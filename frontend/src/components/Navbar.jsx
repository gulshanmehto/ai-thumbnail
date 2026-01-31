import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Sparkles, LayoutGrid, CreditCard, LogOut, Images } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl text-[#111827] tracking-tight">QuikThumb</span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
          {user ? (
            <>
              <Link to="/showcase" className="hidden sm:block">
                <Button variant="ghost" className="gap-2 text-[#4B5563] hover:text-[#111827] hover:bg-gray-100">
                  <Images className="w-4 h-4" />
                  <span className="hidden lg:inline">Showcase</span>
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" className="gap-2 text-[#4B5563] hover:text-[#111827] hover:bg-gray-100 px-2 sm:px-4">
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden md:inline">Dashboard</span>
                </Button>
              </Link>
              <Link to="/pricing">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-semibold text-[#111827] transition-colors cursor-pointer border border-gray-200">
                  <CreditCard className="w-4 h-4 text-red-500" />
                  <span>{user.credits}</span>
                  <span className="hidden xs:inline text-[#6B7280]">credits</span>
                </div>
              </Link>
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="hidden sm:flex gap-2 text-[#6B7280] hover:text-red-500 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/showcase" className="text-sm font-medium text-[#4B5563] hover:text-[#111827] transition-colors hidden sm:block px-3 py-2">
                Showcase
              </Link>
              <Link to="/pricing" className="text-sm font-medium text-[#4B5563] hover:text-[#111827] transition-colors hidden xs:block px-3 py-2">
                Pricing
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-[#4B5563] hover:text-[#111827]">
                  Log In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="btn-gradient text-white border-0 rounded-full px-5 shadow-md hover:shadow-lg">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
