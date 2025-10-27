'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  Home, 
  BookOpen, 
  Globe, 
  Users, 
  Settings,
  MessageSquare,
  Search as SearchIcon,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Courses', href: '/dashboard/courses', icon: BookOpen },
  { 
    name: 'Website', 
    href: '/dashboard/websites', 
    icon: Globe
  },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Communication', href: '/dashboard/communication', icon: MessageSquare },
  { name: 'Subscription', href: '/dashboard/subscription', icon: CreditCard },
  { name: 'Search', href: '/dashboard/search', icon: SearchIcon }
];

const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center">
          <Image src="/learnerfast-logo.png" alt="LearnerFast" width={150} height={40} style={{height: 'auto'}} />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <div key={item.name}>
            <Link
              href={item.href}
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors relative ${
                isActive(item.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {isActive(item.href) && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-primary rounded-r-full"></div>}
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  isActive(item.href) ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                }`}
              />
              {item.name}
            </Link>
            
            {/* Sub-navigation */}
            {item.children && isActive(item.href) && (
              <div className="ml-8 mt-2 space-y-1 border-l border-border pl-4">
                {item.children.map((child) => (
                  <Link
                    key={child.name}
                    href={child.href}
                    className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${
                      pathname === child.href
                        ? 'text-primary font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Settings Link at the bottom */}
      <div className="p-4 border-t border-border mt-auto">
        <Link
            href="/dashboard/settings"
            className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
            isActive('/dashboard/settings')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
        >
            <Settings
            className={`mr-3 h-5 w-5 ${
                isActive('/dashboard/settings') ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
            }`}
            />
            Settings
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
