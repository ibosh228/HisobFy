import { useReveal } from '../hooks/useReveal'

export default function Pricing() {
  const { ref, inView } = useReveal<HTMLDivElement>()
  return (
    <section id="narxlar" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div
        ref={ref}
        className={`reveal rounded-2xl border px-8 py-16 text-center ${inView ? 'in-view' : ''}`}
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
      >
        <h2 className="font-display text-2xl font-bold sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
          Narxlar
        </h2>
        <p className="font-display mt-4 text-lg font-semibold" style={{ color: 'var(--accent)' }}>
          Tez orada
        </p>
        <p className="mx-auto mt-2 max-w-md text-[14.5px]" style={{ color: 'var(--text-secondary)' }}>
          Hisobfy tariflari tez orada e’lon qilinadi.
        </p>
      </div>
    </section>
  )
}
