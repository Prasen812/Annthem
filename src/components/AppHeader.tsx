'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Player', icon: Music },
    { href: '/advisor', label: 'AI Advisor', icon: BrainCircuit },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <Music className="h-6 w-6 mr-2" />
            <Link href="/" className="font-headline text-lg font-bold flex items-center">
            <span className="text-[#39ff14] drop-shadow-[0_0_4px_#39ff14]">a</span>
            <span className="text-[#00eaff] drop-shadow-[0_0_4px_#00eaff]">n</span>
            <span className="text-[#ff00cc] drop-shadow-[0_0_4px_#ff00cc]">n</span>
            them
            </Link>
        </div>
        <nav className="flex items-center gap-4 text-sm lg:gap-6">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'transition-colors hover:text-foreground/80',
                pathname === href ? 'text-foreground' : 'text-foreground/60'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
