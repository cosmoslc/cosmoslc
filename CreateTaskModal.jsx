import { useState } from "react";
import { Loader2, Upload, Plus } from "lucide-react";
import { Modal } from "../../../shared/components/primitives";
import {
  INPUT_CLS,
  LABEL_CLS,
  BTN_GHOST,
  BTN_PRIMARY,
} from "../../../shared/theme/tokens";
import { todayISO } from "../utils/helpers";
import { processMediaFile } from "../../../shared/utils/media";

export function CreateTaskModal({ groups, onAdd, onClose }) {
  const [groupId, setGroupId] = useState(groups[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(todayISO());
  const [attachment, setAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      setAttachment(await processMediaFile(file));
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  }

  function submit() {
    if (!groupId) {
      setError("Guruhni tanlang.");
      return;
    }
    if (!title.trim()) {
      setError("Vazifa nomini kiriting.");
      return;
    }
    onAdd({
      groupId,
      title: title.trim(),
      description: description.trim(),
      attachment,
      dueDate,
    });
    onClose();
  }

  return (
    <Modal title="Yangi vazifa" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className={LABEL_CLS}>Guruh</label>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className={INPUT_CLS}
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLS}>Vazifa nomi</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Masalan: 5-bob, mashqlar"
            className={INPUT_CLS}
          />
        </div>
        <div>
          <label className={LABEL_CLS}>Tavsif</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Vazifa haqida qisqacha..."
            className={INPUT_CLS}
          />
        </div>
        <div>
          <label className={LABEL_CLS}>Fayl (rasm yoki video, ixtiyoriy)</label>
          <label className={`${BTN_GHOST} cursor-pointer inline-flex`}>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFile}
            />
            {uploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Upload size={14} />
            )}{" "}
            {attachment ? attachment.name : "Fayl tanlash"}
          </label>
        </div>
        <div>
          <label className={LABEL_CLS}>Muddat</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={INPUT_CLS}
          />
        </div>
        {error && <p className="text-rose-700 text-xs">{error}</p>}
        <button onClick={submit} className={`${BTN_PRIMARY} w-full`}>
          <Plus size={16} /> Vazifa yaratish
        </button>
      </div>
    </Modal>
  );
}
