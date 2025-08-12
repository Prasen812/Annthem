'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedHeaderDivider } from './AnimatedHeaderDivider';

export function AppHeader() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Player' },
    { href: '/advisor', label: 'AI Advisor' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-6 flex items-center">
          <Music className="h-6 w-6 mr-3" />
            <Link href="/" className="font-headline text-xl font-bold flex items-center">
            <span className="text-[#39ff14] drop-shadow-[0_0_4px_#39ff14]">A</span>
            <span className="text-[#00eaff] drop-shadow-[0_0_4px_#00eaff]">N</span>
            <span className="text-[#ff00cc] drop-shadow-[0_0_4px_#ff00cc]">N</span>
            them
            </Link>
        </div>
        <nav className="flex items-center gap-6 text-base lg:gap-8">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'transition-colors hover:text-foreground/80',
                pathname === href ? 'text-foreground font-semibold' : 'text-foreground/60'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <AnimatedHeaderDivider />
    </header>
  );
}
