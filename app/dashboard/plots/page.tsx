import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/app/db/index';
import { crops, plots } from '@/app/db/schema';
import { asc, desc, eq } from 'drizzle-orm';
import CreatePlotForm from './create-plot-form';

const formatDate = (d: Date) =>
  d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });

export default async function PlotsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const [plotList, cropOptions] = await Promise.all([
    db
      .select({
        id: plots.id,
        name: plots.name,
        areaRai: plots.areaRai,
        location: plots.location,
        plantedAt: plots.plantedAt,
        cropName: crops.name,
        dayGrow: crops.dayGrow,
      })
      .from(plots)
      .leftJoin(crops, eq(plots.cropId, crops.id))
      .orderBy(desc(plots.createdAt)),
    db
      .select({ id: crops.id, name: crops.name, dayGrow: crops.dayGrow })
      .from(crops)
      .orderBy(asc(crops.name)),
  ]);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-slate-50 pt-16 dark:bg-[#030712]">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Plots</h1>
          <p className="mt-1 text-slate-600 dark:text-zinc-400">Add a planting plot and track what&apos;s growing on it.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <CreatePlotForm crops={cropOptions} />
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-black/10 bg-black/[0.02] p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-zinc-500">
              All plots ({plotList.length})
            </h2>
            {plotList.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-zinc-500">No plots yet.</p>
            ) : (
              <ul className="space-y-3">
                {plotList.map((plot) => {
                  // วันเก็บเกี่ยวโดยประมาณ = วันที่ปลูก + จำนวนวันที่พืชใช้โต
                  const planted = plot.plantedAt ? new Date(`${plot.plantedAt}T00:00:00Z`) : null;
                  const harvest =
                    planted && plot.dayGrow !== null
                      ? new Date(planted.getTime() + plot.dayGrow * 86_400_000)
                      : null;

                  return (
                    <li key={plot.id} className="rounded-xl bg-black/[0.02] px-4 py-3 dark:bg-white/[0.03]">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-slate-900 dark:text-white">{plot.name}</span>
                        {plot.dayGrow !== null ? (
                          <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                            {plot.cropName ?? 'Unnamed crop'}
                          </span>
                        ) : (
                          <span className="rounded-md bg-black/5 px-2.5 py-1 text-xs text-slate-500 dark:bg-white/5 dark:text-zinc-500">
                            No crop
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-zinc-500">
                        {plot.areaRai && <span>{Number(plot.areaRai)} rai</span>}
                        {plot.location && <span>{plot.location}</span>}
                        {planted && <span>Planted {formatDate(planted)}</span>}
                        {harvest && <span className="text-indigo-600 dark:text-indigo-400">Harvest ~{formatDate(harvest)}</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
