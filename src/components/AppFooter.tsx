
'use client';
import Link from 'next/link';
import { Twitter, Instagram, Facebook } from 'lucide-react';
import { Button } from './ui/button';

export function AppFooter() {
  const footerLinks = [
    {
      title: 'Company',
      links: [
        { href: '#', label: 'About' },
        { href: '#', label: 'Jobs' },
        { href: '#', label: 'For the Record' },
      ],
    },
    {
      title: 'Communities',
      links: [
        { href: '#', label: 'For Artists' },
        { href: '#', label: 'Developers' },
        { href: '#', label: 'Advertising' },
        { href: '#', label: 'Investors' },
      ],
    },
    {
      title: 'Useful links',
      links: [
        { href: '#', label: 'Support' },
        { href: '#', label: 'Free Mobile App' },
      ],
    },
  ];
  return (
    <footer className="bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="font-headline text-3xl font-bold flex items-center mb-4">
                <span className="text-white">ANN</span>
                <span className="text-white">them</span>
            </Link>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-neutral-400 tracking-wider uppercase">{section.title}</h3>
              <ul className="mt-4 space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-base text-neutral-200 hover:text-white transition">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 md:col-span-1 flex justify-start md:justify-end items-start gap-4">
            <Button variant="ghost" size="icon" className="bg-neutral-800 hover:bg-neutral-700">
              <Twitter className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="bg-neutral-800 hover:bg-neutral-700">
              <Instagram className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="bg-neutral-800 hover:bg-neutral-700">
              <Facebook className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-800 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-neutral-400">
          <div className="flex space-x-6">
            <Link href="#" className="hover:text-white transition">Legal</Link>
            <Link href="#" className="hover:text-white transition">Privacy Center</Link>
            <Link href="#" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition">Cookies</Link>
          </div>
          <p className="mt-4 sm:mt-0">&copy; {new Date().getFullYear()} ANNthem AB</p>
        </div>
      </div>
    </footer>
  );
}
