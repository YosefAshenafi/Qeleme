import { LANDING_DATA } from '../../data/mockData';

export function Footer() {
  return (
    <footer className="bg-[#eff1f2] dark:bg-slate-950 w-full rounded-t-none border-t border-outline-variant/10">
      <div className="flex flex-col md:flex-row justify-between items-center px-12 py-10 w-full max-w-screen-2xl mx-auto">
        <div className="text-lg font-black text-[#2c2f30] dark:text-white mb-6 md:mb-0">
          {LANDING_DATA.navigation.brand}
        </div>
        <div className="flex flex-wrap justify-center gap-8 mb-6 md:mb-0">
          {LANDING_DATA.footer.links.map((link, idx) => (
            <a 
              key={idx} 
              href={link.href} 
              className="font-body text-xs uppercase tracking-widest text-[#2c2f30] dark:text-slate-400 hover:text-[#004be2] dark:hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="font-body text-xs uppercase tracking-widest text-[#2c2f30] dark:text-slate-400 opacity-80">
          {LANDING_DATA.footer.copyright}
        </div>
      </div>
    </footer>
  );
}
