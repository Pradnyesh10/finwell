'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  TrendingUp,
  ShieldAlert,
  Activity,
  BellRing,
  FileText,
  User,
  Settings,
  Bot,
  Home,
  Inbox,
  Tag,
  Users,
  Upload,
  LogOut,
  ArrowLeftRight,
  LineChart,
} from 'lucide-react';
import { homeFor, setSession, type Session } from '@/lib/session';

const personalNav = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'AI Copilot', href: '/copilot', icon: Bot },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
  { name: 'EMI & Loans', href: '/loans', icon: CreditCard },
  { name: 'Stock Portfolio', href: '/portfolio', icon: LineChart },
  { name: 'Investments', href: '/investments', icon: TrendingUp },
  { name: 'Emergency Fund', href: '/emergency', icon: ShieldAlert },
  { name: 'Risk Analysis', href: '/risk', icon: Activity },
  { name: 'Stress Alerts', href: '/stress', icon: BellRing },
  { name: 'Reports', href: '/reports', icon: FileText },
];

const businessNav = [
  { name: 'Home', href: '/business', icon: Home },
  { name: 'Orders', href: '/business/orders', icon: Inbox },
  { name: 'Products', href: '/business/products', icon: Tag },
  { name: 'Customers', href: '/business/customers', icon: Users },
  { name: 'Import Data', href: '/business/import', icon: Upload },
  { name: 'AI Assistant', href: '/copilot', icon: Bot },
];

export function Sidebar({ session }: { session: Session }) {
  const pathname = usePathname();
  const router = useRouter();
  const isBusiness = session.mode === 'business';
  const navItems = isBusiness ? businessNav : personalNav;

  const switchMode = () => {
    const mode = isBusiness ? 'personal' : 'business';
    setSession({ ...session, mode });
    router.push(homeFor(mode));
  };

  const logout = () => {
    setSession(null);
    router.push('/login');
  };

  const linkClass = (active: boolean) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-white/10',
      active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
    );

  return (
    <div className="flex h-full w-64 flex-col border-r border-[var(--border)] bg-[rgba(15,23,42,0.4)] backdrop-blur-xl">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-[0_0_15px_rgba(59,130,246,0.5)]',
            isBusiness ? 'from-emerald-500 to-teal-600' : 'from-primary to-blue-600'
          )}>
            <span className="text-2xl font-black text-white italic">F</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-foreground leading-none">
              FINWELL
            </span>
            <span className={cn('text-[10px] font-bold uppercase tracking-widest mt-1', isBusiness ? 'text-emerald-400' : 'text-muted-foreground')}>
              {isBusiness ? 'for Business' : 'Personal'}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-2">
        <div className="grid grid-cols-2 rounded-lg border border-[var(--border)] p-1 text-xs font-semibold">
          {(['personal', 'business'] as const).map(m => (
            <button
              key={m}
              onClick={() => m !== session.mode && switchMode()}
              className={cn(
                'rounded-md py-1.5 capitalize transition',
                session.mode === m ? (m === 'business' ? 'bg-emerald-500 text-white' : 'bg-primary text-white') : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="flex flex-col gap-1 px-4">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} className={linkClass(pathname === item.href)}>
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 space-y-1">
        {!isBusiness && (
          <>
            <Link href="/profile" className={linkClass(pathname === '/profile')}><User className="h-4 w-4" />Profile</Link>
            <Link href="/settings" className={linkClass(pathname === '/settings')}><Settings className="h-4 w-4" />Settings</Link>
          </>
        )}
        <button onClick={switchMode} className={cn(linkClass(false), 'w-full')}>
          <ArrowLeftRight className="h-4 w-4" />
          Switch to {isBusiness ? 'Personal' : 'Business'}
        </button>
        <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2 mt-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{session.name}</p>
            <p className="text-[11px] text-muted-foreground">+91 {session.phone}</p>
          </div>
          <button onClick={logout} title="Log out" className="text-muted-foreground hover:text-red-400">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
