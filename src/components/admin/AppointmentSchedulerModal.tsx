import React, { useState } from 'react';
import { Registration, ObservationAppointment } from '../../types/database';
import { TIME_SLOTS, OBSERVATION_ROOMS, AVAILABLE_OBSERVERS } from '../../lib/constants';
import { repository } from '../../lib/repository';
import { Calendar, Clock, MapPin, User, AlertCircle, X, CheckCircle2, RotateCcw } from 'lucide-react';

interface AppointmentSchedulerModalProps {
  registration: Registration;
  onClose: () => void;
  onScheduled: (updatedRegistration: Registration) => void;
}

export const AppointmentSchedulerModal: React.FC<AppointmentSchedulerModalProps> = ({
  registration,
  onClose,
  onScheduled,
}) => {
  const existingAppointment = registration.appointment;

  // Default date to next Saturday or 3 days ahead
  const defaultDate = (() => {
    if (existingAppointment?.appointment_date) return existingAppointment.appointment_date;
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  })();

  const [date, setDate] = useState(defaultDate);
  const [slot, setSlot] = useState(existingAppointment?.time_slot || TIME_SLOTS[0]);
  const [room, setRoom] = useState(existingAppointment?.location_room || OBSERVATION_ROOMS[0]);
  const [observerId, setObserverId] = useState(existingAppointment?.observer_id || AVAILABLE_OBSERVERS[0].id);
  const [notes, setNotes] = useState(existingAppointment?.notes || '');
  const [rescheduleReason, setRescheduleReason] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isRescheduling = Boolean(existingAppointment && existingAppointment.status !== 'Dibatalkan');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    const observer = AVAILABLE_OBSERVERS.find((o) => o.id === observerId);

    const fullNotes = isRescheduling && rescheduleReason
      ? `${notes ? notes + ' | ' : ''}Reschedule: ${rescheduleReason}`
      : notes;

    const result = repository.scheduleAppointment({
      registration_id: registration.id,
      appointment_date: date,
      time_slot: slot,
      location_room: room,
      observer_id: observer?.id,
      observer_name: observer ? `${observer.name} (${observer.role})` : undefined,
      notes: fullNotes,
    });

    setIsSaving(false);

    if (!result.success) {
      setError(result.error || 'Gagal menjadwalkan');
      return;
    }

    const updated = repository.getRegistrationById(registration.id);
    if (updated) {
      onScheduled(updated);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            {isRescheduling ? <RotateCcw className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isRescheduling ? 'Reschedule Jadwal Observasi' : 'Tetapkan Jadwal Observasi'}
            </h3>
            <p className="text-xs text-slate-500">
              Siswa: <strong className="text-slate-800">{registration.student?.full_name}</strong> ({registration.registration_number})
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Konflik Jadwal:</span> {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Tanggal Observasi */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>Tanggal Observasi <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Slot Waktu */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span>Pilihan Waktu (Slot) <span className="text-rose-500">*</span></span>
            </label>
            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              {TIME_SLOTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Lokasi Ruangan */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              <span>Ruangan Observasi <span className="text-rose-500">*</span></span>
            </label>
            <select
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              {OBSERVATION_ROOMS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400">Sistem secara otomatis mencegah bentrok ruangan & waktu yang sama.</span>
          </div>

          {/* Observer Assignment (Fondasi Modul 2) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-500" />
              <span>Petugas / Observer Utama</span>
            </label>
            <select
              value={observerId}
              onChange={(e) => setObserverId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              {AVAILABLE_OBSERVERS.map((obs) => (
                <option key={obs.id} value={obs.id}>
                  {obs.name} — {obs.role}
                </option>
              ))}
            </select>
          </div>

          {/* Reschedule Reason if updating */}
          {isRescheduling && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-amber-800">
                Alasan Perubahan Jadwal (Reschedule) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Permintaan orang tua karena anak demam / kendala teknis ruangan"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-amber-50/40 text-xs text-slate-900"
              />
            </div>
          )}

          {/* Internal Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Catatan Khusus Sesi (Internal Staf)
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Siapkan mainan puzzle kayu dan redupkan lampu ruang sensori..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : isRescheduling ? 'Simpan Reschedule' : 'Konfirmasi Jadwal'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
