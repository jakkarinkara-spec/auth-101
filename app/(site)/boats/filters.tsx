'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { AMENITIES } from '@/app/lib/boats';

// ตัวกรองที่ต้องตอบสนองทันที (slider จำนวนคน + checkbox) — เขียนค่าลง URL แล้วให้ server กรองเหมือนตัวกรองอื่น
export default function GuestsAndAmenities({ guests, amenities }: { guests: number; amenities: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(guests);
  const [pending, startTransition] = useTransition();

  const update = (mutate: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(searchParams);
    mutate(p);
    startTransition(() => router.replace(`${pathname}?${p}`, { scroll: false }));
  };
  const commitGuests = () => {
    if (value !== guests) update((p) => p.set('guests', String(value)));
  };

  return (
    <div className={`flex flex-col gap-7 transition-opacity ${pending ? 'opacity-60' : ''}`}>
      <label className="flex flex-col gap-2.5 text-[17px] font-semibold">
        จำนวนคนในกลุ่ม
        <input
          type="range"
          min={1}
          max={20}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          // อัปเดต URL ตอนปล่อยเมาส์/นิ้ว หรือกดคีย์บอร์ดเสร็จ ไม่ใช่ทุกครั้งที่ลาก
          onPointerUp={commitGuests}
          onKeyUp={commitGuests}
          className="h-8 accent-(--nl-teal)"
        />
        <span className="text-[15px] font-normal text-(--nl-muted)">อย่างน้อย {value} คน</span>
      </label>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-[17px] font-semibold">สิ่งอำนวยความสะดวก</legend>
        {AMENITIES.map((a) => (
          <label key={a.value} className="flex min-h-8 items-center gap-2.5">
            <input
              type="checkbox"
              checked={amenities.includes(a.value)}
              onChange={(e) =>
                update((p) => {
                  const next = e.target.checked ? [...amenities, a.value] : amenities.filter((v) => v !== a.value);
                  p.delete('amenity');
                  next.forEach((v) => p.append('amenity', v));
                })
              }
              className="h-5 w-5 accent-(--nl-teal)"
            />
            {a.label}
          </label>
        ))}
      </fieldset>
    </div>
  );
}
