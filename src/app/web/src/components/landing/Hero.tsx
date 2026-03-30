import { LANDING_DATA } from '../../data/mockData';
import Link from 'next/link';

export function Hero() {
  return (
    <header className="relative min-h-[100vh] flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src={LANDING_DATA.hero.backgroundImage} 
          alt="Academic Interior" 
          className="w-full h-full object-cover opacity-80" 
        />
        <div className="hero-gradient absolute inset-0"></div>
      </div>
      <div className="container mx-auto px-8 relative z-10 w-full">
        <div className="max-w-4xl pt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs tracking-widest uppercase mb-8">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              workspace_premium
            </span>
            {LANDING_DATA.hero.badge}
          </div>
          <h1 className="font-headline text-6xl md:text-8xl font-bold tracking-tighter text-on-surface leading-[0.9] mb-8">
            Elevate Your <br/>
            <span className="text-primary italic">Intellectual</span> <br/>
            Boundaries.
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl max-w-xl font-light leading-relaxed mb-12">
            {LANDING_DATA.hero.description}
          </p>
          <div className="flex flex-wrap gap-6">
            <Link 
              href="/signup"
              className="bg-primary hover:bg-primary-dim text-on-primary px-10 py-5 rounded-full font-headline font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 text-center inline-block"
            >
              Get Started
            </Link>
            <button className="bg-surface-container-lowest text-primary px-10 py-5 rounded-full font-headline font-bold text-lg hover:bg-surface-container-low transition-all border border-primary/10 active:scale-95">
              Explore Curriculum
            </button>
          </div>
        </div>
      </div>
      {/* Subtle MT Watermark */}
      <div className="absolute -bottom-24 -right-24 opacity-[0.03] select-none pointer-events-none hidden md:block">
        <span className="font-headline text-[40rem] font-black leading-none">MT</span>
      </div>
    </header>
  );
}
