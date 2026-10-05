'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useModalClose } from '@/app/components/modal';

const inputClass =
  'ui-input';
const labelClass = 'ui-label';

type CropOption = { id: string; name: string | null; dayGrow: number };

export default function CreatePlotForm({ crops }: { crops: CropOption[] }) {
  const router = useRouter();
  const closeModal = useModalClose();
  const [name, setName] = useState('');
  const [areaRai, setAreaRai] = useState('');
  const [location, setLocation] = useState('');
  const [cropId, setCropId] = useState('');
  const [plantedAt, setPlantedAt] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/plots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, areaRai, location, cropId, plantedAt }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? 'Something went wrong. Please try again.');
        return;
      }

      setName('');
      setAreaRai('');
      setLocation('');
      setCropId('');
      setPlantedAt('');
      // ดึงรายการแปลงใหม่จาก Server Component
      router.refresh();
      closeModal?.();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      {error && (
        <div className="ui-error mb-5 flex items-start gap-2.5 px-4 py-3 text-sm">
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className={labelClass}>Name</label>
          <input
            id="name"
            type="text"
            placeholder="North field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="areaRai" className={labelClass}>Area (rai)</label>
          <input
            id="areaRai"
            type="number"
            placeholder="2.5"
            value={areaRai}
            onChange={(e) => setAreaRai(e.target.value)}
            min={0.01}
            step={0.01}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="location" className={labelClass}>Location</label>
          <input
            id="location"
            type="text"
            placeholder="Chiang Mai"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="cropId" className={labelClass}>Crop</label>
          <select id="cropId" value={cropId} onChange={(e) => setCropId(e.target.value)} className={inputClass}>
            <option value="">— None —</option>
            {crops.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.name ?? 'Unnamed'} ({crop.dayGrow} days)
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="plantedAt" className={labelClass}>Planted on</label>
          <input
            id="plantedAt"
            type="date"
            value={plantedAt}
            onChange={(e) => setPlantedAt(e.target.value)}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="ui-btn mt-1 w-full"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating plot…
            </>
          ) : 'Create plot'}
        </button>
      </form>
    </>
  );
}
