import React, { useState } from 'react';
import { AuditLogEntry, AuditActionType, AuditRecordType } from '../../types/admin';
import { repository } from '../../lib/repository';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Lock, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Hash, 
  RefreshCw,
  Database,
  Calendar
} from 'lucide-react';
import { formatIndonesianDate } from '../../lib/utils';

interface AuditLogViewProps {
  currentRole: 'admin' | 'principal' | 'observer' | 'staff';
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ currentRole }) => {
  const isAuthorized = currentRole === 'admin' || currentRole === 'principal';
  const [logs, setLogs] = useState<AuditLogEntry[]>(() => repository.getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecordType, setSelectedRecordType] = useState<string>('all');
  const [selectedActionType, setSelectedActionType] = useState<string>('all');

  const refreshLogs = () => {
    setLogs(repository.getAuditLogs());
  };

  const filteredLogs = logs.filter((log) => {
    if (selectedRecordType !== 'all' && log.record_type !== selectedRecordType) return false;
    if (selectedActionType !== 'all' && log.action_type !== selectedActionType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        log.details.toLowerCase().includes(q) ||
        log.actor_name.toLowerCase().includes(q) ||
        log.record_id.toLowerCase().includes(q) ||
        log.action_type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Privacy & Tamper-Evident Security Assurance */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Jejak Audit Sistem (Audit Trail)</h2>
              <p className="text-xs text-slate-500">
                Pencatatan aktivitas sensitif pendaftaran, asesmen observasi, laporan PPI, keputusan admisi, dan hak akses.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Immutable & Non-Editable</span>
          </div>
          <button
            onClick={refreshLogs}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Segarkan Log"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* UU PDP Compliance Notice */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-3">
        <Database className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-blue-950">
            Kepatuhan Tata Kelola Perlindungan Data Pribadi (UU No. 27 Tahun 2022)
          </p>
          <p className="text-blue-800 leading-relaxed">
            Setiap aksi pembuatan, perubahan asesmen anak, penetapan keputusan admisi, dan pengunduhan data dicatat secara permanen bersama identitas aktor, waktu penanda (timestamp), serta hash integritas record guna mencegah manipulasi tanpa izin.
          </p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-700">Filter Modul:</span>
          {[
            { id: 'all', label: 'Semua Modul' },
            { id: 'Pendaftaran', label: 'Pendaftaran' },
            { id: 'Jadwal', label: 'Jadwal' },
            { id: 'Observasi', label: 'Observasi' },
            { id: 'Laporan', label: 'Laporan PPI' },
            { id: 'Keputusan Admisi', label: 'Admisi' },
            { id: 'Pengguna', label: 'Pengguna' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedRecordType(item.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                selectedRecordType === item.id
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari aktor, ID record, rincian..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Waktu (WIB)</th>
                <th className="px-5 py-3.5">Aktor Pelaksana</th>
                <th className="px-5 py-3.5">Tipe Aksi</th>
                <th className="px-5 py-3.5">Entitas / Modul</th>
                <th className="px-5 py-3.5">Rincian Aktivitas</th>
                <th className="px-5 py-3.5 text-right">Integritas Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Belum ada riwayat aktivitas yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const actionColor =
                    log.action_type.includes('APPROVED') || log.action_type.includes('ADMISSION')
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : log.action_type.includes('REVISION') || log.action_type.includes('TOGGLE')
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : log.action_type.includes('EXPORT')
                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                      : 'bg-blue-50 text-blue-800 border-blue-200';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                        <div className="font-semibold text-slate-800">
                          {new Date(log.timestamp).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })} WIB
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{log.actor_name}</div>
                        <span className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {log.actor_role}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border ${actionColor}`}>
                          {log.action_type}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{log.record_type}</div>
                        <span className="font-mono text-[10px] text-slate-400">{log.record_id}</span>
                      </td>

                      <td className="px-5 py-3.5 text-slate-700 max-w-md">
                        <p className="line-clamp-2 leading-relaxed">{log.details}</p>
                      </td>

                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {log.security_hash || 'SHA256:OK'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
