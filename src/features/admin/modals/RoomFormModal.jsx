import { useState } from 'react';
import { Icon } from '../components/Icon';
import { INPUT_CLS, LABEL_CLS, PrimaryButton } from '../theme/tokens';
import { Modal } from '../components/primitives';

export function RoomFormModal({ editing, onSubmit, onClose }) {
  const [name, setName] = useState(editing?.name || '');
  const [capacity, setCapacity] = useState(editing?.capacity ?? '');
  const [error, setError] = useState('');
  function submit() {
    if (!name.trim()) { setError('Xona nomini kiriting.'); return; }
    onSubmit({ name: name.trim(), capacity: parseInt(capacity) || 0 });
    onClose();
  }
  return (
    <Modal title={editing ? 'Xonani tahrirlash' : 'Yangi xona qo\'shish'} onClose={onClose}>
      <div className="space-y-4">
        <div><label className={LABEL_CLS}>Xona nomi</label><input value={name} onChange={e => setName(e.target.value)} className={INPUT_CLS} placeholder="Masalan: 7-xona" autoFocus /></div>
        <div><label className={LABEL_CLS}>Sig'imi (o'rin soni)</label><input type="number" min="0" value={capacity} onChange={e => setCapacity(e.target.value)} className={INPUT_CLS} placeholder="25" /></div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <PrimaryButton onClick={submit} className="w-full">{editing ? <Icon name="check" size={16} /> : <Icon name="plus" size={16} />} {editing ? 'Saqlash' : "Qo'shish"}</PrimaryButton>
      </div>
    </Modal>
  );
}
