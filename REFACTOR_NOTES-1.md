# Struktura refaktoringi — nima qilindi

Loyiha "shared + role-based" qolipiga o'tkazildi:

```
src/
├── app/                     # entry nuqtalar (routing/launch qatlami)
│   ├── director-main.jsx
│   ├── manager-main.jsx
│   ├── teacher-main.jsx
│   └── student-main.jsx
│
├── shared/                  # rollar orasida ISBOTLANGAN umumiy narsalar
│   ├── api/                 # avvalgi backend/ — bitta Supabase client + jadval bo'yicha fetch/add/update funksiyalar
│   ├── theme/tokens.jsx     # teacher+student uchun umumiy rang/uslub tokenlari
│   ├── components/primitives.jsx  # teacher+student uchun umumiy Avatar/Modal/StarRating/EmptyState...
│   └── utils/format.js      # initials() — 4 ta rolda ham BAYT-BAYTIGA bir xil bo'lgani tekshirilgach chiqarildi
│
├── features/                # har bir ROL uchun alohida
│   ├── director/            # avvalgi frontend-director/
│   ├── manager/              # avvalgi frontend/ (menejer paneli)
│   ├── teacher/               # avvalgi frontend-teacher/
│   └── student/                # avvalgi frontend-student/
│
├── styles/global.css        # avvalgi src/index.css
└── context/                 # hozircha bo'sh — quyida izoh

database/schema.sql          # avvalgi backend/schema.sql (Supabase SQL, JS import qilinmaydi, shuning uchun src/ tashqarisida)
```

`director.html` / `manager.html` / `teacher.html` / `student.html` va `vite.config.js` — o'zgarishsiz qoldi (ular hali ham loyihaning ildizida), faqat ichidagi `<script src>` yangi `/src/app/...` yo'liga ko'rsatildi. `npm run build` muvaffaqiyatli o'tdi — barcha 4 panel + launcher (`index.html`) to'g'ri yig'ildi.

## Nima UCHUN hammasi `shared/`ga ko'chirilmadi

`tokens.jsx`, `primitives.jsx`, `helpers.jsx`, `dataHelpers.jsx`, `constants.jsx`, `Layout.jsx` — bu fayllar 4 ta panelda ham bir xil NOM bilan bor, lekin men har birini juftlab solishtirdim (`diff`):

| Fayl | director vs manager | teacher vs student |
|---|---|---|
| `theme/tokens.jsx` | 21 qator farq | **bir xil** ✅ shared'ga ko'chirildi |
| `components/primitives.jsx` | 100 qator farq | **bir xil** ✅ shared'ga ko'chirildi |
| `utils/helpers.jsx` | 10 qator farq | 89 qator farq (faqat `initials()` bir xil ✅) |
| `utils/dataHelpers.jsx` | 21 qator farq | 50 qator farq |
| `utils/constants.jsx` | 192 qator farq | 124 qator farq |
| `layout/Layout.jsx` | 50 qator farq | 130 qator farq |

Ya'ni bular umuman DUPLICATE emas — har bir rol uchun mustaqil yozilgan, real biznes-mantiq farqlari bor (masalan director/manager konstantalarida filiallar, coin tizimi, moliya kabi ular uchungina tegishli narsalar bor). Bunday farqli fayllarni avtomatik "bittalashtirish" — real xatarli: to'lov, davomat, coin hisob-kitob mantig'ini yashirincha buzib qo'yishi mumkin edi. Shu sababli:

- **Faqat isbotlangan bir xil narsalar** (`tokens.jsx`+`primitives.jsx` teacher/student uchun, `initials()` funksiyasi 4 ta rolda ham) — `shared/`ga chiqarildi.
- **Qolgan hammasi** — o'z `features/<rol>/`ida qoldi, xavfsiz.

## 2-bosqich: constants.jsx'larni ham solishtirdim

`constants.jsx`larni skript bilan qatorma-qator solishtirganimda (probel/tirnoq farqlarini hisobga olmay):

| Konstanta | Natija |
|---|---|
| `WEEK_DAYS`, `MONTHS_UZ`, `JS_DAY_NAMES` | **hamma 4 ta rolda bir xil** ✅ → `shared/constants/calendar.js` |
| `GROUP_COLORS` + `nextGroupColor()` | **hamma 4 ta rolda bir xil** ✅ → `shared/constants/colors.js` |
| `EXPENSE_CATEGORIES`, `LEAD_STATUSES` | **director va manager'da bir xil** ✅ → `shared/constants/finance.js` (teacher/student ishlatmaydi) |
| `PAYMENT_METHODS` | director/manager'da bor, lekin ikon formatlari farqli (biri lucide komponent, biri string nom) — **birlashtirilmadi** |
| `ATTENDANCE_STATUSES` | manager/teacher/student'da bor, lekin obyekt shakli farqli (`dot` vs `on` maydoni) — **birlashtirilmadi** |
| `NAV_ICON_COLORS`, `NAV_ITEMS`/`*_NAV` | har rolning o'z navigatsiyasi, tabiiyki farqli — **birlashtirilmadi** |

Har bir rolning `constants.jsx`si hozir eski nomlarni **shared'dan qayta eksport qiladi** (`export { WEEK_DAYS } from "../../../shared/constants/calendar"`), shu sababli boshqa hech qaysi fayl import qatorini o'zgartirishga hojat bo'lmadi — `import { WEEK_DAYS } from './constants'` barcha joyda avvalgidek ishlayveradi. `npm run build` ikkala bosqichdan keyin ham muvaffaqiyatli o'tdi.

Shuningdek, `frontend-student`dan qolgan **ishlatilmaydigan** `TEACHER_SESSION_KEY` konstantasini student panelidan tozaladim (o'lik kod edi).

## 3-bosqich: "NotSetUp"/"Setup" ekranlarini olib tashladim

O'quvchi va ustoz — ikkalasi ham o'z-o'zidan ro'yxatdan o'tmaydi (hisoblarini director/manager panelidan admin yaratadi), shuning uchun "tizim hali sozlanmagan" degan oraliq ekranlar keraksiz edi. Tekshirganimda buning ustiga ikkitasi haqiqiy muammo bo'lib chiqdi:

- **`features/student/pages/NotSetUpScreen.jsx`** — `appData.teacher` maydonini tekshirar edi, lekin `fetchAppData()` bunday maydonni umuman qaytarmaydi → tekshiruv doim `true` bo'lib, **`StudentLoginScreen`ga hech qachon yetib bo'lmas edi** (haqiqiy bug — endi tuzatildi).
- **`features/teacher/pages/TeacherSetupScreen.jsx`** — hech qayerda import qilinmagan, butunlay o'lik fayl edi.
- **`shared/api/teacherAccount.js`** — `teacher_account` jadvali bilan ishlovchi fetch/add/update funksiyalari, lekin hech qayerdan chaqirilmaydi. `database/schema.sql`ning o'zida ham shu jadval haqida: *"teacher login now happens through teachers_hr... this table is no longer used... drop it yourself"* deb yozilgan ekan.

Olib tashlandi: 2 ta NotSetUpScreen fayli, TeacherSetupScreen.jsx, shared/api/teacherAccount.js, va App.jsx'lardagi shu ekranlarga yo'naltiruvchi shart qatorlari. `npm run build` yana muvaffaqiyatli o'tdi.

**Diqqat — o'zingiz qaror qiladigan narsa:** `database/schema.sql`dagi `teacher_account` jadvalining o'ziga tegmadim (bu Supabase'dagi haqiqiy ma'lumotlar bazasi jadvali, uni o'chirish — ma'lumot yo'qotish xatari bor operatsiya). Agar chindan kerak bo'lmasa, Supabase SQL Editor'da o'zingiz `drop table teacher_account;` buyrug'ini ishga tushirishingiz mumkin.

## Keyingi qadam (tavsiya)

Har bir "bir xil nomli, lekin farqli" fayl bo'yicha qo'lda ko'rib chiqish kerak — masalan `constants.jsx`dagi qaysi konstantalar chindan umumiy (masalan status ranglari, hafta kunlari) va qaysilari rolega xos (masalan director'dagi filial ranglari). Bu — fayl ichini diqqat bilan o'qib, test qilib boradigan ish, shuning uchun bitta javobda avtomatik qilinmadi. Bu ishni **Claude Code**da (real fayllarni ochib, har bir o'zgarishdan keyin build/test yurgizib) bosqichma-bosqich qilish tavsiya etiladi.

## `context/` papkasi

Hozircha bo'sh qoldi — loyihada `AuthContext`/`RoleContext` singari umumiy narsa yo'q edi (har bir panel session'ni o'zi, o'z `localStorage` kaliti bilan boshqaradi: masalan `TEACHER_SESSION_KEY`). Buni haqiqiy umumiy Context'ga aylantirish ham — 4 panelning login/session oqimini qayta yozishni talab qiladigan, alohida muhokama qilinishi kerak bo'lgan o'zgarish.
