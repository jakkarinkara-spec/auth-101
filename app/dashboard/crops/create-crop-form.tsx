'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useModalClose } from '@/app/components/modal';

const inputClass =
  'ui-input';

export default function CreateCropForm() {
  const router = useRouter();
  const closeModal = useModalClose();
  const [name, setName] = useState('');
  const [dayGrow, setDayGrow] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/crops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, dayGrow: Number(dayGrow) }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? 'Something went wrong. Please try again.');
        return;
      }

      setName('');
      setDayGrow('');
      // ดึงรายการ crops ใหม่จาก Server Component
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
          <label htmlFor="name" className="ui-label">
            Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Tomato"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="dayGrow" className="ui-label">
            Days to grow
          </label>
          <input
            id="dayGrow"
            type="number"
            placeholder="90"
            value={dayGrow}
            onChange={(e) => setDayGrow(e.target.value)}
            required
            min={1}
            step={1}
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
              Creating crop…
            </>
          ) : 'Create crop'}
        </button>
      </form>
    </>
  );
}
