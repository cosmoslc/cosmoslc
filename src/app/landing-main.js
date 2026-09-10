import { fetchCourses } from '../shared/api/courses';
import { fetchCenterSettings } from '../shared/api/centerSettings';

function formatMoney(num) {
  if (num === null || num === undefined || num === '') return '0';
  return String(Math.round(Number(num))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function formatPhoneDisplay(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 9) {
    return `+998 (${digits.slice(0, 2)}) ${digits.slice(2, 5)}-${digits.slice(5, 7)}-${digits.slice(7, 9)}`;
  }
  if (digits.length === 12 && digits.startsWith('998')) {
    const sub = digits.slice(3);
    return `+998 (${sub.slice(0, 2)}) ${sub.slice(2, 5)}-${sub.slice(5, 7)}-${sub.slice(7, 9)}`;
  }
  return raw;
}

function phoneToTelUri(raw) {
  if (!raw) return '';
  const cleaned = String(raw).replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length === 9) return `+998${digits}`;
  if (digits.length === 12 && digits.startsWith('998')) return `+${digits}`;
  return `+${digits}`;
}

// Icon helper based on course title
function getCourseGradientAndIcon(name = '') {
  const n = name.toLowerCase();
  if (n.includes('english') || n.includes('ingliz') || n.includes('ielts') || n.includes('cefr')) {
    return {
      gradClass: 'grad-a',
      svgIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5A1.5 1.5 0 014 18.5v-13z"/><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5a1.5 1.5 0 001.5-1.5v-13z"/></svg>`,
      defaultDesc: "Ingliz tili darajalari, grammatika va so'zlashuv ko'nikmalari."
    };
  }
  if (n.includes('matem') || n.includes('math')) {
    return {
      gradClass: 'grad-b',
      svgIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h6v6H4z"/><circle cx="17" cy="7" r="3"/><path d="M4 16l6 4M10 16l-6 4"/><path d="M15 19h6"/></svg>`,
      defaultDesc: "Kuchli mantiqiy fikrlash, zamonaviy usullar va mustahkam bilim."
    };
  }
  if (n.includes('koreys') || n.includes('korean') || n.includes('rus') || n.includes('russian')) {
    return {
      gradClass: 'grad-d',
      svgIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg>`,
      defaultDesc: "Nol darajadan boshlab xalqaro standartlar asosida erkin muloqot."
    };
  }
  return {
    gradClass: 'grad-c',
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="6"/><path d="M9.5 8.5L7 3M14.5 8.5L17 3"/><path d="M12 11.5l1 2.2 2.4.2-1.8 1.6.6 2.3-2.2-1.3-2.2 1.3.6-2.3-1.8-1.6 2.4-.2z" fill="currentColor" stroke="none"/></svg>`,
    defaultDesc: "Nazariy va amaliy mashg'ulotlar uyg'unligida professional ta'lim."
  };
}

// 1. Center Settings Sync
async function initCenterSettings() {
  try {
    const settings = await fetchCenterSettings();
    if (!settings) return;

    // Phone numbers
    const primaryRaw = settings.primaryPhone || '901234567';
    const primaryFormatted = formatPhoneDisplay(primaryRaw);
    const primaryTel = phoneToTelUri(primaryRaw);

    // Primary Phone Elements
    const primaryPhoneEls = document.querySelectorAll('.dynamic-center-phone');
    primaryPhoneEls.forEach(el => {
      el.textContent = primaryFormatted;
      if (el.tagName === 'A') {
        el.setAttribute('href', `tel:${primaryTel}`);
      }
    });

    const callBtns = document.querySelectorAll('.dynamic-call-btn');
    callBtns.forEach(el => {
      el.setAttribute('href', `tel:${primaryTel}`);
    });

    // Secondary phone
    const secContainer = document.getElementById('secondaryPhoneContainer');
    const secEl = document.getElementById('secondaryPhone');
    if (settings.secondaryPhone && settings.secondaryPhone.trim() !== '') {
      const secFormatted = formatPhoneDisplay(settings.secondaryPhone);
      const secTel = phoneToTelUri(settings.secondaryPhone);
      if (secEl) {
        secEl.textContent = secFormatted;
        if (secEl.tagName === 'A') secEl.setAttribute('href', `tel:${secTel}`);
      }
      if (secContainer) secContainer.style.display = 'flex';
    } else if (secContainer) {
      secContainer.style.display = 'none';
    }

    // Address
    const addressText = settings.address && settings.address.trim() !== ''
      ? settings.address
      : "Toshkent sh., Chilonzor tumani";
    
    const addressEls = document.querySelectorAll('.dynamic-center-address');
    addressEls.forEach(el => {
      el.textContent = addressText;
    });

    // Work Hours
    let workDaysLabel = 'Dushanba — Shanba';
    if (Array.isArray(settings.workDays) && settings.workDays.length > 0) {
      if (settings.workDays.length === 1) {
        workDaysLabel = settings.workDays[0];
      } else {
        workDaysLabel = `${settings.workDays[0]} — ${settings.workDays[settings.workDays.length - 1]}`;
      }
    }
    const startH = settings.workStart || '09:00';
    const endH = settings.workEnd || '21:00';
    const workHoursText = `${workDaysLabel} · ${startH} — ${endH}`;

    const workHoursEls = document.querySelectorAll('.dynamic-work-hours');
    workHoursEls.forEach(el => {
      el.textContent = workHoursText;
    });

    // Social Links
    if (settings.telegram) {
      const tgHandle = settings.telegram.replace('@', '');
      const tgLinks = document.querySelectorAll('.dynamic-telegram-link');
      tgLinks.forEach(el => {
        el.setAttribute('href', `https://t.me/${tgHandle}`);
      });
    }
    if (settings.instagram) {
      const igHandle = settings.instagram.replace('@', '');
      const igLinks = document.querySelectorAll('.dynamic-instagram-link');
      igLinks.forEach(el => {
        el.setAttribute('href', `https://instagram.com/${igHandle}`);
      });
    }
  } catch (err) {
    console.warn('Center settings initialization warning:', err);
  }
}

// 2. Courses & Prices Live Sync
async function initCourses() {
  try {
    const courses = await fetchCourses();
    if (!courses || courses.length === 0) return;

    // A. Populate #courseGrid
    const courseGrid = document.getElementById('courseGrid');
    if (courseGrid) {
      // Build HTML for live courses from database
      const cardsHtml = courses.map(c => {
        const { gradClass, svgIcon, defaultDesc } = getCourseGradientAndIcon(c.name);
        const duration = c.durationMonths && Number(c.durationMonths) > 0 
          ? `${c.durationMonths} oy` 
          : 'Haftada 3 kun';
        const priceStr = `${formatMoney(c.price)} so'm`;
        
        return `
          <article class="course-card reveal visible" data-course-id="${c.id}">
            <div class="course-media ${gradClass}" style="${c.color ? `background: linear-gradient(145deg, ${c.color}33, ${c.color}88)` : ''}">
              ${svgIcon}
            </div>
            <div class="course-body">
              <h3>${c.name}</h3>
              <p class="course-desc">${defaultDesc}</p>
              <div class="course-foot">
                <span class="course-meta">
                  <svg class="icon-15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>
                  ${duration}
                </span>
                <strong class="course-price">${priceStr}</strong>
              </div>
            </div>
          </article>
        `;
      }).join('');

      courseGrid.innerHTML = cardsHtml;
    }

    // B. Populate #pricingGrid with real courses & prices
    const pricingGrid = document.getElementById('pricingGrid');
    if (pricingGrid) {
      // Group courses into logical categories or a sleek card listing
      const liveCoursesHtml = courses.map(c => {
        const priceStr = `${formatMoney(c.price)} so'm`;
        const duration = c.durationMonths && Number(c.durationMonths) > 0 
          ? `${c.durationMonths} oy` 
          : 'Haftada 3 kun';
        return `
          <li>
            <span>
              <strong>${c.name}</strong>
              <small style="display:block;font-size:0.75rem;color:var(--mist);">${duration}</small>
            </span>
            <strong class="price-val">${priceStr}</strong>
          </li>
        `;
      }).join('');

      // Render Admin Database Courses Group
      const liveGroupCard = `
        <div class="price-group live-db-group" style="border-color: rgba(78, 168, 255, 0.4); box-shadow: 0 10px 30px rgba(78, 168, 255, 0.12);">
          <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;background:rgba(78, 168, 255, 0.12);color:var(--ion);font-size:0.7rem;font-weight:700;letter-spacing:0.05em;margin-bottom:12px;text-transform:uppercase;">
            <span style="width:6px;height:6px;border-radius:50%;background:#4ea8ff;box-shadow:0 0 8px #4ea8ff;"></span>
            Admin bazasidagi faol kurslar
          </div>
          <h3 class="price-group-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5A1.5 1.5 0 014 18.5v-13z"/><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5a1.5 1.5 0 001.5-1.5v-13z"/></svg>
            Tasdiqlangan Narxlar
          </h3>
          <ul class="price-list">
            ${liveCoursesHtml}
          </ul>
        </div>
      `;

      // Update pricing grid: prepend the live group card or update matching items
      pricingGrid.innerHTML = liveGroupCard + pricingGrid.innerHTML;
    }

  } catch (err) {
    console.warn('Courses initialization warning:', err);
  }
}

// Run immediately on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initCenterSettings();
    initCourses();
  });
} else {
  initCenterSettings();
  initCourses();
}
