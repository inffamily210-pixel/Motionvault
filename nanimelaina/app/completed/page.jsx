import {getCompleted} from '@/lib/api';import CatalogPage from '@/components/CatalogPage';
export default async function Page({searchParams}){return <CatalogPage title="Anime Tamat" data={await getCompleted(searchParams?.page||1)}/>}
