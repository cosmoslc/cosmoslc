import { StudentProfilePage } from "../pages/StudentProfilePage";

export function StudentProfileModal({
  student,
  directorData,
  opData,
  onAddCoins,
  onClose,
  onEdit,
  onRecordPayment,
  onSetStatus,
  onUpdate,
  onRemoveFromGroup,
  onAddToGroup,
  onDelete,
  groups: availableGroups = [],
  openModal,
  openPaymentModal,
}) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 p-3 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <StudentProfilePage
          student={student}
          directorData={directorData}
          opData={opData}
          onUpdateStudent={onUpdate}
          onDeleteStudent={onDelete}
          onAddCoins={onAddCoins}
          onRecordPayment={onRecordPayment}
          onAssignStudentToGroup={onAddToGroup}
          onRemoveFromGroup={onRemoveFromGroup}
          onBack={onClose}
          openModal={openModal}
          openPaymentModal={openPaymentModal}
        />
      </div>
    </div>
  );
}
