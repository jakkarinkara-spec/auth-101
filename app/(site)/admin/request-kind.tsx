import { REQUEST_KIND, badge, type RequestKind } from '../_components/styles';

// ป้ายประเภทคำขอ (สร้างใหม่ / แก้ไขข้อมูล / ส่งใหม่) — สีตาม REQUEST_KIND
export function RequestKindBadge({ kind, label }: { kind: RequestKind; label?: string }) {
  return <span className={`${badge} ${REQUEST_KIND[kind].badge}`}>{label ?? REQUEST_KIND[kind].label}</span>;
}

// คำอธิบายสีด้านบนรายการ
export function RequestKindLegend({ kinds }: { kinds: { kind: RequestKind; label?: string; note: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-(--nl-muted)">
      {kinds.map((k) => (
        <li key={k.kind} className="flex items-center gap-2">
          <RequestKindBadge kind={k.kind} label={k.label} />
          {k.note}
        </li>
      ))}
    </ul>
  );
}
