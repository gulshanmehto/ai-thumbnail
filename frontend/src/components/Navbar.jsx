import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Sparkles, LayoutGrid, CreditCard } from 'lucide-react';

export default function Navbar() {
  const { user, login, logout } = useAuth();

  return (
    <nav className="border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 md:p-2 rounded-lg">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <span className="font-bold text-lg md:text-xl tracking-tight">QuikThumb.ai</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <>
              <Link to="/showcase" className="hidden sm:block">
                <Button variant="ghost" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden md:inline">Showcase</span>
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" className="gap-2 px-2 md:px-4">
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden md:inline">Dashboard</span>
                </Button>
              </Link>
              <Link to="/pricing">
                <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 bg-secondary rounded-full text-[10px] md:text-sm font-medium hover:bg-secondary/80 transition-colors cursor-pointer">
                  <CreditCard className="w-3 h-3 text-muted-foreground" />
                  <span>{user.credits} <span className="hidden xs:inline">Credits</span></span>
                </div>
              </Link>
              <Button onClick={logout} variant="outline" size="sm" className="hidden sm:flex">Logout</Button>
            </>
          ) : (
            <>
              <Link to="/showcase" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">Showcase</Link>
              <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-colors hidden xs:block">Pricing</Link>
              <Link to="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
