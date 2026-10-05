import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/app/db/index';
import { crops } from '@/app/db/schema';
import { desc } from 'drizzle-orm';
import CreateCropForm from './create-crop-form';
import Modal from '@/app/components/modal';

export default async function CropsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const cropList = await db.select().from(crops).orderBy(desc(crops.createdAt));

  return (
    <div className="relative min-h-dvh pt-16">

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink">Crops</h1>
            <p className="mt-1 text-ink-muted">Add a crop and how many days it takes to grow.</p>
          </div>
          <Modal triggerLabel="New crop" title="New crop">
            <CreateCropForm />
          </Modal>
        </div>

        <div>
          <div className="ui-panel p-6">
            <h2 className="ui-panel-title mb-4">
              All crops ({cropList.length})
            </h2>
            {cropList.length === 0 ? (
              <p className="text-sm text-ink-muted">No crops yet.</p>
            ) : (
              <ul className="space-y-3">
                {cropList.map((crop) => (
                  <li key={crop.id} className="ui-row flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-ink">{crop.name ?? '—'}</span>
                    <span className="ui-badge">
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
