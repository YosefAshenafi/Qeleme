import Link from 'next/link';
import { LANDING_DATA } from '../../data/mockData';

export function Navigation() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tighter text-[#004be2] dark:text-[#809bff] font-headline">
          {LANDING_DATA.navigation.brand}
        </div>
        <div className="hidden md:flex items-center gap-8 font-headline font-medium text-sm tracking-tight">
          {LANDING_DATA.navigation.links.map((link, idx) => (
             <Link 
               key={idx} 
               href={link.href} 
               className={`transition-all duration-300 ${
                 link.active 
                   ? "text-[#004be2] dark:text-[#809bff] font-bold border-b-2 border-[#004be2] pb-1 hover:opacity-100" 
                   : "text-[#2c2f30] dark:text-[#eff1f2] opacity-70 hover:opacity-100 hover:text-[#004be2]"
               }`}
             >
               {link.label}
             </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="hidden sm:block text-[#2c2f30] dark:text-[#eff1f2] opacity-70 font-headline text-sm hover:opacity-100 transition-all duration-300"
          >
            Login
          </Link>
          <Link 
            href="/signup" 
            className="bg-primary text-on-primary px-6 py-2 rounded-full font-headline text-sm font-bold scale-95 hover:scale-100 transition-all duration-200 inline-block"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
