import {getTrending} from '@/lib/api';import CatalogPage from '@/components/CatalogPage';
export default async function Page({searchParams}){return <CatalogPage title="Trending Anime" data={await getTrending(searchParams?.page||1)}/>}
