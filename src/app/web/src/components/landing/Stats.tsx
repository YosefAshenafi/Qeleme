import { LANDING_DATA } from '../../data/mockData';

export function Stats() {
  return (
    <section className="py-24 bg-surface-container-low">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          <div className="md:col-span-1">
            <h2 className="font-headline text-4xl font-bold tracking-tight text-on-surface leading-tight mb-4">
              Numbers that <br/>Define Excellence.
            </h2>
            <p className="text-on-surface-variant font-light">Precision analytics for global academic standards.</p>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {LANDING_DATA.stats.map((stat, idx) => (
              <div key={idx} className="bg-surface-container-lowest p-8 rounded-xl shadow-sm">
                <div className="font-headline text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-outline">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
