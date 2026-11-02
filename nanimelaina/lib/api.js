const BASE_URL = 'https://v1312.nanimelaina.web.id/api/nanimelaina';
const ROOT_URL = 'https://v1312.nanimelaina.web.id/api';
async function request(url, options = {}) {
  try {
    const res = await fetch(url, { cache: 'no-store', ...options });
    const type = res.headers.get('content-type') || '';
    const body = type.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) return { error: body?.error || `HTTP ${res.status}`, status: res.status };
    return body;
  } catch (error) { console.error('Nanimelaina API:', error); return null; }
}
const url = (path, params = {}) => {
  const u = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== '') u.searchParams.set(k, String(v)); });
  return u.toString();
};
export const getHomeFeed = () => request(url('/home'));
export const getTopTen = () => request(url('/top-ten'));
export const getRandomAnime = () => request(url('/random'));
export const getAnimeDetail = id => request(url(`/anime/${encodeURIComponent(id)}`));
export const getEpisodes = id => request(url(`/episodes/${encodeURIComponent(id)}`));
export const getServers = (id, ep=1) => request(url(`/servers/${encodeURIComponent(id)}`, {ep}));
export const getStream = (id, ep=1, server='HD-1', type='sub') => request(url(`/stream/${encodeURIComponent(id)}`, {ep,server,type}));
export const getPlayUrl = (id, ep=1, server='HD-1', type='sub') => url(`/play/${encodeURIComponent(id)}`, {ep,server,type});
export const getManifestUrl = (id, ep=1, server='HD-1', type='sub') => url(`/hls/manifest/${encodeURIComponent(id)}`, {ep,server,type});
export const getSubtitleTranslate = (subtitleUrl, lang='id') => request(url('/subtitle/translate', {url:subtitleUrl,lang}));
export const getSubtitleStats = () => request(url('/subtitle/stats'));
export const getSubtitleFilterRules = () => request(`${ROOT_URL}/subtitle/filter-rules`);
export const updateSubtitleFilterRules = rules => request(`${ROOT_URL}/subtitle/filter-rules`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(rules)});
export const getTmdbThumbnails = (title, anilistId) => request(url('/tmdb-thumbnails', {title,anilistId}));
export const getSkipTimes = (malId, episode=1) => request(url('/skip-times', {malId,episode}));
export const getSearch = (query, page=1, filters={}) => request(url('/search', {q:query,page,...filters}));
export const getAzList = (letter='ALL',page=1) => request(url('/az-list',{letter,page}));
export const getTrending = page => request(url('/trending',{page}));
export const getPopular = page => request(url('/popular',{page}));
export const getTopAiring = page => request(url('/top-airing',{page}));
export const getUpcoming = page => request(url('/upcoming',{page}));
export const getCompleted = page => request(url('/completed',{page}));
export const getTvSeries = page => request(url('/tvseries',{page}));
export const getMovies = page => request(url('/movies',{page}));
export const getGenres = () => request(url('/genres'));
export const getGenre = (genre,page=1) => request(url(`/genre/${encodeURIComponent(genre)}`,{page}));
export const getProducer = (producer,page=1) => request(url(`/producer/${encodeURIComponent(producer)}`,{page}));
export const getSchedule = (date='today',page=1,day) => request(url('/schedule',{date,page,day}));
export const getWeeklySchedule = () => request(url('/schedule/weekly'));
export const getAnimeCountdown = id => request(url(`/schedule/${encodeURIComponent(id)}`));
export const getCacheStatus = (id,ep=1) => request(`${ROOT_URL}/cache/status?id=${encodeURIComponent(id)}&ep=${ep}`);
export const startCache = (id,ep=1,server='HD-1') => request(`${ROOT_URL}/cache/start?id=${encodeURIComponent(id)}&ep=${ep}&server=${encodeURIComponent(server)}`);
export const getLocalMp4Url = (id,ep=1) => `${ROOT_URL}/local-mp4?id=${encodeURIComponent(id)}&ep=${ep}`;
