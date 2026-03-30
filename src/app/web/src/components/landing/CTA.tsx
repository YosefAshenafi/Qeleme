import { LANDING_DATA } from '../../data/mockData';

export function CTA() {
  return (
    <section className="py-40 relative bg-on-surface overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src={LANDING_DATA.cta.backgroundImage} 
          alt="Final CTA Background" 
          className="w-full h-full object-cover opacity-10 mix-blend-overlay" 
        />
      </div>
      <div className="container mx-auto px-8 relative z-10 text-center">
        <h2 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter text-on-primary mb-8">
          Ready to Lead <br/>the Vanguard?
        </h2>
        <p className="text-outline-variant max-w-2xl mx-auto text-xl font-light mb-16 leading-relaxed">
          Join thousands of leading scholars and institutions redefining the boundaries of academic excellence. The future of assessment is here.
        </p>
        <button className="bg-primary text-on-primary px-12 py-6 rounded-full font-headline font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/40 cursor-pointer">
          Join Mega Test Today
        </button>
      </div>
    </section>
  );
}
