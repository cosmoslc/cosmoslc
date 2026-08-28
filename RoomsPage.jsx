import { useState } from 'react';
import {
  Building2,
  Users,
  Armchair,
  Plus,
  Pencil,
  Trash2,
  DoorOpen,
  LayoutGrid,
  List,
  Calendar,
  Clock,
  Search,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { BTN_GHOST, INPUT_CLS, PrimaryButton } from '../theme/tokens';
import { opGroups, opRooms } from '../utils/dataHelpers';
import { EmptyState } from '../components/primitives';

export function RoomsPage({
  opData,
  openModal = () => {},
  openRoomModal,
  canEdit = true,
}) {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [searchQuery, setSearchQuery] = useState('');

  const rooms = opRooms(opData) || [];
  const allGroups = opGroups(opData) || [];

  const bigRooms = rooms.filter((r) => (r.capacity || 0) >= 25).length;
  const totalCapacity = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);

  const filteredRooms = rooms.filter((r) =>
    (r.name || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleOpenAdd = () => {
    if (openRoomModal) openRoomModal();
    else openModal({ type: 'roomForm' });
  };

  const handleOpenEdit = (room) => {
    if (openRoomModal) openRoomModal(room);
    else openModal({ type: 'roomForm', editing: room, room });
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25">
            <DoorOpen size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Xonalar
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                {rooms.length} ta
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle Buttons */}
          <div className="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm border border-slate-200/60 dark:border-slate-800'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Jadval ko'rinishi"
            >
              <List size={16} />
              <span className="hidden sm:inline">Ro'yxat</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm border border-slate-200/60 dark:border-slate-800'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Karta (grid) ko'rinishi"
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">Kadrlar</span>
            </button>
          </div>

          {canEdit && (
            <PrimaryButton onClick={handleOpenAdd}>
              <Plus size={16} /> Yangi xona qo'shish
            </PrimaryButton>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="stat-card border-orange-200/80 dark:border-orange-900/40 bg-gradient-to-b from-orange-50/30 to-white dark:from-orange-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
              <Building2 size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
              Xonalar
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-slate-900 dark:text-white mb-0.5">
            {rooms.length} <span className="text-xs font-medium text-slate-400">xona</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Jami xonalar soni
          </div>
        </div>

        <div className="stat-card border-purple-200/80 dark:border-purple-900/40 bg-gradient-to-b from-purple-50/30 to-white dark:from-purple-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-md">
              <Users size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
              25+ sig'im
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-purple-600 dark:text-purple-400 mb-0.5">
            {bigRooms} <span className="text-xs font-medium text-slate-400">xona</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Katta xonalar (25+ o'rin)
          </div>
        </div>

        <div className="stat-card border-teal-200/80 dark:border-teal-900/40 bg-gradient-to-b from-teal-50/30 to-white dark:from-teal-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-badge w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-md">
              <Armchair size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
              Sig'im
            </span>
          </div>
          <div className="stat-value text-[19px] font-extrabold tracking-tight text-teal-600 dark:text-teal-400 mb-0.5">
            {totalCapacity} <span className="text-xs font-medium text-slate-400">o'rin</span>
          </div>
          <div className="stat-label text-xs font-bold text-slate-500 dark:text-slate-400">
            Umumiy o'quvchi sig'imi
          </div>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Xona nomi bo'yicha qidiruv..."
            className={`${INPUT_CLS} !pl-9 !py-2 text-xs`}
          />
        </div>
      </div>

      {/* Main Content: List or Grid */}
      {filteredRooms.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Xonalar topilmadi"
          subtitle={
            searchQuery
              ? `"${searchQuery}" bo'yicha hech qanday xona topilmadi.`
              : "Birinchi o'quv xonasini qo'shib tizimga kiriting."
          }
          action={
            canEdit && !searchQuery ? (
              <PrimaryButton onClick={handleOpenAdd}>
                <Plus size={16} /> Xona qo'shish
              </PrimaryButton>
            ) : null
          }
        />
      ) : viewMode === 'list' ? (
        /* LIST VIEW (Jadval shaklida) */
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Xona nomi</th>
                <th className="py-3 px-4">Biriktirilgan guruhlar</th>
                <th className="py-3 px-4">Dars vaqti va kunlari</th>
                <th className="py-3 px-4 text-center">Sig'im & Bandlik</th>
                {canEdit && <th className="py-3 px-4 text-right">Amallar</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredRooms.map((r) => {
                const usedByGroups = allGroups.filter((g) => String(g.roomId) === String(r.id));
                return (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Xona Nomi */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/40 grid place-items-center shrink-0">
                          <DoorOpen size={16} />
                        </span>
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white">
                            {r.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-normal">
                            Sig'im: {r.capacity || 0} ta o'quvchi
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Biriktirilgan Guruhlar */}
                    <td className="py-3.5 px-4">
                      {usedByGroups.length === 0 ? (
                        <span className="text-slate-400 text-xs italic">
                          Guruh biriktirilmagan
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {usedByGroups.map((g) => (
                            <span
                              key={g.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-bold"
                            >
                              <Layers size={11} className="text-indigo-500" />
                              {g.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Dars vaqti va kunlari */}
                    <td className="py-3.5 px-4">
                      {usedByGroups.length === 0 ? (
                        <span className="text-slate-400 text-xs italic">-</span>
                      ) : (
                        <div className="space-y-1.5">
                          {usedByGroups.map((g) => {
                            const daysStr = Array.isArray(g.days)
                              ? g.days.join(', ')
                              : g.days || 'Kunsiz';
                            const timeStr = g.time || g.lessonTime || 'Vaqtsiz';
                            return (
                              <div
                                key={g.id}
                                className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300"
                              >
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-semibold">
                                  <Calendar size={11} className="text-amber-500" />
                                  {daysStr}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-semibold">
                                  <Clock size={11} className="text-blue-500" />
                                  {timeStr}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>

                    {/* Bandlik / Sig'im */}
                    <td className="py-3.5 px-4 text-center">
                      {usedByGroups.length > 0 ? (
                        <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-800/60 px-2.5 py-1 rounded-full text-xs font-bold">
                          {usedByGroups.length} ta guruh band
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60 px-2.5 py-1 rounded-full text-xs font-bold">
                          Bo'sh
                        </span>
                      )}
                    </td>

                    {/* Amallar */}
                    {canEdit && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(r)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                            title="Tahrirlash"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() =>
                              openModal({
                                type: 'confirm',
                                message: `"${r.name}" xonasini o'chirasizmi?`,
                                action: { kind: 'deleteRoom', roomId: r.id },
                              })
                            }
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID VIEW (Kartalar shaklida) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map((r) => {
            const usedByGroups = allGroups.filter((g) => String(g.roomId) === String(r.id));
            return (
              <div
                key={r.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 space-y-3.5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/60 border border-orange-100 dark:border-orange-900/40 text-orange-600 dark:text-orange-400 grid place-items-center shrink-0">
                    <DoorOpen size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-900 dark:text-white font-bold text-sm truncate">
                      {r.name}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">O'quv xonasi</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-xl font-semibold">
                    <Users size={12} />
                    {r.capacity || 0} ta o'quvchi
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                    {usedByGroups.length > 0
                      ? `${usedByGroups.length} ta guruhda band`
                      : "Bo'sh"}
                  </span>
                </div>

                {/* Group schedule snippet in card */}
                {usedByGroups.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Guruhlar & vaqti:
                    </div>
                    {usedByGroups.slice(0, 3).map((g) => (
                      <div key={g.id} className="text-xs flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span className="font-semibold truncate max-w-[120px]">{g.name}</span>
                        <span className="text-[11px] text-slate-400">{g.time || '15:00'}</span>
                      </div>
                    ))}
                    {usedByGroups.length > 3 && (
                      <div className="text-[10px] text-slate-400 font-medium text-right">
                        +{usedByGroups.length - 3} ta guruh
                      </div>
                    )}
                  </div>
                )}

                {canEdit && (
                  <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleOpenEdit(r)}
                      className={`${BTN_GHOST} flex-1 justify-center !py-1.5 !text-xs`}
                    >
                      <Pencil size={13} /> Tahrirlash
                    </button>
                    <button
                      onClick={() =>
                        openModal({
                          type: 'confirm',
                          message: `"${r.name}" xonasini o'chirasizmi?`,
                          action: { kind: 'deleteRoom', roomId: r.id },
                        })
                      }
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

