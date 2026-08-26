export const DEFAULT_STAFF_FORM_FIELDS = [
  {
    id: "passport",
    label: "Pasport seriya va raqami",
    type: "text",
    placeholder: "AA 1234567",
    required: false,
    icon: "CreditCard",
  },
  {
    id: "pinfl",
    label: "JSHSHIR (PINFL)",
    type: "text",
    placeholder: "14 xonali raqam",
    required: false,
    icon: "Shield",
  },
  {
    id: "education",
    label: "Ta'lim darajasi / Mutaxassisligi",
    type: "select",
    options: ["Oliy (Magistr)", "Oliy (Bakalavr)", "O'rta maxsus", "Talaba", "Boshqa"],
    required: false,
    icon: "GraduationCap",
  },
  {
    id: "telegram",
    label: "Telegram username",
    type: "text",
    placeholder: "@username",
    required: false,
    icon: "Send",
  },
  {
    id: "contractNo",
    label: "Mehnat shartnomasi raqami",
    type: "text",
    placeholder: "№ 12/2025",
    required: false,
    icon: "FileText",
  },
  {
    id: "emergencyPhone",
    label: "Favqulodda bog'lanish telefoni (Yaqini)",
    type: "tel",
    placeholder: "+998 90 123 45 67",
    required: false,
    icon: "PhoneCall",
  },
];

const STORAGE_KEY = "cosmos_staff_custom_form_fields_v1";

export function getStaffCustomFields() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading staff form fields:", e);
  }
  return DEFAULT_STAFF_FORM_FIELDS;
}

export function saveStaffCustomFields(fields) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
  } catch (e) {
    console.error("Error saving staff form fields:", e);
  }
}

/**
 * Checks whether staff has completed their custom form data
 * @param {Object} staff
 * @param {Array} fields
 * @returns {{ isCompleted: boolean, filledCount: number, totalCount: number, percent: number }}
 */
export function getStaffFormCompletionStatus(staff, fields = []) {
  if (!fields || fields.length === 0) {
    fields = getStaffCustomFields();
  }
  const customData = staff?.customFormData || {};
  let filledCount = 0;

  fields.forEach((f) => {
    const val = customData[f.id];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      filledCount++;
    }
  });

  const totalCount = fields.length;
  const percent = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;
  const isCompleted = totalCount > 0 && filledCount === totalCount;
  const hasSomeData = filledCount > 0;

  return {
    isCompleted,
    hasSomeData,
    filledCount,
    totalCount,
    percent,
  };
}
