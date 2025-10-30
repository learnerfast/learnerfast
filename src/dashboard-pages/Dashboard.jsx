import React, { lazy, Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import DynamicSidebar from '../components/layout/DynamicSidebar';
import Header from '../components/layout/Header';
import { HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Lazy load components for better performance
const Home = lazy(() => import('../components/dashboard/Home'));
const Courses = lazy(() => import('../components/dashboard/Courses'));
const Websites = lazy(() => import('../components/dashboard/Websites'));
const Users = lazy(() => import('../components/dashboard/Users'));
const Communication = lazy(() => import('../components/dashboard/Communication'));
const Subscription = lazy(() => import('../components/dashboard/Subscription'));
const Search = lazy(() => import('../components/dashboard/Search'));
const Settings = lazy(() => import('../components/dashboard/Settings'));

import { StatsSkeleton } from '../components/SkeletonLoader';

const LoadingFallback = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
      <div className="h-4 bg-muted rounded w-96 animate-pulse"></div>
    </div>
    <StatsSkeleton />
  </div>
);

const Dashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const renderComponent = () => {
    switch (pathname) {
      case '/dashboard':
        return <Home />;
      case '/dashboard/courses':
        return <Courses />;
      case '/dashboard/websites':
      case '/dashboard/websites/design':
      case '/dashboard/websites/themes':
      case '/dashboard/websites/blog':
      case '/dashboard/websites/popups':
      case '/dashboard/websites/funnels':
      case '/dashboard/websites/navigation':
      case '/dashboard/websites/settings':
        return <Websites />;
      case '/dashboard/users':
        return <Users />;
      case '/dashboard/communication':
        return <Communication />;
      case '/dashboard/subscription':
        return <Subscription />;
      case '/dashboard/search':
        return <Search />;
      case '/dashboard/settings':
        return <Settings />;
      default:
        return <Home />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-16 bg-card border-b border-border animate-pulse"></div>
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
            <div className="container mx-auto px-6 py-8">
              <LoadingFallback />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <DynamicSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <div className="container mx-auto px-6 py-8">
            <Suspense fallback={<LoadingFallback />}>
              {renderComponent()}
            </Suspense>
          </div>
        </main>
      </div>

      {/* Floating Help Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-50 group"
        initial="initial"
        whileHover="hover"
      >
        <button
          className="flex items-center justify-center p-3 bg-teal-600 text-white rounded-full shadow-lg hover:bg-teal-700 transition-all duration-300 ease-in-out"
        >
          <HelpCircle className="h-6 w-6" />
          <motion.span
            variants={{
              initial: { width: 0, opacity: 0, marginLeft: 0 },
              hover: { width: 'auto', opacity: 1, marginLeft: '0.75rem' }
            }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden whitespace-nowrap font-semibold"
          >
            Help & Support
          </motion.span>
        </button>
      </motion.div>
    </div>
  );
};

export default Dashboard;
