import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Sparkles, LayoutGrid, CreditCard, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-[#111827]">QuikThumb</span>
        </Link>

        {/* Center Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors">
            Home
          </Link>
          <Link to="/pricing" className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors">
            Pricing
          </Link>
          <Link to="/affiliate" className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors">
            Affiliate
          </Link>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" className="gap-2 text-[#4B5563] hover:text-[#111827] hover:bg-gray-100 px-3">
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <Link to="/pricing">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-semibold text-[#111827] transition-colors cursor-pointer border border-gray-200">
                  <CreditCard className="w-4 h-4 text-red-500" />
                  <span>{user.credits}</span>
                  <span className="hidden sm:inline text-[#6B7280]">credits</span>
                </div>
              </Link>
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="hidden sm:flex gap-2 text-[#6B7280] hover:text-red-500 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm" className="text-[#111827] border-gray-300 hover:bg-gray-50 rounded-xl px-5 font-medium">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <button className="h-9 px-5 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#FF4D4D] to-[#FF003C] text-white shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300">
                  Start now
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
