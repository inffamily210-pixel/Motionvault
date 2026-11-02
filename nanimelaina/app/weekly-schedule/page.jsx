import {getWeeklySchedule} from '@/lib/api';import CatalogPage from '@/components/CatalogPage';
export default async function Page(){return <CatalogPage title="Jadwal Mingguan" data={await getWeeklySchedule()}/>}
