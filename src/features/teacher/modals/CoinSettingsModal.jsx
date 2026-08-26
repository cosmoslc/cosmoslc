import { useState } from 'react';
import { Modal, StarRating } from '../../../shared/components/primitives';
import { INPUT_CLS, BTN_PRIMARY } from '../../../shared/theme/tokens';

export function CoinSettingsModal({ coinSettings, onSave, onClose }) {
  const [values, setValues] = useState(coinSettings);
  function submit() { onSave(values); onClose(); }
  return (
    <Modal title="🪙 Coin sozlamalari" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-slate-500 text-xs">Har bir yulduz bahoga nechta coin berilishini belgilang. O'zgartirish faqat keyingi baholarga ta'sir qiladi.</p>
        {[5, 4, 3, 2, 1].map(star => (
              <div key={star} className="flex items-center gap-3">
                <div className="w-24 shrink-0"><StarRating value={star} size={15} /></div>
                <span className="text-slate-400 text-xs">=</span>
                <input
                type="number" min="0" value={values[String(star)] ?? 0}
                onChange={e => setValues(v => ({ ...v, [String(star)]: Math.max(0, parseInt(e.target.value) || 0) }))}
                className={`${INPUT_CLS} w-20`}
              />
              <span className="text-slate-500 text-sm">🪙</span>
            </div>
    ))}
<button onClick={submit} className={`${BTN_PRIMARY} w-full`}>Saqlash</button>
</div>
</Modal>
);
}
