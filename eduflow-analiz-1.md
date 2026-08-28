# Eduflow (educationcrm.uz) — To'liq funksiya tahlili
*53 ta skrinshot asosida, NexDu bilan solishtirish uchun*

---

## 0. Arxitektura

Eduflow **5 ta alohida subdomain** orqali ishlaydi (bizning 4 fayl rejamizga mos, +1 marketing):

| Subdomain | Rol |
|---|---|
| `director.educationcrm.uz` | Direktor |
| `manager.educationcrm.uz` | Menejer |
| `teacher.educationcrm.uz` | O'qituvchi |
| `marketing.educationcrm.uz` | Marketing/lid boshqaruvi (alohida login, "Marketing direktor" roli) |
| (student subdomain ko'rinmadi, lekin ehtimol bor) | O'quvchi |

PWA sifatida o'rnatiladi (brauzer manzil satrida "Install" tugmasi). Har sahifada doimiy banner: **"Hisobingiz himoyasiz. 2FA xavfsizlikni yoqing"**.

Real muammo (o'zlarida ham bug bor): **"Yuklashda xatolik"** xatosi bir necha marta takrorlangan (Xodimlar davomati, Yangi menejer yaratish) — hatto tugallangan mahsulotda ham nuqsonlar normal.

---

## 1. DIREKTOR PANELI

### Nav tuzilishi
**UMUMIY**: Dashboard, Analitika, Filial tahlili
**O'QUV MARKAZ**: Menejerlar, Xodimlar davomati, Filiallar, Telegram Botlar
**MOLIYA & TO'LOVLAR**: Moliya (balans), To'lovlar, Xarajatlar, Coin tizimi
**SOZLAMALAR**: Arxiv, Bayramlar, Bildirishnomalar, Markaz sozlamalari, Xavfsizlik, Profil

### Dashboard
- 4 stat karta: To'lovlar, To'lov turlari, O'quvchilar, Daromad (UZS)
- "Tezkor amallar": Analitika / Filiallar / Menejerlar / To'lovlar / Bayram kunlari
- Oylik to'lovlar dinamikasi grafigi (yil filtri: 2026 ▾)
- "So'nggi to'lovlar" bo'limi + "Batafsil →"

### Analitika
7 stat karta: Tushum, Refundlar, **O'qituvchi ulushi**, Xarajatlar, Sof foyda, **Trial→Aktiv %**, **Aktiv→Churn %**
- "Filiallar foydasi" (har filial natijasi)
- "Moliya taqsimoti" — donut chart (Tushum/Refund/O'qt.ulush/Xarajat)
- "So'nggi tranzaksiyalar"

### Filial tahlili
Har filial bo'yicha oylik o'quvchi kelishi/ketishi/to'lovlari, yil filtri + yangilash tugmasi.

### Filiallar
Jadval: FILIAL NOMI (+ "Menejerlarni ko'rish" sub-havolasi) / YARATILGAN / AMALLAR. "+ Yangi filial" tugmasi.

### Dashboard — aniq matnlar
Xush kelibsiz matni: *"Markazingizning umumiy holati shu yerda. Quyidagi tezkor amallar orqali kerakli bo'limga o'ting."* Stat kartalar: To'lovlar / To'lov turlari / O'quvchilar / Daromad (UZS).

### Menejerlar
Jadval: MENEJER / TELEFON / FILIAL / **2FA holati** / AMALLAR. "+ Yangi menejer" modal — **20 punktli granular ruxsat checkbox tizimi**:

| Chap ustun | O'ng ustun |
|---|---|
| Dashboard | Lidlar |
| Bildirishnomalar | Arxiv |
| O'quvchilar | O'qituvchilar |
| Guruhlar | Davomat |
| Kurslar | To'lovlar |
| To'lov turlari | Xarajatlar |
| Analitika | Umumiy analitika |
| To'lov analitikasi | Lid analitikasi |
| O'qituvchi musobaqasi | Guruh analitikasi |
| SMS | Xonalar |
| Marketing panelga kirish | |

+ "Izoh" (ixtiyoriy eslatma) maydoni.

### Xodimlar davomati (Geofence)
Kelgan/Kelmagan/Jami xodim statistikasi, "Xodimlar joylashuvi" (joylashuv so'rash), "Office'da bo'lgan vaqt", **"Kim ko'proq ishlamoqda"** (7/30 kunlik reyting).

### Moliya (balans)
- Markaz balansi (real vaqtda), Tushum, Chiqim, Sof natija
- Faol o'quvchilar / To'lov qilganlar / Qarzdorlar / Umuman to'lamaganlar
- **Chiqimlar taqsimoti**: Tasdiqlangan xarajatlar, O'qituvchi maoshlari, O'qituvchi avanslari, **Manager maoshlari**, Refundlar → Jami chiqim
- **"+ Maosh berish"** — direktor menejerga ham maosh to'laydi (bizda yo'q)

### To'lovlar boshqaruvi
Yillik navigatsiya (◀ 2026 ▶), oylik daromad bar-chart, to'lov turlari taqsimoti, filtrlar (qidiruv/sana/turi).

### Xarajatlar (tasdiqlash navbati)
Jadval ustunlari: MENEJER / SABAB / MIQDOR / HOLAT / SO'RALGAN SANA / IZOH / AMALLAR. Oylik/Yillik almashtirgich + yil navigatsiyasi. 4 stat: Tasdiqlangan xarajatlar / Kutilayotgan so'rovlar / Tasdiqlangan / Rad etilgan. Real misol qatori: SABAB="konditsaner" (ya'ni "konditsioner"), MIQDOR=2,500,000 UZS, HOLAT="Kutilmoqda" (sariq). Qidiruv (sabab bo'yicha, masalan "Ofis materiallari" placeholder) + sana oralig'i + holat filtri. **→ Bizning FinancePage'ga deyarli bir xil, kam kuch bilan to'liq mos qo'shiladi.**

### Coin tizimi (direktor — to'liq boshqaruv)
- **4 tier**: Bronza / Kumush / Oltin / Platina (avtomatik balansga qarab)
- 3 tab: Qoidalar / Top 10 / Redemption
- Qoidalar: Darsga qatnashish (5), Uy vazifasi (3), Test 70-89 (8), Test 90+ (15), Muddatida to'lov (20)
- **"1 coin = necha so'm"** (100) — to'lovga chegirma sifatida ishlatiladi: *"50 coin × 100 so'm = 5,000 so'm chegirma"*
- Coin eskirish (kun, 0=cheksiz), "Coin tizimi faol" umumiy toggle

### Arxiv — 2 bosqichli
1. **Yumshoq arxiv**: 5 tab — O'quvchilar / To'lovlar / Guruhlar / **Lidlar** / Tugallangan
2. **Butunlay tozalash**: alohida sahifa, qat'iy ogohlantirish (*"qaytarib bo'lmaydi"*), alohida "O'quvchilar" va "Guruhlar" uchun qizil purge tugmalari

### Markaz sozlamalari
Asosiy/qo'shimcha telefon, manzil, Telegram/Instagram/Veb-sayt havolalari, **Ish vaqti** (kunlar multi-select + boshlanish/tugash vaqt + jonli preview: *"Dushanba-Shanba · 09:00-21:00"*)

### Bildirishnomalar markazi
Jami/O'qilmagan/O'qilgan hisoblagichlari, filter+qidiruv, ro'yxat (bizda faqat toast bor, tarixiy ro'yxat yo'q)

### Xavfsizlik
- **2FA**: Telegram bot (`@educrmsecuritybot`) orqali yoqiladi — `/start` → tasdiqlash → telefon+parol
- Parolni o'zgartirish (kuchli parol talablari ko'rsatiladi)
- **"Xodim 2FA Reset (Faqat direktor)"** — xodim 2FA'ga kira olmasa, direktor Telegram orqali tasdiqlab o'chirib beradi

---

## 2. MENEJER PANELI

### Nav tuzilishi
**ASOSIY**: Bugungi ish stoli, Dashboard, Chatbox
**O'QUV JARAYONI**: O'quvchilar, Guruhlar, Ustozlar, Xodimlar davomati, Davomat, Kurslar, Xonalar, Marketing panel
**MOLIYA**: To'lovlar, Qarzdorlar, To'lov turi, Chiqimlar
**TAHLIL VA HISOBOT**: Umumiy analiz, To'lovlar analizi, O'qituvchi reyting, Guruhlar analizi, Davomat analizi, Break-even
**ALOQA**: Auto SMS, SMS ulanish
**BOSHQARUV**: Arxiv, Bayram kunlari, Coin tizimi
**SOZLAMALAR**: Markaz sozlamalari, SMS sozlamalar, Rang sozlamalari, Sidebar tartibi

Top bar'da doim ko'rinadigan 3 tugma: **"+ O'quvchi" / "+ To'liq qo'shish" / "To'lov"** (ikki bosqichli o'quvchi qo'shish).

### Bugungi ish stoli — aniq matnlar
3 karta (har biri qizil/sariq chap chiziq bilan):
- **Qarzdorlar** — "Muddati kelgan va o'tgan to'lovlar" — bo'sh holat: *"Bugun qarzdor yo'q ✅"*
- **Bugun kelmaganlar** — "Bugungi darsga kelmagan o'quvchilar" — bo'sh holat: *"Bugun hamma keldi 🎉"*
- **Tugayotgan guruhlar** — "Keyingi 14 kun ichida yakunlanadi" — bo'sh holat: *"Yaqin 14 kunda tugaydigan guruh yo'q"*

Har birida "Barchasi →" havolasi. Alohida `/debtor-students` sahifasiga o'tadi: 4 stat (Jami o'quvchi / Umumiy qarz / Bugun to'lashi kerak / Muddati o'tgan) + filter pillar (Hammasi/Muddati o'tgan/Bugun/Kelgusi).

### Dashboard (asosiy) — kalendar rejimi
"Nimadan boshlaymiz?" 4 tezkor karta (birinchisi ko'k ramka bilan ajratilgan default): O'quvchi qo'shish / Davomat / To'lovlar / Hisobotlar. Pastda **"Kalendar / Klassik"** ko'rinish almashtirgichi + oy navigatsiyasi (◀ Bugun ▶) + **"Oy / Hafta / Kun"** almashtirgich. To'liq oy taqvimi (DU-YA ustunlari) — har kunga tegishli darslar shu yerda ko'rinadi.

### O'quvchilar ro'yxati sahifasi — 5 stat
JAMI O'QUVCHILAR / **GURUHGA QO'SHILGAN** (✓yashil) / **GURUHGA QO'SHILMAGAN** (⚠sariq) / **ARXIVDAGI** (🗑qizil) / **MOBIL DASTUR BOR** (% bilan, yashil). Jadval ustunlari: TO'LIQ ISM / TELEFON RAQAM / QANDAY KELGANI / 📱APP / GURUH / AMALLAR. Qo'shimcha vositalar: **Import** / **Export** tugmalari, sahifa hajmi tanlagichi (10/20/...).

### O'quvchi qo'shish — 2 xil, aniq mustaqil forma
1. **"Tezkor o'quvchi qo'shish"** (5 maydon, hammasi majburiy★ dan tashqari oxirgisi): To'liq ism★, Telefon raqam★ (+998-90-123-45-67 format), Jins★ (dropdown), Parol★ (kamida 6 belgi), "O'quvchi qanday kelgani" (ixtiyoriy, placeholder: *"Masalan: Do'sti orqali, Instagram, Lid: Facebook"*)
2. **"Yangi o'quvchi qo'shish"** (to'liq, ~15 maydon): + O'quv markaz ID, Maktab raqami, Sinf, Tug'ilgan yil/oy/kun (3 alohida maydon), Ota-onasi F.I.Sh, Ota-onasi telefon raqami, "qanday kelgani", va to'liq manzil: **Viloyat → Tuman → Mahalla → Ko'cha va uy raqami** (kaskad dropdown)

Alohida modal: **"O'quvchini guruhga qo'shish"** — tanlangan o'quvchi ma'lumoti ko'k info-box'da ko'rsatiladi, keyin faqat "Guruh" dropdown tanlanadi. (Ya'ni o'quvchi qo'shish va guruhga biriktirish — 2 mustaqil qadam.)

### Kurslar (menejer) — bizning modeldan farqli!
⚠️ **Muhim arxitektura farqi**: ularda **kursning o'zida ham narx va davomiylik bor** (bizda buni to'liq guruhga ko'chirgan edik). Sahifa: "+ Yangi kurs qo'shish" tugmasi, 3 stat (Jami kurslar / O'rtacha davomiylik / O'rtacha narx). Kurs kartasi: nom + "Faol" badge + narx (masalan "350000 UZS") + davomiylik ("8 oy") + Tahrirlash/O'chirish tugmalari. Ya'ni ularda **kurs = shablon** (narx+davomiylik namunasi), **guruh = amaliy nusxa** (xona+ustoz+jadval qo'shilgan holda, kursdan narxni meros oladi yoki qayta belgilaydi).

### Guruh yaratish — 4 bosqichli wizard ko'rinishi
Xonalar sahifasida yuqorida breadcrumb-uslubidagi progress ko'rsatkich bor: **"Kurslarni ✓ → Xonalarni → O'qituvchilarni → Guruh"** — bu shuni ko'rsatadiki, guruh yaratish oldidan tizim foydalanuvchini "avval kurs, keyin xona, keyin o'qituvchi" tartibida yo'naltiradi.

**"Yangi guruh qo'shish" formasi — barcha maydonlar**: Guruh nomi, **Ustoz** (dropdown — bevosita shu yerda tanlanadi), **Guruh ochilgan sana** (ⓘ maslahat belgisi bilan), **Boshlanish vaqti**, **Davomiyligi** (daqiqada, masalan "120 daqiqa"), **Xona** (dropdown), **Kurs** (dropdown, narx+davomiylik ko'rinadi: "Ingiliz tili begginer · 8"), va **avtomatik hisoblanadigan** "Jami darslar soni" info-box: *"104 ta dars · 8 oy × 3 kun/hafta"* (kurs davomiyligi × haftalik dars kunlari soni asosida). Pastda "Dars kunlari" — 7 kunlik pill-tanlagich.

### Guruh detali sahifasi
- "Guruhni tugallash" / "Yangilash" tugmalari
- 6 info-chip qatori: **O'qituvchi** / **Xona** / **Dars vaqti** (soat·daqiqa) / **Dars kunlari** / **To'lov/oy** / **O'quvchilar** (soni)
- **Dars progressi**: 0/104 dars · 0% (real vaqtli progress-bar)
- 4 tab: O'quvchilar / Davomat / Jadval / **+Darslar**
- "Mavjud talaba" (mavjud o'quvchini qo'shish) + "+ Yangi o'quvchi" (yangi yaratib qo'shish) — 2 alohida tugma
- Jadval ustunlari: O'QUVCHI / TELEFON / JINSI / BU OY TO'LOVI + har o'quvchi qatorida **"To'lab qo'yish"** tez tugmasi va guruhdan chiqarish (logout-ikon) tugmasi
- **Guruh darajasida Telegram integratsiyasi** — "Telegram chat" bo'limi, guruh-chat ulash, hozircha "Ulanmagan / Bu guruhda aktiv Telegram binding yo'q"

### O'quvchi balans tarixi
Joriy balans, jami chegirilgan, davomat yozuvlari soni, oxirgi davomat sanasi.

### Ustoz moliyaviy kartochkasi (eng murakkab qism)
- **"Avans berish"** va **"Maosh to'lash"** — 2 alohida amal
- Oylik hisob-kitob: Oylik haqi (foizdan) − Avans − Maosh = **Qolgan haqi**
- **"Teacher hisobidan" vs "Markaz hisobidan"** — 2 xil balans (rangli nuqta bilan)
- 4 tab: Guruhlar / To'lovlar / Avanslar / Maosh tarixi
- Ustoz qo'shishda 2 xil kelishuv turi: **"To'lovdan foiz"** ("o'quvchi to'lovidan ulush") vs **"Belgilangan oylik"** ("to'lovga bog'liq emas")
- Real misol: 350,000 so'mlik to'lov + 40% foiz → Oylik haqi avtomatik 140,000 UZS bo'lib hisoblanadi; "Maosh to'lash" bosilgach Qolgan haqi 0 ga tushadi
- Ustozlar ro'yxatida har kartada **"Ruxsatni olib tashlash"** (yashil, person-check ikon) — guruh yaratish huquqini (`canCreateGroups`) yoqib/o'chiradi. Yonida kalit/qalam/savat ikonlari (parol/tahrirlash/o'chirish)

### Davomat (Attendance) — to'liq modul
Davomat olish modali: 4 holat — ✓Bor / ⏰Kech / 📝Sababli / ✗Yo'q + sabab matni + "Hammasi keldi" tez tugmasi. Saqlangach: statistika sahifasi (Jami/Keldi/Kechikdi/Kelmadi/Davomat%).

### Coin tizimi (menejer — cheklangan)
Jami o'quvchilar, Eng yuqori balans, Leaderboard. **"1 coin = 100 so'm (Director)"** — faqat ko'rish, o'zgartira olmaydi. Har o'quvchida "Ber" (qo'lda coin berish) + "Tarix". Coin tarixida **avtomatik sabablar** ham bor — masalan "Muddatida to'lov" uchun +20 avtomatik yoziladi.

### Xonalar (Rooms) — bizda yo'q modul
Xona nomi + sig'im (masalan "7-xona, 25 ta sig'im"). Statistika: Jami xonalar / Katta xonalar (25+) / Umumiy sig'im.

### Break-even (zararsizlik nuqtasi)
Davr turi/Yil/Oy filtri. Jami tushum, Jami xarajat, Sof foyda, Foydali/zararli davrlar (1/0). Matn bilan tushuntirish: *"Shu davrga kelib yig'ilgan tushum yig'ilgan xarajatni qopladi..."* + 2 chart (Tushum va xarajat / Yig'ilgan foyda dinamikasi). **Manfiy holatni ham to'g'ri hisoblaydi**: −3,800,000 so'm, −542.9% rentabellik holati ko'rilgan.

### ⚠️ Takrorlanuvchi real xato: ism/kurs bog'lanishi uzilib qoladi
Bu alohida ta'kidlashga arziydigan narsa — **kamida 4 ta turli sahifada** bir xil turdagi bug takrorlangan (ism yoki kurs nomi ko'rsatilishi kerak bo'lgan joyda "N/A" yoki "Noma'lum" chiqadi):
- Davomat yozuvi sahifasida: "Ruhshona **N/A**" va "Qudratbek **N/A**" (ism to'g'ri, lekin qo'shimcha identifikator bog'lanmagan)
- Xarajat jadvalida: MENEJER ustuni "**Noma'lum**" (menejer ID to'g'ri saqlanmagan)
- Guruhlar analizi kartasida: guruh nomi o'rniga "**Noma'lum**"
- Davomat analizi sahifasida: "O'qituvchi: ·  Kurs:" — ikkalasi ham **bo'sh** (faqat dars vaqti ko'rinadi)

**Xulosa**: hatto ishlab chiqarilgan (production) mahsulotda ham ma'lumotlar bog'lanishida (relation/foreign-key) uzilishlar bo'ladi — bizning kod uchun ham bunday joylarni (masalan `course.name`, `teacher.name` ko'rsatiladigan har bir joy) "agar topilmasa nima ko'rsatiladi" holatini o'ylab qo'yish kerak (masalan "N/A" emas, "—" yoki umuman ko'rsatmaslik afzalroq).

### Auto SMS
8 xil trigger (Sababli dars qoldirish, Darsga kech qolish va h.k.), har biri alohida toggle. **14 ta shablon o'zgaruvchisi**: {ism}, {telefon}, {guruh}, {yangi_guruh}, {eski_guruh}, {kurs}, {sana}, {dars_vaqti}, {ustoz}, {tolov_miqdori}, {qarz_miqdori}, {balans}, {sabab}, {vaqt}.

### SMS ulanish
**smsxabar.uz (Play Mobile)** integratsiyasi — Login+Parol (Basic auth), Jo'natuvchi (originator) kodi. *"O'chirsangiz Eskiz'ga qaytadi"* — **zaxira SMS-shlyuz (Eskiz.uz) ham bor**, avtomatik fallback.

---

## 3. O'QITUVCHI PANELI (`teacher.jsx` uchun eng muhim qism)

### Nav tuzilishi
**Bosh sahifa** / **O'QUV JARAYONI**: Guruhlar, Talabalar, Jadval / **BAHOLASH**: Imtihonlar, Coin holati / **HISOBOT**: Analitika, To'lovlar, Hisobotlar / Sozlamalar

### Dashboard
Balans kartasi (header), 4 tezkor amal: Guruhlarim / Davomat olish / Baho qo'yish / Maoshim. Statistika: O'quvchilar, Guruhlar, Haqiqiy maosh, Komissiya %. Pastda "Boshqa bo'limlar" tezkor havolalar.

### Guruh detali — 4 tab: Davomat / Baholar / Top / Imtihonlar
- Har dars: DARS VAQTI, DARS KUNLARI, **HOLAT** (Olish mumkin → Yo'qlama olingan)
- ⚠️ **Muhim qoida**: bir marta davomat saqlangach — *"Bugungi yo'qloma olingan — Tahrirlash uchun menejerga murojaat qiling"*. **O'qituvchi o'z davomatini o'zgartira olmaydi**, faqat menejer tuzatadi.
- Davomat jadvali — oylik kalendar, 4 rang legenda (Keldi/Kechikdi/Sababli/Kelmadi)

### Davomat+Baholash kiritish oynasi — 4 qatlamli baholash
Bitta jadvalda birga:
1. **Davomat**: Keldi/Kechikdi/Sababli/Kelmadi
2. **Dars baho**: 5-4-3-2-1
3. **Uy vazifasi**: Bajardi/Qisman/Bajarmadi/Yo'q edi
4. Qatorni ochsangiz: **Vazifa baho** (5-1) + **Aktivlik** (5-1, alohida) + **Izoh** matni (erkin matn maydoni)

Sahifa tepasida 4 stat: JAMI O'QUVCHI / KELDI (soni·foizi) / VAZIFA BAJARDI (masalan "1/2") / O'RTACHA BAHO. Saqlangach yashil qulflash banneri chiqadi: *"Bu sana uchun yo'qlama olingan. Quyida saqlangan natijalar — o'zgartirish uchun menejerga murojaat qiling."* — shu paytdan boshlab barcha maydonlar (baho tugmalari ham) kulrang/bosilmaydigan holatga o'tadi, faqat ko'rish uchun qoladi.

### Jadval
Haftalik kalendar (Dushanba-Yakshanba), har kun darslari, 4 statistika: Haftalik darslar / Bugungi darslar / Kurslar / Guruhlar.

### Coin holati
"Faqat ko'rish" belgisi bilan — 3 tab: Leaderboard / O'quvchilar / Coin qoidalari (o'zgartirish huquqisiz).

### Analitika
Guruh tanlab (dropdown), 6 oylik trend (Davomat% + O'rtacha ball), "O'quvchilar kesimi" ro'yxati.

### To'lovlar
Katta binafsha karta: **Joriy balansim**, *"Har bir to'lovdan X% ulush qo'shiladi"*, Bu oy to'lovlar / Mening ulushim. "To'lov qilgan/qilmagan" hisoblagichlari + guruh bo'yicha yig'ma.

### Hisobotlar
O'qituvchi + oy sarlavhali binafsha karta (Komissiya%, Balans). O'quvchilar/Maosh/Guruhlar statistikasi. "Guruhlar bo'yicha tahlil" — har guruhda o'quvchi/maosh/to'lov-yetarli holati. "Oylik maosh tarixi".

---

## 4. MARKETING PANEL (`marketing.educationcrm.uz`) — bizda umuman yo'q modul

Alohida login, rol: **"Marketing direktor"**. Sidebar: Dashboard, Arizalar, Formalar, Statistika, Xodimlar, Sozlamalar. "+ Yangi forma" tugmasi (binafsha).

- Dashboard: **"Bugungi yangi arizalar"** (ko'k karta), **"Oy boshidan arizalar"** (binafsha karta), **"Konversiya (→ o'quvchi)"** — foiz, masalan "0,0%" (yashil karta), **"Javobsiz arizalar"** + qizil ogohlantirish "⚠ 24 soatdan oshgan" (qizil karta)
- **Sotuv voronkasi (funnel)** — 6 rangli bosqich: **Yangi**(ko'k) → **Bog'lanildi**(sariq) → **Sinov darsi**(binafsha) → **Keldi**(moviy-yashil) → **O'quvchi bo'ldi**(yashil) → **Yo'qotildi**(qizil/pushti). Sarlavha: "oxirgi 30 kun · N ariza"
- "Bugungi eslatmalar" bloki (0 ta bo'lsa: *"Bugunga eslatma yo'q 🎉"*)
- "So'nggi arizalar" bo'limi, **"jonli"** badge (real-time yangilanish belgisi)
- Bo'sh holat: *"Hali arizalar yo'q — Forma havolasini tarqating — birinchi arizalar shu yerda paydo bo'ladi."*
- Forma havolasi orqali tashqi lid yig'ish (landing/Instagram formasidan)
- Profil pastda: ism + "Marketing direktor" rol yorlig'i

---

## 5. UMUMIY XULOSA VA TAVSIYALAR

### Bizda yo'q, ular bor (qo'shish mumkin bo'lgan modullar, murakkablik tartibida)

1. **Davomat moduli (to'liq)** — davomat olish + tahlil sahifasi + qulflash qoidasi — ⭐ eng oson, katta ta'sir
2. **Chiqimlar so'rov oqimi** (menejer so'raydi → direktor tasdiqlaydi) — bizning FinancePage'ga juda yaqin, kam kuch
3. **Ustoz-maosh hisob-kitobi** (avans/maosh/foiz balans, 2 xil kelishuv turi)
4. **Bildirishnomalar markazi** (tarixiy ro'yxat, hozir bizda faqat toast)
5. **Coin/gamifikatsiya tizimi** (tier, avtomatik qoidalar, to'lovga chegirma)
6. **Break-even va chuqur analitika sahifalari**
7. **Xonalar (Rooms) moduli**
8. **2FA + Telegram-bot xavfsizlik zanjiri**
9. **SMS avtomatlashtirish** (shablon o'zgaruvchilari + ikki zaxira shlyuz)
10. **Marketing/lid moduli** — eng katta, alohida 5-fayl (`marketing.jsx`) bo'lardi

### Ularning zaif tomonlari (bizga saboq)
- **Ism/kurs bog'lanishi uzilishi** ("N/A", "Noma'lum") — kamida 4 xil sahifada takrorlangan (batafsil: 2-bo'limdagi "⚠️ Takrorlanuvchi real xato" qismida)
- Real **"Yuklashda xatolik"** xatosi bir necha marta takrorlangan (Menejer yaratish, Xodimlar davomati) — hatto ishlab chiqarilgan mahsulotda ham bug bor, demak bizniki ham "100% mukammal" bo'lishi shart emas, faqat ishonchli ishlashi kerak
- Manba: barcha ma'lumotlar 2026-07-24 kuni, real ish jarayonida olingan skrinshotlar (Jul 24 vaqt tamg'asi bilan)

---

*Tayyorlandi: **73 ta skrinshot**, 4 ta ketma-ket yuklash bosqichi (20+20+20+13) asosida, har biri alohida ko'rib chiqilib to'liq tahlil qilingan — aniq matnlar, stat qiymatlar, jadval ustunlari, forma maydonlari va bo'sh holatlar darajasida.*
