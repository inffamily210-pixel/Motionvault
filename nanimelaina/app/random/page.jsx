import {getRandomAnime} from '@/lib/api';import AnimeGrid from '@/components/AnimeGrid';
export default async function Page(){const d=await getRandomAnime();const a=d?.data||d?.anime||d?.result||d;return <section><h1 className="text-2xl mb-5">Random Anime</h1><AnimeGrid animeList={Array.isArray(a)?a:a?[a]:[]}/><a href="/random">Acak Lagi</a></section>}
