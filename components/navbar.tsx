'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Stethoscope, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-teal-600 p-2 rounded-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Book My Doc</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {user && profile ? (
              <>
                <Link
                  href="/doctors"
                  className={`text-sm font-medium transition-colors hover:text-teal-600 ${
                    pathname === '/doctors' ? 'text-teal-600' : 'text-gray-700'
                  }`}
                >
                  Find Doctors
                </Link>
                <Link
                  href={profile.role === 'doctor' ? '/doctor/dashboard' : '/dashboard'}
                  className={`text-sm font-medium transition-colors hover:text-teal-600 ${
                    pathname.includes('/dashboard') ? 'text-teal-600' : 'text-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      {profile.full_name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href={profile.role === 'doctor' ? '/doctor/profile' : '/profile'} className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={profile.role === 'doctor' ? '/doctor/dashboard' : '/dashboard'} className="cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : !isAuthPage ? (
              <>
                <Link
                  href="/doctors"
                  className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
                >
                  Find Doctors
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                    Sign Up
                  </Button>
                </Link>
              </>
            ) : null}
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t">
            {user && profile ? (
              <>
                <Link
                  href="/doctors"
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Find Doctors
                </Link>
                <Link
                  href={profile.role === 'doctor' ? '/doctor/dashboard' : '/dashboard'}
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href={profile.role === 'doctor' ? '/doctor/profile' : '/profile'}
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-gray-50 rounded"
                >
                  Sign Out
                </button>
              </>
            ) : !isAuthPage ? (
              <>
                <Link
                  href="/doctors"
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Find Doctors
                </Link>
                <Link
                  href="/login"
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block px-4 py-2 text-sm font-medium text-teal-600 hover:bg-gray-50 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            ) : null}
          </div>
        )}
      </div>
    </nav>
  );
}
