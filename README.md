# Menejer Panel + O'quvchi Panel

Backend (Supabase) va ikkita frontend (menejer + o'quvchi) endi to'liq
ajratilgan. `window.storage` butunlay olib tashlandi — u aslida Claude
Artifacts'ning o'zining ichki saqlash tizimi edi (shu sababli oldin "Access
shared data" degan oyna chiqargan), Supabase bilan hech qanday aloqasi yo'q
edi.

Ikkala frontend ham **bitta Supabase bazasini** ishlatadi — o'qituvchi/menejer
tomonda yaratilgan guruh, o'quvchi, davomat kabi ma'lumotlarni o'quvchi paneli
ham o'sha jadvallardan o'qiydi.

## Papka tuzilishi

Loyiha "shared + role-based" qolipida (batafsil: [REFACTOR_NOTES.md](./REFACTOR_NOTES.md)):

```
database/schema.sql        — Supabase'da bir marta ishga tushiriladigan SQL sxema

src/
  app/                      — har bir panel uchun entry fayl (director/manager/teacher/student-main.jsx)
  shared/
    api/                    — supabaseClient.js + har bir jadval uchun fetch/add/update/delete,
                              index.js hammasini birlashtiradi (fetchDirectorData/fetchOpData —
                              direktor/menejer uchun; fetchAppData — teacher/student uchun)
    theme/, components/, utils/  — FAQAT isbotlangan (diff qilib tekshirilgan) umumiy narsalar
  features/
    director/               — DIREKTOR PANELI (avvalgi frontend-director/)
    manager/                 — MENEJER PANELI (avvalgi frontend/)
    teacher/                  — USTOZ PANELI (avvalgi frontend-teacher/)
    student/                   — O'QUVCHI PANELI (avvalgi frontend-student/)
                                App.jsx, theme/, utils/, components/, layout/, pages/, modals/
  styles/global.css          — umumiy Tailwind/global CSS
```

## Yangi jadvallar (o'quvchi paneli uchun)

`schema.sql` endi yana quyidagilarni ham yaratadi (avvalgi jadvallarga
qo'shimcha, xavfsiz qayta ishga tushiriladi):

- `students` jadvaliga `password_hash` va `coins` ustunlari qo'shildi
  (o'quvchi kirishi va coin balansi uchun)
- `teacher_account` — o'quvchi paneli "tizim sozlanganmi" tekshiruvi uchun
  bitta yozuv (batafsili sxema faylidagi izohda)
- `tasks` — vazifalar va har bir o'quvchining topshirig'i (submissions, jsonb)
- `postponed` — ko'chirilgan darslar
- `app_settings` — yulduz→coin mosligi (`coin_settings`, bitta qator)

**Agar avval schema.sql'ni ishga tushirgan bo'lsangiz**, uni Supabase SQL
Editor'da **qayta** ishga tushiring — yangi jadvallar va `alter table`
qatorlari xavfsiz qo'shiladi (mavjud ma'lumotlarga tegmaydi).

## O'rnatish

1. **Supabase loyihasini yarating** (supabase.com → New project).
2. **SQL sxemani ishga tushiring**: Supabase Dashboard → SQL Editor → yangi
   query oching → `database/schema.sql` faylining butun matnini joylashtirib,
   "Run" bosing.
3. **`.env` faylini sozlang**: `.env.example`ni `.env` qilib nusxalang va
   Supabase loyihangizning Project URL / anon key qiymatlarini kiriting —
   ikkala frontend ham shu bitta `.env`dan foydalanadi.
4. **O'rnatish**: `npm install`
5. **Ishga tushirish**: har bir frontend alohida Vite ilovasi sifatida ishga
   tushiriladi — qaysi birini ishlatishni Vite konfiguratsiyasida (`root`)
   ko'rsating, yoki har biri uchun alohida `vite.config.js` yarating.
6. **Birinchi hisoblarni qo'shing**: hozircha registratsiya ekrani yo'q —
   Supabase Table Editor orqali `directors`/`managers` (menejer paneli) va
   `teacher_account`/`students` (o'quvchi paneli) jadvallariga qo'lda
   qatorlar kiriting. Parolni frontend'dagi `hashPassword()` funksiyasi bilan
   bir xil SHA-256 formatda hash qilish kerak.

## ⚠️ Xavfsizlik haqida muhim eslatma

Ikkala ilova ham hali o'zining telefon+parol tekshiruvini ishlatadi (Supabase
Auth emas). `schema.sql` oxiridagi RLS siyosatlari **ataylab ochiq** qilib
qo'yilgan — ya'ni anon kalitga ega har qanday so'rov barcha jadvallarni
o'qiy/yoza oladi. Bu development bosqichi uchun ishlaydi, lekin real
o'quvchilarning to'lov va baho ma'lumotlari bilan ishlatishdan oldin:

- Login'larni haqiqiy **Supabase Auth**ga o'tkazing, YOKI
- Barcha yozish amallarini so'rovchi kim ekanligini tekshiradigan
  **Edge Function** orqasiga joylashtiring.

Aks holda anon kalitni bilgan har kim ma'lumotlarni o'zgartira oladi.

