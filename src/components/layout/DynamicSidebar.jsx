'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
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
  ArrowLeft,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCourseBuilder } from '../dashboard/Courses';

const mainNavigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Courses', href: '/dashboard/courses', icon: BookOpen },
  { 
    name: 'Website', 
    href: '/dashboard/websites', 
    icon: Globe,
    children: [
      { name: 'Design', href: '/dashboard/websites/design' },
      { name: 'Themes', href: '/dashboard/websites/themes' },
      { name: 'Blog', href: '/dashboard/websites/blog' },
      { name: 'Popups', href: '/dashboard/websites/popups' },
      { name: 'Funnels', href: '/dashboard/websites/funnels' },
      { name: 'Navigation', href: '/dashboard/websites/navigation' },
      { name: 'Settings', href: '/dashboard/websites/settings' }
    ]
  },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Communication', href: '/dashboard/communication', icon: MessageSquare },
  { name: 'Subscription', href: '/dashboard/subscription', icon: CreditCard },
  { name: 'Search', href: '/dashboard/search', icon: SearchIcon }
];

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

const DynamicSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  
  // Try to get course builder context, but don't fail if not available
  let courseBuilder = null;
  try {
    courseBuilder = useCourseBuilder();
  } catch (e) {
    // Context not available, use main sidebar
  }

  const isActive = (href) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Render Course Builder Sidebar
  if (courseBuilder?.editingCourse) {
    return (
      <div className="w-64 bg-card border-r border-border flex flex-col">
        {/* Course Header */}
        <div className="p-4 border-b border-border">
          <button 
            onClick={courseBuilder.stopEditing}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{courseBuilder.editingCourse.title}</span>
          </button>
        </div>
        
        {/* Course Builder Navigation */}
        <div className="flex-1 overflow-y-auto">
          {courseBuilderItems.map((category) => (
            <div key={category.category} className="p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {category.category}
              </h3>
              <div className="space-y-1">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => courseBuilder.setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        courseBuilder.activeTab === item.id
                          ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
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
        </div>
      </div>
    );
  }

  // Render Main Sidebar
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
        {mainNavigation.map((item) => (
          <div key={item.name}>
            <Link
              href={item.href}
              onMouseEnter={() => router.prefetch(item.href)}
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

// Wrapper component that handles context availability
const DynamicSidebarWrapper = (props) => {
  const pathname = usePathname();
  
  // Only use dynamic sidebar on courses page
  if (pathname.startsWith('/dashboard/courses')) {
    return <DynamicSidebar {...props} />;
  }
  
  // Fallback to regular sidebar for other pages
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
        {mainNavigation.map((item) => {
          const isActive = (href) => {
            if (href === '/dashboard') {
              return pathname === href;
            }
            return pathname.startsWith(href);
          };
          
          return (
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
          );
        })}
      </nav>

      {/* Settings Link at the bottom */}
      <div className="p-4 border-t border-border mt-auto">
        <Link
            href="/dashboard/settings"
            className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
            pathname.startsWith('/dashboard/settings')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
        >
            <Settings
            className={`mr-3 h-5 w-5 ${
                pathname.startsWith('/dashboard/settings') ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
            }`}
            />
            Settings
        </Link>
      </div>
    </div>
  );
};

export default DynamicSidebarWrapper;