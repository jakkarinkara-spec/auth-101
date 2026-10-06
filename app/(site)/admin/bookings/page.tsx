import { bangkokToday } from '@/app/lib/boats';
import { firstParam, type SearchParams } from '@/app/lib/search';
import { heading } from '../../_components/ui';
import { BookingsSection, loadBookingRows, parseTab } from '../../_components/bookings-section';
import { adminSession } from '../guard';

// /admin/bookings — คำขอจองทุกเรือ กรองสถานะด้วย ?status=
export default async function AdminBookings({ searchParams }: { searchParams: SearchParams }) {
  if (!(await adminSession('/admin/bookings'))) return null;

  const tab = parseTab(firstParam((await searchParams).status));
  const rows = await loadBookingRows(tab);

  return (
    <>
      <h1 className={`${heading} text-[40px] leading-tight`}>คำขอจอง</h1>
      <BookingsSection tab={tab} rows={rows} today={bangkokToday()} basePath="/admin/bookings" />
    </>
  );
}
