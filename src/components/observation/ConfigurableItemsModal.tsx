import React, { useState } from 'react';
import { ObservationItem, ObservationDomain } from '../../types/observation';
import { OBSERVATION_DOMAINS, DEFAULT_OBSERVATION_ITEMS } from '../../lib/observationData';
import { repository } from '../../lib/repository';
import { 
  X, 
  Settings2, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  RotateCcw, 
  Filter, 
  Search, 
  AlertCircle,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { StarLogo } from '../common/StarLogo';

interface ConfigurableItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemsUpdated: () => void;
}

export const ConfigurableItemsModal: React.FC<ConfigurableItemsModalProps> = ({
  isOpen,
  onClose,
  onItemsUpdated,
}) => {
  const [items, setItems] = useState<ObservationItem[]>(() => repository.getObservationItems());
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Item edit / create form state
  const [editingItem, setEditingItem] = useState<ObservationItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form values
  const [formDomainId, setFormDomainId] = useState<string>('A');
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formActivity, setFormActivity] = useState('');
  const [formOrderIndex, setFormOrderIndex] = useState(1);

  if (!isOpen) return null;

  const refreshItems = () => {
    const fresh = repository.getObservationItems();
    setItems(fresh);
    onItemsUpdated();
  };

  const filteredItems = items.filter((item) => {
    if (selectedDomain !== 'all' && item.domain_id !== selectedDomain) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const codeMatch = item.code.toLowerCase().includes(q);
      const titleMatch = item.title.toLowerCase().includes(q);
      const descMatch = item.description?.toLowerCase().includes(q) || false;
      return codeMatch || titleMatch || descMatch;
    }
    return true;
  });

  const handleToggleActive = (item: ObservationItem) => {
    const updated: ObservationItem = {
      ...item,
      is_active: !item.is_active,
    };
    repository.saveObservationItem(updated);
    refreshItems();
    setFeedback(`Status butir ${item.code} diubah menjadi ${updated.is_active ? 'Aktif' : 'Non-aktif'}.`);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleStartEdit = (item: ObservationItem) => {
    setEditingItem(item);
    setIsCreatingNew(false);
    setFormDomainId(item.domain_id);
    setFormCode(item.code);
    setFormTitle(item.title);
    setFormDescription(item.description || '');
    setFormActivity(item.suggested_activity || '');
    setFormOrderIndex(item.order_index);
  };

  const handleStartCreate = () => {
    setEditingItem(null);
    setIsCreatingNew(true);
    const domain = selectedDomain !== 'all' ? selectedDomain : 'A';
    setFormDomainId(domain);
    const countInDomain = items.filter((i) => i.domain_id === domain).length;
    setFormCode(`${domain}-${countInDomain + 1}`);
    setFormTitle('');
    setFormDescription('');
    setFormActivity('');
    setFormOrderIndex(countInDomain + 1);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formCode.trim()) {
      alert('Judul dan kode butir wajib diisi.');
      return;
    }

    const itemToSave: ObservationItem = {
      id: editingItem ? editingItem.id : `custom-${Date.now()}`,
      domain_id: formDomainId,
      code: formCode.trim().toUpperCase(),
      title: formTitle.trim(),
      description: formDescription.trim() || '',
      suggested_activity: formActivity.trim() || undefined,
      is_active: editingItem ? editingItem.is_active : true,
      order_index: Number(formOrderIndex) || 1,
    };

    repository.saveObservationItem(itemToSave);
    refreshItems();
    setEditingItem(null);
    setIsCreatingNew(false);
    setFeedback(`Butir observasi "${itemToSave.code}" berhasil disimpan.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDeleteItem = (itemId: string, code: string) => {
    if (confirm(`Hapus butir observasi ${code}? Tindakan ini tidak dapat dibatalkan.`)) {
      repository.deleteObservationItem(itemId);
      refreshItems();
      setFeedback(`Butir observasi ${code} dihapus.`);
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Kembalikan semua butir indikator ke 38 instrumen standar Little Star School? Penyesuaian kustom akan di-reset.')) {
      localStorage.setItem('littlestar_observation_items', JSON.stringify(DEFAULT_OBSERVATION_ITEMS));
      refreshItems();
      setFeedback('Instrumen observasi berhasil di-reset ke standar baku.');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-6 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 pr-8">
          <div>
            <div className="flex items-center gap-2">
              <StarLogo size={20} />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Konfigurasi Penilaian Observasi
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">
              Instrumen & Indikator Domain Observasi (7 Domain)
            </h2>
            <p className="text-xs text-slate-500">
              Super Admin dapat menyesuaikan daftar butir indikator, menambahkan butir baru, atau menonaktifkan indikator tertentu.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Domain tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setSelectedDomain('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedDomain === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({items.length})
            </button>
            {OBSERVATION_DOMAINS.map((dom) => {
              const count = items.filter((i) => i.domain_id === dom.id).length;
              return (
                <button
                  key={dom.id}
                  onClick={() => setSelectedDomain(dom.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedDomain === dom.id
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {dom.id}: {dom.name.split(' ')[0]} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartCreate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Indikator</span>
            </button>

            <button
              onClick={handleResetToDefault}
              title="Reset ke 38 indikator baku"
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 text-xs font-medium cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari indikator berdasarkan kode (misal: COMM-01) atau kata kunci..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 transition-colors"
          />
        </div>

        {/* Modal Body / Items List / Form */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-3">
          
          {/* Create or Edit Form */}
          {(isCreatingNew || editingItem) && (
            <form onSubmit={handleSaveForm} className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-amber-900 uppercase tracking-wide">
                  {editingItem ? `Edit Indikator ${editingItem.code}` : 'Tambah Indikator Observasi Baru'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setIsCreatingNew(false);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Batal
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Domain Indikator:
                  </label>
                  <select
                    value={formDomainId}
                    onChange={(e) => setFormDomainId(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    {OBSERVATION_DOMAINS.map((dom) => (
                      <option key={dom.id} value={dom.id}>
                        {dom.id}. {dom.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Kode Indikator:
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="Contoh: COMM-07"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Urutan Tampilan:
                  </label>
                  <input
                    type="number"
                    value={formOrderIndex}
                    onChange={(e) => setFormOrderIndex(Number(e.target.value))}
                    min={1}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Judul Indikator / Keterampilan yang Diamati:
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Memahami instruksi sederhana dua langkah berurutan"
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Deskripsi / Kriteria Observasi:
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Jelaskan kriteria perilaku yang dinilai dari anak..."
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Saran Aktivitas / Instruksi Stimulus untuk Guru:
                </label>
                <input
                  type="text"
                  value={formActivity}
                  onChange={(e) => setFormActivity(e.target.value)}
                  placeholder="Contoh: Ajak anak meletakkan balok di keranjang lalu menutup kotak"
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setIsCreatingNew(false);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-2xs"
                >
                  Simpan Indikator
                </button>
              </div>
            </form>
          )}

          {/* List of Items */}
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Tidak ada indikator yang sesuai dengan filter atau kata kunci.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => {
                const domain = OBSERVATION_DOMAINS.find((d) => d.id === item.domain_id);
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      item.is_active
                        ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                        : 'bg-slate-50 border-dashed border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {item.code}
                        </span>
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Domain {item.domain_id}: {domain?.name}
                        </span>
                        {!item.is_active && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                            Non-aktif
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-extrabold text-slate-800">
                        {item.title}
                      </h4>

                      {item.description && (
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {item.suggested_activity && (
                        <div className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100 inline-block mt-0.5">
                          <span className="font-semibold text-slate-700">Aktivitas stimulus:</span>{' '}
                          {item.suggested_activity}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-center">
                      <button
                        onClick={() => handleToggleActive(item)}
                        title={item.is_active ? 'Klik untuk non-aktifkan' : 'Klik untuk aktifkan'}
                        className={`p-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                          item.is_active
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                            : 'text-slate-400 bg-slate-100 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {item.is_active ? (
                          <ToggleRight className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                        title="Edit indikator"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {item.id.startsWith('custom-') && (
                        <button
                          onClick={() => handleDeleteItem(item.id, item.code)}
                          className="p-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                          title="Hapus indikator kustom"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Modal Bottom Close */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Total {items.length} butir instrumen terdaftar</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
