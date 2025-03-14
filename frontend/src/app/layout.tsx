'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/layout/Sidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import MobileNav from '@/components/layout/MobileNav';
import MobileHeader from '@/components/layout/MobileHeader';
import { AuthProvider } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <html lang="en">
      <body className={`${inter.className} bg-black`}>
        <AuthProvider>
          {/* Main container - fixed height */}
          <div className="h-screen max-w-screen bg-black text-white flex overflow-hidden">
            {/* Sidebar - sticky */}
            {!isAuthPage && (
              <aside className="hidden md:block md:flex-none md:w-64 h-screen sticky top-0">
                <Sidebar />
              </aside>
            )}

            {/* Main content area - center column */}
            <div className="flex flex-col flex-1 h-screen relative">
              {/* Mobile header - sticky on mobile */}
              {!isAuthPage && <MobileHeader />}

              {/* Main content - scrollable area */}
              <main className={`flex-1 overflow-y-auto ${isAuthPage ? '' : 'border-x border-gray-800 md:max-w-2xl md:mx-0'}`}>
                {children}
              </main>

              {/* Mobile nav - fixed at bottom on mobile */}
              {!isAuthPage && <div className="md:hidden">
                <MobileNav />
              </div>}
            </div>

            {/* Right sidebar - sticky */}
            {!isAuthPage && (
              <aside className="hidden lg:block lg:flex-none lg:w-80 h-screen sticky top-0">
                <RightSidebar />
              </aside>
            )}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
