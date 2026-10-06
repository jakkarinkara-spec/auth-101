import Link from 'next/link';
import { heading } from '../../../_components/ui';
import { adminSession } from '../../guard';
import BoatForm from '../boat-form';

export default async function NewBoatPage() {
  if (!(await adminSession('/admin/boats/new'))) return null; // layout แสดงข้อความแจ้งแล้ว

  return (
    <div className="flex max-w-[880px] flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-[15px] text-(--nl-muted)">
              <Link href="/admin/boats" className="text-(--nl-teal) hover:text-(--nl-teal-dk)">
                เรือ
              </Link>{' '}
              / เพิ่มเรือ
            </p>
            <h1 className={`${heading} text-[40px] leading-tight`}>เพิ่มเรือ</h1>
          </div>
          <BoatForm
            boat={{
              name: '',
              port: '',
              lengthM: null,
              seats: null,
              kind: '',
              captain: '',
              description: null,
              engine: null,
              equipment: null,
              tags: [],
              priceHalf: null,
              priceFull: null,
              priceNight: null,
            }}
          />
    </div>
  );
}
