/* ============================================================
   HOTELKU — Frontend JavaScript
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
        if (savedUser && savedUser.id) {
          options = options || {};
          options.headers = options.headers || {};
          if (options.headers instanceof Headers) {
            if (!options.headers.has('x-user-id')) options.headers.set('x-user-id', String(savedUser.id));
            if (!options.headers.has('x-user-email')) options.headers.set('x-user-email', String(savedUser.email));
            if (!options.headers.has('x-user-name') && savedUser.name) options.headers.set('x-user-name', encodeURIComponent(savedUser.name));
            if (!options.headers.has('x-user-role') && savedUser.role) options.headers.set('x-user-role', String(savedUser.role));
            if (!options.headers.has('x-user-phone') && savedUser.phone) options.headers.set('x-user-phone', encodeURIComponent(savedUser.phone));
          } else if (typeof options.headers === 'object') {
            if (!options.headers['x-user-id']) options.headers['x-user-id'] = String(savedUser.id);
            if (!options.headers['x-user-email']) options.headers['x-user-email'] = String(savedUser.email);
            if (!options.headers['x-user-name'] && savedUser.name) options.headers['x-user-name'] = encodeURIComponent(savedUser.name);
            if (!options.headers['x-user-role'] && savedUser.role) options.headers['x-user-role'] = String(savedUser.role);
            if (!options.headers['x-user-phone'] && savedUser.phone) options.headers['x-user-phone'] = encodeURIComponent(savedUser.phone);
          }
        }
      }
    } catch(e) {}
    return origFetch.apply(this, [url, options]);
  };
})();

/// ==================== REALTIME CLOCK & DATE ====================
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

document.addEventListener('DOMContentLoaded', () => {
  initRealtimeClock();

  // ==================== NAVBAR SCROLL EFFECT ====================
  const navbar = document.getElementById('navbar');
  if (navbar && !navbar.classList.contains('navbar-solid')) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // ==================== MOBILE MENU TOGGLE ====================
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking a link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // ==================== HERO SLIDESHOW ====================
  const heroSlides = document.querySelectorAll('.hero-slide');
  const indicators = document.querySelectorAll('.indicator');

  if (heroSlides.length > 0) {
    let currentSlide = 0;
    const totalSlides = heroSlides.length;

    function goToSlide(index) {
      heroSlides[currentSlide].classList.remove('active');
      if (indicators[currentSlide]) indicators[currentSlide].classList.remove('active');

      currentSlide = index;

      heroSlides[currentSlide].classList.add('active');
      if (indicators[currentSlide]) indicators[currentSlide].classList.add('active');
    }

    function nextSlide() {
      goToSlide((currentSlide + 1) % totalSlides);
    }

    // Auto-play slideshow
    let slideInterval = setInterval(nextSlide, 6000);

    function resetInterval() {
      clearInterval(slideInterval);
      slideInterval = setInterval(nextSlide, 6000);
    }

    // Indicator clicks
    indicators.forEach(indicator => {
      indicator.addEventListener('click', () => {
        goToSlide(parseInt(indicator.dataset.slide));
        resetInterval();
      });
    });

    // Touch swipe for Hero Slideshow on mobile
    const heroSection = document.getElementById('home');
    if (heroSection) {
      let touchStartX = 0;
      let touchEndX = 0;

      heroSection.addEventListener('touchstart', (e) => {
        if (!e.touches || e.touches.length === 0) return;
        touchStartX = e.touches[0].clientX;
        touchEndX = touchStartX;
      }, { passive: true });

      heroSection.addEventListener('touchmove', (e) => {
        if (!e.touches || e.touches.length === 0) return;
        touchEndX = e.touches[0].clientX;
      }, { passive: true });

      heroSection.addEventListener('touchend', () => {
        const diffX = touchEndX - touchStartX;
        if (Math.abs(diffX) > 40) {
          if (diffX < 0) {
            goToSlide((currentSlide + 1) % totalSlides); // swipe left -> next slide
          } else {
            goToSlide((currentSlide - 1 + totalSlides) % totalSlides); // swipe right -> prev slide
          }
          resetInterval();
        }
      }, { passive: true });
    }
  }

  // ==================== LOGIN BACKGROUND SLIDESHOW ====================
  const loginSlides = document.querySelectorAll('.login-bg-slide');

  if (loginSlides.length > 0) {
    let currentLoginSlide = 0;

    setInterval(() => {
      loginSlides[currentLoginSlide].classList.remove('active');
      currentLoginSlide = (currentLoginSlide + 1) % loginSlides.length;
      loginSlides[currentLoginSlide].classList.add('active');
    }, 5000);
  }

  // ==================== LOGIN FORM ====================
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const alertError = document.getElementById('alertError');
    const alertSuccess = document.getElementById('alertSuccess');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const btnLogin = document.getElementById('btnLogin');
    const btnText = btnLogin.querySelector('.btn-text');
    const btnLoader = btnLogin.querySelector('.btn-loader');

    // Form validation
    function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }

    function clearErrors() {
      emailInput.classList.remove('error');
      passwordInput.classList.remove('error');
      emailError.textContent = '';
      passwordError.textContent = '';
      alertError.style.display = 'none';
      alertSuccess.style.display = 'none';
    }

    function showError(element, errorEl, message) {
      element.classList.add('error');
      errorEl.textContent = message;
    }

    function showAlert(type, message) {
      if (type === 'error') {
        alertError.style.display = 'flex';
        alertSuccess.style.display = 'none';
        errorMessage.textContent = message;
      } else {
        alertSuccess.style.display = 'flex';
        alertError.style.display = 'none';
        successMessage.textContent = message;
      }
    }

    function setLoading(loading) {
      btnLogin.disabled = loading;
      btnText.style.display = loading ? 'none' : 'inline';
      btnLoader.style.display = loading ? 'inline-flex' : 'none';
    }

    // Check if redirected from registration
    const pageParams = new URLSearchParams(window.location.search);
    if (pageParams.get('registered') === '1' || pageParams.get('registered') === 'true') {
      showAlert('success', 'Pendaftaran berhasil! Silakan masukkan email dan password Anda untuk masuk.');
      const regEmail = pageParams.get('email');
      if (regEmail && emailInput) {
        emailInput.value = regEmail;
        if (passwordInput) {
          setTimeout(() => passwordInput.focus(), 200);
        }
      }
    }

    // Submit handler
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const email = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value;
      let valid = true;

      // Validate email
      if (!email) {
        showError(emailInput, emailError, 'Email harus diisi');
        valid = false;
      } else if (!validateEmail(email)) {
        showError(emailInput, emailError, 'Format email tidak valid');
        valid = false;
      }

      // Validate password
      if (!password) {
        showError(passwordInput, passwordError, 'Password harus diisi');
        valid = false;
      } else if (password.length < 4) {
        showError(passwordInput, passwordError, 'Password minimal 4 karakter');
        valid = false;
      }

      if (!valid) return;

      // Send login request
      setLoading(true);

      // Check local registered accounts fallback for serverless multi-instance support
      let localAccount = null;
      try {
        const accounts = JSON.parse(localStorage.getItem('hotelku_registered_accounts') || '[]');
        localAccount = accounts.find(a => a.email && a.email.toLowerCase() === email && a.password === password) || null;
      } catch (e) {}

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, localAccount })
        });

        const data = await response.json();

        if (data.success) {
          showAlert('success', data.message);
          if (data.user) {
            localStorage.setItem('hotelku_user', JSON.stringify(data.user));
          }
          
          const params = new URLSearchParams(window.location.search);
          const redirectUrl = params.get('redirect');

          // Redirect after short delay based on user role
          setTimeout(() => {
            if (redirectUrl) {
              window.location.href = redirectUrl;
            } else if (data.user && data.user.role === 'admin') {
              window.location.href = '/admin/dashboard';
            } else if (data.user && data.user.role === 'receptionist') {
              window.location.href = '/receptionist/dashboard';
            } else {
              window.location.href = '/rooms';
            }
          }, 1000);
        } else {
          showAlert('error', data.message);
          setLoading(false);
        }
      } catch (err) {
        showAlert('error', 'Terjadi kesalahan. Silakan coba lagi.');
        setLoading(false);
      }
    });

    // Real-time validation on blur
    emailInput.addEventListener('blur', () => {
      if (emailInput.value && !validateEmail(emailInput.value)) {
        showError(emailInput, emailError, 'Format email tidak valid');
      }
    });

    emailInput.addEventListener('input', () => {
      emailInput.classList.remove('error');
      emailError.textContent = '';
    });

    passwordInput.addEventListener('input', () => {
      passwordInput.classList.remove('error');
      passwordError.textContent = '';
    });
  }

  // Carry over redirect parameter to register link if exists
  const urlParams = new URLSearchParams(window.location.search);
  const redirectTarget = urlParams.get('redirect');
  const registerLink = document.querySelector('.register-link');
  if (redirectTarget && registerLink) {
    registerLink.href = '/register?redirect=' + encodeURIComponent(redirectTarget);
  }

  // ==================== PASSWORD TOGGLE ====================
  const passwordToggle = document.getElementById('passwordToggle');

  if (passwordToggle) {
    const passwordInput = document.getElementById('password');
    const icon = passwordToggle.querySelector('i');

    passwordToggle.addEventListener('click', () => {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  }

  // ==================== DEMO ACCOUNTS ====================
  const demoToggle = document.getElementById('demoToggle');
  const demoList = document.getElementById('demoList');

  if (demoToggle && demoList) {
    demoToggle.addEventListener('click', () => {
      const isHidden = demoList.style.display === 'none';
      demoList.style.display = isHidden ? 'block' : 'none';
      demoToggle.innerHTML = isHidden
        ? '<i class="fas fa-times-circle"></i> Tutup Akun Demo'
        : '<i class="fas fa-info-circle"></i> Lihat Akun Demo';
    });

    // Auto-fill demo credentials
    document.querySelectorAll('.demo-use-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.demo-item');
        const email = item.dataset.email;
        const password = item.dataset.password;

        document.getElementById('email').value = email;
        document.getElementById('password').value = password;

        // Clear any errors
        document.getElementById('email').classList.remove('error');
        document.getElementById('password').classList.remove('error');
        document.getElementById('emailError').textContent = '';
        document.getElementById('passwordError').textContent = '';

        // Visual feedback
        btn.textContent = '✓';
        btn.style.background = 'var(--gold)';
        btn.style.color = 'var(--black)';
        setTimeout(() => {
          btn.textContent = 'Gunakan';
          btn.style.background = '';
          btn.style.color = '';
        }, 1500);
      });
    });
  }

  // ==================== BOOKING FORM ====================
  const bookingForm = document.getElementById('bookingForm');

  if (bookingForm) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const checkinInput = bookingForm.querySelector('input[name="checkin"]');
    const checkoutInput = bookingForm.querySelector('input[name="checkout"]');

    if (checkinInput && checkoutInput) {
      checkinInput.min = todayStr;

      let savedCi = localStorage.getItem('hotelku_checkin');
      let savedCo = localStorage.getItem('hotelku_checkout');

      if (savedCi && savedCi >= todayStr) {
        checkinInput.value = savedCi;
      } else {
        checkinInput.value = todayStr;
      }

      const minCheckout = new Date(checkinInput.value);
      minCheckout.setDate(minCheckout.getDate() + 1);
      const minCheckoutStr = minCheckout.toISOString().split('T')[0];
      checkoutInput.min = minCheckoutStr;

      if (savedCo && savedCo > checkinInput.value) {
        checkoutInput.value = savedCo;
      } else {
        checkoutInput.value = minCheckoutStr;
      }

      checkinInput.addEventListener('change', () => {
        const minCo = new Date(checkinInput.value);
        minCo.setDate(minCo.getDate() + 1);
        const minCoStr = minCo.toISOString().split('T')[0];
        checkoutInput.min = minCoStr;
        if (new Date(checkoutInput.value) <= new Date(checkinInput.value)) {
          checkoutInput.value = minCoStr;
        }
        localStorage.setItem('hotelku_checkin', checkinInput.value);
        localStorage.setItem('hotelku_checkout', checkoutInput.value);
      });

      checkoutInput.addEventListener('change', () => {
        localStorage.setItem('hotelku_checkin', checkinInput.value);
        localStorage.setItem('hotelku_checkout', checkoutInput.value);
      });
    }

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const ci = checkinInput.value;
      const co = checkoutInput.value;
      if (ci && co) {
        localStorage.setItem('hotelku_checkin', ci);
        localStorage.setItem('hotelku_checkout', co);
        window.location.href = `/rooms?checkin=${encodeURIComponent(ci)}&checkout=${encodeURIComponent(co)}`;
      } else {
        window.location.href = '/rooms';
      }
    });
  }

  // ==================== SMOOTH SCROLL FOR NAV LINKS ====================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 80; // navbar height
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ==================== ACTIVE NAV LINK ON SCROLL ====================
  const sections = document.querySelectorAll('section[id]');

  if (sections.length > 0) {
    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset + 100;

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + sectionId) {
              link.classList.add('active');
            }
          });
        }
      });
    });
  }

  // ==================== SCROLL REVEAL ANIMATIONS ====================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements for scroll animation
  document.querySelectorAll('.room-card, .facility-card, .dash-card, .contact-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

});
