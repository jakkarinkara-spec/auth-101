import { inArray } from 'drizzle-orm';
import { bookings } from '@/app/db/schema';
import { ownedBoatIds } from '@/app/lib/admin';
import { bangkokToday } from '@/app/lib/boats';
import { firstParam, type SearchParams } from '@/app/lib/search';
import { heading } from '../../_components/ui';
import { BookingsSection, loadBookingRows, parseTab } from '../../_components/bookings-section';
import { approvedOwnerContext } from '../guard';

// /owner/bookings — คำขอจองเฉพาะเรือที่ผู้ใช้เป็นเจ้าของ (boats.owner_id) กรอง ?status=
export default async function OwnerBookings({ searchParams }: { searchParams: SearchParams }) {
  const { user } = await approvedOwnerContext('/owner/bookings');
  const tab = parseTab(firstParam((await searchParams).status));
  const rows = await loadBookingRows(tab, inArray(bookings.boatId, ownedBoatIds(user.id)));

  return (
    <>
      <h1 className={`${heading} text-[40px] leading-tight`}>คำขอจอง</h1>
      <BookingsSection tab={tab} rows={rows} today={bangkokToday()} basePath="/owner/bookings" />
    </>
  );
}
