import Link from 'next/link';
import { heading } from '../../../_components/ui';
import BoatForm from '../../../admin/boats/boat-form';
import { approvedOwnerContext } from '../../guard';

// /owner/boat-requests/new — ฟอร์มขอเพิ่มเรือ (ขั้นที่ 2) เฉพาะเจ้าของเรือที่ผ่านการอนุมัติตัวบุคคลแล้ว
export default async function NewBoatRequest() {
  await approvedOwnerContext('/owner/boat-requests/new');

  return (
    <div className="mx-auto flex w-full max-w-[880px] flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-[15px] text-(--nl-muted)">
          <Link href="/owner/boat-requests" className="text-(--nl-teal) hover:text-(--nl-teal-dk)">
            คำขอเพิ่มเรือ
          </Link>{' '}
          / ขอเพิ่มเรือ
        </p>
        <h1 className={`${heading} text-[40px] leading-tight`}>ขอเพิ่มเรือ</h1>
        <p className="text-[17px] leading-[1.7] text-(--nl-muted)">
          กรอกข้อมูลเรือ ผู้ดูแลระบบจะตรวจแล้วอนุมัติรายลำ — อนุมัติแล้วเรือเปิดรับจองทันที (แก้ข้อมูล / ราคาภายหลังต้องติดต่อผู้ดูแลระบบ)
        </p>
      </div>
      <BoatForm mode="apply" />
    </div>
  );
}
