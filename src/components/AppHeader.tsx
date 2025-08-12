'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedHeaderDivider } from './AnimatedHeaderDivider';
import { Button } from './ui/button';

export function AppHeader() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Player' },
    { href: '/advisor', label: 'AI Advisor' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-black">
      <div className="container flex h-20 items-center justify-between">
        <div className="hidden md:flex gap-x-2 items-center">
          <Link href="/" className="font-headline text-2xl font-bold flex items-center">
            <span className="text-[#39ff14] drop-shadow-[0_0_4px_#39ff14]">A</span>
            <span className="text-[#00eaff] drop-shadow-[0_0_4px_#00eaff]">N</span>
            <span className="text-[#ff00cc] drop-shadow-[0_0_4px_#ff00cc]">N</span>
            <span className="text-white">them</span>
          </Link>
        </div>
        <div className="flex md:hidden gap-x-2 items-center">
          <Button variant="ghost" size="icon" className="rounded-full">
            <HomeIcon />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search />
          </Button>
        </div>

        <div className="flex justify-between items-center gap-x-4">
          <nav className="hidden md:flex items-center gap-6 text-lg lg:gap-8">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'transition-colors hover:text-white/80',
                  pathname === href ? 'text-white font-bold' : 'text-white/60'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex gap-x-4">
            <Button variant="ghost" className="text-neutral-300 font-medium">
              Sign up
            </Button>
            <Button className="bg-white text-black px-6 py-2">
              Log in
            </Button>
          </div>
        </div>
      </div>
      <div className="px-6">
        <AnimatedHeaderDivider />
      </div>
    </header>
  );
}
