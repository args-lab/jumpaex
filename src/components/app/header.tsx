import Link from 'next/link';
import { Zap } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-xl inline-block">AnonTrade</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-4">
          {/* Future nav items can go here */}
        </nav>
        {/* Future user auth items can go here */}
      </div>
    </header>
  );
}
