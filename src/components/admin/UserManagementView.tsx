import React, { useState } from 'react';
import { StaffUser, StaffRole } from '../../types/admin';
import { Registration } from '../../types/database';
import { repository } from '../../lib/repository';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Key, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Search, 
  Filter, 
  Lock, 
  Sparkles,
  Phone,
  Mail,
  UserCheck,
  Calendar,
  AlertCircle,
  X,
  Clock
} from 'lucide-react';
import { formatIndonesianDate } from '../../lib/utils';

interface UserManagementViewProps {
  currentRole: 'admin' | 'principal' | 'observer' | 'staff';
  registrations: Registration[];
  onRefreshData: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentRole,
  registrations,
  onRefreshData,
}) => {
  const isSuperAdmin = currentRole === 'admin';
  const [users, setUsers] = useState<StaffUser[]>(() => repository.getStaffUsers());
  const [roleFilter, setRoleFilter] = useState<'all' | StaffRole>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{ user: StaffUser; code: string } | null>(null);
  const [assignObserverStudent, setAssignObserverStudent] = useState<Registration | null>(null);

  // Form state for Create / Edit User
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<StaffRole>('observer');
  const [formTitle, setFormTitle] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const refreshUserList = () => {
    setUsers(repository.getStaffUsers());
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('observer');
    setFormTitle('Guru Observer & Asesor ABK');
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (u: StaffUser) => {
    setEditingUser(u);
    setFormName(u.full_name);
    setFormEmail(u.email);
    setFormPhone(u.phone);
    setFormRole(u.role);
    setFormTitle(u.role_title);
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      setFormError('Nama lengkap dan alamat email wajib diisi.');
      return;
    }

    try {
      const payload: StaffUser = {
        id: editingUser ? editingUser.id : `usr-${Date.now()}`,
        full_name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || '082199988769',
        role: formRole,
        role_title: formTitle.trim() || (formRole === 'observer' ? 'Guru Observer ABK' : formRole === 'principal' ? 'Kepala Sekolah' : formRole === 'staff' ? 'Staf Administrasi' : 'Administrator'),
        is_active: editingUser ? editingUser.is_active : true,
        assigned_student_count: editingUser ? editingUser.assigned_student_count : 0,
        last_login_at: editingUser ? editingUser.last_login_at : undefined,
        created_at: editingUser ? editingUser.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      repository.saveStaffUser(payload, 'Super Admin');
      refreshUserList();
      setIsCreateModalOpen(false);
      onRefreshData();
    } catch (err: any) {
      setFormError(err?.message || 'Gagal menyimpan pengguna.');
    }
  };

  const handleToggleStatus = (u: StaffUser) => {
    if (!isSuperAdmin) {
      alert('Hanya Super Administrator yang berwenang mengubah status keaktifan akun.');
      return;
    }
    if (u.role === 'admin' && u.email === 'admin@littlestarpamekasan.sch.id') {
      alert('Akun Super Admin utama tidak dapat dinonaktifkan.');
      return;
    }

    repository.toggleStaffUserStatus(u.id, 'Super Admin');
    refreshUserList();
  };

  const handleResetPassword = (u: StaffUser) => {
    if (!isSuperAdmin) {
      alert('Hanya Super Administrator yang berwenang mereset kata sandi akun.');
      return;
    }

    const res = repository.resetStaffPassword(u.id, 'Super Admin');
    if (res.success) {
      setResetFeedback({ user: u, code: res.tempPasswordCode });
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role_title.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate observers available for appointment assignment
  const observers = users.filter(u => u.role === 'observer' && u.is_active);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Manajemen Pengguna & Penugasan Staf</h2>
              <p className="text-xs text-slate-500">
                Pengelolaan akun Guru Observer, Kepala Sekolah, Admin Pendaftaran, dan penugasan observasi siswa.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSuperAdmin ? (
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Pengguna Staf</span>
            </button>
          ) : (
            <div className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Hanya Super Admin yang dapat menambah/menonaktifkan akun</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-700">Filter Peran:</span>
          {(['all', 'admin', 'principal', 'observer', 'staff'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                roleFilter === r
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {r === 'all' ? 'Semua Staf' : r === 'admin' ? 'Super Admin' : r === 'principal' ? 'Kepala Sekolah' : r === 'observer' ? 'Guru Observer' : 'Admin Pendaftaran'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, email, jabatan..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Staff User Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Nama & Jabatan</th>
                <th className="px-5 py-3.5">Peran Sistem</th>
                <th className="px-5 py-3.5">Kontak</th>
                <th className="px-5 py-3.5 text-center">Beban Observasi</th>
                <th className="px-5 py-3.5">Status Akun</th>
                <th className="px-5 py-3.5">Login Terakhir</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Tidak ditemukan pengguna yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleBadge = 
                    u.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 border-purple-200'
                      : u.role === 'principal'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : u.role === 'observer'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200';

                  const roleLabel =
                    u.role === 'admin'
                      ? 'Super Admin'
                      : u.role === 'principal'
                      ? 'Kepala Sekolah'
                      : u.role === 'observer'
                      ? 'Guru Observer'
                      : 'Admin Pendaftaran';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 text-sm">{u.full_name}</div>
                        <div className="text-[11px] text-slate-500">{u.role_title}</div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleBadge}`}>
                          {roleLabel}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.phone}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        {u.role === 'observer' ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            {u.assigned_student_count} Siswa
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 text-[11px]">
                            <XCircle className="w-3 h-3" />
                            <span>Nonaktif</span>
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-slate-500">
                        {u.last_login_at ? (
                          <span className="text-[11px]">
                            {new Date(u.last_login_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })} WIB
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Belum pernah</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isSuperAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(u)}
                                title="Edit data pengguna"
                                className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleResetPassword(u)}
                                title="Reset kata sandi pengguna"
                                className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Key className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleToggleStatus(u)}
                                title={u.is_active ? 'Nonaktifkan akun' : 'Aktifkan akun'}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  u.is_active
                                    ? 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                                }`}
                              >
                                {u.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Reset Feedback Modal */}
      {resetFeedback && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-emerald-700">
              <div className="p-2.5 bg-emerald-100 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Reset Kata Sandi Berhasil</h3>
                <p className="text-xs text-slate-500">Kode keamanan sementara telah diterbitkan</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div>
                <span className="text-slate-500">Pengguna:</span>{' '}
                <strong className="text-slate-900">{resetFeedback.user.full_name}</strong>
              </div>
              <div>
                <span className="text-slate-500">Email:</span>{' '}
                <span className="font-mono">{resetFeedback.user.email}</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block mb-1">Kode Akses Sementara:</span>
                <span className="text-lg font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded border border-blue-200 tracking-wider">
                  {resetFeedback.code}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Salin kode ini dan berikan secara aman kepada staf terkait untuk digunakan saat proses masuk perdana.
            </p>

            <button
              onClick={() => setResetFeedback(null)}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-sm cursor-pointer"
            >
              Tutup & Selesai
            </button>
          </div>
        </div>
      )}

      {/* Modal: Create or Edit User */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">
                  {editingUser ? 'Edit Akun Staf' : 'Tambah Akun Staf Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-blue-200 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Rina Kusumawati, S.Psi., M.Psi., Psikolog"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Alamat Email (Akun Login) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="nama.staf@littlestarpamekasan.sch.id"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Peran Sistem <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => {
                      const r = e.target.value as StaffRole;
                      setFormRole(r);
                      if (r === 'observer') setFormTitle('Guru Observer & Asesor ABK');
                      else if (r === 'principal') setFormTitle('Kepala Sekolah Little Star School');
                      else if (r === 'staff') setFormTitle('Staf Administrasi & Pendaftaran');
                      else if (r === 'admin') setFormTitle('Super Administrator');
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="observer">Guru Observer</option>
                    <option value="principal">Kepala Sekolah</option>
                    <option value="staff">Admin Pendaftaran</option>
                    <option value="admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / Telepon
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="082199988769"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jabatan / Titel Resmi
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Psikolog Perkembangan & Asesor ABK"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl font-semibold text-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  {editingUser ? 'Perbarui Akun' : 'Daftarkan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
