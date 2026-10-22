import React from 'react';
import { StarLogo } from '../common/StarLogo';
import { SchoolSettings } from '../../types/database';
import { createWhatsAppLink } from '../../lib/utils';
import { MapPin, Phone, Mail, MessageCircle, Heart } from 'lucide-react';

interface FooterProps {
  settings: SchoolSettings;
  onNavigate: (view: 'home' | 'register' | 'confirmation' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  const whatsappUrl = createWhatsAppLink(
    settings.whatsapp_number,
    'Halo Little Star School Pamekasan, saya ingin berkonsultasi mengenai proses pendaftaran observasi siswa.'
  );

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand & Tagline */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <StarLogo size={36} />
              <span className="text-xl font-extrabold text-white tracking-tight">
                Little Star School <span className="text-amber-400">Pamekasan</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              "{settings.tagline}". Pusat pembelajaran khusus dan asesmen tumbuh kembang ramah anak berkebutuhan khusus (ABK) di Pamekasan, Madura.
            </p>
            <div className="pt-2">
              <span className="text-xs text-amber-400 bg-amber-950/70 border border-amber-800/60 rounded-md px-2.5 py-1 font-medium inline-block">
                {settings.accreditation}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">Navigasi Utama</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    setTimeout(() => document.getElementById('tentang-sekolah')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Visi & Misi Sekolah
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    setTimeout(() => document.getElementById('tahapan-observasi')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Alur Observasi Play-Based
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('register');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-amber-400 font-semibold hover:underline"
                >
                  Formulir Pendaftaran Baru
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-slate-500 hover:text-slate-300 transition-colors text-xs"
                >
                  Login Staf & Administrasi
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">Kontak & Lokasi</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{settings.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{settings.phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{settings.email}</span>
              </p>
              <div className="pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat WhatsApp Resmi</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Quiet Bottom Notice */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            &copy; {new Date().getFullYear()} Little Star School Pamekasan. Hak Cipta Dilindungi Undang-Undang.
          </p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Didedikasikan dengan</span>
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 inline" />
            <span>untuk anak-anak istimewa Pamekasan & Madura</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
