
'use client';

import Link from 'next/link';
import { Home, Store, Repeat, WalletCards, User, Link as LinkIcon } from 'lucide-react'; // Added LinkIcon
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function BottomNavigationBar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/market', label: 'Market', icon: Store },
    { href: '/convert', label: 'Convert', icon: Repeat },
    { href: '/assets', label: 'Assets', icon: WalletCards },
    { href: '/connect', label: 'Connect', icon: LinkIcon }, // Added Connect
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-50">
      <div className="container mx-auto h-full">
        <ul className="flex justify-around items-center h-full">
          {navItems.map((item) => (
            <li key={item.label} className="flex-1 text-center">
              <Button
                variant="ghost"
                className={cn(
                  'flex flex-col items-center justify-center h-full w-full p-1 rounded-none',
                  (pathname === item.href || (item.href === '/convert' && pathname.startsWith('/transactions'))) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5 mb-0.5" />
                  <span className="text-xs leading-tight">{item.label}</span>
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
