# COSMOS CRM - O'quv Markazlari Boshqaruv Tizimi

COSMOS CRM — bu o'quv markazlari, maktablar va ta'lim muassasalarining barcha biznes jarayonlarini bitta joyda boshqarish uchun mo'ljallangan kompleks ERP/CRM platformasi. Tizim moliya, xodimlar, talabalar, davomat, savdo (leads) va hisobotlarni to'liq avtomatlashtirish imkonini beradi.

---

## 📊 To'liq Funksional Analiz va Asosiy Modullar

Ushbu ilova juda ko'p qatlamli va murakkab logikaga ega bo'lib, o'quv markazi faoliyatining barcha jihatlarini qamrab oladi:

### 1. 💰 Moliya Boshqaruvi (Finance)
Markazning to'liq moliyaviy nazorati, daromad va xarajatlarni aniq hisoblash moduli.
- **Kassa va Balans**: Filiallar bo'yicha markaz balansi (boshlang'ich kapitalni kiritish va tahrirlash).
- **Xarajatlar (Expenses)**: Xarajatlar toifalari, tasdiqlangan va kutilayotgan xarajatlar monitoringi, filiallar bo'yicha filtrlash.
- **Ish Haqi va Oyliklar (Salaries)**: O'qituvchilar va boshqa xodimlarga maosh to'lash tizimi. Ish haqi hisob-kitobi bir necha turda bo'lishi mumkin:
  - **Fixed (Qat'iy)**: Oylik belgilangan maosh.
  - **KPI (Foiz yoki Har bir o'quvchi uchun)**: Guruhdagi talabalar soni yoki tushgan to'lov foizi asosida avtomatik hisoblash.
  - Avans, jarima yoki bonuslar kiritish imkoniyati.
- **Talabalar To'lovlari (Payments)**: O'quvchilardan qabul qilingan to'lovlar tarixi, to'lov turlari (Naqd pul, Plastik karta, Payme/Click, Bank o'tkazmasi).
- **Qarzdorlar (Debtors)**: To'lov muddatidan o'tib ketgan o'quvchilarni avtomatik tarzda aniqlash, qarz miqdorini hisoblash va ularga tezkor SMS eslatmalar yuborish.
- **Qo'shimcha Daromad (Additional Income)**: O'quv to'lovlaridan tashqari bo'lgan kirimlar (masalan, kitob savdosi, kiyim-kechak).
- **Zararsizlik Nuqtasi (Break-even Analysis)**: Markaz o'zini-o'zi qoplashi uchun qancha daromad qilishi va joriy holat darajasi qanday ekanligini hisoblovchi analitika.

### 2. 👥 Xodimlar Boshqaruvi va Ruxsatlar (Staff & RBAC)
Markaz xodimlari va o'qituvchilar bazasi, qat'iy xavfsizlik va ruxsatlarni (Role-Based Access Control) boshqarish.
- **Xodimlar (Staff)**: Barcha menejer, admin, tozalik xodimi, o'qituvchilar ro'yxati.
- **Rollar va Lavozimlar (Positions/Roles)**: Har bir xodimga o'ziga xos lavozim va tizim sahifalariga kirish (Read/Write) ruxsatlarini biriktirish. Xodim tizimga kirganda faqat o'ziga ruxsat etilgan bo'limlarni ko'ra oladi.
- **Davomat (Employee Attendance)**: O'qituvchilar va xodimlar uchun ishga kelib-ketish davomatini belgilash va yuritish. Oylik ish haqiga bog'lanishi mumkin.
- **Profil va Maxsus Formalar**: Har bir xodim uchun qo'shimcha so'rovnomalar (Custom Form Builder) shakllantirish va shaxsiy kabinet, CV yoki portfolioni saqlash.

### 3. 🎓 Talabalar va Guruhlar (Students & Groups)
Ta'lim jarayonini va talabalar hisobini yurituvchi asosiy CRM blok.
- **Guruhlar (Groups)**: Yangi guruhlar ochish, fanlar/kurslar biriktirish, o'qituvchi tayinlash, xona va kunlarni (toq/juft kunlar) belgilash.
- **Talabalar Profil (Student Profile)**: Talabaning umumiy ma'lumotlari, balansi, guruhlari, davomati, to'lovlar tarixi va ota-onasi raqamlari bitta oynada aks etadi.
- **Talaba Davomati (Student Attendance)**: Har bir guruh uchun kunlik davomat belgilash. (Keldi, Kelmadi, Sababli).
- **O'quvchilarni Ko'chirish va Muzlatish**: Talabani boshqa guruhga ko'chirish yoki ma'lum muddatga (sayohat/kasallik) muzlatish (Freeze) funksiyasi.

### 4. 🎯 Lidlar va Savdo Voronkasi (Leads & CRM Pipeline)
Yangi mijozlarni (potensial talabalarni) sotib olish (Conversion) jarayonini kuzatish.
- **Voronka (Kanban Board)**: Lidlar holatlari (Yangi, Bog'lanildi, O'ylab ko'radi, Sinov darsida, Ro'yxatdan o'tdi).
- **Follow-ups (Eslatmalar)**: Lidlar bilan qachon qayta bog'lanish kerakligi bo'yicha muddat (Deadline) va eslatmalar kiritish.
- **Konversiya**: Nechta murojaat qilingan va ulardan nechtasi talabaga aylanganini foizlarda hisoblash va samaradorlikni baholash.

### 5. 📊 Hisobotlar va Analitika (Reports & Dashboard)
Rivojlanish dinamikasini real vaqtda kuzatib borish.
- **Boshqaruv Paneli (Dashboard)**: Asosiy ko'rsatkichlar - faol talabalar soni, bugungi to'lovlar tushumi, qarzlar miqdori, konversiya darajasi, va lidlar manbalari (Instagram, Telegram, Tashqi reklama).
- **Maxsus Hisobotlar**: O'qituvchilar reytingi (Teacher Performance), Darsliklar hisoboti, Daromad-xarajat solishtirmasi (Cashflow), Davomat hisobotlari kabi 10 dan ortiq tayyor eksport qilinuvchi jadvallar.

### 6. ⚙️ Tizim Sozlamalari (Settings)
Markazning asosiy mantiqiy sozlamalari.
- **Filiallar (Branches)**: Ko'p filialli markazlarni yagona bazadan boshqarish imkoniyati.
- **Kurslar va Narxlar (Courses)**: O'qitiladigan kurslar va ularning oylik narxlarini shakllantirish.
- **Xonalar (Rooms)**: Xonalar sig'imini belgilash, dars jadvali to'qnashuvlarini (conflict) oldini olish.
- **SMS Xabarnomalar (SMS Gateway)**: Avtomatlashtirilgan SMS shablonlar (Tug'ilgan kun tabrigi, To'lov haqida eslatma).
- **Chegirmalar va Imtiyozlar (Discounts)**: Oila a'zolari uchun yoki maxsus ijtimoiy chegirmalar toifalarini kiritish.

---

## 🛠 Texnologiyalar (Tech Stack)

Ushbu ilova eng zamonaviy web texnologiyalar asosida qurilgan:

- **Frontend Framework**: [React.js](https://react.dev/) (v18+)
- **Build Tool**: [Vite](https://vitejs.dev/) - Tezkor va optimal kompilatsiya uchun.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Barcha dizayn va responsivlik utility-class lar orqali amalga oshirilgan, qo'shimcha maxsus CSS fayllari minimallashtirilgan).
- **Icons**: [Lucide React](https://lucide.dev/) - Tizimdagi barcha ikonkalar.
- **Theme**: Tizim Light va Dark (Tungi) mavzularda barqaror ishlaydi. 
- **Modullik**: Ilova alohida sahifalar (`pages`), komponentlar (`components/primitives`), utils va layout papkalariga tizimli bo'lingan.

---

## 🚀 Ishga Tushirish (Getting Started)

Loyihani mahalliy (local) muhitda ishga tushirish uchun quyidagi qadamlarni bajaring:

### 1. Repozitoriyni klonlash va papkaga o'tish
```bash
git clone <repo-url>
cd <project-folder>
```

### 2. Kutubxonalarni o'rnatish
Node.js (v18+) o'rnatilganiga ishonch hosil qiling va qaramliklarni (dependencies) o'rnating:
```bash
npm install
```

### 3. Dasturni ishga tushirish (Development)
Dev serverni ishga tushirish uchun:
```bash
npm run dev
```
Dastur `http://localhost:5173` (yoki konsolda ko'rsatilgan port) da ochiladi.

### 4. Ishlab chiqarishga tayyorlash (Production Build)
Loyihani build qilish va production fayllarini yaratish:
```bash
npm run build
```
Natija `dist` papkasiga saqlanadi va ixtiyoriy statik hostingga (Vercel, Netlify, Nginx) yuklanishga tayyor bo'ladi.

---
**COSMOS CRM** - Barcha huquqlar himoyalangan. Tizim tezkorlik, foydalanuvchiga qulay interfeys (UI/UX) va qat'iy ma'lumotlar xavfsizligiga asoslanib yaratilgan.
