/* ============================================================
   HOTELKU — Frontend JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

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

    // Submit handler
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const email = emailInput.value.trim();
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
      } else if (password.length < 5) {
        showError(passwordInput, passwordError, 'Password minimal 5 karakter');
        valid = false;
      }

      if (!valid) return;

      // Send login request
      setLoading(true);

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
          showAlert('success', data.message);
          
          // Redirect after short delay based on user role
          setTimeout(() => {
            if (data.user && data.user.role === 'admin') {
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
    // Set default dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkinInput = bookingForm.querySelector('input[name="checkin"]');
    const checkoutInput = bookingForm.querySelector('input[name="checkout"]');

    if (checkinInput && checkoutInput) {
      checkinInput.value = today.toISOString().split('T')[0];
      checkoutInput.value = tomorrow.toISOString().split('T')[0];
      checkinInput.min = today.toISOString().split('T')[0];

      checkinInput.addEventListener('change', () => {
        const minCheckout = new Date(checkinInput.value);
        minCheckout.setDate(minCheckout.getDate() + 1);
        checkoutInput.min = minCheckout.toISOString().split('T')[0];
        if (new Date(checkoutInput.value) <= new Date(checkinInput.value)) {
          checkoutInput.value = minCheckout.toISOString().split('T')[0];
        }
      });
    }

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Redirect to login for booking
      window.location.href = '/login';
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
