import React, { useState } from 'react';
import { StarLogo } from '../common/StarLogo';
import { Menu, X, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentView: 'home' | 'register' | 'confirmation' | 'admin';
  onNavigate: (view: 'home' | 'register' | 'confirmation' | 'admin') => void;
  isAdminLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, isAdminLoggedIn = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: 'home' | 'register' | 'confirmation' | 'admin', anchorId?: string) => {
    setMobileMenuOpen(false);
    if (currentView !== 'home' && anchorId) {
      onNavigate('home');
      setTimeout(() => {
        const element = document.getElementById(anchorId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (anchorId) {
      const element = document.getElementById(anchorId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else {
      onNavigate(view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strict 3-Zone Top Bar Contract */}
        <div className="flex items-center justify-between gap-8 h-18">
          
          {/* Zone 1: Single Brand Wordmark Element */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1"
          >
            <StarLogo size={34} className="shrink-0 transition-transform group-hover:scale-105" />
            <span className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight whitespace-nowrap shrink-0">
              Little Star School <span className="text-amber-500 font-bold">Pamekasan</span>
            </span>
          </button>

          {/* Zone 2: 4-5 Concise Single-Line Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <button
              onClick={() => handleNavClick('home')}
              className={`hover:text-amber-600 transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                currentView === 'home' ? 'text-amber-600 border-b-2 border-amber-500' : ''
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => handleNavClick('home', 'tentang-sekolah')}
              className="hover:text-amber-600 transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer"
            >
              Tentang Kami
            </button>
            <button
              onClick={() => handleNavClick('home', 'tahapan-observasi')}
              className="hover:text-amber-600 transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer"
            >
              Tahapan Observasi
            </button>
            <button
              onClick={() => handleNavClick('home', 'alur-dan-faq')}
              className="hover:text-amber-600 transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer"
            >
              Alur & FAQ
            </button>
            <button
              onClick={() => handleNavClick('home', 'kontak')}
              className="hover:text-amber-600 transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer"
            >
              Kontak
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action (+ discreet admin access link) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('admin')}
              title="Portal Administrator Internal"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>{isAdminLoggedIn ? 'Dashboard Staf' : 'Staf Internal'}</span>
            </button>

            <button
              onClick={() => handleNavClick('register')}
              className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0 ${
                currentView === 'register'
                  ? 'bg-amber-600 text-white shadow-amber-200'
                  : 'bg-amber-500 hover:bg-amber-600 text-white active:scale-98 shadow-amber-200/50'
              }`}
            >
              Daftar Observasi
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <button
            onClick={() => handleNavClick('home')}
            className="block w-full text-left py-2 text-base font-semibold text-slate-800 hover:text-amber-600"
          >
            Beranda
          </button>
          <button
            onClick={() => handleNavClick('home', 'tentang-sekolah')}
            className="block w-full text-left py-2 text-base font-semibold text-slate-800 hover:text-amber-600"
          >
            Tentang Kami
          </button>
          <button
            onClick={() => handleNavClick('home', 'tahapan-observasi')}
            className="block w-full text-left py-2 text-base font-semibold text-slate-800 hover:text-amber-600"
          >
            Tahapan Observasi
          </button>
          <button
            onClick={() => handleNavClick('home', 'alur-dan-faq')}
            className="block w-full text-left py-2 text-base font-semibold text-slate-800 hover:text-amber-600"
          >
            Alur & FAQ
          </button>
          <button
            onClick={() => handleNavClick('home', 'kontak')}
            className="block w-full text-left py-2 text-base font-semibold text-slate-800 hover:text-amber-600"
          >
            Kontak
          </button>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('admin');
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700"
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Portal Administrator & Staf Internal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
