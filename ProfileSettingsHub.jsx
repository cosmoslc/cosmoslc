import { useState, useEffect } from "react";
import {
  UserCircle2,
  Building2,
  ShieldCheck,
  Bell,
  Upload,
  Loader2,
  CheckCircle2,
  Smartphone,
  KeyRound,
  Lock,
  Globe,
  Phone,
  MapPin,
  Clock,
  Calendar,
  Send,
  Instagram,
  Laptop,
  ShieldAlert,
  Save,
  Sparkles,
} from "lucide-react";
import { GLASS, INPUT_CLS, LABEL_CLS, BTN_GHOST, PrimaryButton } from "../theme/tokens";
import { WEEK_DAYS } from "../utils/constants";
import { readFileAsDataURL, compressImageDataUrl } from "../utils/helpers";

export function ProfileSettingsHub({
  director,
  updateDirector,
  directorData,
  onUpdateSettings,
  defaultTab = "profile",
  onTabChange,
  addNotification,
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [securitySaved, setSecuritySaved] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: director?.name || "Ismoil Akromov",
    phone: director?.phone || "+998 90 123 45 67",
    email: director?.email || "director@cosmos.uz",
    centerName: director?.centerName || "COSMOS LC",
    role: "Bosh Direktor (Super Admin)",
    bio: director?.bio || "Ta'lim markazi boshqaruvchisi va ta'sischisi",
    logo: director?.logo || "",
  });

  // Center Settings State
  const centerSettings = directorData?.centerSettings || {
    primaryPhone: "+998 90 123 45 67",
    secondaryPhone: "+998 91 987 65 43",
    address: "Toshkent shahri, Chilonzor tumani, Bunyodkor shoh ko'chasi 42-uy",
    telegram: "https://t.me/cosmos_lc",
    instagram: "https://instagram.com/cosmos_learning",
    website: "https://cosmos.edu.uz",
    workDays: ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"],
    workStart: "08:30",
    workEnd: "21:00",
  };

  const [settingsForm, setSettingsForm] = useState(centerSettings);

  // Security Form State
  const [twoFactor, setTwoFactor] = useState(Boolean(director?.twoFactorEnabled));
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirmPass: "",
  });
  const [quickPin, setQuickPin] = useState("5842");
  const [autoLockMin, setAutoLockMin] = useState("30");

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (onTabChange) onTabChange(tabId);
  };

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const raw = await readFileAsDataURL(file);
      const compressed = await compressImageDataUrl(raw, 280);
      setProfileForm((p) => ({ ...p, logo: compressed }));
      if (updateDirector) {
        updateDirector({ ...director, logo: compressed });
      }
      if (addNotification) addNotification("Markaz logotipi yangilandi ✅");
    } catch (err) {
      console.error(err);
    }
    setUploadingLogo(false);
  }

  const handleSaveProfile = (e) => {
    e?.preventDefault?.();
    if (updateDirector) {
      updateDirector({
        ...director,
        name: profileForm.name,
        phone: profileForm.phone,
        email: profileForm.email,
        centerName: profileForm.centerName,
        bio: profileForm.bio,
        logo: profileForm.logo,
      });
    }
    setProfileSaved(true);
    if (addNotification) addNotification("Profil ma'lumotlari muvaffaqiyatli saqlandi ✅");
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleSaveCenterSettings = () => {
    if (onUpdateSettings) {
      onUpdateSettings(settingsForm);
    }
    setSettingsSaved(true);
    if (addNotification) addNotification("Markaz sozlamalari muvaffaqiyatli saqlandi ✅");
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const toggleWorkDay = (day) => {
    setSettingsForm((prev) => ({
      ...prev,
      workDays: (prev.workDays || []).includes(day)
        ? prev.workDays.filter((d) => d !== day)
        : [...(prev.workDays || []), day],
    }));
  };

  const handleSaveSecurity = (e) => {
    e?.preventDefault?.();
    if (passwords.newPass && passwords.newPass !== passwords.confirmPass) {
      alert("Yangi parollar bir-biriga mos kelmadi!");
      return;
    }
    if (updateDirector) {
      updateDirector({
        ...director,
        twoFactorEnabled: twoFactor,
      });
    }
    setPasswords({ current: "", newPass: "", confirmPass: "" });
    setSecuritySaved(true);
    if (addNotification) addNotification("Xavfsizlik sozlamalari yangilandi 🛡️");
    setTimeout(() => setSecuritySaved(false), 3000);
  };

  const tabs = [
    { id: "profile", label: "Shaxsiy Profil", icon: UserCircle2 },
    { id: "centerSettings", label: "Markaz Sozlamalari", icon: Building2 },
    { id: "security", label: "Xavfsizlik & Kirish", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg overflow-hidden flex items-center justify-center text-white font-bold text-2xl">
                {profileForm.logo ? (
                  <img
                    src={profileForm.logo}
                    alt="Logo"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  profileForm.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "JD"
                )}
              </div>
              <label
                className="absolute -bottom-2 -right-2 p-2 bg-white text-slate-800 rounded-xl shadow-md cursor-pointer hover:bg-slate-100 hover:scale-105 transition-all"
                title="Rasmni yangilash"
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                {uploadingLogo ? (
                  <Loader2 size={15} className="animate-spin text-primary" />
                ) : (
                  <Upload size={15} />
                )}
              </label>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  {profileForm.name}
                </h1>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-full">
                  Faol
                </span>
              </div>
              <p className="text-indigo-200 text-sm mt-1 font-medium flex items-center gap-2">
                <span>{profileForm.centerName}</span>
                <span>•</span>
                <span>{profileForm.role}</span>
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Profil ma'lumotlari, filial va markaz parametrlari hamda tizim xavfsizligi boshqaruvi
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs text-indigo-200">Xavfsizlik darajasi</div>
              <div className="text-sm font-bold text-white">
                {twoFactor ? "Yuqori (2FA Faol)" : "O'rtacha"}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs md:text-sm transition-all ${
                  isActive
                    ? "bg-white text-slate-900 shadow-md shadow-black/10 scale-105"
                    : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: SHAXSIY PROFIL */}
      {activeTab === "profile" && (
        <div className="space-y-6 animate-fadeIn">
          {profileSaved && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 text-sm font-medium">
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
              Profil ma'lumotlari muvaffaqiyatli saqlandi!
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Card: Basic Info & Avatar */}
            <div className={`${GLASS} rounded-xl p-6 space-y-5 md:col-span-1`}>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserCircle2 className="w-5 h-5 text-primary" />
                <span>Profil surati & Logo</span>
              </h3>

              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center">
                <div className="w-24 h-24 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden mb-3 flex items-center justify-center text-slate-600 font-bold text-2xl shadow-sm">
                  {profileForm.logo ? (
                    <img
                      src={profileForm.logo}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    profileForm.name?.slice(0, 2)?.toUpperCase() || "DR"
                  )}
                </div>
                <label className={`${BTN_GHOST} cursor-pointer text-xs flex items-center gap-2`}>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  {uploadingLogo ? (
                    <Loader2 size={14} className="animate-spin text-primary" />
                  ) : (
                    <Upload size={14} />
                  )}
                  Rasmni almashtirish
                </label>
                <p className="text-[11px] text-slate-400 mt-2">
                  PNG, JPG yoki WEBP (maks. 5MB)
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                    Roli / Lavozimi
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {profileForm.role}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                    Tizimga kirish holati
                  </span>
                  <span className="text-xs font-medium text-emerald-600 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Doimiy faol
                  </span>
                </div>
              </div>
            </div>

            {/* Right Card: Profile Form Details */}
            <div className={`${GLASS} rounded-xl p-6 md:p-8 space-y-6 md:col-span-2`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    Shaxsiy ma'lumotlar
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Ism, telefon raqami va markaz nomi kabi asosiy rekvizitlar
                  </p>
                </div>
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-primary-dark transition-all"
                >
                  <Save size={14} />
                  <span>Saqlash</span>
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLS}>To'liq ism (F.I.SH)</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                    className={INPUT_CLS}
                    placeholder="Masalan: Ismoil Akromov"
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>Telefon raqami</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, phone: e.target.value })
                    }
                    className={INPUT_CLS}
                    placeholder="+998 90 123 45 67"
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>Elektron pochta (Email)</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, email: e.target.value })
                    }
                    className={INPUT_CLS}
                    placeholder="director@cosmos.uz"
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>O'quv markazi nomi</label>
                  <input
                    type="text"
                    value={profileForm.centerName}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        centerName: e.target.value,
                      })
                    }
                    className={INPUT_CLS}
                    placeholder="COSMOS LC"
                  />
                </div>
              </div>

              <div>
                <label className={LABEL_CLS}>Qisqacha bio / Izoh</label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, bio: e.target.value })
                  }
                  className={`${INPUT_CLS} resize-none`}
                  placeholder="Markaz haqida yoki shaxsiy eslatma..."
                />
              </div>

              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-indigo-900">
                  <p className="font-bold mb-0.5">Eslatma:</p>
                  <p>
                    Ushbu ma'lumotlar o'quvchilar cheklarida, boshqaruv hisobotlarida va tizim bildirishnomalarida bosh mas'ul shaxs sifatida ko'rinadi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MARKAZ SOZLAMALARI */}
      {activeTab === "centerSettings" && (
        <div className="space-y-6 animate-fadeIn">
          {settingsSaved && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 text-sm font-medium">
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
              Markaz sozlamalari muvaffaqiyatli saqlandi!
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Aloqa ma'lumotlari */}
            <div className={`${GLASS} rounded-xl p-6 space-y-4`}>
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <Phone className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Aloqa va Manzil
                </h3>
              </div>

              <div>
                <label className={LABEL_CLS}>Asosiy telefon raqami</label>
                <input
                  type="text"
                  value={settingsForm.primaryPhone || ""}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      primaryPhone: e.target.value,
                    })
                  }
                  className={INPUT_CLS}
                  placeholder="+998 90 123 45 67"
                />
              </div>

              <div>
                <label className={LABEL_CLS}>Qo'shimcha telefon raqami</label>
                <input
                  type="text"
                  value={settingsForm.secondaryPhone || ""}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      secondaryPhone: e.target.value,
                    })
                  }
                  className={INPUT_CLS}
                  placeholder="+998 91 987 65 43"
                />
              </div>

              <div>
                <label className={LABEL_CLS}>Rasmiy manzil va mo'ljal</label>
                <input
                  type="text"
                  value={settingsForm.address || ""}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      address: e.target.value,
                    })
                  }
                  className={INPUT_CLS}
                  placeholder="Toshkent sh., Chilonzor t., Bunyodkor sh.k."
                />
              </div>
            </div>

            {/* Ijtimoiy tarmoqlar */}
            <div className={`${GLASS} rounded-xl p-6 space-y-4`}>
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <Globe className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Ijtimoiy tarmoqlar & Vebsayt
                </h3>
              </div>

              <div>
                <label className={LABEL_CLS}>Telegram kanal / bot havola</label>
                <div className="relative">
                  <Send className="w-4 h-4 text-sky-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={settingsForm.telegram || ""}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        telegram: e.target.value,
                      })
                    }
                    className={`${INPUT_CLS} pl-10`}
                    placeholder="https://t.me/cosmos_lc"
                  />
                </div>
              </div>

              <div>
                <label className={LABEL_CLS}>Instagram sahifa</label>
                <div className="relative">
                  <Instagram className="w-4 h-4 text-pink-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={settingsForm.instagram || ""}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        instagram: e.target.value,
                      })
                    }
                    className={`${INPUT_CLS} pl-10`}
                    placeholder="https://instagram.com/cosmos_learning"
                  />
                </div>
              </div>

              <div>
                <label className={LABEL_CLS}>Rasmiy veb-sayt</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={settingsForm.website || ""}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        website: e.target.value,
                      })
                    }
                    className={`${INPUT_CLS} pl-10`}
                    placeholder="https://cosmos.edu.uz"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ish vaqti va kunlari */}
          <div className={`${GLASS} rounded-xl p-6 md:p-8 space-y-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    Ish vaqti va kunlari tartibi
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Markazning qabul va dars soatlari grafikasi
                  </p>
                </div>
              </div>

              <button
                onClick={handleSaveCenterSettings}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-primary-dark transition-all"
              >
                <Save size={14} />
                <span>Saqlash</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Ish kunlari (Tanlang):
                </label>
                <div className="flex flex-wrap gap-2">
                  {WEEK_DAYS.map((day) => {
                    const isSelected = (settingsForm.workDays || []).includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleWorkDay(day)}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-primary text-white shadow-sm scale-105"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL_CLS}>Boshlanish vaqti</label>
                    <input
                      type="time"
                      value={settingsForm.workStart || "08:30"}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          workStart: e.target.value,
                        })
                      }
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Tugash vaqti</label>
                    <input
                      type="time"
                      value={settingsForm.workEnd || "21:00"}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          workEnd: e.target.value,
                        })
                      }
                      className={INPUT_CLS}
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Grafik ko'rinishi:
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {(settingsForm.workDays || []).length > 0
                      ? `${settingsForm.workDays[0] || ""} - ${
                          settingsForm.workDays[
                            settingsForm.workDays.length - 1
                          ] || ""
                        }`
                      : "Belgilanmagan"}{" "}
                    • {settingsForm.workStart} - {settingsForm.workEnd}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: XAVFSIZLIK & KIRISH */}
      {activeTab === "security" && (
        <div className="space-y-6 animate-fadeIn">
          {securitySaved && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 text-sm font-medium">
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
              Xavfsizlik sozlamalari yangilandi!
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* 2FA & Kirish nazorati */}
            <div className={`${GLASS} rounded-xl p-6 space-y-5`}>
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Autentifikatsiya & 2FA
                </h3>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    Ikki bosqichli tekshiruv (2FA)
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hisobga kirishda SMS / Kod orqali tasdiqlash
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTwoFactor(!twoFactor)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    twoFactor ? "bg-primary" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      twoFactor ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-3">
                <label className={LABEL_CLS}>Tezkor kirish PIN-kodi</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      maxLength={6}
                      value={quickPin}
                      onChange={(e) => setQuickPin(e.target.value)}
                      className={`${INPUT_CLS} pl-10 font-mono tracking-widest`}
                      placeholder="****"
                    />
                  </div>
                  <span className="text-xs text-emerald-600 font-semibold px-2.5 py-1.5 bg-emerald-50 rounded-xl">
                    O'rnatilgan
                  </span>
                </div>
              </div>

              <div>
                <label className={LABEL_CLS}>
                  Faoliyat bo'lmaganda avtomatik qulflash
                </label>
                <select
                  value={autoLockMin}
                  onChange={(e) => setAutoLockMin(e.target.value)}
                  className={INPUT_CLS}
                >
                  <option value="15">15 daqiqadan so'ng</option>
                  <option value="30">30 daqiqadan so'ng (Tavsiya etiladi)</option>
                  <option value="60">1 soatdan so'ng</option>
                  <option value="never">Hech qachon</option>
                </select>
              </div>
            </div>

            {/* Parolni o'zgartirish */}
            <div className={`${GLASS} rounded-xl p-6 space-y-4`}>
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <Lock className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Parolni yangilash
                </h3>
              </div>

              <div>
                <label className={LABEL_CLS}>Joriy parol</label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                  className={INPUT_CLS}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className={LABEL_CLS}>Yangi parol</label>
                <input
                  type="password"
                  value={passwords.newPass}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPass: e.target.value })
                  }
                  className={INPUT_CLS}
                  placeholder="Kamida 8 ta belgi"
                />
              </div>

              <div>
                <label className={LABEL_CLS}>Yangi parolni takrorlang</label>
                <input
                  type="password"
                  value={passwords.confirmPass}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirmPass: e.target.value })
                  }
                  className={INPUT_CLS}
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveSecurity}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Lock size={14} />
                  <span>Parolni saqlash</span>
                </button>
              </div>
            </div>
          </div>

          {/* Faol qurilmalar & Sessiyalar */}
          <div className={`${GLASS} rounded-xl p-6 space-y-4`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Laptop className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Faol qurilmalar & Kirish tarixi
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                2 ta faol sessiya
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Laptop size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs text-slate-900">
                        Chrome (Windows 11)
                      </p>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                        Ushbu qurilma
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Toshkent, O'zbekiston • IP: 178.218.201.42 • Hozir faol
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs text-slate-900">
                        Safari (iPhone 15 Pro)
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Toshkent, O'zbekiston • IP: 84.54.120.15 • 2 soat oldin
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Sessiya yakunlandi")}
                  className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-semibold rounded-xl hover:bg-rose-100 transition-colors"
                >
                  Yakunlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
