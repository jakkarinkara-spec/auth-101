import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/app/db/index';
import { crops, plots } from '@/app/db/schema';
import { asc, desc, eq } from 'drizzle-orm';
import CreatePlotForm from './create-plot-form';
import Modal from '@/app/components/modal';

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
    <div className="relative min-h-dvh pt-16">

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink">Plots</h1>
            <p className="mt-1 text-ink-muted">Add a planting plot and track what&apos;s growing on it.</p>
          </div>
          <Modal triggerLabel="New plot" title="New plot">
            <CreatePlotForm crops={cropOptions} />
          </Modal>
        </div>

        <div>
          <div className="ui-panel p-6">
            <h2 className="ui-panel-title mb-4">
              All plots ({plotList.length})
            </h2>
            {plotList.length === 0 ? (
              <p className="text-sm text-ink-muted">No plots yet.</p>
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
                    <li key={plot.id} className="ui-row px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-ink">{plot.name}</span>
                        {plot.dayGrow !== null ? (
                          <span className="ui-badge">
                            {plot.cropName ?? 'Unnamed crop'}
                          </span>
                        ) : (
                          <span className="ui-badge ui-badge-muted">
                            No crop
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
                        {plot.areaRai && <span>{Number(plot.areaRai)} rai</span>}
                        {plot.location && <span>{plot.location}</span>}
                        {planted && <span>Planted {formatDate(planted)}</span>}
                        {harvest && <span className="font-semibold text-highlight">Harvest ~{formatDate(harvest)}</span>}
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
