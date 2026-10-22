import React from 'react';
import { SchoolSettings } from '../../types/database';
import { createWhatsAppLink } from '../../lib/utils';
import { MapPin, Phone, MessageCircle, Mail, Clock } from 'lucide-react';

interface ContactSectionProps {
  settings: SchoolSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const whatsappUrl = createWhatsAppLink(
    settings.whatsapp_number,
    'Halo Little Star School Pamekasan, saya ingin bertanya lebih lanjut mengenai layanan observasi anak berkebutuhan khusus.'
  );

  return (
    <section id="kontak" className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold tracking-wider uppercase text-amber-600">
            Hubungi Kami
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Konsultasi & Layanan Informasi
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Pintu komunikasi Little Star School selalu terbuka untuk orang tua, keluarga, dan tenaga medis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Card 1: WhatsApp Chat Button */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border border-emerald-200/80 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Konsultasi WhatsApp</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Respon cepat melalui admin resmi Little Star School Pamekasan pada jam operasional sekolah.
              </p>
              <div className="text-xs text-slate-500 font-medium">
                Nomor: +{settings.whatsapp_number}
              </div>
            </div>

            <div className="pt-6">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-sm rounded-xl shadow-xs transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Mulai Chat WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Card 2: Phone & Email */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Telepon & Email</h3>
              
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>{settings.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="truncate">{settings.email}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Senin - Sabtu: 07.30 - 15.30 WIB</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 text-xs text-slate-400">
              *Jadwal observasi anak dapat dilaksanakan pada hari Sabtu sesuai konfirmasi
            </div>
          </div>

          {/* Card 3: Address & Location */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Lokasi Sekolah</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {settings.address}
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                Akses mudah di pusat Pamekasan, lingkungan ramah anak dengan area parkir dan ruang tunggu keluarga.
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 text-xs text-slate-400">
              Kabupaten Pamekasan, Madura, Jawa Timur
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
