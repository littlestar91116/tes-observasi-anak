import React, { useState } from 'react';
import { SchoolSettings } from '../../types/database';
import { repository } from '../../lib/repository';
import { AuditLogger } from '../../lib/auditLogger';
import { 
  Settings, 
  X, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Save, 
  Info, 
  Image as ImageIcon,
  Building,
  Phone,
  Mail,
  FileText,
  Calendar,
  Sliders
} from 'lucide-react';

interface SchoolSettingsModalProps {
  settings: SchoolSettings;
  onClose: () => void;
  onSaved: (updated: SchoolSettings) => void;
}

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({
  settings,
  onClose,
  onSaved,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'report' | 'scoring' | 'schedule'>('profile');

  // Profile & Contact State
  const [schoolName, setSchoolName] = useState(settings.school_name || 'Little Star School Pamekasan');
  const [tagline, setTagline] = useState(settings.tagline || 'Setiap Anak Istimewa, Setiap Potensi Berharga');
  const [logoUrl, setLogoUrl] = useState(settings.logo_url || '/assets/aistudio/Logo_Little_Star_Learning_-_full_color_e3de3950.png');
  const [address, setAddress] = useState(settings.address || 'Perum Royal Pademawu, Blok B No.18 - 19, Dasok - Pademawu - Pamekasan');
  const [phone, setPhone] = useState(settings.phone || '082199988769');
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp_number || '082199988769');
  const [email, setEmail] = useState(settings.email || 'littlestar91116@gmail.com');
  const [accreditation, setAccreditation] = useState(settings.accreditation || 'Terakreditasi B / Layanan Khusus Terdaftar');
  
  // Vision & Mission
  const [vision, setVision] = useState(settings.vision);
  const [missionList, setMissionList] = useState<string[]>(settings.mission || []);
  const [newMissionItem, setNewMissionItem] = useState('');

  // Report & Document Configuration
  const [reportHeader, setReportHeader] = useState(
    settings.report_header || 'LEMBAGA PENDIDIKAN KHUSUS & PUSAT TUMBUH KEMBANG LITTLE STAR SCHOOL PAMEKASAN'
  );
  const [reportFooter, setReportFooter] = useState(
    settings.report_footer || 'DOKUMEN RAHASIA — INFORMASI PERKEMBANGAN ANAK • LITTLE STAR SCHOOL PAMEKASAN'
  );
  const [reportNumberFormat, setReportNumberFormat] = useState(
    settings.report_number_format || 'LSS-OBS/{YEAR}/{MONTH}/{SEQ}'
  );

  // Scoring Labels
  const [score0, setScore0] = useState(settings.scoring_labels?.score_0 || 'Belum ditunjukkan');
  const [score1, setScore1] = useState(settings.scoring_labels?.score_1 || 'Ditunjukkan dengan bantuan penuh');
  const [score2, setScore2] = useState(settings.scoring_labels?.score_2 || 'Ditunjukkan dengan bantuan sebagian');
  const [score3, setScore3] = useState(settings.scoring_labels?.score_3 || 'Ditunjukkan secara mandiri');

  // Calendar & Operating Schedule
  const [calendarSchedule, setCalendarSchedule] = useState(
    settings.calendar_schedule || 'Senin – Jumat: 08:00 – 15:30 WIB • Sabtu: 08:00 – 12:30 WIB (Khusus Observasi ABK & Sesi Terapi)'
  );
  
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddMission = () => {
    if (newMissionItem.trim()) {
      setMissionList([...missionList, newMissionItem.trim()]);
      setNewMissionItem('');
    }
  };

  const handleRemoveMission = (index: number) => {
    setMissionList(missionList.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updated = repository.updateSettings({
      school_name: schoolName,
      tagline,
      logo_url: logoUrl,
      address,
      phone,
      whatsapp_number: whatsapp,
      email,
      accreditation,
      vision,
      mission: missionList,
      report_header: reportHeader,
      report_footer: reportFooter,
      report_number_format: reportNumberFormat,
      calendar_schedule: calendarSchedule,
      scoring_labels: {
        score_0: score0,
        score_1: score1,
        score_2: score2,
        score_3: score3,
      },
    });

    AuditLogger.log(
      'SETTINGS_UPDATE',
      'Pengaturan',
      updated.id,
      `Memperbarui profil dan konfigurasi sekolah (${schoolName}, ${address}, telp: ${phone})`,
      'Super Admin',
      'admin'
    );

    setIsSaving(false);
    setSavedSuccess(true);
    onSaved(updated);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Pengaturan & Konfigurasi Sekolah
            </h3>
            <p className="text-xs text-slate-500">
              Kelola identitas resmi, logo, nomor kontak, format dokumen laporan, dan skala skor observasi.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan berhasil disimpan ke sistem! Menutup jendela...</span>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 gap-2 mb-5 text-xs font-bold">
          {[
            { id: 'profile', label: 'Identitas & Kontak', icon: Building },
            { id: 'report', label: 'Kop Laporan & Penomoran', icon: FileText },
            { id: 'scoring', label: 'Skala Skor Observasi', icon: Sliders },
            { id: 'schedule', label: 'Jadwal & Kalender', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2.5 px-3 flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
                  isSel
                    ? 'border-blue-700 text-blue-700 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">

          {/* TAB 1: IDENTITAS & KONTAK */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Resmi Sekolah</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Slogan / Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Logo Preview & URL */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
                <img
                  src={logoUrl}
                  alt="Logo Preview"
                  className="w-14 h-14 object-contain rounded-full shadow-xs bg-white p-1 border border-slate-200"
                  onError={(e) => {
                    (e.target as any).src = '/assets/aistudio/Logo_Little_Star_Learning_-_full_color_e3de3950.png';
                  }}
                />
                <div className="flex-1">
                  <label className="block font-bold text-slate-700 mb-1">Path / URL Logo Sekolah</label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-800 font-mono text-[11px] focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Default aktif: <code>/assets/aistudio/Logo_Little_Star_Learning_-_full_color_e3de3950.png</code>
                  </p>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Gedung Sekolah</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Phone, WA, Email */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telepon</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">WhatsApp Resmi</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Resmi</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Accreditation */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Legalitas & Akreditasi</label>
                <input
                  type="text"
                  value={accreditation}
                  onChange={(e) => setAccreditation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: KOP LAPORAN & FORMAT PENOMORAN */}
          {activeTab === 'report' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kop Header Laporan Observasi Resmi</label>
                <input
                  type="text"
                  value={reportHeader}
                  onChange={(e) => setReportHeader(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teks Footer Kerahasiaan (Privacy Watermark)</label>
                <input
                  type="text"
                  value={reportFooter}
                  onChange={(e) => setReportFooter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Format Pola Penomoran Laporan</label>
                <input
                  type="text"
                  value={reportNumberFormat}
                  onChange={(e) => setReportNumberFormat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Tag pengganti otomatis: <code>{'{YEAR}'}</code> untuk tahun, <code>{'{MONTH}'}</code> untuk bulan, <code>{'{SEQ}'}</code> untuk urutan nomor.
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-xs">
                <span className="font-bold">Contoh Hasil Penomoran Dokumen:</span>{' '}
                <span className="font-mono font-bold text-blue-700">LSS-OBS/2026/10/001</span>
              </div>
            </div>
          )}

          {/* TAB 3: SKALA SKOR OBSERVASI */}
          {activeTab === 'scoring' && (
            <div className="space-y-4">
              <p className="text-slate-600 text-xs">
                Konfigurasi label tingkatan skala observasi 0–3 yang digunakan oleh Guru Observer pada lembar penilaian.
              </p>

              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <span className="w-16 font-mono font-bold text-slate-700 bg-slate-100 py-1.5 text-center rounded border">Skor 0</span>
                  <input
                    type="text"
                    value={score0}
                    onChange={(e) => setScore0(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-16 font-mono font-bold text-slate-700 bg-slate-100 py-1.5 text-center rounded border">Skor 1</span>
                  <input
                    type="text"
                    value={score1}
                    onChange={(e) => setScore1(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-16 font-mono font-bold text-slate-700 bg-slate-100 py-1.5 text-center rounded border">Skor 2</span>
                  <input
                    type="text"
                    value={score2}
                    onChange={(e) => setScore2(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-16 font-mono font-bold text-slate-700 bg-slate-100 py-1.5 text-center rounded border">Skor 3</span>
                  <input
                    type="text"
                    value={score3}
                    onChange={(e) => setScore3(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                <strong>Catatan Asesmen:</strong> Nilai "Belum Diamati" tidak dihitung sebagai nol (0) dan dikecualikan dari pembagi perhitungan persentase domain.
              </div>
            </div>
          )}

          {/* TAB 4: JADWAL & KALENDER */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jam Operasional & Hari Belajar</label>
                <textarea
                  rows={3}
                  value={calendarSchedule}
                  onChange={(e) => setCalendarSchedule(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Visi Sekolah</label>
                <textarea
                  rows={2}
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Poin Misi Sekolah</label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {missionList.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="flex-1 text-slate-700">{m}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMission(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newMissionItem}
                    onChange={(e) => setNewMissionItem(e.target.value)}
                    placeholder="Tambah poin misi baru..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddMission}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-slate-400 text-xs">Little Star School Pamekasan • Versi 4.0</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl font-bold text-slate-700 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <span>Menyimpan...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Pengaturan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
