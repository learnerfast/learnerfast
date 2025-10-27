'use client';
import React, { useMemo, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  BookOpen, 
  Globe, 
  Users, 
  Settings,
  MessageSquare,
  Search as SearchIcon,
  Video,
  Upload,
  BarChart3,
  Activity,
  Sparkles,
  FileText,
  Award,
  GraduationCap,
  ClipboardList,
  FileCheck,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCourseContext } from '../../app/dashboard/courses/page';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Courses', href: '/dashboard/courses', icon: BookOpen },
  { name: 'Website', href: '/dashboard/websites', icon: Globe },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Communication', href: '/dashboard/communication', icon: MessageSquare },
  { name: 'Subscription', href: '/dashboard/subscription', icon: CreditCard },
  { name: 'Search', href: '/dashboard/search', icon: SearchIcon }
];

const Sidebar = React.memo(() => {
  const pathname = usePathname();
  const { user } = useAuth();
  const courseContext = useCourseContext();
  const { selectedCourse, onTabSelect } = courseContext || {};

  const isActive = useMemo(() => (href) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }, [pathname]);

  const courseBuilderItems = [
    {
      category: 'Contents',
      items: [
        { id: 'course-outline', label: 'Course outline', icon: BookOpen },
        { id: 'course-page-layout', label: 'Course page layout', icon: FileText }
      ]
    },
    {
      category: 'Course settings',
      items: [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'access', label: 'Access', icon: Users },
        { id: 'pricing', label: 'Pricing', icon: BarChart3 },
        { id: 'automations', label: 'Automations', icon: Sparkles }
      ]
    }
  ];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="font-semibold text-lg text-foreground">CourseBuilder</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {selectedCourse && pathname === '/dashboard/courses' ? (
          <>
            <div className="mb-4 pb-4 border-b border-border">
              <button 
                onClick={() => onTabSelect?.(null)}
                className="text-sm text-muted-foreground hover:text-foreground mb-2"
              >
                ← Back to Courses
              </button>
              <h3 className="font-semibold text-foreground truncate">{selectedCourse.title}</h3>
            </div>
            {courseBuilderItems.map((category) => (
              <div key={category.category} className="mb-6">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                  {category.category}
                </h4>
                <div className="space-y-1">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onTabSelect?.(item.id)}
                        className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <Icon className="mr-3 h-4 w-4" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        ) : (
          navigation.map((item) => (
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
          ))
        )}
      </nav>

      {/* Settings Link at the bottom - only show when not in course mode */}
      {!(selectedCourse && pathname === '/dashboard/courses') && (
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
      )}
    </div>
  );
});

Sidebar.displayName = 'Sidebar';
export default Sidebar;