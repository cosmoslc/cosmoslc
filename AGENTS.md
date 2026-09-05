# Project Design & UI Rules

## 1. Flattened UI Hierarchy (No Nested Boxes / Cards Rule)
- **Asosiy qoida:** Agar asosiy konteyner (modal, card yoki panel) mavjud bo'lsa, uning ichidagi har bir element yoki kichik guruh uchun alohida borderli, soyali "box" (card) ochilmasin.
- **Qo'llash usuli:**
  - Ichki elementlarni ajratish uchun ortiqcha borderli bloklar o'rniga nozik dividerlar (`border-b`, `divide-y`), mayin fon rangi (`bg-slate-50/50 dark:bg-slate-800/30`), yoki bo'shliqlar (`gap`, `space-y`) va tipografiyadan foydalanilsin.
  - Form boshqaruv elementlari (input, rang tanlash, qidiruv) va sarlavhalar alohida-alohida qutilarga bo'linmasdan, bitta toza qatorda ixcham joylashtirilsin.
  - Ko'p elementli ro'yxatlar (masalan ruxsatlar, parametrlar) butun ekranni vertikal egallab ketmasligi uchun ustunli to'r (`grid-cols-2` yoki `grid-cols-3`) shaklida tartiblansin.
  - Mini switchlar va checkboxlar ixcham, ortiqcha paddinglarsiz ko'rinsin.

## 2. Ixcham Labellar va Qavsli Eslatmalarni Taqiqlash (Clean Labels & No Unsolicited Help Text)
- **Asosiy qoida:** Form va interfeys elementlarida faqatgina qisqa va asosiy so'zlar yozilsin.
- **Qo'llash usuli:**
  - Label, option va placeholderlarda qavs ichidagi ortiqcha eslatmalar (masalan: `(Dropdown)`, `(Qidirish va tanlash)`, `(Keyinroq biriktirish)`, `(Ixtiyoriy)`) mutlaqo ishlatilmasin.
  - Inputlar hamda form elementlari ostiga qo'shimcha tushuntirish matnlari, yordamchi `<p>` yoki `<span>` izohlari va eslatmalar yozilmasin.
  - Yordamchi izohlar yoki qavs ichidagi eslatmalar faqat foydalanuvchi ularni aniq so'ragan taqdirdagina qo'shiladi.
  - Qoshimcha inputlar yonidan support inputlar qoshish faqatgina user sorasa qoshiladi

## 3. Summa va Raqam Inputlari Qoidasi (Money & Number Inputs Rule)
- **Asosiy qoida:** Har doim summa/narx yoziladigan inputlarda raqamlar minglik bo'linish (thousand separator - bo'shliq bilan, masalan: `1 000 000`, `250 000`) formatida ko'rsatilsin va kiritilsin (`MoneyInput` komponenti yoki `formatMoneyInput` ishlatilsin).
- **Raqam validatsiyasi:**
  - Barcha raqamli va summa kiritish inputlarida qat'iy validatsiya bo'lishi lozim: faqat raqamlar kiritilishiga ruxsat berilsin, harf yoki noo'rin belgilarga yo'l qo'yilmasin.
  - Manfiy qiymatlarga (agar maxsus ruxsat berilmagan bo'lsa) yo'l qo'yilmasin (`min="0"` yoki musbat raqam tekshiruvi).
  - Saqlash va hisob-kitoblarda qiymat toza `Number` formatiga o'girilib (`parseMoneyInput` orqali) ishlatilishi lozim.
  - Oddiy sonlar/miqdorlar (masalan o'quvchilar soni, foiz, muddat, xona sig'imi) kiritiladigan inputlarda ham faqat raqamlar kiritilishi va min/max chegaralariga rioya qilinishi ta'minlansin (`NumberInput` yoki tegishli validatsiya bilan).
