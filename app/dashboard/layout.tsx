import FarmSidebar from '@/app/components/farm-sidebar';

// Layout ของทุกหน้าใต้ /dashboard — มี sidebar Farm Manage อยู่ด้านซ้าย
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1">
      <FarmSidebar />
      {/* เว้นที่ให้ sidebar (lg) หรือแถบเมนู (จอเล็ก, สูง h-12) */}
      <div className="pt-12 lg:pl-64 lg:pt-0">{children}</div>
    </div>
  );
}
