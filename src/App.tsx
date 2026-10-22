/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/home/HeroSection';
import { AboutSection } from './components/home/AboutSection';
import { VisionMissionSection } from './components/home/VisionMissionSection';
import { ObservationStepsSection } from './components/home/ObservationStepsSection';
import { AdmissionFaqSection } from './components/home/AdmissionFaqSection';
import { ContactSection } from './components/home/ContactSection';
import { RegistrationWizard } from './components/registration/RegistrationWizard';
import { RegistrationConfirmation } from './components/confirmation/RegistrationConfirmation';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SchoolSettingsModal } from './components/admin/SchoolSettingsModal';
import { repository } from './lib/repository';
import { Registration, SchoolSettings } from './types/database';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'register' | 'confirmation' | 'admin'>('home');
  const [settings, setSettings] = useState<SchoolSettings>(() => repository.getSettings());
  const [activeRegistration, setActiveRegistration] = useState<Registration | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Initialize with the most recent sample registration if opening confirmation directly
  useEffect(() => {
    if (!activeRegistration) {
      const all = repository.getRegistrations();
      if (all.length > 0) {
        setActiveRegistration(all[0]);
      }
    }
  }, [activeRegistration]);

  const handleRegistrationSuccess = (newReg: Registration) => {
    setActiveRegistration(newReg);
    setCurrentView('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateSettings = (updated: SchoolSettings) => {
    setSettings(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-slate-800">
      
      {/* Top Bar Contract compliant navigation */}
      <div className="no-print">
        <Header
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isAdminLoggedIn={Boolean(repository.getCurrentUser())}
        />
      </div>

      {/* Main View Router */}
      <main className="flex-1">
        
        {/* VIEW 1: Public Homepage */}
        {currentView === 'home' && (
          <div className="space-y-0">
            <HeroSection
              schoolName={settings.school_name}
              tagline={settings.tagline}
              onRegisterClick={() => {
                setCurrentView('register');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onLearnMoreClick={() => {
                const el = document.getElementById('alur-dan-faq');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <AboutSection />

            <VisionMissionSection
              settings={settings}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
            />

            <ObservationStepsSection
              onRegisterClick={() => {
                setCurrentView('register');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            <AdmissionFaqSection
              faqList={settings.faq_list}
              onRegisterClick={() => {
                setCurrentView('register');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            <ContactSection settings={settings} />
          </div>
        )}

        {/* VIEW 2: Online Registration Multi-Step Wizard */}
        {currentView === 'register' && (
          <RegistrationWizard
            onSuccess={handleRegistrationSuccess}
            onCancel={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW 3: Registration Confirmation & Receipt */}
        {currentView === 'confirmation' && (
          <>
            {activeRegistration ? (
              <RegistrationConfirmation
                registration={activeRegistration}
                settings={settings}
                onBackToHome={() => {
                  setCurrentView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ) : (
              <div className="py-20 text-center space-y-4">
                <p className="text-slate-500">Tidak ada berkas pendaftaran aktif yang dipilih.</p>
                <button
                  onClick={() => setCurrentView('register')}
                  className="px-5 py-2.5 bg-amber-500 text-white rounded-xl font-bold"
                >
                  Mulai Pendaftaran Baru
                </button>
              </div>
            )}
          </>
        )}

        {/* VIEW 4: Internal Admin Registration & Scheduling Dashboard */}
        {currentView === 'admin' && (
          <AdminDashboard
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onBackToHome={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

      </main>

      {/* Footer (Hidden on print) */}
      <div className="no-print">
        <Footer
          settings={settings}
          onNavigate={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>

      {/* Settings Modal (Global) */}
      {isSettingsModalOpen && (
        <SchoolSettingsModal
          settings={settings}
          onClose={() => setIsSettingsModalOpen(false)}
          onSaved={(updated) => {
            handleUpdateSettings(updated);
            setIsSettingsModalOpen(false);
          }}
        />
      )}

    </div>
  );
}
