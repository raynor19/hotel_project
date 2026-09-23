/* ============================================================
   HOTELKU — Pages JavaScript
   (Rooms, Carousel, Reservations, Admin)
   ============================================================ */

// ==================== GLOBAL AUTH FETCH INTERCEPTOR ====================
(function() {
  if (window.__hotelkuFetchWrapped) return;
  window.__hotelkuFetchWrapped = true;
  const origFetch = window.fetch;
  window.fetch = function(url, options = {}) {
    try {
      const savedUserStr = localStorage.getItem('hotelku_user');
      if (savedUserStr && typeof url === 'string' && url.startsWith('/api')) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser && (savedUser.id || savedUser.role)) {
          options = options || {};
          options.credentials = options.credentials || 'same-origin';
          options.headers = options.headers || {};
          if (options.headers instanceof Headers) {
            if (!options.headers.has('x-user-id')) options.headers.set('x-user-id', String(savedUser.id || ''));
            if (!options.headers.has('x-user-email')) options.headers.set('x-user-email', String(savedUser.email || ''));
            if (!options.headers.has('x-user-role')) options.headers.set('x-user-role', String(savedUser.role || ''));
            if (!options.headers.has('x-user-name')) options.headers.set('x-user-name', encodeURIComponent(savedUser.name || ''));
          } else if (typeof options.headers === 'object') {
            if (!options.headers['x-user-id']) options.headers['x-user-id'] = String(savedUser.id || '');
            if (!options.headers['x-user-email']) options.headers['x-user-email'] = String(savedUser.email || '');
            if (!options.headers['x-user-role']) options.headers['x-user-role'] = String(savedUser.role || '');
            if (!options.headers['x-user-name']) options.headers['x-user-name'] = encodeURIComponent(savedUser.name || '');
          }
        }
      }
    } catch(e) {}
    return origFetch.apply(this, [url, options]);
  };
})();

// ==================== REALTIME CLOCK & DATE ====================
function initRealtimeClock() {
  const tzConfig = {
    id: { timeZone: 'Asia/Jakarta', tzCode: 'WIB' },
    en: { timeZone: 'Europe/London', tzCode: 'BST' },
    ja: { timeZone: 'Asia/Tokyo', tzCode: 'JST' },
    ar: { timeZone: 'Asia/Riyadh', tzCode: 'AST' },
    zh: { timeZone: 'Asia/Shanghai', tzCode: 'CST' }
  };

  const weekIndexMap = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };

  const days = {
    id: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    ja: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
    zh: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  };

  const months = {
    id: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  };

  function updateClock() {
    const lang = (window.getCurrentLanguage && window.getCurrentLanguage()) || localStorage.getItem('hotelku_lang') || 'id';
    const cfg = tzConfig[lang] || tzConfig.id;
    const now = new Date();

    let parts = {};
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: cfg.timeZone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
      });
      formatter.formatToParts(now).forEach(p => { parts[p.type] = p.value; });
    } catch (e) {
      parts = {
        year: String(now.getFullYear()),
        month: String(now.getMonth() + 1),
        day: String(now.getDate()),
        weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()],
        hour: String(now.getHours()),
        minute: String(now.getMinutes()),
        second: String(now.getSeconds())
      };
    }

    const year = parseInt(parts.year, 10);
    const monthIdx = parseInt(parts.month, 10) - 1;
    const dateNum = parseInt(parts.day, 10);
    const dayIdx = weekIndexMap[parts.weekday] !== undefined ? weekIndexMap[parts.weekday] : 0;

    let h24 = parseInt(parts.hour, 10);
    if (h24 === 24) h24 = 0;
    const hours24 = String(h24).padStart(2, '0');
    const minutes = String(parts.minute || '00').padStart(2, '0');
    const seconds = String(parts.second || '00').padStart(2, '0');
    const h12 = h24 % 12 || 12;
    const hours12 = String(h12).padStart(2, '0');

    const dayList = days[lang] || days.id;
    const monthList = months[lang] || months.id;
    const dayName = dayList[dayIdx];
    const monthName = monthList[monthIdx];

    let dateFormatted = '';
    let timeFormatted = '';
    let yearFormatted = String(year);

    if (lang === 'en') {
      dateFormatted = `${dayName}, ${monthName} ${dateNum}, ${year}`;
      timeFormatted = `${hours12}:${minutes}:${seconds} ${h24 >= 12 ? 'PM' : 'AM'} ${cfg.tzCode}`;
    } else if (lang === 'ja') {
      yearFormatted = `${year}年`;
      dateFormatted = `${year}年${monthIdx + 1}月${dateNum}日 (${dayName})`;
      timeFormatted = `${hours24}:${minutes}:${seconds} ${cfg.tzCode}`;
    } else if (lang === 'zh') {
      yearFormatted = `${year}年`;
      const period = h24 < 6 ? '凌晨' : h24 < 12 ? '上午' : h24 < 18 ? '下午' : '晚上';
      dateFormatted = `${year}年${monthIdx + 1}月${dateNum}日 ${dayName}`;
      timeFormatted = `${period} ${hours12}:${minutes}:${seconds} ${cfg.tzCode}`;
    } else if (lang === 'ar') {
      const ampm = h24 >= 12 ? 'م' : 'ص';
      dateFormatted = `${dayName}، ${dateNum} ${monthName} ${year}`;
      timeFormatted = `${hours12}:${minutes}:${seconds} ${ampm} ${cfg.tzCode}`;
    } else {
      // Bahasa Indonesia (default Jakarta WIB)
      dateFormatted = `${dayName}, ${dateNum} ${monthName} ${year}`;
      timeFormatted = `${hours24}:${minutes}:${seconds} ${cfg.tzCode}`;
    }

    const fullFormatted = `${dateFormatted} • ${timeFormatted}`;

    document.querySelectorAll('.topbar-clock-badge').forEach(el => {
      el.classList.add('notranslate');
      el.setAttribute('dir', 'ltr');
    });

    document.querySelectorAll('.realtime-full-datetime').forEach(el => {
      el.classList.add('notranslate');
      el.setAttribute('dir', 'ltr');
      el.textContent = fullFormatted;
    });
    document.querySelectorAll('.realtime-date').forEach(el => {
      el.classList.add('notranslate');
      el.textContent = dateFormatted;
    });
    document.querySelectorAll('.realtime-clock').forEach(el => {
      el.classList.add('notranslate');
      el.setAttribute('dir', 'ltr');
      el.textContent = timeFormatted;
    });
    document.querySelectorAll('.realtime-day').forEach(el => {
      el.classList.add('notranslate');
      el.textContent = dayName;
    });
    document.querySelectorAll('.realtime-daynum').forEach(el => {
      el.classList.add('notranslate');
      el.textContent = String(dateNum);
    });
    document.querySelectorAll('.realtime-month').forEach(el => {
      el.classList.add('notranslate');
      el.textContent = monthName;
    });
    document.querySelectorAll('.realtime-year').forEach(el => {
      el.classList.add('notranslate');
      el.textContent = yearFormatted;
    });
  }

  window.updateRealtimeClock = updateClock;
  updateClock();
  if (!window.__hotelkuClockInterval) {
    window.__hotelkuClockInterval = setInterval(updateClock, 1000);
  }
  window.addEventListener('languageChanged', updateClock);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRealtimeClock);
} else {
  initRealtimeClock();
}

// ==================== UTILITY FUNCTIONS ====================

function formatCurrency(amount) {
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const lang = (window.getCurrentLanguage && window.getCurrentLanguage()) || localStorage.getItem('hotelku_lang') || 'id';

  if (lang === 'en') {
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } else if (lang === 'ja' || lang === 'zh') {
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  } else if (lang === 'ar') {
    const monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return `${d.getDate()} ${monthsAr[d.getMonth()]} ${d.getFullYear()}`;
  } else {
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}

function getStatusBadge(status) {
  const map = {
    'pending': ['Menunggu Konfirmasi', 'status-pending', 'fa-clock'],
    'approved': ['Pesanan Dikonfirmasi', 'status-approved', 'fa-check-circle'],
    'rejected': ['Ditolak', 'status-rejected', 'fa-times-circle'],
    'checked-in': ['Sedang Menginap', 'status-checked-in', 'fa-door-open'],
    'checked-out': ['Checked Out', 'status-checked-out', 'fa-sign-out-alt']
  };
  const [label, cls, icon] = map[status] || ['Unknown', '', 'fa-question'];
  return `<span class="status-badge ${cls}"><i class="fas ${icon}"></i> ${label}</span>`;
}

function getPaymentBadge(rsv) {
  if (!rsv) return '';
  const methodNames = {
    'qris': 'QRIS',
    'va': 'Virtual Account',
    'cc': 'Kartu Kredit / Debit',
    'hotel': 'Bayar di Hotel'
  };
  const m = (rsv.paymentMethod || 'qris').toLowerCase();
  const label = methodNames[m] || (rsv.paymentMethod ? rsv.paymentMethod.toUpperCase() : 'QRIS');
  if (rsv.paymentStatus === 'paid' || (!rsv.paymentStatus && m !== 'hotel')) {
    return `<span class="status-badge" style="background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;font-size:0.75rem;font-weight:700;"><i class="fas fa-check-circle"></i> LUNAS (${label}) · ${rsv.paymentRef || ''}</span>`;
  } else if (rsv.paymentStatus === 'pay_at_hotel' || m === 'hotel') {
    return `<span class="status-badge" style="background:#fef3c7;color:#92400e;border:1px solid #fde68a;font-size:0.75rem;font-weight:700;"><i class="fas fa-hotel"></i> Bayar di Resepsionis</span>`;
  }
  return `<span class="status-badge" style="background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;font-size:0.75rem;"><i class="fas fa-credit-card"></i> ${label}</span>`;
}
window.getPaymentBadge = getPaymentBadge;


function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const isLoginMsg = message && message.toLowerCase().includes('login');
  if (isLoginMsg) {
    const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
    toast.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-exclamation-circle"></i>
          <span>${message}</span>
        </div>
        <a href="/login?redirect=${redirectUrl}" style="background: rgba(255,255,255,0.25); color: #fff; padding: 4px 10px; border-radius: 4px; text-decoration: none; font-weight: 700; font-size: 0.8rem; white-space: nowrap;">
          Masuk Akun →
        </a>
      </div>
    `;
  } else {
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
  }

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), isLoginMsg ? 6000 : 4000);
}

function showModal(title, bodyHTML, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <h3>${title}</h3>
      ${bodyHTML}
      <div class="modal-actions">
        <button class="btn-cancel" id="modalCancel">Batal</button>
        <button class="btn-reject" id="modalConfirm">Konfirmasi</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#modalCancel').onclick = () => overlay.remove();
  overlay.querySelector('#modalConfirm').onclick = () => { onConfirm(overlay); overlay.remove(); };
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

// ==================== NAVBAR INIT ====================

async function initNavbar() {
  try {
    let res = await fetch('/api/me');
    let data = await res.json().catch(() => ({ success: false }));

    // Jika sesi server terputus/kosong tapi di localStorage ada user yang tersimpan, pulihkan otomatis
    if (!data.success) {
      const savedUserStr = localStorage.getItem('hotelku_user');
      if (savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser && (savedUser.id || savedUser.email)) {
            const restoreRes = await fetch('/api/auth/restore-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: savedUser.id, email: savedUser.email })
            });
            const restoreData = await restoreRes.json().catch(() => ({ success: false }));
            if (restoreData.success) {
              data = restoreData;
            }
          }
        } catch(e) {}
      }
    }

    if (data.success) {
      const user = data.user;
      localStorage.setItem('hotelku_user', JSON.stringify(user));

      // Show/hide elements based on role
      document.querySelectorAll('.logged-out-only').forEach(el => el.classList.add('hide'));
      document.querySelectorAll('.logged-in-only').forEach(el => el.classList.remove('hide'));

      if (user.role === 'admin') {
        document.querySelectorAll('.admin-only, .staff-only').forEach(el => el.classList.remove('hide'));
        document.querySelectorAll('.guest-only, .receptionist-only').forEach(el => el.classList.add('hide'));
      } else if (user.role === 'receptionist') {
        document.querySelectorAll('.receptionist-only, .staff-only').forEach(el => el.classList.remove('hide'));
        document.querySelectorAll('.admin-only, .guest-only').forEach(el => el.classList.add('hide'));
      } else {
        document.querySelectorAll('.guest-only').forEach(el => el.classList.remove('hide'));
        document.querySelectorAll('.admin-only, .receptionist-only, .staff-only').forEach(el => el.classList.add('hide'));
      }

      const nameEl = document.getElementById('navUserName');
      if (nameEl) nameEl.textContent = user.name;

      // Logout
      const logoutBtn = document.getElementById('navLogout');
      if (logoutBtn) {
        logoutBtn.onclick = async () => {
          localStorage.removeItem('hotelku_user');
          localStorage.removeItem('hotelku_my_rsv');
          try {
            for (let i = localStorage.length - 1; i >= 0; i--) {
              const k = localStorage.key(i);
              if (k && (k.startsWith('hotelku_my_rsv') || k.startsWith('hotelku_user'))) {
                localStorage.removeItem(k);
              }
            }
          } catch(e) {}
          try {
            document.cookie = 'hotelku_auth=; path=/; max-age=0; SameSite=Lax';
          } catch(e) {}
          await fetch('/api/logout', { method: 'POST' });
          window.location.href = '/login';
        };
      }
    } else {
      document.querySelectorAll('.logged-in-only').forEach(el => el.classList.add('hide'));
      document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hide'));
      document.querySelectorAll('.guest-only').forEach(el => el.classList.add('hide'));
      document.querySelectorAll('.logged-out-only').forEach(el => el.classList.remove('hide'));
    }
  } catch {
    document.querySelectorAll('.logged-in-only').forEach(el => el.classList.add('hide'));
    document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hide'));
    document.querySelectorAll('.guest-only').forEach(el => el.classList.add('hide'));
  }
}

// ==================== PHOTO CAROUSEL ====================

function initCarousel(containerEl, photos) {
  if (!containerEl || !photos || photos.length === 0) return;

  let activeIndex = 0;
  let slidesHTML = photos.map((p, i) => `<div class="carousel-slide" data-index="${i}"><img src="${p}" alt="Foto ${i+1}" draggable="false"></div>`).join('');
  let thumbsHTML = photos.map((p, i) => `<img src="${p.replace('w=1200', 'w=200')}" class="${i === 0 ? 'active' : ''}" data-index="${i}" alt="Thumb ${i+1}">`).join('');
  let dotsHTML = photos.map((_, i) => `<button class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Foto ${i+1}"></button>`).join('');

  containerEl.innerHTML = `
    <div class="carousel-container" tabindex="0">
      <button class="carousel-arrow carousel-prev" aria-label="Foto Sebelumnya"><i class="fas fa-chevron-left"></i></button>
      <div class="carousel-track">${slidesHTML}</div>
      <button class="carousel-arrow carousel-next" aria-label="Foto Berikutnya"><i class="fas fa-chevron-right"></i></button>
      <div class="carousel-counter">1 / ${photos.length}</div>
      <div class="carousel-dots">${dotsHTML}</div>
      <div class="carousel-swipe-hint"><i class="fas fa-arrows-alt-h"></i> Geser kanan / kiri</div>
    </div>
    <div class="carousel-thumbs">${thumbsHTML}</div>
  `;

  const track = containerEl.querySelector('.carousel-track');
  const counter = containerEl.querySelector('.carousel-counter');
  const thumbs = containerEl.querySelectorAll('.carousel-thumbs img');
  const dots = containerEl.querySelectorAll('.carousel-dot');
  const prevBtn = containerEl.querySelector('.carousel-prev');
  const nextBtn = containerEl.querySelector('.carousel-next');
  const hint = containerEl.querySelector('.carousel-swipe-hint');
  const thumbsContainer = containerEl.querySelector('.carousel-thumbs');

  function updateUI(index) {
    activeIndex = index;
    if (counter) counter.textContent = `${index + 1} / ${photos.length}`;
    thumbs.forEach((t, i) => t.classList.toggle('active', i === index));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));

    // Auto scroll thumbnail into view
    if (thumbs[index] && thumbsContainer) {
      const thumbLeft = thumbs[index].offsetLeft;
      const thumbWidth = thumbs[index].clientWidth;
      const containerWidth = thumbsContainer.clientWidth;
      thumbsContainer.scrollTo({
        left: thumbLeft - (containerWidth / 2) + (thumbWidth / 2),
        behavior: 'smooth'
      });
    }

    // Hide swipe hint after first user interaction
    if (hint && hint.style.opacity !== '0') {
      hint.style.opacity = '0';
      setTimeout(() => { if (hint) hint.style.display = 'none'; }, 600);
    }
  }

  function goToSlide(idx) {
    if (idx < 0) idx = 0;
    if (idx >= photos.length) idx = photos.length - 1;
    activeIndex = idx;
    const slides = track.querySelectorAll('.carousel-slide');
    if (slides[activeIndex]) {
      const slide = slides[activeIndex];
      const targetScroll = slide.offsetLeft - ((track.clientWidth - slide.clientWidth) / 2);
      track.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth'
      });
    } else {
      track.scrollTo({
        left: activeIndex * track.clientWidth,
        behavior: 'smooth'
      });
    }
    updateUI(activeIndex);
  }

  // Prev / Next button clicks
  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    goToSlide(activeIndex - 1);
  });

  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    goToSlide(activeIndex + 1);
  });

  // Thumbnail clicks
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const idx = parseInt(thumb.dataset.index);
      goToSlide(idx);
    });
  });

  // Dot clicks
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.index);
      goToSlide(idx);
    });
  });

  // Track scroll listener (sync UI if user free-scrolls with peek support)
  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const slides = track.querySelectorAll('.carousel-slide');
      if (!slides.length) return;
      const trackCenter = track.scrollLeft + (track.clientWidth / 2);
      let closestIdx = 0;
      let minDiff = Infinity;
      slides.forEach((s, i) => {
        const slideCenter = s.offsetLeft + (s.clientWidth / 2);
        const diff = Math.abs(trackCenter - slideCenter);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      });
      if (closestIdx !== activeIndex && closestIdx >= 0 && closestIdx < photos.length) {
        updateUI(closestIdx);
      }
    }, 50);
  });

  // ==================== TOUCH GESTURES (SWIPE MOBILE) ====================
  let touchStartX = 0;
  let touchStartY = 0;
  let touchCurrentX = 0;
  let isSwiping = false;

  track.addEventListener('touchstart', (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchCurrentX = touchStartX;
    isSwiping = true;
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    if (!isSwiping || !e.touches || e.touches.length === 0) return;
    touchCurrentX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    isSwiping = false;
    const diffX = touchCurrentX - touchStartX;
    const diffY = Math.abs((e.changedTouches[0]?.clientY || 0) - touchStartY);

    // If horizontal motion is dominant and exceeds 35px threshold
    if (Math.abs(diffX) > 35 && Math.abs(diffX) > diffY) {
      if (diffX < 0) {
        // Swiped left -> Next slide
        goToSlide(activeIndex + 1);
      } else {
        // Swiped right -> Previous slide
        goToSlide(activeIndex - 1);
      }
    }
  }, { passive: true });

  // ==================== MOUSE DRAG GESTURES (DESKTOP) ====================
  let isMouseDown = false;
  let mouseStartX = 0;
  let mouseDiffX = 0;

  track.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    mouseStartX = e.clientX;
    mouseDiffX = 0;
    track.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    mouseDiffX = e.clientX - mouseStartX;
  });

  window.addEventListener('mouseup', () => {
    if (!isMouseDown) return;
    isMouseDown = false;
    track.style.cursor = 'grab';
    if (Math.abs(mouseDiffX) > 40) {
      if (mouseDiffX < 0) {
        goToSlide(activeIndex + 1);
      } else {
        goToSlide(activeIndex - 1);
      }
    }
  });

  // Keyboard Navigation (ArrowLeft / ArrowRight)
  containerEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToSlide(activeIndex - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToSlide(activeIndex + 1);
    }
  });
}

// ==================== ROOMS LISTING PAGE ====================

// Global helper to slide card images right/left on listing page
window.slideCardImg = function(btn, direction) {
  const cardImg = btn.closest('.card-img');
  if (!cardImg) return;

  const track = cardImg.querySelector('.card-slider-track');
  const countText = cardImg.querySelector('.photo-idx-text');
  const dots = cardImg.querySelectorAll('.card-slider-dot');
  const total = parseInt(cardImg.dataset.totalPhotos) || 1;
  let current = parseInt(cardImg.dataset.currentIndex) || 0;

  current += direction;
  if (current < 0) current = 0;
  if (current >= total) current = total - 1;

  cardImg.dataset.currentIndex = current;
  track.style.transform = `translateX(-${current * 100}%)`;

  if (countText) countText.textContent = current + 1;
  dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
};

async function initRoomsPage() {
  const container = document.getElementById('roomsGrid');
  const searchInput = document.getElementById('roomSearch');
  const typeFilter = document.getElementById('typeFilter');
  if (!container) return;

  // Sync dates from URL query or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const qCi = urlParams.get('checkin') || urlParams.get('checkIn');
  const qCo = urlParams.get('checkout') || urlParams.get('checkOut');
  if (qCi) localStorage.setItem('hotelku_checkin', qCi);
  if (qCo) localStorage.setItem('hotelku_checkout', qCo);

  const activeCi = qCi || localStorage.getItem('hotelku_checkin');
  const activeCo = qCo || localStorage.getItem('hotelku_checkout');
  const roomQuery = (activeCi && activeCo) ? `?checkin=${encodeURIComponent(activeCi)}&checkout=${encodeURIComponent(activeCo)}` : '';

  let allRooms = [];

  async function loadRooms() {
    const params = new URLSearchParams();
    if (searchInput?.value) params.set('search', searchInput.value);
    if (typeFilter?.value && typeFilter.value !== 'all') params.set('type', typeFilter.value);

    const res = await fetch('/api/rooms?' + params);
    const data = await res.json();
    allRooms = data.rooms || [];
    renderRooms(allRooms);
  }

  function renderRooms(rooms) {
    if (rooms.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><h3>Tidak ada kamar ditemukan</h3><p>Coba ubah kata kunci pencarian</p></div>';
      return;
    }

    container.innerHTML = rooms.map(room => {
      const photos = room.photos || [];
      const slidesHTML = photos.map(p => `<img src="${p}" alt="${room.name}" loading="lazy" draggable="false">`).join('');
      const dotsHTML = photos.map((_, idx) => `<span class="card-slider-dot ${idx === 0 ? 'active' : ''}"></span>`).join('');

      return `
        <div class="room-listing-card">
          <div class="card-img" data-room-id="${room.id}" data-current-index="0" data-total-photos="${photos.length}">
            <div class="card-slider-track">
              ${slidesHTML}
            </div>
            ${photos.length > 1 ? `
              <button class="card-slider-arrow card-slider-prev" onclick="slideCardImg(this, -1)" aria-label="Foto Sebelumnya">
                <i class="fas fa-chevron-left"></i>
              </button>
              <button class="card-slider-arrow card-slider-next" onclick="slideCardImg(this, 1)" aria-label="Foto Berikutnya">
                <i class="fas fa-chevron-right"></i>
              </button>
              <div class="card-slider-dots">${dotsHTML}</div>
            ` : ''}
            <span class="photo-count"><i class="fas fa-camera"></i> <span class="photo-idx-text">1</span>/${photos.length}</span>
          </div>
          <a href="/rooms/${room.id}${roomQuery}" class="room-card-link">
            <div class="card-body">
              <h3>${room.name}</h3>
              <div class="room-meta">
                <span><i class="fas fa-users"></i> ${room.capacity} Tamu</span>
                <span><i class="fas fa-expand-arrows-alt"></i> ${room.size} m²</span>
                <span><i class="fas fa-bed"></i> ${room.bed}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; margin: 4px 0 10px; font-size: 0.8rem;">
                <span style="color: #f39c12; font-weight: 700;"><i class="fas fa-star"></i> ${room.avgRating || '5.0'}</span>
                <span style="color: #888; font-size: 0.75rem;">(${room.reviewCount || 0} ulasan tamu)</span>
              </div>
              <div class="card-price">
                <div>
                  <span class="price">${formatCurrency(room.price)}</span>
                  <span class="per-night">/ malam</span>
                </div>
                <span class="availability-badge ${room.availableUnits > 0 ? 'avail-yes' : 'avail-no'}">
                  ${room.availableUnits > 0 ? room.availableUnits + ' tersedia' : 'Penuh'}
                </span>
              </div>
            </div>
          </a>
        </div>
      `;
    }).join('');

    // Setup Touch Swipe on each Room Card in Mobile
    document.querySelectorAll('.room-listing-card .card-img').forEach(cardImg => {
      let touchStartX = 0;
      let touchStartY = 0;
      let touchCurrentX = 0;

      cardImg.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchCurrentX = touchStartX;
      }, { passive: true });

      cardImg.addEventListener('touchmove', (e) => {
        touchCurrentX = e.touches[0].clientX;
      }, { passive: true });

      cardImg.addEventListener('touchend', (e) => {
        const diffX = touchCurrentX - touchStartX;
        const diffY = Math.abs((e.changedTouches[0]?.clientY || 0) - touchStartY);

        if (Math.abs(diffX) > 35 && Math.abs(diffX) > diffY) {
          const nextBtn = cardImg.querySelector('.card-slider-next');
          const prevBtn = cardImg.querySelector('.card-slider-prev');
          if (diffX < 0 && nextBtn) {
            slideCardImg(nextBtn, 1);
          } else if (diffX > 0 && prevBtn) {
            slideCardImg(prevBtn, -1);
          }
        }
      }, { passive: true });
    });
  }

  // ==================== LUXURY CUSTOM DROPDOWN LOGIC ====================
  const dropdownEl = document.getElementById('typeDropdown');
  const dropdownTrigger = document.getElementById('dropdownTrigger');
  const dropdownMenu = document.getElementById('dropdownMenu');
  const dropdownLabel = document.getElementById('dropdownCurrentLabel');
  const triggerIcon = dropdownTrigger?.querySelector('.trigger-icon i');
  const dropdownItems = document.querySelectorAll('.dropdown-item');
  const categoryPills = document.querySelectorAll('.cat-pill');

  function syncDropdownUI(type) {
    dropdownItems.forEach(item => {
      const match = item.dataset.value === type;
      item.classList.toggle('active', match);
      if (match) {
        if (dropdownLabel) dropdownLabel.textContent = item.querySelector('.item-title').textContent;
        if (triggerIcon && item.dataset.icon) {
          triggerIcon.className = `fas ${item.dataset.icon}`;
        }
      }
    });
    categoryPills.forEach(p => p.classList.toggle('active', p.dataset.type === type));
  }

  if (dropdownTrigger && dropdownMenu) {
    dropdownTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdownMenu.classList.toggle('show');
      dropdownTrigger.classList.toggle('open', isOpen);
      dropdownTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    dropdownItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = item.dataset.value;
        if (typeFilter) typeFilter.value = value;
        syncDropdownUI(value);
        dropdownMenu.classList.remove('show');
        dropdownTrigger.classList.remove('open');
        dropdownTrigger.setAttribute('aria-expanded', 'false');
        loadRooms();
      });
    });

    document.addEventListener('click', (e) => {
      if (!dropdownEl?.contains(e.target)) {
        dropdownMenu.classList.remove('show');
        dropdownTrigger.classList.remove('open');
        dropdownTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Category pills click handler (sync with custom dropdown & load rooms)
  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const type = pill.dataset.type;
      if (typeFilter) typeFilter.value = type;
      syncDropdownUI(type);
      loadRooms();
    });
  });

  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(loadRooms, 300); });
  }

  if (typeFilter) {
    typeFilter.addEventListener('change', () => {
      syncDropdownUI(typeFilter.value);
      loadRooms();
    });
  }

  await loadRooms();
}

// ==================== ROOM DETAIL PAGE ====================

async function initRoomDetailPage() {
  const roomId = window.location.pathname.split('/').pop();
  const detailContainer = document.getElementById('roomDetailContent');
  if (!detailContainer) return;

  const res = await fetch(`/api/rooms/${roomId}`);
  const data = await res.json();

  if (!data.success) {
    detailContainer.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Kamar tidak ditemukan</h3></div>';
    return;
  }

  const room = data.room;

  // Determine initial check-in & check-out dates from URL query or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultTmr = new Date(); defaultTmr.setDate(defaultTmr.getDate() + 1);
  const defaultTmrStr = defaultTmr.toISOString().split('T')[0];

  let initCi = urlParams.get('checkin') || urlParams.get('checkIn') || localStorage.getItem('hotelku_checkin') || todayStr;
  let initCo = urlParams.get('checkout') || urlParams.get('checkOut') || localStorage.getItem('hotelku_checkout') || defaultTmrStr;

  if (initCi < todayStr) initCi = todayStr;
  if (initCo <= initCi) {
    const nextDay = new Date(initCi);
    nextDay.setDate(nextDay.getDate() + 1);
    initCo = nextDay.toISOString().split('T')[0];
  }

  localStorage.setItem('hotelku_checkin', initCi);
  localStorage.setItem('hotelku_checkout', initCo);

  detailContainer.innerHTML = `
    <div id="carouselMount"></div>
    <div class="room-detail-grid">
      <div class="room-detail-info">
        <h1>${room.name}</h1>
        <span class="room-type-badge">${room.type}</span>
        <div class="room-detail-meta">
          <div class="meta-item"><i class="fas fa-users"></i> ${room.capacity} Tamu</div>
          <div class="meta-item"><i class="fas fa-expand-arrows-alt"></i> ${room.size} m²</div>
          <div class="meta-item"><i class="fas fa-bed"></i> ${room.bed}</div>
        </div>
        <p class="description">${room.description}</p>
        <h3 style="font-family:'Playfair Display',serif;margin-bottom:16px;">Fasilitas Kamar</h3>
        <div class="facilities-list">
          ${room.facilities.map(f => `<span class="facility-tag"><i class="fas fa-check"></i> ${f}</span>`).join('')}
        </div>
      </div>
      <div class="room-detail-sidebar">
        <div class="sidebar-price">
          <div class="price-amount">${formatCurrency(room.price)}</div>
          <div class="price-per">per malam</div>
          <div class="availability ${room.availableUnits > 0 ? 'avail-yes' : 'avail-no'}" style="margin-top:8px;">
            ${room.availableUnits > 0 ? `<i class="fas fa-check-circle"></i> ${room.availableUnits} kamar tersedia` : '<i class="fas fa-times-circle"></i> Kamar penuh'}
          </div>
        </div>
        <div class="sidebar-form">
          <label>Check-in</label>
          <input type="date" id="sidebarCheckin" min="${todayStr}" value="${initCi}">
          <label>Check-out</label>
          <input type="date" id="sidebarCheckout" value="${initCo}">
          <div class="cost-summary" id="costSummary" style="display:none;">
            <div class="cost-row"><span id="costNights">0 malam</span><span id="costAmount">Rp 0</span></div>
            <div class="cost-row total"><span>Total</span><span id="costTotal">Rp 0</span></div>
          </div>
        </div>
        <a href="/reservation/${room.id}?checkIn=${encodeURIComponent(initCi)}&checkOut=${encodeURIComponent(initCo)}" class="btn-reserve ${room.availableUnits <= 0 ? 'disabled' : ''}" id="btnReserve">
          <i class="fas fa-calendar-plus"></i> Ajukan Reservasi
        </a>
      </div>
    </div>
  `;

  // Init carousel
  initCarousel(document.getElementById('carouselMount'), room.photos);

  // Date calc
  const ciInput = document.getElementById('sidebarCheckin');
  const coInput = document.getElementById('sidebarCheckout');
  const costSummary = document.getElementById('costSummary');
  const btnReserve = document.getElementById('btnReserve');

  const minInitCo = new Date(ciInput.value); minInitCo.setDate(minInitCo.getDate() + 1);
  coInput.min = minInitCo.toISOString().split('T')[0];

  function syncReserveLink() {
    if (btnReserve && room.availableUnits > 0) {
      btnReserve.href = `/reservation/${room.id}?checkIn=${encodeURIComponent(ciInput.value)}&checkOut=${encodeURIComponent(coInput.value)}`;
    }
  }

  function calcCost() {
    if (ciInput.value && coInput.value) {
      const nights = Math.ceil((new Date(coInput.value) - new Date(ciInput.value)) / 86400000);
      if (nights > 0) {
        document.getElementById('costNights').textContent = nights + ' malam × ' + formatCurrency(room.price);
        document.getElementById('costAmount').textContent = formatCurrency(nights * room.price);
        document.getElementById('costTotal').textContent = formatCurrency(nights * room.price);
        costSummary.style.display = 'block';
      }
    }
    syncReserveLink();
  }

  ciInput.addEventListener('change', () => {
    const minCo = new Date(ciInput.value); minCo.setDate(minCo.getDate() + 1);
    coInput.min = minCo.toISOString().split('T')[0];
    if (new Date(coInput.value) <= new Date(ciInput.value)) coInput.value = minCo.toISOString().split('T')[0];
    localStorage.setItem('hotelku_checkin', ciInput.value);
    localStorage.setItem('hotelku_checkout', coInput.value);
    calcCost();
  });
  coInput.addEventListener('change', () => {
    localStorage.setItem('hotelku_checkin', ciInput.value);
    localStorage.setItem('hotelku_checkout', coInput.value);
    calcCost();
  });
  calcCost();

  if (room.availableUnits <= 0) {
    document.getElementById('btnReserve').addEventListener('click', (e) => e.preventDefault());
  }
}

// ==================== RESERVATION FORM PAGE ====================

async function initReservationForm() {
  const roomId = window.location.pathname.split('/').pop();
  const formContainer = document.getElementById('reservationContent');
  if (!formContainer) return;

  // Check login status (non-blocking, coba pulihkan dari localStorage jika ada)
  let currentUser = null;
  try {
    let me = await fetch('/api/me').then(r => r.json()).catch(() => ({ success: false }));
    if (!me.success) {
      const savedUserStr = localStorage.getItem('hotelku_user');
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser && (savedUser.id || savedUser.email)) {
          const restoreRes = await fetch('/api/auth/restore-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: savedUser.id, email: savedUser.email })
          }).then(r => r.json()).catch(() => ({ success: false }));
          if (restoreRes.success) me = restoreRes;
        }
      }
    }
    if (me.success) currentUser = me.user;
  } catch(e) {}

  const roomRes = await fetch(`/api/rooms/${roomId}`);
  const roomData = await roomRes.json();
  if (!roomData.success) { formContainer.innerHTML = '<div class="empty-state"><h3>Kamar tidak ditemukan</h3></div>'; return; }

  const room = roomData.room;
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultTmr = new Date(); defaultTmr.setDate(defaultTmr.getDate() + 1);
  const defaultTmrStr = defaultTmr.toISOString().split('T')[0];

  const urlParams = new URLSearchParams(window.location.search);
  let initCi = urlParams.get('checkIn') || urlParams.get('checkin') || localStorage.getItem('hotelku_checkin') || todayStr;
  let initCo = urlParams.get('checkOut') || urlParams.get('checkout') || localStorage.getItem('hotelku_checkout') || defaultTmrStr;

  if (initCi < todayStr) initCi = todayStr;
  if (initCo <= initCi) {
    const nextDay = new Date(initCi);
    nextDay.setDate(nextDay.getDate() + 1);
    initCo = nextDay.toISOString().split('T')[0];
  }

  localStorage.setItem('hotelku_checkin', initCi);
  localStorage.setItem('hotelku_checkout', initCo);

  const minCoObj = new Date(initCi);
  minCoObj.setDate(minCoObj.getDate() + 1);
  const minCoStr = minCoObj.toISOString().split('T')[0];

  const defaultName = currentUser ? currentUser.name : '';
  const defaultEmail = currentUser ? currentUser.email : '';
  const defaultPhone = currentUser ? (currentUser.phone || '') : '';

  formContainer.innerHTML = `
    <!-- Checkout Steps Indicator -->
    <div class="checkout-steps-bar">
      <div class="checkout-step active" id="stepIndicator1">
        <span class="step-num">1</span>
        <span class="step-label">Isi Data Pemesanan</span>
      </div>
      <div class="step-divider" id="stepDivider1"></div>
      <div class="checkout-step" id="stepIndicator2">
        <span class="step-num">2</span>
        <span class="step-label">Pembayaran (Payment)</span>
      </div>
      <div class="step-divider" id="stepDivider2"></div>
      <div class="checkout-step" id="stepIndicator3">
        <span class="step-num">3</span>
        <span class="step-label">Persetujuan Resepsionis</span>
      </div>
    </div>

    <div class="reservation-layout">
      <!-- Left: Dynamic Steps Container -->
      <div class="form-card" id="mainCheckoutCard">
        
        <!-- STEP 1: Form Data Tamu -->
        <div id="step1DataContainer">
          <h2><i class="fas fa-user-edit" style="color:#C4A265;margin-right:10px;"></i>Langkah 1: Data Tamu & Jadwal Menginap</h2>
          <form id="rsvStep1Form">
            <div class="form-row">
              <div class="form-group">
                <label><i class="fas fa-calendar-check"></i> Tanggal Check-in</label>
                <input type="date" id="rsvCheckin" name="checkIn" min="${todayStr}" value="${initCi}" required>
              </div>
              <div class="form-group">
                <label><i class="fas fa-calendar-minus"></i> Tanggal Check-out</label>
                <input type="date" id="rsvCheckout" name="checkOut" min="${minCoStr}" value="${initCo}" required>
              </div>
            </div>
            <div class="form-group">
              <label><i class="fas fa-user"></i> Nama Tamu yang Menginap</label>
              <input type="text" id="rsvName" name="guestName" value="${defaultName}" placeholder="Masukkan nama lengkap Anda" required>
              <small style="display:block;margin-top:4px;font-size:0.75rem;color:#777;">*Bisa diubah jika Anda memesan kamar atas nama orang lain (keluarga / rekan)</small>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label><i class="fas fa-phone"></i> No. Telepon</label>
                <input type="tel" id="rsvPhone" name="guestPhone" value="${defaultPhone}" placeholder="081234567890" required>
              </div>
              <div class="form-group">
                <label><i class="fas fa-envelope"></i> Email</label>
                <input type="email" id="rsvEmail" name="guestEmail" value="${defaultEmail}" placeholder="email@example.com" required>
              </div>
            </div>
            <div class="form-group">
              <label><i class="fas fa-sticky-note"></i> Catatan Khusus (Opsional)</label>
              <textarea id="rsvNotes" name="notes" placeholder="Permintaan khusus, misalnya: minta kamar lantai atas atau non-smoking room"></textarea>
            </div>
            <button type="submit" class="btn-reserve" id="btnGoToPayment" style="background: linear-gradient(135deg, #C4A265, #A88344); color: #fff; font-weight: 700; border: none; padding: 14px; border-radius: 8px; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; box-shadow: 0 4px 15px rgba(196,162,101,0.35);">
              Lanjut ke Pembayaran <i class="fas fa-arrow-right"></i>
            </button>
          </form>
        </div>

        <!-- STEP 2: Payment Container (Initially Hidden) -->
        <div id="step2PaymentContainer" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0;"><i class="fas fa-credit-card" style="color:#C4A265;margin-right:10px;"></i>Langkah 2: Pilih Metode Pembayaran</h2>
            <span style="font-size: 0.78rem; background: #ecfdf5; color: #065f46; padding: 4px 10px; border-radius: 20px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
              <i class="fas fa-shield-alt"></i> Pembayaran Aman
            </span>
          </div>

          <!-- Total Bill Callout Banner -->
          <div style="background: #fdfbf7; border: 1.5px solid #ebdcc5; border-radius: 10px; padding: 16px 20px; margin-bottom: 22px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
              <span style="font-size: 0.78rem; color: #8A6D3B; font-weight: 700; text-transform: uppercase;">Total yang Harus Dibayar</span>
              <div style="font-size: 1.5rem; font-weight: 800; color: #1a1a1a; font-family: 'Playfair Display', serif;" id="payTotalBanner">${formatCurrency(room.price)}</div>
            </div>
            <div style="text-align: right; font-size: 0.8rem; color: #6b7280;">
              <div><strong id="payNightsBanner">1 malam</strong> menginap</div>
              <div style="font-size: 0.75rem; color: #9ca3af;">Sudah termasuk pajak & layanan</div>
            </div>
          </div>

          <!-- Pilihan Metode Pembayaran -->
          <div class="payment-methods-list" id="paymentMethodsList">
            <!-- 1. QRIS -->
            <div class="payment-method-item selected" data-method="QRIS">
              <div class="pm-left">
                <div class="pm-radio"></div>
                <div class="pm-info">
                  <h4>QRIS (Instant Pay / Semua E-Wallet)</h4>
                  <p>BCA Mobile, GoPay, OVO, DANA, ShopeePay, Livin'</p>
                </div>
              </div>
              <div class="pm-icons">
                <span class="pm-badge" style="background:#fee2e2;color:#991b1b;"><i class="fas fa-qrcode"></i> QRIS</span>
              </div>
            </div>

            <!-- 2. Virtual Account Bank -->
            <div class="payment-method-item" data-method="BCA Virtual Account">
              <div class="pm-left">
                <div class="pm-radio"></div>
                <div class="pm-info">
                  <h4>BCA Virtual Account</h4>
                  <p>Verifikasi instan 24 jam bebas biaya admin</p>
                </div>
              </div>
              <div class="pm-icons">
                <span class="pm-badge" style="background:#eff6ff;color:#1e40af;"><i class="fas fa-university"></i> BCA VA</span>
              </div>
            </div>

            <!-- 3. Mandiri Virtual Account -->
            <div class="payment-method-item" data-method="Mandiri Virtual Account">
              <div class="pm-left">
                <div class="pm-radio"></div>
                <div class="pm-info">
                  <h4>Mandiri Virtual Account</h4>
                  <p>Transfer via Livin' by Mandiri atau ATM</p>
                </div>
              </div>
              <div class="pm-icons">
                <span class="pm-badge" style="background:#fef3c7;color:#92400e;"><i class="fas fa-university"></i> Mandiri</span>
              </div>
            </div>

            <!-- 4. Kartu Kredit / Debit -->
            <div class="payment-method-item" data-method="Kartu Kredit / Debit">
              <div class="pm-left">
                <div class="pm-radio"></div>
                <div class="pm-info">
                  <h4>Kartu Kredit / Debit Online</h4>
                  <p>Visa, Mastercard, JCB, American Express</p>
                </div>
              </div>
              <div class="pm-icons">
                <span class="pm-badge"><i class="fab fa-cc-visa"></i> <i class="fab fa-cc-mastercard"></i></span>
              </div>
            </div>

            <!-- 5. Bayar di Hotel -->
            <div class="payment-method-item" data-method="Bayar di Hotel">
              <div class="pm-left">
                <div class="pm-radio"></div>
                <div class="pm-info">
                  <h4>Bayar di Hotel (Front Desk)</h4>
                  <p>Bayar tunai atau EDC saat Anda check-in di hotel</p>
                </div>
              </div>
              <div class="pm-icons">
                <span class="pm-badge" style="background:#f3f4f6;color:#374151;"><i class="fas fa-hotel"></i> Resepsionis</span>
              </div>
            </div>
          </div>

          <!-- Dynamic Payment Details Box -->
          <div class="payment-details-box" id="paymentDetailsBox">
            <!-- Box Content populated by JS based on selection -->
          </div>

          <!-- Action Buttons (Centered) -->
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; margin-top: 28px; width: 100%; text-align: center;">
            <button type="button" id="btnConfirmPayment" style="background: linear-gradient(135deg, #059669, #10b981); color: #fff; font-weight: 700; border: none; padding: 15px 36px; border-radius: 8px; font-size: 1.05rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 10px; width: 100%; max-width: 440px; margin: 0 auto; box-shadow: 0 4px 15px rgba(16,185,129,0.35); transition: all 0.2s ease;">
              <i class="fas fa-check-circle" style="font-size: 1.15rem;"></i>
              <span>Konfirmasi & Bayar Sekarang</span>
            </button>
            <button type="button" class="btn btn-outline" id="btnBackToStep1" style="background: transparent; border: none; color: #6b7280; font-size: 0.88rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 6px 14px; text-decoration: underline; margin: 0 auto;">
              <i class="fas fa-arrow-left"></i> Kembali & Ubah Data Pemesanan
            </button>
          </div>
        </div>

      </div>

      <!-- Right: Sticky Room Summary -->
      <div>
        <div class="room-summary-card">
          <div class="summary-img"><img src="${room.photos[0]}" alt="${room.name}"></div>
          <div class="summary-body">
            <h3>${room.name}</h3>
            <div class="room-meta" style="margin-bottom:12px;">
              <span><i class="fas fa-bed"></i> ${room.bed}</span>
              <span><i class="fas fa-users"></i> ${room.capacity} Tamu</span>
            </div>
            <div class="cost-summary" id="rsvCostSummary">
              <div class="cost-row"><span>Harga per malam</span><span>${formatCurrency(room.price)}</span></div>
              <div class="cost-row"><span id="rsvNightsLabel">1 malam</span><span id="rsvSubtotal">${formatCurrency(room.price)}</span></div>
              <div class="cost-row total"><span>Total Biaya</span><span id="rsvTotal">${formatCurrency(room.price)}</span></div>
            </div>
            
            <div style="margin-top: 18px; padding-top: 14px; border-top: 1px dashed #e5e7eb; font-size: 0.78rem; color: #6b7280; line-height: 1.5;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; color:#059669;">
                <i class="fas fa-check-circle"></i> <span>Konfirmasi Instan ke Resepsionis</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <i class="fas fa-file-invoice" style="color:#C4A265;"></i> <span>E-Invoice Resmi Terbit Setelah ACC</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <i class="fas fa-door-open" style="color:#2563eb;"></i> <span>Notifikasi Kamar Ready Saat Bersih</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const ciInput = document.getElementById('rsvCheckin');
  const coInput = document.getElementById('rsvCheckout');
  let currentTotalAmount = room.price;
  let currentNights = 1;
  let selectedMethod = 'QRIS';

  function updateCost() {
    if (ciInput.value && coInput.value) {
      const nights = Math.ceil((new Date(coInput.value) - new Date(ciInput.value)) / 86400000);
      if (nights > 0) {
        currentNights = nights;
        currentTotalAmount = nights * room.price;
        document.getElementById('rsvNightsLabel').textContent = nights + ' malam';
        document.getElementById('rsvSubtotal').textContent = formatCurrency(currentTotalAmount);
        document.getElementById('rsvTotal').textContent = formatCurrency(currentTotalAmount);
        
        const payTotalBanner = document.getElementById('payTotalBanner');
        if (payTotalBanner) payTotalBanner.textContent = formatCurrency(currentTotalAmount);
        const payNightsBanner = document.getElementById('payNightsBanner');
        if (payNightsBanner) payNightsBanner.textContent = nights + ' malam';
      }
    }
  }

  ciInput.addEventListener('change', () => {
    const minCo = new Date(ciInput.value); minCo.setDate(minCo.getDate() + 1);
    coInput.min = minCo.toISOString().split('T')[0];
    if (new Date(coInput.value) <= new Date(ciInput.value)) coInput.value = minCo.toISOString().split('T')[0];
    localStorage.setItem('hotelku_checkin', ciInput.value);
    localStorage.setItem('hotelku_checkout', coInput.value);
    updateCost();
  });

  coInput.addEventListener('change', () => {
    localStorage.setItem('hotelku_checkin', ciInput.value);
    localStorage.setItem('hotelku_checkout', coInput.value);
    updateCost();
  });
  updateCost();

  // Dynamic Payment Method Detail Box
  function renderPaymentDetailBox(method) {
    const box = document.getElementById('paymentDetailsBox');
    if (!box) return;

    if (method === 'QRIS') {
      box.innerHTML = `
        <div style="text-align: center;">
          <div style="font-weight: 700; color: #1a1a1a; font-size: 0.95rem; margin-bottom: 4px;">
            <i class="fas fa-qrcode" style="color:#C4A265;"></i> Scan Kode QRIS HotelKu
          </div>
          <p style="font-size: 0.8rem; color: #6b7280; margin: 0 0 14px 0;">
            Buka aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau E-Wallet (GoPay, OVO, DANA, ShopeePay) lalu arahkan kamera ke QR Code berikut:
          </p>

          <div class="qris-qr-container">
            <div style="font-size: 0.75rem; font-weight: 800; letter-spacing: 1px; color: #0a0a0a; margin-bottom: 8px;">
              QRIS PEMBAYARAN HOTELKU YOGYAKARTA
            </div>
            <!-- Dynamic Vector QR Mockup -->
            <div style="background: #fff; padding: 12px; border: 2px solid #111; border-radius: 8px; display: inline-block;">
              <svg width="180" height="180" viewBox="0 0 100 100" style="display:block;">
                <rect width="100" height="100" fill="#ffffff"/>
                <!-- Top Left Marker -->
                <rect x="5" y="5" width="28" height="28" fill="#111"/>
                <rect x="9" y="9" width="20" height="20" fill="#fff"/>
                <rect x="13" y="13" width="12" height="12" fill="#111"/>
                <!-- Top Right Marker -->
                <rect x="67" y="5" width="28" height="28" fill="#111"/>
                <rect x="71" y="9" width="20" height="20" fill="#fff"/>
                <rect x="75" y="13" width="12" height="12" fill="#111"/>
                <!-- Bottom Left Marker -->
                <rect x="5" y="67" width="28" height="28" fill="#111"/>
                <rect x="9" y="71" width="20" height="20" fill="#fff"/>
                <rect x="13" y="75" width="12" height="12" fill="#111"/>
                <!-- Center HotelKu Logo Badge -->
                <rect x="40" y="40" width="20" height="20" rx="4" fill="#C4A265"/>
                <text x="50" y="54" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">✦</text>
                <!-- Matrix Patterns -->
                <rect x="37" y="10" width="6" height="6" fill="#111"/>
                <rect x="47" y="15" width="8" height="6" fill="#111"/>
                <rect x="57" y="8" width="6" height="8" fill="#111"/>
                <rect x="10" y="37" width="6" height="6" fill="#111"/>
                <rect x="20" y="47" width="6" height="6" fill="#111"/>
                <rect x="67" y="37" width="6" height="6" fill="#111"/>
                <rect x="77" y="47" width="8" height="6" fill="#111"/>
                <rect x="87" y="37" width="6" height="8" fill="#111"/>
                <rect x="37" y="67" width="6" height="6" fill="#111"/>
                <rect x="47" y="77" width="8" height="6" fill="#111"/>
                <rect x="57" y="87" width="6" height="6" fill="#111"/>
                <rect x="67" y="67" width="6" height="8" fill="#111"/>
                <rect x="77" y="77" width="6" height="6" fill="#111"/>
                <rect x="87" y="87" width="6" height="6" fill="#111"/>
              </svg>
            </div>
            <div style="font-size: 0.72rem; color: #4b5563; margin-top: 10px;">
              NMID: <strong>ID102455588801</strong> · HotelKu Official Merchant
            </div>
          </div>

          <div style="margin-top: 12px; font-size: 0.8rem; color: #b45309; background: #fef3c7; padding: 8px 12px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px;">
            <i class="fas fa-stopwatch"></i> Selesaikan pembayaran dalam <strong>14:59</strong> menit
          </div>
        </div>
      `;
    } else if (method.includes('Virtual Account')) {
      const bankName = method.includes('BCA') ? 'BCA' : 'Mandiri';
      const vaNum = bankName === 'BCA' ? '8277 0812 3456 7890' : '8890 0812 3456 7890';
      box.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: 700; color: #1a1a1a; font-size: 0.95rem;">
              <i class="fas fa-university" style="color:#C4A265;"></i> Nomor ${bankName} Virtual Account
            </span>
            <span style="font-size: 0.72rem; background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 4px; font-weight: 700;">Verifikasi Otomatis</span>
          </div>

          <div class="va-copy-box">
            <span style="font-family: monospace; font-size: 1.25rem; font-weight: 800; color: #1e3a8a; letter-spacing: 1px;" id="vaNumberDisplay">${vaNum}</span>
            <button type="button" onclick="navigator.clipboard.writeText('${vaNum.replace(/\\s+/g, '')}'); showToast('Nomor VA berhasil disalin ke clipboard!', 'success');" style="background: #C4A265; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; font-size: 0.8rem; font-weight: 700; cursor: pointer;">
              <i class="fas fa-copy"></i> Salin
            </button>
          </div>

          <div style="font-size: 0.8rem; color: #4b5563; line-height: 1.6;">
            <div>Atas Nama: <strong>HotelKu Official Booking</strong></div>
            <div style="font-size: 0.75rem; color: #6b7280; margin-top: 4px;">
              Petunjuk: Masuk ke menu m-Banking / ATM > Transfer > Virtual Account > Masukkan nomor di atas > Konfirmasi nama HotelKu.
            </div>
          </div>
        </div>
      `;
    } else if (method.includes('Kartu Kredit')) {
      box.innerHTML = `
        <div>
          <div style="font-weight: 700; color: #1a1a1a; font-size: 0.95rem; margin-bottom: 12px;">
            <i class="fas fa-credit-card" style="color:#C4A265;"></i> Informasi Kartu Kredit / Debit Online
          </div>
          <div class="form-group" style="margin-bottom: 12px;">
            <label style="font-size:0.75rem; font-weight:700; color:#374151;">Nomor Kartu (16 Digit)</label>
            <input type="text" placeholder="4111 2222 3333 4444" maxlength="19" style="width:100%; padding:10px 14px; border:1.5px solid #d1d5db; border-radius:6px; font-family:monospace; font-size:0.95rem;">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size:0.75rem; font-weight:700; color:#374151;">Masa Berlaku (MM/YY)</label>
              <input type="text" placeholder="12/28" maxlength="5" style="width:100%; padding:10px 14px; border:1.5px solid #d1d5db; border-radius:6px; font-size:0.9rem;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size:0.75rem; font-weight:700; color:#374151;">CVV / CVC (3 Digit)</label>
              <input type="password" placeholder="•••" maxlength="4" style="width:100%; padding:10px 14px; border:1.5px solid #d1d5db; border-radius:6px; font-size:0.9rem;">
            </div>
          </div>
          <div style="font-size: 0.72rem; color: #6b7280; margin-top: 10px;">
            <i class="fas fa-lock" style="color:#10b981;"></i> Dilindungi enkripsi 256-bit SSL & 3D Secure Verification.
          </div>
        </div>
      `;
    } else {
      // Bayar di Hotel
      box.innerHTML = `
        <div style="text-align: center; padding: 10px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #fef3c7; color: #d97706; display: inline-flex; align-items: center; justify-content: center; font-size: 1.3rem; margin-bottom: 8px;">
            <i class="fas fa-hotel"></i>
          </div>
          <div style="font-weight: 700; color: #1a1a1a; font-size: 0.95rem; margin-bottom: 4px;">
            Pembayaran Langsung di Meja Resepsionis
          </div>
          <p style="font-size: 0.8rem; color: #6b7280; margin: 0; line-height: 1.5;">
            Anda dapat menyelesaikan pelunasan kamar saat tiba di hotel pada tanggal <strong>${formatDate(ciInput.value)}</strong> menggunakan Uang Tunai, Kartu Debit, atau Kartu Kredit.
          </p>
          <div style="margin-top: 10px; font-size: 0.75rem; color: #047857; background: #ecfdf5; padding: 6px 12px; border-radius: 6px; display: inline-block;">
            <i class="fas fa-info-circle"></i> Reservasi Anda tetap akan dikirim ke Resepsionis untuk reservasi unit kamar.
          </div>
        </div>
      `;
    }
  }

  // Initial render for default QRIS
  renderPaymentDetailBox(selectedMethod);

  // Method Selection Listener
  document.querySelectorAll('.payment-method-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.payment-method-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      selectedMethod = item.dataset.method;
      renderPaymentDetailBox(selectedMethod);
    });
  });

  // Step 1 Submit -> Advance to Step 2 (Payment)
  const step1Form = document.getElementById('rsvStep1Form');
  const step1Container = document.getElementById('step1DataContainer');
  const step2Container = document.getElementById('step2PaymentContainer');
  const stepInd1 = document.getElementById('stepIndicator1');
  const stepInd2 = document.getElementById('stepIndicator2');
  const stepDiv1 = document.getElementById('stepDivider1');

  step1Form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate inputs
    const guestName = document.getElementById('rsvName').value.trim();
    const guestPhone = document.getElementById('rsvPhone').value.trim();
    const guestEmail = document.getElementById('rsvEmail').value.trim();

    if (!guestName || !guestPhone || !guestEmail) {
      showToast('Mohon lengkapi seluruh data pemesanan', 'error');
      return;
    }

    // Smooth transition to Step 2
    step1Container.style.display = 'none';
    step2Container.style.display = 'block';

    stepInd1.classList.remove('active');
    stepInd1.classList.add('completed');
    stepInd1.querySelector('.step-num').innerHTML = '<i class="fas fa-check"></i>';
    
    stepDiv1.classList.add('active');
    stepInd2.classList.add('active');

    updateCost();
    renderPaymentDetailBox(selectedMethod);

    window.scrollTo({ top: 120, behavior: 'smooth' });
    showToast('Data tamu terverifikasi. Silakan pilih metode pembayaran Anda.', 'info');
  });

  // Back to Step 1
  document.getElementById('btnBackToStep1').addEventListener('click', () => {
    step2Container.style.display = 'none';
    step1Container.style.display = 'block';

    stepInd1.classList.remove('completed');
    stepInd1.classList.add('active');
    stepInd1.querySelector('.step-num').textContent = '1';

    stepDiv1.classList.remove('active');
    stepInd2.classList.remove('active');

    window.scrollTo({ top: 120, behavior: 'smooth' });
  });

  // Step 2: Confirm & Pay -> Submit to Server
  const btnConfirmPay = document.getElementById('btnConfirmPayment');
  btnConfirmPay.addEventListener('click', async () => {
    btnConfirmPay.disabled = true;
    btnConfirmPay.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memverifikasi Pembayaran...';

    const paymentRef = 'PAY-' + Date.now().toString().slice(-6);
    const paymentStatus = selectedMethod === 'Bayar di Hotel' ? 'pay_at_hotel' : 'paid';

    try {
      const savedUserStr = localStorage.getItem('hotelku_user');
      let currentUserId = null;
      try {
        const u = JSON.parse(savedUserStr);
        if (u && u.id) currentUserId = u.id;
      } catch(e) {}

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: parseInt(roomId),
          userId: currentUserId || undefined,
          checkIn: ciInput.value,
          checkOut: coInput.value,
          guestName: document.getElementById('rsvName').value.trim(),
          guestPhone: document.getElementById('rsvPhone').value.trim(),
          guestEmail: document.getElementById('rsvEmail').value.trim(),
          notes: document.getElementById('rsvNotes').value.trim(),
          paymentMethod: selectedMethod,
          paymentStatus: paymentStatus,
          paymentRef: paymentRef
        })
      });
      const data = await res.json();

      if (data.success) {
        if (data.user) {
          localStorage.setItem('hotelku_user', JSON.stringify(data.user));
          try {
            document.cookie = `hotelku_auth=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=${30*24*60*60}; SameSite=Lax`;
          } catch(e) {}
        }

        if (data.reservation) {
          try {
            const rsvObj = {
              ...data.reservation,
              roomName: data.reservation.roomName || room.name || 'Standard Room',
              roomType: data.reservation.roomType || room.type || 'Standard',
              roomPhoto: data.reservation.roomPhoto || (room.photos && room.photos[0] ? room.photos[0] : 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80')
            };
            let myStored = JSON.parse(localStorage.getItem('hotelku_my_rsv') || '[]');
            // Filter to only retain items belonging to the current user
            const activeUid = rsvObj.userId ? parseInt(rsvObj.userId) : null;
            const activeEmail = (rsvObj.guestEmail || '').trim().toLowerCase();
            myStored = myStored.filter(r => {
              if (!r) return false;
              const rEmail = (r.guestEmail || '').trim().toLowerCase();
              if (activeEmail && rEmail) return rEmail === activeEmail;
              if (activeUid && r.userId && parseInt(r.userId) === activeUid) return true;
              return false;
            });
            const exists = myStored.some(r => r.id === rsvObj.id);
            if (!exists) {
              myStored.unshift(rsvObj);
              localStorage.setItem('hotelku_my_rsv', JSON.stringify(myStored.slice(0, 30)));
            }
          } catch(e) {}
        }

        // Show celebratory success modal dialog
        showPaymentSuccessModal({
          reservationId: data.reservation ? data.reservation.id : 'RSV-NEW',
          guestName: document.getElementById('rsvName').value.trim(),
          roomName: room.name,
          amount: currentTotalAmount,
          method: selectedMethod,
          paymentRef: paymentRef
        });

      } else {
        showToast(data.message || 'Gagal memproses pembayaran', 'error');
        btnConfirmPay.disabled = false;
        btnConfirmPay.innerHTML = '<i class="fas fa-check-circle"></i> Konfirmasi & Bayar Sekarang';
      }
    } catch (err) {
      showToast('Terjadi gangguan jaringan saat memproses pembayaran', 'error');
      btnConfirmPay.disabled = false;
      btnConfirmPay.innerHTML = '<i class="fas fa-check-circle"></i> Konfirmasi & Bayar Sekarang';
    }
  });
}

// Modal Pop-Up Konfirmasi Pembayaran Berhasil & Diteruskan ke Resepsionis
function showPaymentSuccessModal(details) {
  const existing = document.getElementById('paymentSuccessModalOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'paymentSuccessModalOverlay';
  overlay.style.cssText = 'position:fixed; inset:0; background:rgba(10,10,10,0.75); backdrop-filter:blur(6px); z-index:999999; display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn 0.3s ease;';

  overlay.innerHTML = `
    <div style="background:#fff; border-radius:16px; max-width:480px; width:100%; padding:32px 28px; text-align:center; box-shadow:0 25px 50px -12px rgba(0,0,0,0.35); position:relative;">
      <div style="width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg, #10b981, #059669); color:#fff; display:inline-flex; align-items:center; justify-content:center; font-size:2.2rem; margin-bottom:18px; box-shadow:0 8px 24px rgba(16,185,129,0.35);">
        <i class="fas fa-check"></i>
      </div>
      
      <h2 style="font-family:'Playfair Display', serif; font-size:1.5rem; color:#1a1a1a; margin:0 0 6px 0;">
        Pembayaran Berhasil!
      </h2>
      <p style="font-size:0.88rem; color:#4b5563; margin:0 0 20px 0; line-height:1.5;">
        Terima kasih <strong>${details.guestName}</strong>. Pembayaran sebesar <strong>${formatCurrency(details.amount)}</strong> via <strong>${details.method}</strong> telah diverifikasi.
      </p>

      <!-- Status Flow Card -->
      <div style="background:#fdfbf7; border:1px solid #ebdcc5; border-radius:10px; padding:16px; margin-bottom:24px; text-align:left;">
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
          <span style="width:24px; height:24px; border-radius:50%; background:#10b981; color:#fff; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700;">✓</span>
          <span style="font-size:0.82rem; color:#065f46; font-weight:700;">1. Pembayaran Lunas (Ref: ${details.paymentRef})</span>
        </div>
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
          <span style="width:24px; height:24px; border-radius:50%; background:#f59e0b; color:#fff; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700;"><i class="fas fa-spinner fa-spin"></i></span>
          <span style="font-size:0.82rem; color:#92400e; font-weight:700;">2. Diteruskan ke Meja Resepsionis untuk Disetujui (ACC)</span>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="width:24px; height:24px; border-radius:50%; background:#e5e7eb; color:#6b7280; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700;">3</span>
          <span style="font-size:0.82rem; color:#6b7280;">3. Terbit E-Invoice & Notifikasi Kamar Ready Check-In</span>
        </div>
      </div>

      <button type="button" id="btnGoToMyReservations" style="width:100%; background:linear-gradient(135deg, #C4A265, #A88344); color:#fff; font-weight:700; border:none; padding:14px; border-radius:8px; font-size:0.95rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 15px rgba(196,162,101,0.35);">
        Lihat Status Pemesanan Saya <i class="fas fa-arrow-right"></i>
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('btnGoToMyReservations').addEventListener('click', () => {
    overlay.remove();
    window.location.href = '/my-reservations';
  });
}

// ==================== MY RESERVATIONS PAGE ====================

async function initMyReservations() {
  const container = document.getElementById('myReservationsList');
  if (!container) return;

  const me = await fetch('/api/me').then(r => r.json());
  if (!me.success) { window.location.href = '/login'; return; }

  const res = await fetch('/api/reservations');
  const data = await res.json();

  if (!data.success || data.reservations.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><h3>Belum ada reservasi</h3><p>Mulai jelajahi kamar dan buat reservasi pertama Anda!</p><a href="/rooms" class="btn-reserve" style="display:inline-block;max-width:240px;margin-top:16px;">Lihat Kamar</a></div>';
    return;
  }

  container.innerHTML = data.reservations.map(rsv => `
    <div class="reservation-card">
      <div class="rsv-img"><img src="${rsv.roomPhoto}" alt="${rsv.roomName}"></div>
      <div class="rsv-body">
        <h3>${rsv.roomName}</h3>
        <div class="rsv-details">
          <span><i class="fas fa-calendar"></i> ${formatDate(rsv.checkIn)} — ${formatDate(rsv.checkOut)}</span>
          <span><i class="fas fa-moon"></i> ${rsv.totalNights} malam</span>
        </div>
        <div class="rsv-id">${rsv.id} · ${formatDate(rsv.createdAt)}</div>
        ${rsv.status === 'rejected' && rsv.rejectionReason ? `<div style="color:#e74c3c;font-size:0.8rem;margin-top:6px;"><i class="fas fa-info-circle"></i> ${rsv.rejectionReason}</div>` : ''}
      </div>
      <div class="rsv-actions">
        <div class="rsv-price">${formatCurrency(rsv.totalPrice)}</div>
        ${getStatusBadge(rsv.status)}
      </div>
    </div>
  `).join('');
}

// ==================== ADMIN DASHBOARD ====================

async function initAdminDashboard() {
  const statsContainer = document.getElementById('dashboardStats');
  const recentContainer = document.getElementById('recentReservations');
  if (!statsContainer) return;

  const [statsRes, rsvRes] = await Promise.all([
    fetch('/api/stats').then(r => r.json()),
    fetch('/api/reservations?status=pending').then(r => r.json())
  ]);

  if (statsRes.success) {
    const s = statsRes.stats;
    statsContainer.innerHTML = `
      <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-bed"></i></div><div class="stat-info"><div class="stat-number">${s.totalRooms}</div><div class="stat-label">Total Kamar</div></div></div>
      <div class="stat-card"><div class="stat-icon green"><i class="fas fa-door-open"></i></div><div class="stat-info"><div class="stat-number">${s.available}</div><div class="stat-label">Tersedia</div></div></div>
      <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-clock"></i></div><div class="stat-info"><div class="stat-number">${s.pending}</div><div class="stat-label">Menunggu ACC</div></div></div>
      <div class="stat-card"><div class="stat-icon gold"><i class="fas fa-user-check"></i></div><div class="stat-info"><div class="stat-number">${s.checkedIn}</div><div class="stat-label">Tamu Check-in</div></div></div>
    `;
  }

  if (recentContainer && rsvRes.success) {
    if (rsvRes.reservations.length === 0) {
      recentContainer.innerHTML = '<p style="color:#888;text-align:center;padding:40px;">Tidak ada reservasi yang menunggu persetujuan.</p>';
    } else {
      recentContainer.innerHTML = rsvRes.reservations.map(rsv => `
        <div class="admin-rsv-card">
          <div class="rsv-photo"><img src="${rsv.roomPhoto}" alt="${rsv.roomName}"></div>
          <div class="rsv-info">
            <h4>${rsv.roomName} — ${rsv.id}</h4>
            <div class="rsv-guest"><i class="fas fa-user" style="color:#C4A265;margin-right:6px;"></i>${rsv.guestName} · ${rsv.guestPhone}</div>
            <div class="rsv-dates"><i class="fas fa-calendar" style="margin-right:6px;"></i>${formatDate(rsv.checkIn)} — ${formatDate(rsv.checkOut)} (${rsv.totalNights} malam)</div>
          </div>
          <div class="rsv-right">
            <span class="rsv-amount">${formatCurrency(rsv.totalPrice)}</span>
            ${getStatusBadge(rsv.status)}
            <button class="btn-approve" onclick="approveRsv('${rsv.id}')"><i class="fas fa-check"></i> ACC</button>
            <button class="btn-reject" onclick="rejectRsv('${rsv.id}')"><i class="fas fa-times"></i> Tolak</button>
          </div>
        </div>
      `).join('');
    }
  }
}

// ==================== ADMIN RESERVATIONS PAGE ====================

async function initAdminReservations(statusFilter = 'all') {
  const container = document.getElementById('adminRsvList');
  if (!container) return;

  const res = await fetch(`/api/reservations${statusFilter !== 'all' ? '?status=' + statusFilter : ''}`);
  const data = await res.json();

  if (!data.success || data.reservations.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><h3>Tidak ada reservasi</h3></div>';
    return;
  }

  container.innerHTML = data.reservations.map(rsv => `
    <div class="admin-rsv-card">
      <div class="rsv-photo"><img src="${rsv.roomPhoto}" alt="${rsv.roomName}"></div>
      <div class="rsv-info">
        <h4>${rsv.roomName} — ${rsv.id}</h4>
        <div class="rsv-guest"><i class="fas fa-user" style="color:#C4A265;margin-right:6px;"></i>${rsv.guestName} · ${rsv.guestPhone}</div>
        <div class="rsv-dates"><i class="fas fa-calendar" style="margin-right:6px;"></i>${formatDate(rsv.checkIn)} — ${formatDate(rsv.checkOut)} (${rsv.totalNights} malam)</div>
        <div style="margin-top: 5px;">${getPaymentBadge(rsv)}</div>
        ${rsv.notes ? `<div style="font-size:0.8rem;color:#888;margin-top:4px;"><i class="fas fa-sticky-note"></i> ${rsv.notes}</div>` : ''}
      </div>
      <div class="rsv-right">
        <span class="rsv-amount">${formatCurrency(rsv.totalPrice)}</span>
        ${getStatusBadge(rsv.status)}
        ${rsv.status === 'pending' ? `
          <button class="btn-approve" onclick="approveRsv('${rsv.id}')"><i class="fas fa-check"></i> ACC (Setujui)</button>
          <button class="btn-reject" onclick="rejectRsv('${rsv.id}')"><i class="fas fa-times"></i> Tolak</button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

// ==================== ADMIN CHECK-IN PAGE ====================

async function initAdminCheckin() {
  const container = document.getElementById('checkinList');
  if (!container) return;

  const res = await fetch('/api/reservations?status=approved');
  const data = await res.json();

  if (!data.success || data.reservations.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-door-open"></i><h3>Tidak ada tamu yang siap check-in</h3><p>Semua reservasi yang disetujui sudah diproses.</p></div>';
    return;
  }

  container.innerHTML = data.reservations.map(rsv => `
    <div class="admin-rsv-card">
      <div class="rsv-photo"><img src="${rsv.roomPhoto}" alt="${rsv.roomName}"></div>
      <div class="rsv-info">
        <h4>${rsv.roomName} — ${rsv.id}</h4>
        <div class="rsv-guest"><i class="fas fa-user" style="color:#C4A265;margin-right:6px;"></i>${rsv.guestName} · ${rsv.guestPhone}</div>
        <div class="rsv-dates"><i class="fas fa-calendar" style="margin-right:6px;"></i>${formatDate(rsv.checkIn)} — ${formatDate(rsv.checkOut)} (${rsv.totalNights} malam)</div>
      </div>
      <div class="rsv-right">
        <span class="rsv-amount">${formatCurrency(rsv.totalPrice)}</span>
        ${getStatusBadge(rsv.status)}
        ${rsv.roomReadyNotified ? `
          <span class="status-badge" style="background:#d1fae5;color:#065f46;margin-top:6px;font-size:0.75rem;">
            <i class="fas fa-check-circle"></i> Tamu Telah Diberi Tahu
          </span>
        ` : `
          <button class="btn btn-outline btn-sm" style="margin-top:6px;font-size:0.75rem;border-color:#059669;color:#059669;" onclick="notifyRoomReady('${rsv.id}')">
            <i class="fas fa-bell"></i> Beri Tahu: Kamar Siap
          </button>
        `}
        <button class="btn-checkin" style="margin-top:6px; background:#10b981; color:#fff; font-weight:700; border:none; padding:8px 16px; border-radius:6px; cursor:pointer;" onclick="processCheckin('${rsv.id}')"><i class="fas fa-sign-in-alt"></i> Check In Sekarang</button>
      </div>
    </div>
  `).join('');
}

// ==================== ADMIN CHECK-OUT PAGE ====================

async function initAdminCheckout() {
  const container = document.getElementById('checkoutList');
  if (!container) return;

  const res = await fetch('/api/reservations?status=checked-in');
  const data = await res.json();

  if (!data.success || data.reservations.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-sign-out-alt"></i><h3>Tidak ada tamu yang sedang menginap</h3><p>Semua tamu sudah check-out.</p></div>';
    return;
  }

  container.innerHTML = data.reservations.map(rsv => `
    <div class="admin-rsv-card">
      <div class="rsv-photo"><img src="${rsv.roomPhoto}" alt="${rsv.roomName}"></div>
      <div class="rsv-info">
        <h4>${rsv.roomName} — ${rsv.id}</h4>
        <div class="rsv-guest"><i class="fas fa-user" style="color:#C4A265;margin-right:6px;"></i>${rsv.guestName} · ${rsv.guestPhone}</div>
        <div class="rsv-dates"><i class="fas fa-calendar" style="margin-right:6px;"></i>${formatDate(rsv.checkIn)} — ${formatDate(rsv.checkOut)} (${rsv.totalNights} malam)</div>
        <div style="margin-top: 6px; display: flex; flex-wrap: wrap; gap: 6px;">
          ${rsv.checkoutConfirmedReady ? `<span class="status-badge" style="background:#d1fae5;color:#065f46;font-size:0.72rem;"><i class="fas fa-check-circle"></i> Tamu Siap Tepat Waktu</span>` : ''}
          ${rsv.lateCheckoutRequested ? `<span class="status-badge" style="background:#fef3c7;color:#92400e;font-size:0.72rem;"><i class="fas fa-clock"></i> Late Check-out (${rsv.lateCheckoutStatus})</span>` : ''}
          ${rsv.bellboyRequested ? `<span class="status-badge" style="background:#e0e7ff;color:#3730a3;font-size:0.72rem;"><i class="fas fa-luggage-cart"></i> Bellboy (${rsv.bellboyStatus})</span>` : ''}
        </div>
      </div>
      <div class="rsv-right">
        <span class="rsv-amount">${formatCurrency(rsv.totalPrice)}</span>
        ${getStatusBadge(rsv.status)}
        <button class="btn-checkout" style="margin-top:6px; background:#d97706; color:#fff; font-weight:700; border:none; padding:8px 16px; border-radius:6px; cursor:pointer;" onclick="processCheckout('${rsv.id}')"><i class="fas fa-sign-out-alt"></i> Check Out Sekarang</button>
      </div>
    </div>
  `).join('');
}

// ==================== ADMIN ACTIONS ====================

async function approveRsv(id) {
  if (!confirm('Setujui reservasi ' + id + '?')) return;
  try {
    const res = await fetch(`/api/reservations/${id}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    showToast(data.message, data.success ? 'success' : 'error');
    if (data.success) {
      if (typeof loadReceptionistDashboard === 'function') {
        await loadReceptionistDashboard();
      }
      if (typeof initAdminReservations === 'function') {
        const activeTab = document.querySelector('.filter-tab.active');
        const status = activeTab ? activeTab.dataset.status : 'all';
        await initAdminReservations(status);
      }
      setTimeout(() => location.reload(), 600);
    }
  } catch (err) {
    showToast('Gagal memproses persetujuan reservasi: ' + err.message, 'error');
  }
}

async function approveAndCheckin(id) {
  if (!confirm('Setujui dan langsung proses Check-In Sekarang untuk reservasi ' + id + '?')) return;
  try {
    const res = await fetch(`/api/reservations/${id}/approve-checkin`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    showToast(data.message, data.success ? 'success' : 'error');
    if (data.success) {
      if (typeof loadReceptionistDashboard === 'function') {
        await loadReceptionistDashboard();
      }
      if (typeof initAdminReservations === 'function') {
        const activeTab = document.querySelector('.filter-tab.active');
        const status = activeTab ? activeTab.dataset.status : 'all';
        await initAdminReservations(status);
      }
      setTimeout(() => location.reload(), 600);
    }
  } catch (err) {
    showToast('Gagal memproses persetujuan & check-in: ' + err.message, 'error');
  }
}
window.approveAndCheckin = approveAndCheckin;

async function rejectRsv(id) {
  showModal('Tolak Reservasi', '<p style="margin-bottom:12px;color:#888;">Berikan alasan penolakan:</p><textarea id="rejectReason" placeholder="Alasan penolakan..."></textarea>', async (overlay) => {
    try {
      const reason = document.getElementById('rejectReason')?.value || '';
      const res = await fetch(`/api/reservations/${id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      showToast(data.message, data.success ? 'success' : 'error');
      if (data.success) {
        if (typeof loadReceptionistDashboard === 'function') {
          await loadReceptionistDashboard();
        }
        if (typeof initAdminReservations === 'function') {
          const activeTab = document.querySelector('.filter-tab.active');
          const status = activeTab ? activeTab.dataset.status : 'all';
          await initAdminReservations(status);
        }
        setTimeout(() => location.reload(), 600);
      }
    } catch (err) {
      showToast('Gagal menolak reservasi: ' + err.message, 'error');
    }
  });
}

async function processCheckin(id) {
  if (!confirm('Proses Check-In Sekarang untuk reservasi ' + id + '?')) return;
  try {
    const res = await fetch(`/api/reservations/${id}/checkin`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    showToast(data.message, data.success ? 'success' : 'error');
    if (data.success) {
      if (typeof loadReceptionistDashboard === 'function') {
        await loadReceptionistDashboard();
      }
      if (typeof initAdminReservations === 'function') {
        const activeTab = document.querySelector('.filter-tab.active');
        const status = activeTab ? activeTab.dataset.status : 'all';
        await initAdminReservations(status);
      }
      setTimeout(() => location.reload(), 600);
    }
  } catch (err) {
    showToast('Gagal memproses check-in: ' + err.message, 'error');
  }
}

async function processCheckout(id) {
  if (!confirm('Proses Check-Out Sekarang untuk reservasi ' + id + '?')) return;
  try {
    const res = await fetch(`/api/reservations/${id}/checkout`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    showToast(data.message, data.success ? 'success' : 'error');
    if (data.success) {
      if (typeof loadReceptionistDashboard === 'function') {
        await loadReceptionistDashboard();
      }
      if (typeof initAdminReservations === 'function') {
        const activeTab = document.querySelector('.filter-tab.active');
        const status = activeTab ? activeTab.dataset.status : 'all';
        await initAdminReservations(status);
      }
      setTimeout(() => location.reload(), 600);
    }
  } catch (err) {
    showToast('Gagal memproses check-out: ' + err.message, 'error');
  }
}

// ==================== PRD VALUE-ADDED FEATURES ====================
// Fitur 1: Pengingat Check-Out Otomatis (T-2 Jam)
// Fitur 2: Notifikasi Kamar Siap Check-In (Room Ready)
// Fitur 3: Demo Mode & WhatsApp Push Simulation

async function loadGuestAlerts() {
  const container = document.getElementById('guestAlertsContainer');
  if (!container) return;

  try {
    const res = await fetch('/api/notifications/guest-alerts');
    const json = await res.json();
    if (!json.success || !json.data) {
      container.innerHTML = '';
      return;
    }

    const { checkoutReminder, roomReadyAlert } = json.data;
    let html = '';

    // Room Ready Alert Banner removed per user request

    // 2. Render Checkout Reminder Banner (Amber / Gold)
    if (checkoutReminder) {
      let readyBtnHtml = '';
      if (checkoutReminder.checkoutConfirmedReady) {
        readyBtnHtml = `
          <span class="status-badge" style="background: #d1fae5; color: #065f46; padding: 8px 14px; font-size: 0.8rem; font-weight: 700;">
            <i class="fas fa-check-circle"></i> Terkonfirmasi: Siap Check-Out Tepat Waktu (12:00 WIB)
          </span>
        `;
      } else {
        readyBtnHtml = `
          <button class="btn btn-sm" style="background: #27ae60; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 6px;" onclick="submitCheckoutAction('${checkoutReminder.reservationId}', 'confirm-ready')">
            <i class="fas fa-check"></i> Konfirmasi Siap Pukul 12:00
          </button>
        `;
      }

      let lateBtnHtml = '';
      if (checkoutReminder.lateCheckoutRequested) {
        if (checkoutReminder.lateCheckoutStatus === 'pending') {
          lateBtnHtml = `
            <span class="status-badge" style="background: #fef3c7; color: #92400e; padding: 8px 14px; font-size: 0.8rem; font-weight: 700;">
              <i class="fas fa-hourglass-half"></i> Permohonan Late Check-Out (+${checkoutReminder.lateCheckoutHours} Jam) Menunggu Resepsionis
            </span>
          `;
        } else if (checkoutReminder.lateCheckoutStatus === 'approved') {
          lateBtnHtml = `
            <span class="status-badge" style="background: #d1fae5; color: #065f46; padding: 8px 14px; font-size: 0.8rem; font-weight: 700;">
              <i class="fas fa-check-double"></i> Late Check-Out Disetujui! Batas Baru: ${checkoutReminder.checkOutTime}
            </span>
          `;
        } else if (checkoutReminder.lateCheckoutStatus === 'rejected') {
          lateBtnHtml = `
            <span class="status-badge" style="background: #fee2e2; color: #991b1b; padding: 8px 14px; font-size: 0.8rem; font-weight: 700;">
              <i class="fas fa-times-circle"></i> Permohonan Late Check-Out Ditolak (Kamar Penuh)
            </span>
          `;
        }
      } else {
        lateBtnHtml = `
          <button class="btn btn-sm" style="background: #d97706; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 6px;" onclick="openLateCheckoutModal('${checkoutReminder.reservationId}', '${checkoutReminder.roomName}')">
            <i class="fas fa-business-time"></i> Ajukan Late Check-Out
          </button>
        `;
      }

      let bellboyBtnHtml = '';
      if (checkoutReminder.bellboyRequested) {
        if (checkoutReminder.bellboyStatus === 'requested') {
          bellboyBtnHtml = `
            <span class="status-badge" style="background: #e0e7ff; color: #3730a3; padding: 8px 14px; font-size: 0.8rem; font-weight: 700;">
              <i class="fas fa-luggage-cart"></i> Bantuan Bellboy Dipanggil (Menuju Kamar)
            </span>
          `;
        } else if (checkoutReminder.bellboyStatus === 'dispatched') {
          bellboyBtnHtml = `
            <span class="status-badge" style="background: #fef3c7; color: #92400e; padding: 8px 14px; font-size: 0.8rem; font-weight: 700;">
              <i class="fas fa-running"></i> Petugas Porter Sedang Menuju Kamar Anda
            </span>
          `;
        } else if (checkoutReminder.bellboyStatus === 'completed') {
          bellboyBtnHtml = `
            <span class="status-badge" style="background: #d1fae5; color: #065f46; padding: 8px 14px; font-size: 0.8rem; font-weight: 700;">
              <i class="fas fa-check"></i> Bantuan Bellboy Selesai
            </span>
          `;
        }
      } else {
        bellboyBtnHtml = `
          <button class="btn btn-sm" style="background: #4f46e5; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 6px;" onclick="submitCheckoutAction('${checkoutReminder.reservationId}', 'request-bellboy')">
            <i class="fas fa-luggage-cart"></i> Panggil Bantuan Bellboy
          </button>
        `;
      }

      html += `
        <div style="background: linear-gradient(135deg, #fffbeb, #fef3c7); border: 2px solid #f59e0b; border-radius: 12px; padding: 22px 24px; margin-bottom: 20px; box-shadow: 0 4px 20px rgba(245,158,11,0.15); display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 42px; height: 42px; border-radius: 50%; background: #d97706; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                <i class="fas fa-bell"></i>
              </div>
              <div>
                <span style="background: #b45309; color: #fff; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 0.72rem; letter-spacing: 0.5px;">
                  ✦ PENGINGAT WAKTU CHECK-OUT (T-2 JAM) ✦
                </span>
                <h3 style="font-family: 'Playfair Display', serif; font-size: 1.25rem; color: #78350f; margin: 4px 0 0 0;">
                  Persiapan Kepulangan — Batas Waktu: ${checkoutReminder.checkOutTime}
                </h3>
              </div>
            </div>
            <button class="btn btn-sm" style="background: #075e54; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 6px;" onclick='openWhatsappPreview("checkout", ${JSON.stringify(checkoutReminder).replace(/'/g, "\\'")})'>
              <i class="fab fa-whatsapp" style="color: #25d366;"></i> Pesan WhatsApp
            </button>
          </div>

          <p style="font-size: 0.9rem; color: #92400e; line-height: 1.6; margin: 0;">
            Selamat pagi <strong>Bpk/Ibu ${checkoutReminder.guestName}</strong>! Waktu check-out untuk <strong>${checkoutReminder.roomName} (Unit ${checkoutReminder.unitNumber})</strong> adalah hari ini pukul <strong>${checkoutReminder.checkOutTime}</strong>. Mohon persiapkan barang bawaan Anda agar kepulangan berjalan lancar dan nyaman.
          </p>

          <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center; border-top: 1px dashed #fcd34d; padding-top: 14px;">
            <span style="font-size: 0.8rem; font-weight: 700; color: #78350f; margin-right: 4px;">Aksi Cepat Tamu:</span>
            ${readyBtnHtml}
            ${lateBtnHtml}
            ${bellboyBtnHtml}
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  } catch (err) {
    console.error('Error loading guest alerts:', err);
  }
}

async function submitCheckoutAction(reservationId, action, extra = {}) {
  try {
    const res = await fetch(`/api/reservations/${reservationId}/checkout-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra })
    });
    const data = await res.json();
    showToast(data.message, data.success ? 'success' : 'error');
    if (data.success) {
      await loadGuestAlerts();
    }
  } catch {
    showToast('Terjadi kesalahan saat memproses aksi', 'error');
  }
}

function openLateCheckoutModal(reservationId, roomName) {
  const modal = document.getElementById('lateCheckoutModal');
  const rsvInput = document.getElementById('lateCheckoutRsvId');
  const sub = document.getElementById('lateCheckoutSub');
  if (!modal) return;

  rsvInput.value = reservationId;
  if (sub) sub.textContent = `Pilih perpanjangan waktu untuk ${roomName} (${reservationId}).`;
  modal.style.display = 'flex';
}

function initDemoSimulationToolbar() {
  const btnCheckout = document.getElementById('btnSimulateCheckout');
  const btnRoomReady = document.getElementById('btnSimulateRoomReady');
  const btnReset = document.getElementById('btnResetSimulation');

  if (btnCheckout) {
    btnCheckout.onclick = async () => {
      await fetch('/api/demo/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceCheckoutReminder: true, forceRoomReady: false })
      });
      showToast('Simulasi Pengingat Check-Out (T-2 Jam) Aktif!', 'success');
      await loadGuestAlerts();
    };
  }

  if (btnRoomReady) {
    btnRoomReady.onclick = async () => {
      await fetch('/api/demo/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceCheckoutReminder: false, forceRoomReady: true })
      });
      showToast('Simulasi Notifikasi Kamar Siap Check-In Aktif!', 'success');
      await loadGuestAlerts();
    };
  }

  if (btnReset) {
    btnReset.onclick = async () => {
      await fetch('/api/demo/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true })
      });
      showToast('Mode simulasi direset ke waktu normal', 'info');
      await loadGuestAlerts();
    };
  }

  // Handle Late Check-out Form
  const lateForm = document.getElementById('lateCheckoutForm');
  if (lateForm) {
    lateForm.onsubmit = async (e) => {
      e.preventDefault();
      const rsvId = document.getElementById('lateCheckoutRsvId').value;
      const hours = document.querySelector('input[name="lateCheckoutOption"]:checked')?.value || 1;
      const reason = document.getElementById('lateCheckoutReason').value;

      await submitCheckoutAction(rsvId, 'request-late-checkout', { hours, reason });
      document.getElementById('lateCheckoutModal').style.display = 'none';
    };

    const cancelBtn = document.getElementById('btnCancelLateCheckout');
    if (cancelBtn) {
      cancelBtn.onclick = () => {
        document.getElementById('lateCheckoutModal').style.display = 'none';
      };
    }
  }

  // Handle WhatsApp Modal
  const btnCloseWa = document.getElementById('btnCloseWhatsapp');
  if (btnCloseWa) {
    btnCloseWa.onclick = () => {
      document.getElementById('whatsappModal').style.display = 'none';
    };
  }
}

function openWhatsappPreview(type, data) {
  const modal = document.getElementById('whatsappModal');
  const body = document.getElementById('whatsappMessageBody');
  const timestamp = document.getElementById('whatsappTimestamp');
  if (!modal || !body) return;

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
  if (timestamp) timestamp.textContent = timeStr;

  if (type === 'room_ready') {
    body.innerHTML = `
      Halo <strong>Bpk/Ibu ${data.guestName}</strong>, salam hangat dari HotelKu Yogyakarta! 🌿<br><br>
      Kabar gembira, kamar Anda <strong>${data.roomName} (Unit ${data.unitNumber})</strong> telah selesai disiapkan dan siap huni lebih awal (<strong>Early Check-In Privilege</strong>)! ✨<br><br>
      Anda dapat langsung menuju meja resepsionis untuk serah terima kunci kamar tanpa perlu mengantre di lobi.<br><br>
      Kami menantikan kedatangan Anda di HotelKu Yogyakarta! 🛎️
    `;
  } else {
    body.innerHTML = `
      Selamat pagi <strong>Bpk/Ibu ${data.guestName}</strong> dari HotelKu Yogyakarta! ☀️<br><br>
      Kami mengingatkan bahwa waktu check-out untuk kamar <strong>${data.roomName} (Unit ${data.unitNumber})</strong> adalah hari ini pukul <strong>${data.checkOutTime}</strong> (tersisa 2 jam lagi).<br><br>
      Mohon persiapkan barang bawaan Anda agar kepulangan berjalan lancar.<br><br>
      ✦ Butuh waktu berkemas lebih? Ajukan <em>Late Check-Out</em>.<br>
      ✦ Butuh bantuan porter koper? Panggil <em>Bellboy</em> melalui aplikasi.<br><br>
      Terima kasih telah memilih menginap di HotelKu Yogyakarta! 🙏
    `;
  }

  modal.style.display = 'flex';
}

async function notifyRoomReady(reservationId) {
  try {
    const res = await fetch(`/api/receptionist/notify-room-ready/${reservationId}`, { method: 'PUT' });
    const data = await res.json();
    showToast(data.message, data.success ? 'success' : 'error');
    if (data.success) setTimeout(() => location.reload(), 800);
  } catch {
    showToast('Gagal mengirimkan notifikasi kamar siap', 'error');
  }
}
