import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/app/db/index';
import { crops } from '@/app/db/schema';
import { desc } from 'drizzle-orm';
import CreateCropForm from './create-crop-form';

export default async function CropsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const cropList = await db.select().from(crops).orderBy(desc(crops.createdAt));

  return (
    <div className="relative min-h-dvh overflow-hidden bg-slate-50 pt-16 dark:bg-[#030712]">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-zinc-500 dark:hover:text-white">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Crops</h1>
          <p className="mt-1 text-slate-600 dark:text-zinc-400">Add a crop and how many days it takes to grow.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <CreateCropForm />
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-black/10 bg-black/[0.02] p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-zinc-500">
              All crops ({cropList.length})
            </h2>
            {cropList.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-zinc-500">No crops yet.</p>
            ) : (
              <ul className="space-y-3">
                {cropList.map((crop) => (
                  <li key={crop.id} className="flex items-center justify-between rounded-xl bg-black/[0.02] px-4 py-3 dark:bg-white/[0.03]">
                    <span className="text-sm text-slate-700 dark:text-zinc-300">{crop.name ?? '—'}</span>
                    <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      {crop.dayGrow} days
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
