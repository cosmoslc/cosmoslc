# Project Design & UI Rules

## 1. Flattened UI Hierarchy (No Nested Boxes / Cards Rule)
- **Asosiy qoida:** Agar asosiy konteyner (modal, card yoki panel) mavjud bo'lsa, uning ichidagi har bir element yoki kichik guruh uchun alohida borderli, soyali "box" (card) ochilmasin.
- **Qo'llash usuli:**
  - Ichki elementlarni ajratish uchun ortiqcha borderli bloklar o'rniga nozik dividerlar (`border-b`, `divide-y`), mayin fon rangi (`bg-slate-50/50 dark:bg-slate-800/30`), yoki bo'shliqlar (`gap`, `space-y`) va tipografiyadan foydalanilsin.
  - Form boshqaruv elementlari (input, rang tanlash, qidiruv) va sarlavhalar alohida-alohida qutilarga bo'linmasdan, bitta toza qatorda ixcham joylashtirilsin.
  - Ko'p elementli ro'yxatlar (masalan ruxsatlar, parametrlar) butun ekranni vertikal egallab ketmasligi uchun ustunli to'r (`grid-cols-2` yoki `grid-cols-3`) shaklida tartiblansin.
  - Mini switchlar va checkboxlar ixcham, ortiqcha paddinglarsiz ko'rinsin.
