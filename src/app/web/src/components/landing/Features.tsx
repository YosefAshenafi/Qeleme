import { LANDING_DATA } from '../../data/mockData';

export function Features() {
  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <h2 className="font-headline text-5xl font-bold tracking-tighter mb-6">
              Designed for the <span className="text-primary italic">Avant-Garde</span>.
            </h2>
            <p className="text-on-surface-variant text-lg font-light leading-relaxed">
              Our infrastructure is built with academic rigor at its core, combining advanced AI with traditional pedagogical values.
            </p>
          </div>
          <div className="h-px bg-outline-variant/30 flex-grow mx-8 hidden lg:block"></div>
          <div className="material-symbols-outlined text-6xl text-primary opacity-20">architecture</div>
        </div>
        
        <div className="grid grid-cols-12 gap-6 h-auto md:h-[600px]">
          {/* Bento Item 1 */}
          <div className="col-span-12 md:col-span-8 bg-surface-container-lowest rounded-xl p-10 flex flex-col justify-between border border-outline-variant/10 group hover:border-primary/20 transition-all shadow-sm">
            <div>
              <span className="material-symbols-outlined text-4xl text-primary mb-6" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
              <h3 className="font-headline text-3xl font-bold mb-4">Neural Assessment Engine</h3>
              <p className="text-on-surface-variant font-light max-w-md">Real-time adaptive testing that mirrors the human learning curve with unprecedented mathematical precision.</p>
            </div>
            <div className="flex justify-end mt-8">
              <img 
                src={LANDING_DATA.features.images.dataViz} 
                alt="Data visualization" 
                className="w-full h-48 object-cover rounded-lg" 
              />
            </div>
          </div>
          
          {/* Bento Item 2 */}
          <div className="col-span-12 md:col-span-4 bg-primary rounded-xl p-10 text-on-primary flex flex-col justify-between shadow-xl shadow-primary/20">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
            <div>
              <h3 className="font-headline text-3xl font-bold mb-4 leading-tight">Institutional Integrity</h3>
              <p className="opacity-80 font-light text-sm mb-6">Blockchain-verified credentials and state-of-the-art proctoring systems to ensure absolute academic honesty.</p>
              <a href="#" className="inline-flex items-center gap-2 font-bold text-sm tracking-widest uppercase group">
                Learn More 
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </a>
            </div>
          </div>
          
          {/* Bento Item 3 */}
          <div className="col-span-12 md:col-span-4 bg-surface-container-high rounded-xl p-10 flex flex-col justify-between group hover:bg-surface-container-highest transition-all shadow-sm">
            <span className="material-symbols-outlined text-4xl text-primary mb-6">public</span>
            <h3 className="font-headline text-2xl font-bold mb-2">Global Access</h3>
            <p className="text-on-surface-variant text-sm font-light">Localized for 45 languages and 120 regional education systems.</p>
          </div>
          
          {/* Bento Item 4 */}
          <div className="col-span-12 md:col-span-8 bg-surface-container-lowest rounded-xl p-10 flex flex-col md:flex-row items-center gap-8 border border-outline-variant/10 shadow-sm">
            <div className="flex-1">
              <h3 className="font-headline text-2xl font-bold mb-4">Collaborative Research</h3>
              <p className="text-on-surface-variant text-sm font-light">Connect with researchers globally to benchmark institutional performance and share pedagogical breakthroughs.</p>
            </div>
            <div className="flex-1 w-full h-40 bg-surface-container-low rounded-lg overflow-hidden group">
              <img 
                src={LANDING_DATA.features.images.collaboration} 
                alt="Collaboration" 
                className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 transition-all" 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
