import {getPopular} from '@/lib/api';import CatalogPage from '@/components/CatalogPage';
export default async function Page({searchParams}){return <CatalogPage title="Anime Populer" data={await getPopular(searchParams?.page||1)}/>}
