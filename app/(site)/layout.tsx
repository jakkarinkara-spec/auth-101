import { IBM_Plex_Sans_Thai, Kanit } from 'next/font/google';

// หน้าเว็บเช่าเรือ (น้ำลึก) — ธีมสว่างตายตัวตามดีไซน์ ไม่ใช้ token light/dark ของ dashboard
const kanit = Kanit({ variable: '--font-kanit', weight: ['500', '600'], subsets: ['thai', 'latin'] });
const plex = IBM_Plex_Sans_Thai({ variable: '--font-plex-thai', weight: ['400', '500', '600'], subsets: ['thai', 'latin'] });

// สีจากดีไซน์ — prefix nl- กันชนกับ token เดิมใน globals.css; ใช้ใน class แบบ bg-(--nl-navy)
const TOKENS = {
  '--nl-navy': '#0F3B52',
  '--nl-teal': '#0B6E72',
  '--nl-teal-dk': '#084F52',
  '--nl-accent': '#F29A4A',
  '--nl-accent-soft': '#FFF1E3',
  '--nl-ink': '#0E2433',
  '--nl-muted': '#4A5D68',
  '--nl-label': '#3D525D',
  '--nl-line': '#DCE5E7',
  '--nl-divider': '#E6ECEE',
  '--nl-field': '#C9D5D8',
  '--nl-bg': '#F3F6F5',
  '--nl-tint': '#DDF0EF',
  '--nl-on-navy': '#D3E2E6',
  '--nl-nav': '#E6EEF0',
  '--nl-footer': '#C4D3D8',
  // globals.css ตั้งสี <option> จาก --input-bg / --ink ซึ่งเป็นสีมืดเมื่อ data-theme=dark — บังคับเป็นสีสว่างในเว็บนี้
  '--input-bg': '#FFFFFF',
  '--ink': '#0E2433',
} as React.CSSProperties;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={TOKENS}
      className={`${kanit.variable} ${plex.variable} flex min-h-dvh flex-1 flex-col bg-(--nl-bg) font-(family-name:--font-plex-thai) text-(--nl-ink) [color-scheme:light]`}
    >
      {children}
    </div>
  );
}
