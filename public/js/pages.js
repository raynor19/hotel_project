/* ============================================================
   HOTELKU — Pages JavaScript
   (Rooms, Carousel, Reservations, Admin)
   ============================================================ */

// ==================== REALTIME CLOCK & DATE ====================
function initRealtimeClock() {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  function updateClock() {
    const now = new Date();
    const dayName = days[now.getDay()];
    const dateNum = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const dateFormatted = `${dayName}, ${dateNum} ${monthName} ${year}`;
    const timeFormatted = `${hours}:${minutes}:${seconds} WIB`;
    const fullFormatted = `${dayName}, ${dateNum} ${monthName} ${year} • ${timeFormatted}`;

    document.querySelectorAll('.realtime-full-datetime').forEach(el => {
      el.textContent = fullFormatted;
    });
    document.querySelectorAll('.realtime-date').forEach(el => {
      el.textContent = dateFormatted;
    });
    document.querySelectorAll('.realtime-clock').forEach(el => {
      el.textContent = timeFormatted;
    });
    document.querySelectorAll('.realtime-day').forEach(el => {
      el.textContent = dayName;
    });
    document.querySelectorAll('.realtime-daynum').forEach(el => {
      el.textContent = dateNum;
    });
    document.querySelectorAll('.realtime-month').forEach(el => {
      el.textContent = monthName;
    });
    document.querySelectorAll('.realtime-year').forEach(el => {
      el.textContent = year;
    });
  }

  updateClock();
  setInterval(updateClock, 1000);
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
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getStatusBadge(status) {
  const map = {
    'pending': ['Menunggu', 'status-pending', 'fa-clock'],
    'approved': ['Disetujui', 'status-approved', 'fa-check-circle'],
    'rejected': ['Ditolak', 'status-rejected', 'fa-times-circle'],
    'checked-in': ['Checked In', 'status-checked-in', 'fa-sign-in-alt'],
    'checked-out': ['Checked Out', 'status-checked-out', 'fa-sign-out-alt']
  };
  const [label, cls, icon] = map[status] || ['Unknown', '', 'fa-question'];
  return `<span class="status-badge ${cls}"><i class="fas ${icon}"></i> ${label}</span>`;
}

function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
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
    const res = await fetch('/api/me');
    const data = await res.json();

    if (data.success) {
      const user = data.user;
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
        logoutBtn.addEventListener('click', async () => {
          await fetch('/api/logout', { method: 'POST' });
          window.location.href = '/login';
        });
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
          <a href="/rooms/${room.id}" class="room-card-link">
            <div class="card-body">
              <h3>${room.name}</h3>
              <div class="room-meta">
                <span><i class="fas fa-users"></i> ${room.capacity} Tamu</span>
                <span><i class="fas fa-expand-arrows-alt"></i> ${room.size} m²</span>
                <span><i class="fas fa-bed"></i> ${room.bed}</span>
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
          <input type="date" id="sidebarCheckin">
          <label>Check-out</label>
          <input type="date" id="sidebarCheckout">
          <div class="cost-summary" id="costSummary" style="display:none;">
            <div class="cost-row"><span id="costNights">0 malam</span><span id="costAmount">Rp 0</span></div>
            <div class="cost-row total"><span>Total</span><span id="costTotal">Rp 0</span></div>
          </div>
        </div>
        <a href="/reservation/${room.id}" class="btn-reserve ${room.availableUnits <= 0 ? 'disabled' : ''}" id="btnReserve">
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
  const today = new Date().toISOString().split('T')[0];
  ciInput.min = today;
  ciInput.value = today;
  const tmr = new Date(); tmr.setDate(tmr.getDate() + 1);
  coInput.min = tmr.toISOString().split('T')[0];
  coInput.value = tmr.toISOString().split('T')[0];

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
  }

  ciInput.addEventListener('change', () => {
    const minCo = new Date(ciInput.value); minCo.setDate(minCo.getDate() + 1);
    coInput.min = minCo.toISOString().split('T')[0];
    if (new Date(coInput.value) <= new Date(ciInput.value)) coInput.value = minCo.toISOString().split('T')[0];
    calcCost();
  });
  coInput.addEventListener('change', calcCost);
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

  // Check login
  const me = await fetch('/api/me').then(r => r.json());
  if (!me.success) { window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname); return; }

  const roomRes = await fetch(`/api/rooms/${roomId}`);
  const roomData = await roomRes.json();
  if (!roomData.success) { formContainer.innerHTML = '<div class="empty-state"><h3>Kamar tidak ditemukan</h3></div>'; return; }

  const room = roomData.room;
  const today = new Date().toISOString().split('T')[0];
  const tmr = new Date(); tmr.setDate(tmr.getDate() + 1);

  formContainer.innerHTML = `
    <div class="reservation-layout">
      <div class="form-card">
        <h2><i class="fas fa-calendar-plus" style="color:#C4A265;margin-right:10px;"></i>Form Reservasi</h2>
        <form id="rsvForm">
          <div class="form-row">
            <div class="form-group">
              <label><i class="fas fa-calendar-check"></i> Tanggal Check-in</label>
              <input type="date" id="rsvCheckin" name="checkIn" min="${today}" value="${today}" required>
            </div>
            <div class="form-group">
              <label><i class="fas fa-calendar-minus"></i> Tanggal Check-out</label>
              <input type="date" id="rsvCheckout" name="checkOut" min="${tmr.toISOString().split('T')[0]}" value="${tmr.toISOString().split('T')[0]}" required>
            </div>
          </div>
          <div class="form-group">
            <label><i class="fas fa-user"></i> Nama Tamu yang Menginap</label>
            <input type="text" id="rsvName" name="guestName" value="${me.user.name}" placeholder="Masukkan nama lengkap tamu" required>
            <small style="display:block;margin-top:4px;font-size:0.75rem;color:#777;">*Bisa diubah jika Anda memesan kamar atas nama orang lain (keluarga / rekan)</small>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label><i class="fas fa-phone"></i> No. Telepon</label>
              <input type="tel" id="rsvPhone" name="guestPhone" placeholder="081234567890" required>
            </div>
            <div class="form-group">
              <label><i class="fas fa-envelope"></i> Email</label>
              <input type="email" id="rsvEmail" name="guestEmail" value="${me.user.email}" placeholder="email@example.com" required>
            </div>
          </div>
          <div class="form-group">
            <label><i class="fas fa-sticky-note"></i> Catatan (Opsional)</label>
            <textarea id="rsvNotes" name="notes" placeholder="Permintaan khusus, misalnya: minta kamar lantai atas"></textarea>
          </div>
          <button type="submit" class="btn-reserve" id="btnSubmitRsv">
            <i class="fas fa-paper-plane"></i> Kirim Pengajuan Reservasi
          </button>
        </form>
      </div>
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
          </div>
        </div>
      </div>
    </div>
  `;

  const ciInput = document.getElementById('rsvCheckin');
  const coInput = document.getElementById('rsvCheckout');

  function updateCost() {
    if (ciInput.value && coInput.value) {
      const nights = Math.ceil((new Date(coInput.value) - new Date(ciInput.value)) / 86400000);
      if (nights > 0) {
        document.getElementById('rsvNightsLabel').textContent = nights + ' malam';
        document.getElementById('rsvSubtotal').textContent = formatCurrency(nights * room.price);
        document.getElementById('rsvTotal').textContent = formatCurrency(nights * room.price);
      }
    }
  }

  ciInput.addEventListener('change', () => {
    const minCo = new Date(ciInput.value); minCo.setDate(minCo.getDate() + 1);
    coInput.min = minCo.toISOString().split('T')[0];
    if (new Date(coInput.value) <= new Date(ciInput.value)) coInput.value = minCo.toISOString().split('T')[0];
    updateCost();
  });
  coInput.addEventListener('change', updateCost);
  updateCost();

  // Submit
  document.getElementById('rsvForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitRsv');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: parseInt(roomId),
          checkIn: ciInput.value,
          checkOut: coInput.value,
          guestName: document.getElementById('rsvName').value,
          guestPhone: document.getElementById('rsvPhone').value,
          guestEmail: document.getElementById('rsvEmail').value,
          notes: document.getElementById('rsvNotes').value
        })
      });
      const data = await res.json();

      if (data.success) {
        showToast(data.message, 'success');
        setTimeout(() => { window.location.href = '/my-reservations'; }, 1500);
      } else {
        showToast(data.message, 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim Pengajuan Reservasi';
      }
    } catch {
      showToast('Terjadi kesalahan', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim Pengajuan Reservasi';
    }
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
        ${rsv.notes ? `<div style="font-size:0.8rem;color:#888;margin-top:4px;"><i class="fas fa-sticky-note"></i> ${rsv.notes}</div>` : ''}
      </div>
      <div class="rsv-right">
        <span class="rsv-amount">${formatCurrency(rsv.totalPrice)}</span>
        ${getStatusBadge(rsv.status)}
        ${rsv.status === 'pending' ? `
          <button class="btn-approve" onclick="approveRsv('${rsv.id}')"><i class="fas fa-check"></i> ACC</button>
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
        <button class="btn-checkin" onclick="processCheckin('${rsv.id}')"><i class="fas fa-sign-in-alt"></i> Proses Check-in</button>
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
      </div>
      <div class="rsv-right">
        <span class="rsv-amount">${formatCurrency(rsv.totalPrice)}</span>
        ${getStatusBadge(rsv.status)}
        <button class="btn-checkout" onclick="processCheckout('${rsv.id}')"><i class="fas fa-sign-out-alt"></i> Proses Check-out</button>
      </div>
    </div>
  `).join('');
}

// ==================== ADMIN ACTIONS ====================

async function approveRsv(id) {
  if (!confirm('Setujui reservasi ' + id + '?')) return;
  const res = await fetch(`/api/reservations/${id}/approve`, { method: 'PUT' });
  const data = await res.json();
  showToast(data.message, data.success ? 'success' : 'error');
  if (data.success) setTimeout(() => location.reload(), 800);
}

async function rejectRsv(id) {
  showModal('Tolak Reservasi', '<p style="margin-bottom:12px;color:#888;">Berikan alasan penolakan:</p><textarea id="rejectReason" placeholder="Alasan penolakan..."></textarea>', async (overlay) => {
    const reason = document.getElementById('rejectReason')?.value || '';
    const res = await fetch(`/api/reservations/${id}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    const data = await res.json();
    showToast(data.message, data.success ? 'success' : 'error');
    if (data.success) setTimeout(() => location.reload(), 800);
  });
}

async function processCheckin(id) {
  if (!confirm('Proses check-in untuk reservasi ' + id + '?')) return;
  const res = await fetch(`/api/reservations/${id}/checkin`, { method: 'PUT' });
  const data = await res.json();
  showToast(data.message, data.success ? 'success' : 'error');
  if (data.success) setTimeout(() => location.reload(), 800);
}

async function processCheckout(id) {
  if (!confirm('Proses check-out untuk reservasi ' + id + '?')) return;
  const res = await fetch(`/api/reservations/${id}/checkout`, { method: 'PUT' });
  const data = await res.json();
  showToast(data.message, data.success ? 'success' : 'error');
  if (data.success) setTimeout(() => location.reload(), 800);
}
