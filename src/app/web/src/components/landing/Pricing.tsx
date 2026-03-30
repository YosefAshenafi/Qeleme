import { LANDING_DATA } from '../../data/mockData';

export function Pricing() {
  return (
    <section className="py-32 bg-surface">
      <div className="container mx-auto px-8">
        <div className="text-center mb-20">
          <h2 className="font-headline text-5xl font-bold tracking-tighter mb-4">Investment in Knowledge</h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {LANDING_DATA.pricing.map((plan, idx) => (
            <div 
              key={idx} 
              className={`bg-surface-container-lowest rounded-2xl p-10 flex flex-col ${
                plan.featured 
                  ? "border-2 border-primary ring-4 ring-primary/5 relative scale-105 shadow-2xl z-10" 
                  : "border border-outline-variant/10 hover:shadow-2xl transition-all"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                  Most Recommended
                </div>
              )}
              <div className="mb-8">
                <h3 className={`font-headline text-xl font-bold mb-2 uppercase tracking-widest ${plan.featured ? "text-primary" : "text-outline"}`}>
                  {plan.tier}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-headline font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-on-surface-variant font-light">/mo</span>}
                </div>
              </div>
              <ul className={`space-y-4 mb-10 flex-grow ${plan.featured ? "font-medium" : "text-on-surface-variant font-light"}`}>
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span> 
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                className={`w-full py-4 rounded-full font-bold transition-all ${
                  plan.featured 
                    ? "bg-primary text-on-primary shadow-lg shadow-primary/20 hover:scale-[1.02]" 
                    : "border border-primary/20 text-primary hover:bg-primary/5"
                }`}
              >
                {plan.description}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
