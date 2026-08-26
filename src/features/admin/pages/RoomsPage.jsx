import { Building2, Users, Armchair, Plus, Pencil, Trash2, DoorOpen } from 'lucide-react';
import { BTN_GHOST, BTN_ICON, PrimaryButton } from '../theme/tokens';
import { opGroups, opRooms } from '../utils/dataHelpers';
import { EmptyState } from '../components/primitives';

export function RoomsPage({ opData, openModal = () => {}, canEdit }) {
  const rooms = opRooms(opData);
  const bigRooms = rooms.filter(r => (r.capacity || 0) >= 25).length;
  const totalCapacity = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);

  return (
    <div className="space-y-6">
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
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              O'quv xonalari sig'imi va guruhlar taqsimotini boshqarish
            </p>
          </div>
        </div>
        {canEdit && (
          <PrimaryButton onClick={() => openModal({ type: 'roomForm' })}>
            <Plus size={16} /> Yangi xona qo'shish
          </PrimaryButton>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="stat-card border-orange-200/80 dark:border-orange-900/40 bg-gradient-to-b from-orange-50/30 to-white dark:from-orange-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
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
            Jami xonalar
          </div>
        </div>

        <div className="stat-card border-purple-200/80 dark:border-purple-900/40 bg-gradient-to-b from-purple-50/30 to-white dark:from-purple-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
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
            Katta xonalar (25+)
          </div>
        </div>

        <div className="stat-card border-teal-200/80 dark:border-teal-900/40 bg-gradient-to-b from-teal-50/30 to-white dark:from-teal-950/20 dark:to-slate-900 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer">
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
            Umumiy sig'im
          </div>
        </div>
      </div>

      {rooms.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Xonalar mavjud emas"
          subtitle="Birinchi o'quv xonasini qo'shib tizimga kiriting."
          action={
            canEdit ? (
              <PrimaryButton onClick={() => openModal({ type: 'roomForm' })}>
                <Plus size={16} /> Xona qo'shish
              </PrimaryButton>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map(r => {
            const usedByGroups = opGroups(opData).filter(g => g.roomId === r.id);
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
                    <p className="text-slate-900 dark:text-white font-bold text-sm truncate">{r.name}</p>
                    <p className="text-slate-400 text-xs mt-0.5">O'quv xonasi</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-xl font-semibold">
                    <Users size={12} />
                    {r.capacity || 0} ta o'quvchi
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                    {usedByGroups.length > 0 ? `${usedByGroups.length} ta guruhda band` : "Bo'sh"}
                  </span>
                </div>

                {canEdit && (
                  <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => openModal({ type: 'roomForm', editing: r })}
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
