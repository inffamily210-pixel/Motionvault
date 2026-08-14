  /**
 * GET /api/youtube-import?url=<channel link, @handle, or bare handle>
 *
 * Resolves a YouTube channel reference and returns its most recent uploaded
 * videos (title, description, thumbnail, publish date) so the admin panel
 * can bulk-prefill new presets from a whole channel instead of one video
 * at a time.
 *
 * Requires the YOUTUBE_API_KEY environment variable (YouTube Data API v3
 * key from Google Cloud Console). Set it in Vercel -> Project Settings ->
 * Environment Variables, then redeploy. The key never reaches the browser
 * because this file only runs on Vercel's server, not in the page.
 *
 * Accepts:
 *   https://www.youtube.com/@handle
 *   https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxxx
 *   https://www.youtube.com/c/CustomName        (best-effort, via search)
 *   https://www.youtube.com/user/LegacyUsername
 *   @handle                                      (bare, no URL)
 *
 * Does NOT accept single-video links (youtube.com/watch, youtu.be/...) —
 * those are handled entirely client-side already via extractYouTubeId().
 */

const MAX_VIDEOS = 200; // safety cap so one import can't run away on huge channels
const API_BASE = 'https://www.googleapis.com/youtube/v3';

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'YOUTUBE_API_KEY belum diset di environment variable Vercel. Tambahkan dulu di Project Settings, lalu redeploy.' });
    return;
  }

  const input = String(req.query.url || '').trim();
  if (!input) {
    res.status(400).json({ error: 'Parameter url wajib diisi.' });
    return;
  }

  try {
    const ref = parseChannelRef(input);
    if (!ref) {
      res.status(400).json({ error: 'Link ini tidak dikenali sebagai akun/channel YouTube.' });
      return;
    }

    const channel = await resolveChannel(ref, apiKey);
    if (!channel) {
      res.status(404).json({ error: 'Channel YouTube tidak ditemukan.' });
      return;
    }

    const videos = await fetchChannelVideos(channel.uploadsPlaylistId, apiKey, MAX_VIDEOS);

    res.status(200).json({
      channel: { id: channel.id, title: channel.title, thumbnail: channel.thumbnail },
      videos,
      truncated: videos.length >= MAX_VIDEOS
    });
  } catch (err) {
    console.error('youtube-import error:', err);
    res.status(502).json({ error: 'Gagal mengambil data dari YouTube: ' + err.message });
  }
};

/** Figure out what kind of channel reference this string is. Returns null if
 *  it doesn't look like a channel/account reference at all (e.g. it's a
 *  single-video link, or just not a YouTube URL). */
function parseChannelRef(input) {
  const s = input.trim();

  // Bare handle typed without a URL, e.g. "@someone"
  if (/^@[\w.-]{2,}$/.test(s)) return { type: 'handle', value: s };

  let u;
  try {
    u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
  } catch {
    return null;
  }

  const host = u.hostname.replace(/^www\./, '').replace(/^m\./, '');
  if (host !== 'youtube.com' && host !== 'youtu.be') return null;

  const parts = u.pathname.split('/').filter(Boolean);
  if (!parts.length) return null;

  // These first-segments are video/playlist routes, not channel routes.
  if (['watch', 'shorts', 'embed', 'live', 'playlist'].includes(parts[0])) return null;

  if (parts[0].startsWith('@')) return { type: 'handle', value: parts[0] };
  if (parts[0] === 'channel' && parts[1]) return { type: 'id', value: parts[1] };
  if (parts[0] === 'user' && parts[1]) return { type: 'user', value: parts[1] };
  if (parts[0] === 'c' && parts[1]) return { type: 'custom', value: parts[1] };

  // Old-style bare custom URL, e.g. youtube.com/SomeChannelName
  if (parts.length === 1) return { type: 'custom', value: parts[0] };

  return null;
}

async function ytFetch(path, params, apiKey) {
  const url = new URL(`${API_BASE}/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set('key', apiKey);

  const r = await fetch(url.toString());
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message || `YouTube API error (HTTP ${r.status})`);
  return data;
}

async function resolveChannel(ref, apiKey) {
  let data;

  if (ref.type === 'id') {
    data = await ytFetch('channels', { part: 'snippet,contentDetails', id: ref.value }, apiKey);
  } else if (ref.type === 'handle') {
    data = await ytFetch('channels', { part: 'snippet,contentDetails', forHandle: ref.value }, apiKey);
  } else if (ref.type === 'user') {
    data = await ytFetch('channels', { part: 'snippet,contentDetails', forUsername: ref.value }, apiKey);
  } else {
    // "/c/CustomName" has no direct lookup endpoint in the API — best effort
    // via channel search, taking the top hit.
    const search = await ytFetch('search', { part: 'snippet', type: 'channel', q: ref.value, maxResults: 1 }, apiKey);
    const hit = search.items && search.items[0];
    if (!hit) return null;
    data = await ytFetch('channels', { part: 'snippet,contentDetails', id: hit.snippet.channelId }, apiKey);
  }

  const item = data.items && data.items[0];
  if (!item) return null;

  return {
    id: item.id,
    title: item.snippet.title,
    thumbnail: (item.snippet.thumbnails && (item.snippet.thumbnails.medium || item.snippet.thumbnails.default) || {}).url || '',
    uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads
  };
}

async function fetchChannelVideos(uploadsPlaylistId, apiKey, maxVideos) {
  // Step 1: walk the channel's uploads playlist to collect video IDs.
  // 1 API unit per page of up to 50 — cheap even for large channels.
  const ids = [];
  let pageToken = '';
  while (ids.length < maxVideos) {
    const data = await ytFetch('playlistItems', {
      part: 'contentDetails',
      playlistId: uploadsPlaylistId,
      maxResults: 50,
      ...(pageToken ? { pageToken } : {})
    }, apiKey);

    (data.items || []).forEach(it => ids.push(it.contentDetails.videoId));
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }

  const capped = ids.slice(0, maxVideos);

  // Step 2: batch-fetch full snippet (incl. description) 50 IDs at a time.
  const videos = [];
  for (let i = 0; i < capped.length; i += 50) {
    const batch = capped.slice(i, i + 50);
    const data = await ytFetch('videos', { part: 'snippet', id: batch.join(',') }, apiKey);
    (data.items || []).forEach(v => {
      videos.push({
        id: v.id,
        title: v.snippet.title || '',
        description: v.snippet.description || '',
        thumbnail: (v.snippet.thumbnails && (v.snippet.thumbnails.medium || v.snippet.thumbnails.default) || {}).url || '',
        publishedAt: v.snippet.publishedAt
      });
    });
  }

  // videos.list doesn't guarantee it preserves input order, so re-sort
  // newest-first explicitly rather than relying on that.
  videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  return videos;
}
