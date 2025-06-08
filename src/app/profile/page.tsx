
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit2, Copy, Eye, Gem, UserCheck2, ShieldCheck, Twitter, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListItemProps {
  icon: React.ElementType;
  label: string;
  value?: string;
  valueType?: 'default' | 'accent' | 'success' | 'muted';
  onClick?: () => void;
}

const ListItem: React.FC<ListItemProps> = ({ icon: Icon, label, value, valueType = 'default', onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center w-full p-4 text-left hover:bg-muted/50 transition-colors"
    >
      <Icon className="h-5 w-5 mr-4 text-muted-foreground" />
      <span className="flex-grow text-sm font-medium">{label}</span>
      {value && (
        <Badge
          variant={valueType === 'accent' || valueType === 'success' ? 'default' : 'secondary'}
          className={cn(
            "mr-2 text-xs py-0.5 px-2",
            valueType === 'accent' && 'bg-accent text-accent-foreground hover:bg-accent/90',
            valueType === 'success' && 'bg-green-500/20 text-green-700 border-transparent hover:bg-green-500/30',
            valueType === 'muted' && 'bg-transparent text-muted-foreground px-0'
          )}
        >
          {value}
        </Badge>
      )}
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
};

export default function ProfilePage() {
  const router = useRouter();

  const listItems: ListItemProps[] = [
    { icon: Gem, label: 'VIP Privilege', value: 'Regular', valueType: 'accent', onClick: () => alert('VIP Privilege clicked') },
    { icon: UserCheck2, label: 'Verifications', value: 'Verified', valueType: 'success', onClick: () => alert('Verifications clicked') },
    { icon: ShieldCheck, label: 'Security', onClick: () => alert('Security clicked') },
    { icon: Twitter, label: 'Twitter', value: 'Unlinked', valueType: 'muted', onClick: () => alert('Twitter clicked') },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      {/* Page-specific Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between p-3 border-b bg-background shadow-sm h-14">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Account Info</h1>
        <div className="w-9" /> {/* Spacer to balance title */}
      </header>

      <main className="flex-grow overflow-y-auto p-4 space-y-5 pb-[calc(4rem+4.5rem)]"> {/* Padding for BottomNav + PageFooter */}
        {/* User Info Block */}
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="flex items-center mb-4">
            <Avatar className="h-12 w-12 mr-4">
              <AvatarImage src="https://placehold.co/100x100.png" alt="User-1b6fb" data-ai-hint="avatar person" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <p className="text-lg font-semibold flex-grow">User-1b6fb</p>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">UID</span>
              <div className="flex items-center">
                <span className="font-medium">209211373</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 ml-1 text-muted-foreground hover:text-foreground">
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Registration Info</span>
              <div className="flex items-center">
                <span className="font-medium truncate max-w-[180px] sm:max-w-xs">arganjava@gmail.com</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 ml-1 text-muted-foreground hover:text-foreground">
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings List */}
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          {listItems.map((item, index) => (
            <React.Fragment key={item.label}>
              <ListItem {...item} />
              {index < listItems.length - 1 && <Separator className="mx-4 w-auto" />}
            </React.Fragment>
          ))}
        </div>
      </main>

      {/* Page-specific Footer for buttons */}
      <footer className="fixed bottom-16 left-0 right-0 z-20 p-3 border-t bg-background flex gap-3">
        <Button className="flex-1 h-11 text-sm bg-accent hover:bg-accent/90 text-accent-foreground">
          Switch Account
        </Button>
        <Button variant="outline" className="flex-1 h-11 text-sm bg-muted hover:bg-muted/80 text-foreground">
          Log Out
        </Button>
      </footer>
    </div>
  );
}
