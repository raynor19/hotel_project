/* ============================================================
   ORVEN — Global i18n Language Switcher Module
   (Instant Dynamic Translation Engine with Japanese & Chinese Support)
   ============================================================ */

(function() {
  // Available Languages with Flag SVG
  const LANGUAGES = {
    'id': {
      code: 'id',
      gtCode: 'id',
      name: 'Indonesia',
      flagSvg: `<svg viewBox="0 0 30 30" width="18" height="18" style="display:block; border-radius:50%;"><clipPath id="idClip"><circle cx="15" cy="15" r="15"/></clipPath><g clip-path="url(#idClip)"><rect width="30" height="15" fill="#e70011"/><rect y="15" width="30" height="15" fill="#ffffff"/></g></svg>`
    },
    'en': {
      code: 'en',
      gtCode: 'en',
      name: 'English',
      flagSvg: `<svg viewBox="0 0 60 30" width="18" height="18" style="display:block; border-radius:50%;"><clipPath id="circleClip"><circle cx="15" cy="15" r="15"/></clipPath><g clip-path="url(#circleClip)" transform="scale(0.5 1)"><rect width="60" height="30" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" stroke-width="2"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></g></svg>`
    },
    'ja': {
      code: 'ja',
      gtCode: 'ja',
      name: '日本語',
      flagSvg: `<svg viewBox="0 0 30 30" width="18" height="18" style="display:block; border-radius:50%;"><clipPath id="jaClip"><circle cx="15" cy="15" r="15"/></clipPath><g clip-path="url(#jaClip)"><rect width="30" height="30" fill="#ffffff"/><circle cx="15" cy="15" r="7" fill="#bc002d"/></g></svg>`
    },
    'ar': {
      code: 'ar',
      gtCode: 'ar',
      name: 'العربية',
      flagSvg: `<svg viewBox="0 0 30 30" width="18" height="18" style="display:block; border-radius:50%;"><clipPath id="arClip"><circle cx="15" cy="15" r="15"/></clipPath><g clip-path="url(#arClip)"><rect width="30" height="30" fill="#006c35"/><text x="15" y="19" font-size="10" text-anchor="middle" fill="#ffffff">🇸🇦</text></g></svg>`
    },
    'zh': {
      code: 'zh',
      gtCode: 'zh-CN', // Important: Google Translate requires zh-CN for Simplified Chinese
      name: '中文',
      flagSvg: `<svg viewBox="0 0 30 30" width="18" height="18" style="display:block; border-radius:50%;"><clipPath id="zhClip"><circle cx="15" cy="15" r="15"/></clipPath><g clip-path="url(#zhClip)"><rect width="30" height="30" fill="#de2910"/><polygon points="7,4 9,9 4,6 10,6 5,9" fill="#ffde00"/></g></svg>`
    }
  };

  // State Management
  let currentLang = localStorage.getItem('hotelku_lang') || 'id';
  if (!LANGUAGES[currentLang]) currentLang = 'id';

  // Currency Formatter (Fixed IDR)
  window.formatCurrency = function(amountInIDR) {
    const num = Number(amountInIDR) || 0;
    return 'Rp ' + Math.round(num).toLocaleString('id-ID');
  };

  window.getCurrentCurrency = function() {
    return 'IDR';
  };

  window.getCurrentLanguage = function() {
    return currentLang;
  };

  // ==================== SEMANTIC KEY-BASED TRANSLATIONS ====================
  const KEY_TRANSLATIONS = {
    en: {
      navHome: 'Home',
      navRooms: 'Rooms & Suites',
      navFacilities: 'Facilities',
      navAbout: 'About Us',
      navContact: 'Contact',
      navMyReservations: 'My Bookings',
      navProfile: 'My Profile',
      navSignIn: 'Login',
      navRegister: 'Register',
      heroSub: '✦ WELCOME TO ORVEN ✦',
      heroTitle: 'Luxury Stay Experience in the Heart of Yogyakarta',
      heroDesc: 'Experience the harmonious blend of modern luxury and warm Javanese heritage hospitality in downtown Yogyakarta.',
      btnSeeRooms: 'View All Rooms',
      btnBookNow: 'Book Now',
      checkInLabel: 'Check-in',
      checkOutLabel: 'Check-out',
      guestsLabel: 'Guests',
      roomsLabel: 'Rooms',
      btnSearchRooms: 'Search Rooms',
      ourRoomsLabel: '✦ OUR ROOMS ✦',
      ourRoomsTitle: 'Exclusive Room Selection',
      perNight: '/ night',
      btnViewRoom: 'View Room'
    },
    ja: {
      navHome: 'ホーム',
      navRooms: '客室＆スイート',
      navFacilities: '館内施設',
      navAbout: '当ホテルについて',
      navContact: 'お問い合わせ',
      navMyReservations: '予約確認',
      navProfile: 'マイプロフィール',
      navSignIn: 'ログイン',
      navRegister: '会員登録',
      heroSub: '✦ ホテルクへようこそ ✦',
      heroTitle: 'ジョグジャカルタの中心で極上の贅沢を',
      heroDesc: '現代のモダンなラグジュアリーと温かなジャワの伝統的なおもてなしが調和する特別な空間。',
      btnSeeRooms: 'すべての客室を見る',
      btnBookNow: '今すぐ予約',
      checkInLabel: 'チェックイン',
      checkOutLabel: 'チェックアウト',
      guestsLabel: '宿泊人数',
      roomsLabel: '部屋数',
      btnSearchRooms: '空室を検索',
      ourRoomsLabel: '✦ 客室のご案内 ✦',
      ourRoomsTitle: '厳選された客室コレクション',
      perNight: '/ 泊',
      btnViewRoom: '詳細を見る'
    },
    zh: {
      navHome: '首页',
      navRooms: '客房与套房',
      navFacilities: '酒店设施',
      navAbout: '关于我们',
      navContact: '联系我们',
      navMyReservations: '我的预订',
      navProfile: '个人资料',
      navSignIn: '登录',
      navRegister: '注册',
      heroSub: '✦ 欢迎莅临 ORVEN ✦',
      heroTitle: '日惹市中心的高端奢华下榻体验',
      heroDesc: '尽享现代典雅奢华与爪哇传统待客之道的完美交融。',
      btnSeeRooms: '查看所有客房',
      btnBookNow: '立即预订',
      checkInLabel: '入住日期',
      checkOutLabel: '退房日期',
      guestsLabel: '入住人数',
      roomsLabel: '房间数',
      btnSearchRooms: '查询客房',
      ourRoomsLabel: '✦ 精选客房 ✦',
      ourRoomsTitle: '尊贵客房系列',
      perNight: '/ 晚',
      btnViewRoom: '查看房型'
    },
    ar: {
      navHome: 'الرئيسية',
      navRooms: 'الغرف والأجنحة',
      navFacilities: 'المرافق',
      navAbout: 'من نحن',
      navContact: 'اتصل بنا',
      navMyReservations: 'حجوزاتي',
      navProfile: 'الملف الشخصي',
      navSignIn: 'تسجيل الدخول',
      navRegister: 'إنشاء حساب',
      heroSub: '✦ أهلاً بكم في هوتيلكو ✦',
      heroTitle: 'تجربة إقامة فاخرة في قلب يوغياكارتا',
      heroDesc: 'استمتع بمزيج متناغم من الفخامة العصرية والضيافة الجاوية الدافئة في وسط المدينة الثقافية.',
      btnSeeRooms: 'عرض جميع الغرف',
      btnBookNow: 'احجز الآن',
      checkInLabel: 'تسجيل الوصول',
      checkOutLabel: 'تسجيل المغادرة',
      guestsLabel: 'النزلاء',
      roomsLabel: 'الغرف',
      btnSearchRooms: 'البحث عن الغرف',
      ourRoomsLabel: '✦ غرفنا ✦',
      ourRoomsTitle: 'مجموعة الغرف الحصرية',
      perNight: '/ ليلة',
      btnViewRoom: 'عرض الغرفة'
    }
  };

  // ==================== SEMANTIC HTML-BASED TRANSLATIONS ====================
  const HTML_TRANSLATIONS = {
    en: {
      adminCheckoutNotice: '<i class="fas fa-info-circle" style="margin-right: 6px;"></i> When the <strong>"Process Check-Out"</strong> button is clicked, reservation status changes to <strong>Checked-Out</strong>, the room unit automatically returns to <strong>Available</strong> status, and guests can now submit reviews and ratings.',
      adminCheckinNotice: '<i class="fas fa-info-circle" style="margin-right: 6px;"></i> When the <strong>"Process Check-In"</strong> button is clicked, reservation status changes to <strong>Checked-In</strong> and the room unit will be marked as <strong>Occupied</strong>.'
    },
    ja: {
      adminCheckoutNotice: '<i class="fas fa-info-circle" style="margin-right: 6px;"></i> <strong>「チェックアウト処理」</strong>ボタンを押すと、予約ステータスが<strong>Checked-Out</strong>になり、客室は自動的に<strong>空室 (Available)</strong>に戻り、ゲストが口コミ・評価を投稿できるようになります。',
      adminCheckinNotice: '<i class="fas fa-info-circle" style="margin-right: 6px;"></i> <strong>「チェックイン処理」</strong>ボタンを押すと、予約ステータスが<strong>Checked-In</strong>になり、客室は<strong>滞在中 (Occupied)</strong>としてマークされます。'
    },
    zh: {
      adminCheckoutNotice: '<i class="fas fa-info-circle" style="margin-right: 6px;"></i> 点击<strong>“办理退房”</strong>按钮后，预订状态变更为<strong>Checked-Out</strong>，房间自动恢复为<strong>空闲 (Available)</strong>状态，客人即可发表入住评价与评分。',
      adminCheckinNotice: '<i class="fas fa-info-circle" style="margin-right: 6px;"></i> 点击<strong>“办理入住”</strong>按钮后，预订状态变更为<strong>Checked-In</strong>，房间单元将被标记为<strong>在住 (Occupied)</strong>。'
    },
    ar: {
      adminCheckoutNotice: '<i class="fas fa-info-circle" style="margin-right: 6px;"></i> عند الضغط على زر <strong>"إجراءات المغادرة"</strong>، تتحول حالة الحجز إلى <strong>Checked-Out</strong>، وتصبح الغرفة <strong>متاحة (Available)</strong> تلقائياً، ويتمكن النزيل من تقديم التقييم والمراجعة.',
      adminCheckinNotice: '<i class="fas fa-info-circle" style="margin-right: 6px;"></i> عند الضغط على زر <strong>"إجراءات الوصول"</strong>، تتحول حالة الحجز إلى <strong>Checked-In</strong> وتحدد الغرفة على أنها <strong>مشغولة (Occupied)</strong>.'
    }
  };

  // ==================== COMPREHENSIVE DICTIONARY ====================
  const DICT = {
    // --- Navigation & Core UI ---
    'Home': { en: 'Home', ja: 'ホーム', zh: '首页', ar: 'الرئيسية' },
    'Beranda': { en: 'Home', ja: 'ホーム', zh: '首页', ar: 'الرئيسية' },
    'Pilihan Kamar': { en: 'Rooms & Suites', ja: '客室一覧', zh: '精选客房', ar: 'خيارات الغرف' },
    'Kamar': { en: 'Rooms', ja: '客室', zh: '客房', ar: 'الغرف' },
    'Kamar & Suite': { en: 'Rooms & Suites', ja: '客室＆スイート', zh: '客房与套房', ar: 'الغرف والأجنحة' },
    'Fasilitas': { en: 'Facilities', ja: '館内施設', zh: '酒店设施', ar: 'المرافق' },
    'Tentang Kami': { en: 'About Us', ja: 'ホテル概要', zh: '关于我们', ar: 'من نحن' },
    'Kontak': { en: 'Contact', ja: 'お問い合わせ', zh: '联系我们', ar: 'اتصل بنا' },
    'Pesanan Saya': { en: 'My Bookings', ja: '予約確認', zh: '我的预订', ar: 'حجوزاتي' },
    'Riwayat Pemesanan': { en: 'My Bookings', ja: '予約履歴', zh: '预订记录', ar: 'سجل الحجوزات' },
    'Riwayat Pemesanan Saya': { en: 'My Bookings', ja: '予約履歴', zh: '我的预订记录', ar: 'سجل حجوزاتي' },
    'Daftar Reservasi Anda': { en: 'Your Reservations', ja: '予約一覧', zh: '您的预订列表', ar: 'قائمة حجوزاتك' },
    'Profil': { en: 'Profile', ja: 'プロフィール', zh: '个人资料', ar: 'الملف الشخصي' },
    'Profil Saya': { en: 'My Profile', ja: 'マイプロフィール', zh: '我的资料', ar: 'ملفي الشخصي' },
    'Admin Console': { en: 'Admin Console', ja: '管理者コンソール', zh: '管理控制台', ar: 'لوحة تحكم المسؤول' },
    'Konsol Resepsionis': { en: 'Receptionist Console', ja: 'フロントデスク', zh: '前台控制台', ar: 'لوحة الاستقبال' },
    'Front Desk Operational Console': { en: 'Front Desk Operational Console', ja: 'フロント運用コンソール', zh: '前台运营控制台', ar: 'لوحة تشغيل مكتب الاستقبال' },
    'Sistem Siap Melayani': { en: 'System Ready', ja: 'システム稼働中', zh: '系统就绪', ar: 'النظام جاهز' },
    'Masuk': { en: 'Login', ja: 'ログイン', zh: '登录', ar: 'تسجيل الدخول' },
    'Daftar': { en: 'Register', ja: '新規登録', zh: '注册', ar: 'إنشاء حساب' },
    'Daftar Sekarang': { en: 'Register Now', ja: '今すぐ登録', zh: '立即注册', ar: 'سجل الآن' },
    'Daftar Akun Baru': { en: 'Create New Account', ja: '新規アカウント作成', zh: '创建新账户', ar: 'إنشاء حساب جديد' },
    'Daftar Akun Tamu Baru': { en: 'Register New Guest Account', ja: '新規ゲスト登録', zh: '注册新客人账户', ar: 'تسجيل حساب نزيل جديد' },
    'Pendaftaran berhasil!': { en: 'Registration successful!', ja: '登録が完了しました！', zh: '注册成功！', ar: 'تم التسجيل بنجاح!' },
    'Pendaftaran berhasil! Mengalihkan ke halaman Masuk...': {
      en: 'Registration successful! Redirecting to Sign In...',
      ja: '登録が完了しました！ログイン画面へ移動します...',
      zh: '注册成功！正在跳转至登录页面...',
      ar: 'تم التسجيل بنجاح! جاري التحويل إلى صفحة الدخول...'
    },
    'Pendaftaran berhasil! Silakan masukkan email dan password Anda untuk masuk.': {
      en: 'Registration successful! Please enter your email and password to sign in.',
      ja: '登録が完了しました！メールアドレスとパスワードを入力してログインしてください。',
      zh: '注册成功！请输入您的邮箱和密码登录。',
      ar: 'تم التسجيل بنجاح! الرجاء إدخال البريد الإلكتروني وكلمة المرور لتسجيل الدخول.'
    },
    'Pendaftaran akun berhasil! Silakan masuk dengan email dan password Anda.': {
      en: 'Registration successful! Please sign in with your email and password.',
      ja: 'アカウント登録が完了しました！メールとパスワードでログインしてください。',
      zh: '账户注册成功！请使用邮箱和密码登录。',
      ar: 'تم تسجيل الحساب بنجاح! يرجى تسجيل الدخول باستخدام البريد وكلمة المرور.'
    },
    'Keluar': { en: 'Logout', ja: 'ログアウト', zh: '退出登录', ar: 'تسجيل خروج' },
    'Pesan Sekarang': { en: 'Book Now', ja: '今すぐ予約', zh: '立即预订', ar: 'احجز الآن' },
    'Reservasi Sekarang': { en: 'Book Now', ja: '予約を申し込む', zh: '立即预订', ar: 'احجز الآن' },
    'Lihat Semua Kamar': { en: 'View All Rooms', ja: 'すべての客室を見る', zh: '查看所有客房', ar: 'عرض جميع الغرف' },
    'Jelajahi Kamar': { en: 'Explore Rooms', ja: '客室を探す', zh: '探索客房', ar: 'استكشف الغرف' },
    'Jelajahi Pilihan Kamar': { en: 'Explore Room Options', ja: '客室一覧を見る', zh: '浏览客房选项', ar: 'استعراض خيارات الغرف' },
    'Cek Ketersediaan': { en: 'Check Availability', ja: '空室状況を確認', zh: '查看空余房态', ar: 'التحقق من التوافر' },
    'Detail Kamar': { en: 'Room Details', ja: '客室詳細', zh: '客房详情', ar: 'تفاصيل الغرفة' },
    'Pesan Kamar Ini': { en: 'Book This Room', ja: 'この部屋を予約', zh: '预订此客房', ar: 'احجز هذه الغرفة' },
    'Reservasi Kamar Baru': { en: 'New Reservation', ja: '新規予約', zh: '新建预订', ar: 'حجز غرفة جديدة' },
    'Kembali ke Kamar': { en: 'Back to Rooms', ja: '客室一覧へ戻る', zh: '返回客房列表', ar: 'العودة إلى الغرف' },
    'Kembali': { en: 'Back', ja: '戻る', zh: '返回', ar: 'رجوع' },
    'Batal': { en: 'Cancel', ja: 'キャンセル', zh: '取消', ar: 'إلغاء' },
    'Simpan': { en: 'Save', ja: '保存', zh: '保存', ar: 'حفظ' },
    'Tutup': { en: 'Close', ja: '閉じる', zh: '关闭', ar: 'إغلاق' },

    // --- Search & Filters ---
    'Check-in': { en: 'Check-in', ja: 'チェックイン', zh: '入住', ar: 'الوصول' },
    'Check-out': { en: 'Check-out', ja: 'チェックアウト', zh: '退房', ar: 'المغادرة' },
    'Tamu': { en: 'Guests', ja: '人数', zh: '人数', ar: 'النزلاء' },
    'Cari Kamar': { en: 'Search Rooms', ja: '空室検索', zh: '搜索客房', ar: 'بحث عن غرف' },
    'Semua Tipe': { en: 'All Types', ja: 'すべてのタイプ', zh: '所有房型', ar: 'جميع الأنواع' },
    'Kapasitas': { en: 'Capacity', ja: '定員', zh: '容纳人数', ar: 'السعة' },
    'Ukuran': { en: 'Size', ja: '広さ', zh: '面积', ar: 'المساحة' },
    'Tempat Tidur': { en: 'Bed', ja: 'ベッド', zh: '床型', ar: 'السرير' },
    'Harga': { en: 'Price', ja: '料金', zh: '价格', ar: 'السعر' },
    'Tersedia': { en: 'Available', ja: '空室あり', zh: '有房', ar: 'متاح' },
    'Penuh': { en: 'Full', ja: '満室', zh: '满房', ar: 'مكتمل' },
    'Unit Tersisa': { en: 'Units Left', ja: '残り部屋数', zh: '剩余间数', ar: 'الغرف المتبقية' },
    '/ malam': { en: '/ night', ja: '/ 泊', zh: '/ 晚', ar: '/ ليلة' },
    'malam': { en: 'night(s)', ja: '泊', zh: '晚', ar: 'ليلة' },

    // --- Stepper & Booking Form ---
    '✦ FORMULIR RESERVASI ✦': { en: '✦ RESERVATION FORM ✦', ja: '✦ ご予約フォーム ✦', zh: '✦ 预订表单 ✦', ar: '✦ نموذج الحجز ✦' },
    'Pemesanan Kamar Orven': { en: 'Orven Room Booking', ja: 'ホテルク客室予約', zh: 'Orven 客房预订', ar: 'حجز غرفة في فندق هوتيلكو' },
    'Lengkapi data diri dan lakukan pembayaran untuk konfirmasi instan pemesanan kamar Anda': {
      en: 'Complete your information and make a payment for instant reservation confirmation',
      ja: '必要事項を入力し、お支払いを完了すると即時に予約確認が行われます',
      zh: '完善个人信息并完成付款即可即时确认您的客房预订',
      ar: 'أكمل بياناتك الشخصية وأتمم الدفع لتأكيد حجز غرفتك فورياً'
    },
    '1. Data Pemesan': { en: '1. Guest Details', ja: '1. お客様情報', zh: '1. 预订人信息', ar: '1. بيانات النزيل' },
    '2. Pembayaran': { en: '2. Payment', ja: '2. お支払い', zh: '2. 支付结算', ar: '2. الدفع' },
    'Informasi Tamu': { en: 'Guest Information', ja: 'ご宿泊者情報', zh: '入住客人信息', ar: 'معلومات النزيل' },
    'Tanggal Check-In': { en: 'Check-In Date', ja: 'チェックイン日', zh: '入住日期', ar: 'تاريخ الوصول' },
    'Tanggal Check-Out': { en: 'Check-Out Date', ja: 'チェックアウト日', zh: '退房日期', ar: 'تاريخ المغادرة' },
    'Tanggal Check-in': { en: 'Check-In Date', ja: 'チェックイン日', zh: '入住日期', ar: 'تاريخ الوصول' },
    'Tanggal Check-out': { en: 'Check-Out Date', ja: 'チェックアウト日', zh: '退房日期', ar: 'تاريخ المغادرة' },
    'Nama Lengkap Tamu': { en: 'Guest Full Name', ja: 'ご宿泊代表者名', zh: '住客姓名', ar: 'الاسم الكامل للنزيل' },
    'Nomor Telepon / WhatsApp': { en: 'Phone / WhatsApp', ja: '電話番号 / WhatsApp', zh: '电话 / WhatsApp', ar: 'رقم الهاتف / واتساب' },
    'Alamat Email': { en: 'Email Address', ja: 'メールアドレス', zh: '电子邮箱', ar: 'البريد الإلكتروني' },
    'Catatan Tambahan / Permintaan Khusus': { en: 'Special Requests / Notes', ja: 'ご要望・特記事項', zh: '特殊要求 / 备注', ar: 'طلبات خاصة / ملاحظات' },
    'Ringkasan Pemesanan': { en: 'Booking Summary', ja: 'ご予約概要', zh: '预订摘要', ar: 'ملخص الحجز' },
    'Durasi Menginap:': { en: 'Length of Stay:', ja: 'ご宿泊日数:', zh: '入住晚数:', ar: 'مدة الإقامة:' },
    'Harga per Malam:': { en: 'Rate per Night:', ja: '1泊あたりの料金:', zh: '每晚房价:', ar: 'السعر للّيلة:' },
    'Total Pembayaran:': { en: 'Total Amount:', ja: 'お支払い合計:', zh: '付款总额:', ar: 'إجمالي الدفع:' },
    'Total Biaya': { en: 'Total Price', ja: '合計金額', zh: '总计费用', ar: 'إجمالي التكلفة' },
    'Lanjut ke Pembayaran': { en: 'Continue to Payment', ja: 'お支払いへ進む', zh: '前往付款', ar: 'المتابعة إلى الدفع' },

    // --- Payment Step ---
    'Konfirmasi & Pembayaran': { en: 'Confirmation & Payment', ja: '確認とお支払い', zh: '确认并支付', ar: 'التأكيد والدفع' },
    'Pilih Metode Pembayaran': { en: 'Select Payment Method', ja: 'お支払い方法の選択', zh: '选择支付方式', ar: 'اختر طريقة الدفع' },
    'Metode Pembayaran': { en: 'Payment Method', ja: 'お支払い方法', zh: '支付方式', ar: 'طريقة الدفع' },
    'QRIS (Bayar Cepat via Scan QR)': { en: 'QRIS (Instant QR Scan)', ja: 'QRIS (QR即時決済)', zh: 'QRIS (快捷扫码支付)', ar: 'رمز الاستجابة السريع QRIS' },
    'Virtual Account (BCA / Mandiri)': { en: 'Virtual Account (Bank Transfer)', ja: 'バーチャル口座振込', zh: '银行虚拟账户转账', ar: 'حساب بنكي افتراضي (VA)' },
    'Kartu Kredit / Debit': { en: 'Credit / Debit Card', ja: 'クレジットカード / デビット', zh: '信用卡 / 借记卡', ar: 'بطاقة ائتمان / خصم' },
    'Bayar di Resepsionis': { en: 'Pay at Hotel Reception', ja: 'フロント現地決済', zh: '到店前台支付', ar: 'الدفع في الاستقبال' },
    'Bayar di Hotel': { en: 'Pay at Hotel', ja: 'ホテル現地払い', zh: '酒店到店支付', ar: 'الدفع في الفندق' },
    'Salin Nomor VA': { en: 'Copy VA Number', ja: '口座番号をコピー', zh: '复制账号', ar: 'نسخ رقم الحساب' },
    'Nomor Kartu': { en: 'Card Number', ja: 'カード番号', zh: '卡号', ar: 'رقم البطاقة' },
    'Masa Berlaku': { en: 'Expiry Date', ja: '有効期限', zh: '有效期', ar: 'تاريخ الصلاحية' },
    'Ubah Data': { en: 'Edit Information', ja: '情報を変更', zh: '修改信息', ar: 'تعديل البيانات' },
    'Konfirmasi & Bayar Sekarang': { en: 'Confirm & Pay Now', ja: '確認して今すぐ支払う', zh: '确认并立即支付', ar: 'تأكيد والدفع الآن' },

    // --- Success & Celebration Modal ---
    'Pembayaran Berhasil Dikonfirmasi!': { en: 'Payment Confirmed!', ja: 'お支払いが確認されました！', zh: '付款已确认！', ar: 'تم تأكيد الدفع بنجاح!' },
    'Pembayaran Berhasil!': { en: 'Payment Successful!', ja: 'お支払い完了！', zh: '支付成功！', ar: 'تم الدفع بنجاح!' },
    'ID Pembayaran:': { en: 'Payment ID:', ja: '決済番号:', zh: '支付编号:', ar: 'رقم المعاملة:' },
    'Metode:': { en: 'Method:', ja: '決済手段:', zh: '支付方式:', ar: 'الطريقة:' },
    'Total Bayar:': { en: 'Amount Paid:', ja: 'お支払い額:', zh: '支付金额:', ar: 'المبلغ المدفوع:' },
    'Menuju Riwayat Pemesanan': { en: 'Go to My Bookings', ja: '予約履歴へ進む', zh: '前往我的预订', ar: 'الانتقال إلى حجوزاتي' },

    // --- My Bookings & Alerts ---
    '✦ EARLY CHECK-IN PRIVILEGE ✦': { en: '✦ EARLY CHECK-IN PRIVILEGE ✦', ja: '✦ アーリーチェックイン特典 ✦', zh: '✦ 提前入住特权 ✦', ar: '✦ ميزة تسجيل الوصول المبكر ✦' },
    'Kamar Anda Sudah Selesai Disiapkan & Siap Huni!': {
      en: 'Your Room is Cleaned & Ready for Check-in!',
      ja: 'お部屋の準備が整いました。ご入室いただけます！',
      zh: '您的客房已清扫完毕，已可直接入住！',
      ar: 'غرفتك جاهزة ومعدة لاستقبالك الآن!'
    },
    'Fast-Track Key Handover': { en: 'Fast-Track Key Handover', ja: '鍵の優先お渡し', zh: '快捷钥匙通道', ar: 'استلام سريع للمفتاح' },
    'Lihat Simulasi Notifikasi WhatsApp': { en: 'View WhatsApp Notification', ja: 'WhatsApp通知を見る', zh: '查看 WhatsApp 模拟通知', ar: 'عرض إشعار واتساب' },
    '✦ PENGINGAT CHECK-OUT OTOMATIS (T-2 JAM) ✦': {
      en: '✦ AUTOMATIC CHECK-OUT REMINDER (T-2 HOURS) ✦',
      ja: '✦ チェックアウトのご案内 (2時間前) ✦',
      zh: '✦ 自动退房提醒 (提前2小时) ✦',
      ar: '✦ تذكير تلقائي بموعد المغادرة (قبل ساعتين) ✦'
    },
    'Batas Waktu Check-Out Pukul 12:00 WIB': {
      en: 'Check-out Deadline at 12:00',
      ja: 'チェックアウト期限 12:00',
      zh: '退房截止时间 12:00',
      ar: 'الموعد النهائي لتسجيل المغادرة الساعة 12:00'
    },
    'Siap Check-Out Tepat Waktu': { en: 'Ready to Check-out on Time', ja: '定刻チェックアウト可能', zh: '按时退房已准备', ar: 'جاهز للمغادرة في الوقت المحدد' },
    'Ajukan Late Check-Out': { en: 'Request Late Check-out', ja: 'レイトチェックアウト申請', zh: '申请延迟退房', ar: 'طلب تمديد موعد المغادرة' },
    'Butuh Bellboy / Porter': { en: 'Request Bellboy / Porter', ja: 'ベルボーイ・ポーター呼出', zh: '呼叫行李员 (Bellboy)', ar: 'طلب حامل الحقائب' },
    'Panggil Bellboy': { en: 'Call Bellboy', ja: 'ベルボーイを呼ぶ', zh: '呼叫行李员', ar: 'استدعاء حامل الحقائب' },

    // --- Status Badges ---
    'Menunggu': { en: 'Pending', ja: '承認待ち', zh: '等待审核', ar: 'قيد الانتظار' },
    'Menunggu ACC': { en: 'Awaiting ACC', ja: '承認待ち (ACC)', zh: '等待审核 (ACC)', ar: 'بانتظار الموافقة' },
    'Disetujui': { en: 'Approved', ja: '承認済み', zh: '已批准', ar: 'تمت الموافقة' },
    'Pesanan Dikonfirmasi': { en: 'Booking Confirmed', ja: '予約確定済み', zh: '预订已确认', ar: 'تم تأكيد الحجز' },
    'Pesanan Sudah Dikonfirmasi': { en: 'Booking Confirmed', ja: '予約確定済み', zh: '预订已确认', ar: 'تم تأكيد الحجز' },
    'Ditolak': { en: 'Rejected', ja: '却下', zh: '已拒绝', ar: 'مرفوض' },
    'Checked In': { en: 'Checked In', ja: 'チェックイン中', zh: '已入住', ar: 'تم تسجيل الوصول' },
    'Sedang Menginap': { en: 'In-House Guest', ja: 'ご滞在中', zh: '正在入住中', ar: 'مقيم حالياً' },
    'Checked Out': { en: 'Checked Out', ja: 'チェックアウト済', zh: '已退房', ar: 'تم تسجيل المغادرة' },
    'Menunggu Persetujuan Resepsionis': { en: 'Awaiting Receptionist Approval', ja: 'フロントデスクの承認待ち', zh: '等待前台审核批准', ar: 'في انتظار موافقة موظف الاستقبال' },
    'Kamar Siap Huni': { en: 'Room Ready', ja: '準備完了', zh: '客房就绪', ar: 'الغرفة جاهزة' },
    'Kamar Anda Sudah Siap!': { en: 'Your Room is Ready!', ja: 'お部屋の準備完了！', zh: '您的房间已备好！', ar: 'غرفتك جاهزة!' },

    // --- Action Buttons ---
    'Lihat E-Invoice Resmi': { en: 'View Official E-Invoice', ja: '公式電子請求書を見る', zh: '查看官方电子收据', ar: 'عرض الفاتورة الإلكترونية' },
    'Lihat Invoice': { en: 'View Invoice', ja: '請求書を見る', zh: '查看收据', ar: 'عرض الفاتورة' },
    'Check-In Online': { en: 'Online Check-In', ja: 'オンラインチェックイン', zh: '在线办理入住', ar: 'تسجيل وصول إلكتروني' },
    'Check In Sekarang': { en: 'Check-In Now', ja: '今すぐチェックイン', zh: '立即办理入住', ar: 'تسجيل الوصول الآن' },
    'Check-Out Sekarang': { en: 'Check-Out Now', ja: '今すぐチェックアウト', zh: '立即退房', ar: 'تسجيل المغادرة الآن' },
    'Check Out Sekarang': { en: 'Check-Out Now', ja: '今すぐチェックアウト', zh: '立即退房', ar: 'تسجيل المغادرة الآن' },
    'Setujui & Check In': { en: 'Approve & Check-In', ja: '承認＆チェックイン', zh: '批准并直接入住', ar: 'موافقة وتسجيل وصول' },
    'Beri Ulasan & Rating': { en: 'Write Review & Rating', ja: '口コミ・評価を投稿', zh: '发表评价与评分', ar: 'كتابة تقييم ومراجعة' },
    'Sudah Diulas': { en: 'Reviewed', ja: '口コミ投稿済', zh: '已评价', ar: 'تم التقييم' },
    'Lihat Ulasan di Kamar': { en: 'View Room Reviews', ja: '客室の口コミを見る', zh: '查看房间评价', ar: 'عرض تقييمات الغرفة' },
    'Kirim Ulasan': { en: 'Submit Review', ja: '口コミを送信', zh: '提交评价', ar: 'إرسال التقييم' },
    'Cetak / Simpan PDF': { en: 'Print / Save PDF', ja: '印刷 / PDF保存', zh: '打印 / 保存为PDF', ar: 'طباعة / حفظ كملف PDF' },

    // --- Receptionist Console ---
    'Front Desk & Operasional Harian': { en: 'Front Desk & Daily Operations', ja: 'フロントデスク日常業務', zh: '前台日常运营', ar: 'مكتب الاستقبال والعمليات اليومية' },
    'Booking Menunggu ACC': { en: 'Bookings Awaiting ACC', ja: '承認待ち予約 (ACC)', zh: '待确认审核预订 (ACC)', ar: 'حجوزات بانتظار الموافقة' },
    'Tamu Siap Check-In': { en: 'Guests Ready to Check-In', ja: 'チェックイン可能ゲスト', zh: '可办理入住客人', ar: 'نزلاء جاهزون لتسجيل الوصول' },
    'Tamu Sedang Menginap': { en: 'In-House Guests', ja: '滞在中ゲスト', zh: '在住房客', ar: 'نزلاء مقيمون حالياً' },
    'Kamar Perlu Dibersihkan': { en: 'Rooms Need Cleaning', ja: '清掃待ちの客室', zh: '待打扫客房', ar: 'غرف بحاجة إلى تنظيف' },
    'Mendekati Check-Out (< 2 Jam)': { en: 'Approaching Check-Out (< 2h)', ja: 'まもなく退房 (2時間以内)', zh: '即将退房房客 (2小时内)', ar: 'اقتراب موعد المغادرة (< ساعتين)' },
    'Status Kamar Real-Time': { en: 'Real-Time Room Status', ja: 'リアルタイム客室状況', zh: '实时房态', ar: 'حالة الغرف المباشرة' },
    'Konfirmasi Pemesanan': { en: 'Booking Confirmation', ja: '予約確認・承認', zh: '预订审核确认', ar: 'تأكيد الحجوزات' },
    'Proses Check-In Tamu': { en: 'Process Guest Check-In', ja: 'チェックイン受付', zh: '办理客人入住', ar: 'إجراءات تسجيل الوصول' },
    'Proses Check-Out': { en: 'Process Check-Out', ja: 'チェックアウト受付', zh: '办理退房手续', ar: 'إجراءات تسجيل المغادرة' },
    'Katalog Kamar': { en: 'Room Catalog', ja: '客室カタログ', zh: '客房名录', ar: 'دليل الغرف' },
    'Semua Pemesanan': { en: 'All Reservations', ja: 'すべての予約', zh: '所有预订', ar: 'جميع الحجوزات' },
    'Pemesanan Masuk Perlu Tindakan (Pending)': {
      en: 'Incoming Bookings Requiring Action (Pending)',
      ja: '対応が必要な新規予約 (承認待ち)',
      zh: '待处理新预订订单 (Pending)',
      ar: 'طلبات الحجز الواردة التي تحتاج لإجراء'
    },
    'Tamu Siap Check-In (Telah Disetujui / ACC)': {
      en: 'Guests Ready for Check-In (Approved / ACC)',
      ja: 'チェックイン待ちゲスト (承認済 / ACC)',
      zh: '待办理入住客人 (已批准 / ACC)',
      ar: 'النزلاء الجاهزون لتسجيل الوصول (تمت الموافقة)'
    },
    'Setujui (ACC)': { en: 'Approve (ACC)', ja: '承認する (ACC)', zh: '审核通过 (ACC)', ar: 'موافقة (ACC)' },
    'Tolak': { en: 'Reject', ja: '却下する', zh: '拒绝', ar: 'رفض' },
    'Tandai Kamar Siap Huni': { en: 'Mark Room Ready', ja: '部屋準備完了にする', zh: '标记房间已就绪', ar: 'تعيين الغرفة جاهزة' },
    'Kirim Ulang Notifikasi Siap': { en: 'Resend Ready Notice', ja: '準備完了通知を再送', zh: '重新发送就绪通知', ar: 'إعادة إرسال إشعار الجاهزية' },
    'Proses Check-In': { en: 'Process Check-In', ja: 'チェックイン処理', zh: '办理入住', ar: 'معالجة تسجيل الوصول' },

    // --- Placeholders ---
    'Masukkan nama lengkap tamu': { en: 'Enter guest full name', ja: 'ご宿泊代表者氏名を入力', zh: '请输入入住人姓名', ar: 'أدخل الاسم الكامل للنزيل' },
    'Permintaan khusus, misalnya: minta kamar lantai atas': { en: 'Special requests, e.g. high floor room', ja: 'ご要望（例：高層階希望）', zh: '特殊要求，例如：高楼层房间', ar: 'طلبات خاصة، مثلاً: غرفة في طابق علوي' },
    'Cari tipe kamar atau fasilitas (contoh: Deluxe, Jacuzzi, Balcony)...': { en: 'Search room types or amenities (e.g. Deluxe, Jacuzzi, Balcony)...', ja: '部屋タイプや設備で検索...', zh: '搜索房型或设施...', ar: 'ابحث عن نوع الغرفة أو المرافق...' },
    'Alasan penolakan...': { en: 'Reason for rejection...', ja: '却下の理由...', zh: '拒绝原因...', ar: 'سبب الرفض...' },
    // --- Admin Check-Out Page ---
    'Proses Check-Out — Admin Orven': {
      en: 'Check-Out Process — Orven Admin',
      ja: 'チェックアウト処理 — ホテルク管理',
      zh: '办理退房 — Orven 管理端',
      ar: 'إجراءات تسجيل المغادرة — إدارة هوتيلكو'
    },
    '✦ KEBERANGKATAN TAMU ✦': {
      en: '✦ GUEST DEPARTURE ✦',
      ja: '✦ ご出発ゲスト ✦',
      zh: '✦ 客人退房离店 ✦',
      ar: '✦ مغادرة النزلاء ✦'
    },
    'Proses Check-Out Tamu': {
      en: 'Guest Check-Out Process',
      ja: 'ゲスト チェックアウト処理',
      zh: '办理客人退房手续',
      ar: 'إجراءات تسجيل مغادرة النزيل'
    },
    'Daftar tamu yang sedang aktif menginap (Checked-In) dan siap menyelesaikan proses kepulangan / check-out': {
      en: 'List of in-house guests (Checked-In) ready to complete check-out and departure',
      ja: '現在滞在中（チェックイン済）で退房手続きを行うゲストの一覧',
      zh: '当前在住（已入住）且准备办理退房离店手续的客人名单',
      ar: 'قائمة النزلاء المقيمين حالياً والجاهزين لإتمام إجراءات المغادرة'
    },
    'Memuat daftar tamu menginap...': {
      en: 'Loading in-house guests...',
      ja: '滞在中のゲストを読み込み中...',
      zh: '正在加载在住房客名单...',
      ar: 'جاري تحميل النزلاء المقيمين...'
    },
    'Tidak ada tamu yang sedang menginap': {
      en: 'No guests currently in-house',
      ja: '現在滞在中のゲストはいません',
      zh: '当前暂无在住房客',
      ar: 'لا يوجد نزلاء مقيمون حالياً'
    },
    'Semua tamu sudah check-out.': {
      en: 'All guests have checked out.',
      ja: 'すべてのゲストがチェックアウトしました。',
      zh: '所有客人均已退房离店。',
      ar: 'جميع النزلاء قد أتموا تسجيل المغادرة.'
    },
    'Tamu Siap Tepat Waktu': {
      en: 'Guest Ready On Time',
      ja: '定刻チェックアウト可能',
      zh: '客人已准时就绪',
      ar: 'النزيل جاهز في الوقت المحدد'
    },

    // --- Admin Check-In Page ---
    'Proses Check-In — Admin Orven': {
      en: 'Check-In Process — Orven Admin',
      ja: 'チェックイン処理 — ホテルク管理',
      zh: '办理入住 — Orven 管理端',
      ar: 'إجراءات تسجيل الوصول — إدارة هوتيلكو'
    },
    '✦ KEDATANGAN TAMU ✦': {
      en: '✦ GUEST ARRIVALS ✦',
      ja: '✦ ご到着ゲスト ✦',
      zh: '✦ 客人到店入住 ✦',
      ar: '✦ وصول النزلاء ✦'
    },
    'Proses Check-In Tamu': {
      en: 'Guest Check-In Process',
      ja: 'ゲスト チェックイン処理',
      zh: '办理客人入住手续',
      ar: 'إجراءات تسجيل وصول النزيل'
    },
    'Daftar tamu dengan reservasi yang telah disetujui (Approved) dan siap melakukan check-in fisik di hotel': {
      en: 'List of guests with approved reservations ready for physical check-in at the hotel',
      ja: '承認済みでホテル現地でのチェックインが可能なゲストの一覧',
      zh: '预订已获批准且准备在酒店前台办理入住的客人名单',
      ar: 'قائمة النزلاء ذوي الحجوزات المعتمدة والجاهزين لتسجيل الوصول في الفندق'
    },
    'Memuat daftar tamu siap check-in...': {
      en: 'Loading guests ready for check-in...',
      ja: 'チェックイン可能ゲストを読み込み中...',
      zh: '正在加载准备入住客人名单...',
      ar: 'جاري تحميل النزلاء الجاهزين للوصول...'
    },
    'Tidak ada tamu yang siap check-in': {
      en: 'No guests ready for check-in',
      ja: 'チェックイン可能なゲストはいません',
      zh: '暂无准备入住的客人',
      ar: 'لا يوجد نزلاء جاهزون لتسجيل الوصول'
    },
    'Semua reservasi yang disetujui sudah melakukan check-in atau belum ada yang disetujui.': {
      en: 'All approved reservations have already checked in or none are approved yet.',
      ja: 'すべての承認済み予約はチェックイン済みか、承認待ちです。',
      zh: '所有获批预订均已办理入住或暂无获批预订。',
      ar: 'جميع الحجوزات المعتمدة تم تسجيل وصولها أو لا يوجد أي حجز معتمد بعد.'
    },

    // --- Admin Reservations Page ---
    'Kelola Reservasi — Admin Orven': {
      en: 'Manage Bookings — Orven Admin',
      ja: '予約管理 — ホテルク管理',
      zh: '预订管理 — Orven 管理端',
      ar: 'إدارة الحجوزات — إدارة هوتيلكو'
    },
    '✦ MANAJEMEN RESERVASI ✦': {
      en: '✦ RESERVATION MANAGEMENT ✦',
      ja: '✦ 予約管理 ✦',
      zh: '✦ 预订管理 ✦',
      ar: '✦ إدارة الحجوزات ✦'
    },
    'Daftar Semua Reservasi': {
      en: 'All Reservations List',
      ja: '全予約一覧',
      zh: '所有预订列表',
      ar: 'قائمة جميع الحجوزات'
    },
    'Tinjau detail permohonan reservasi tamu, setujui (ACC), atau tolak dengan alasan': {
      en: 'Review guest booking requests, approve (ACC), or reject with reasons',
      ja: 'ゲストの予約リクエストを確認し、承認(ACC)または理由付きで却下します',
      zh: '查看客人预订申请详情，审核通过(ACC)或附理由拒绝',
      ar: 'مراجعة تفاصيل طلبات الحجز، الموافقة عليها أو رفضها مع ذكر السبب'
    },
    'Semua Status': {
      en: 'All Statuses',
      ja: 'すべてのステータス',
      zh: '所有状态',
      ar: 'جميع الحالات'
    },
    'Menunggu (Pending)': {
      en: 'Pending',
      ja: '承認待ち (Pending)',
      zh: '待审核 (Pending)',
      ar: 'قيد الانتظار'
    },
    'Disetujui (Approved)': {
      en: 'Approved',
      ja: '承認済み (Approved)',
      zh: '已批准 (Approved)',
      ar: 'تمت الموافقة'
    },
    'Memuat data reservasi...': {
      en: 'Loading reservations...',
      ja: '予約データを読み込み中...',
      zh: '正在加载预订数据...',
      ar: 'جاري تحميل بيانات الحجوزات...'
    },
    'Tidak ada reservasi ditemukan': {
      en: 'No reservations found',
      ja: '予約が見つかりませんでした',
      zh: '未找到预订记录',
      ar: 'لم يتم العثور على أي حجوزات'
    },
    'Belum ada data reservasi untuk filter ini.': {
      en: 'No reservation data for this filter.',
      ja: 'このフィルターに該当する予約データはありません。',
      zh: '此筛选条件下暂无预订数据。',
      ar: 'لا توجد بيانات حجوزات لهذا التصنيف.'
    },

    // --- Receptionist Dashboard & Rooms Status ---
    '✦ FRONT DESK & OPERASIONAL HARIAN ✦': {
      en: '✦ FRONT DESK & DAILY OPERATIONS ✦',
      ja: '✦ フロントデスク日常業務 ✦',
      zh: '✦ 前台日常运营 ✦',
      ar: '✦ مكتب الاستقبال والعمليات اليومية ✦'
    },
    'Kelola pemesanan kamar tamu yang masuk, pantau status kesiapan kamar, dan layani proses check-in / check-out': {
      en: 'Manage incoming guest bookings, monitor room readiness, and handle check-in / check-out',
      ja: '新規予約の管理、客室清掃状況の確認、チェックイン・退房業務を処理します',
      zh: '管理新进客房预订，监控客房准备就绪状态，并处理入住和退房手续',
      ar: 'إدارة طلبات الحجز الواردة، ومتابعة جاهزية الغرف، وخدمة إجراءات تسجيل الوصول والمغادرة'
    },
    '✦ MONITORING KEBERSIHAN & HUNIAN ✦': {
      en: '✦ ROOM CLEANLINESS & OCCUPANCY MONITOR ✦',
      ja: '✦ 清掃状況＆客室稼働モニタリング ✦',
      zh: '✦ 客房清洁与入住监控 ✦',
      ar: '✦ مراقبة نظافة وإشغال الغرف ✦'
    },
    'Denah Status Kamar Real-Time': {
      en: 'Real-Time Room Status Floor Plan',
      ja: 'リアルタイム客室フロアマップ',
      zh: '实时客房状态平面图',
      ar: 'مخطط حالة الغرف المباشر'
    },
    'Pantau kamar yang kosong, sedang terisi tamu, dalam proses pembersihan oleh tim housekeeping, atau sedang perbaikan': {
      en: 'Monitor vacant rooms, occupied rooms, rooms being cleaned by housekeeping, or under maintenance',
      ja: '空室、滞在中、ハウスキーピング清掃中、修繕中の客室をリアルタイムで把握',
      zh: '监控空房、在住房客、保洁打扫中或维修中的客房状态',
      ar: 'مراقبة الغرف الشاغرة، والمشغولة بالنزلاء، وتلك قيد التنظيف أو الصيانة'
    },
    '🟢 Siap Huni (Available)': {
      en: '🟢 Ready (Available)',
      ja: '🟢 準備完了 (Available)',
      zh: '🟢 准备就绪 (Available)',
      ar: '🟢 جاهز ومتاح (Available)'
    },
    '🔴 Terisi Tamu (Occupied)': {
      en: '🔴 Occupied',
      ja: '🔴 滞在中 (Occupied)',
      zh: '🔴 客人入住中 (Occupied)',
      ar: '🔴 مشغولة بنزيل (Occupied)'
    },
    '🟡 Dibersihkan (Cleaning)': {
      en: '🟡 Cleaning',
      ja: '🟡 清掃中 (Cleaning)',
      zh: '🟡 打扫清洁中 (Cleaning)',
      ar: '🟡 قيد التنظيف (Cleaning)'
    },
    '⚫ Perbaikan (Maintenance)': {
      en: '⚫ Maintenance',
      ja: '⚫ メンテナンス中 (Maintenance)',
      zh: '⚫ 维修维护中 (Maintenance)',
      ar: '⚫ قيد الصيانة (Maintenance)'
    },

    // --- User Reservations Header ---
    '✦ AKTIVITAS ANDA ✦': {
      en: '✦ YOUR ACTIVITY ✦',
      ja: '✦ ご利用履歴 ✦',
      zh: '✦ 您的活动 ✦',
      ar: '✦ نشاطك ✦'
    },
    'Pantau status pengajuan reservasi, jadwal check-in, dan berikan ulasan setelah masa menginap selesai': {
      en: 'Track your booking approval status, check-in schedule, and leave a review after your stay',
      ja: '予約申請の進捗、チェックイン時間を確認し、滞在完了後に口コミを投稿できます',
      zh: '追踪预订审核进度与入住日程，并在退房后发表真实入住评价',
      ar: 'تابع حالة الموافقة على الحجز وموعد الوصول، وشارك تقييمك بعد إتمام الإقامة'
    },

    // --- Admin General Headers ---
    '✦ EXECUTIVE DASHBOARD ✦': {
      en: '✦ EXECUTIVE DASHBOARD ✦',
      ja: '✦ エグゼクティブ・ダッシュボード ✦',
      zh: '✦ 综合管理仪表盘 ✦',
      ar: '✦ لوحة الإدارة التنفيذية ✦'
    },
    'Laporan & Statistik Keseluruhan': {
      en: 'Overall Reports & Analytics',
      ja: '全体レポート＆統計',
      zh: '全面报表与数据分析',
      ar: 'التقارير والإحصائيات الشاملة'
    },
    'Akses penuh ke performa finansial, tingkat okupansi hunian, dan rekapitulasi bisnis Orven': {
      en: 'Full access to financial performance, occupancy rates, and Orven business summaries',
      ja: '売上推移、客室稼働率、ホテル事業全体の総括データへアクセス',
      zh: '全面了解酒店财务收益表现、客房入住率以及业务统计汇总',
      ar: 'وصول كامل للأداء المالي، معدلات إشغال الغرف، وملخصات أعمال هوتيلكو'
    },
    'Total Pendapatan Terwujud': {
      en: 'Total Realized Revenue',
      ja: '総売上高',
      zh: '已实现总收入',
      ar: 'إجمالي الإيرادات المحققة'
    },
    'Tingkat Okupansi Kamar': {
      en: 'Room Occupancy Rate',
      ja: '客室稼働率',
      zh: '客房入住率',
      ar: 'معدل إشغال الغرف'
    },
    '✦ MANAJEMEN ASET KAMAR ✦': {
      en: '✦ ROOM ASSET MANAGEMENT ✦',
      ja: '✦ 客室アセット管理 ✦',
      zh: '✦ 客房资产管理 ✦',
      ar: '✦ إدارة أصول الغرف ✦'
    },
    'Kelola Data Kamar Hotel': {
      en: 'Manage Hotel Rooms',
      ja: 'ホテル客室データの管理',
      zh: '管理酒店客房数据',
      ar: 'إدارة بيانات غرف الفندق'
    },
    'Tambah tipe kamar baru, sesuaikan tarif harga menginap, perbarui foto interior/POV, dan kelola kapasitas unit': {
      en: 'Add room types, adjust rates, update photos, and manage capacity',
      ja: '客室タイプの追加、宿泊料金の改定、写真の更新、室数の管理を行います',
      zh: '新增房型、调整房价、更新室内照片并管理客房配额',
      ar: 'إضافة أنواع غرف جديدة، وتعديل الأسعار، وتحديث الصور وإدارة السعة'
    },
    '✦ MANAJEMEN PENGGUNA ✦': {
      en: '✦ USER MANAGEMENT ✦',
      ja: '✦ ユーザー管理 ✦',
      zh: '✦ 用户账号管理 ✦',
      ar: '✦ إدارة المستخدمين ✦'
    },
    'Kelola Pengguna & Staf Hotel': {
      en: 'Manage Users & Hotel Staff',
      ja: 'ユーザー＆スタッフ管理',
      zh: '管理用户与酒店员工',
      ar: 'إدارة المستخدمين وموظفي الفندق'
    },
    'Buat akun baru untuk staf resepsionis, atur peranan hak akses (RBAC), dan kelola data akun pengguna': {
      en: 'Create accounts for receptionist staff, configure role permissions (RBAC), and manage users',
      ja: 'フロントスタッフの新規アカウント作成、アクセス権限(RBAC)の設定、ユーザー情報の管理',
      zh: '为前台员工创建新账号，配置基于角色的访问权限(RBAC)以及管理用户数据',
      ar: 'إنشاء حسابات جديدة لموظفي الاستقبال، وضبط صلاحيات الأدوار، وإدارة حسابات المستخدمين'
    },
    '✦ KONFIGURASI SISTEM ✦': {
      en: '✦ SYSTEM CONFIGURATION ✦',
      ja: '✦ システム設定 ✦',
      zh: '✦ 系统配置 ✦',
      ar: '✦ إعدادات النظام ✦'
    },
    'Pengaturan Umum Website': {
      en: 'General Website Settings',
      ja: 'ウェブサイト全般設定',
      zh: '网站常规全局设置',
      ar: 'إعدادات الموقع العامة'
    },
    'Atur identitas properti hotel, kontak layanan pelanggan, banner promosi publik, serta jam operasional dan kebijakan check-in/out': {
      en: 'Configure hotel branding, customer support contacts, promo banners, operational hours, and check-in/out policies',
      ja: 'ホテル情報、サポート窓口、プロモーション告知、営業時間やチェックイン規約を設定',
      zh: '配置酒店品牌标识、客服联系方式、宣传横幅以及营业时间与退房政策',
      ar: 'ضبط هوية الفندق، وجهات اتصال خدمة العملاء، ولافتات العروض، وساعات العمل وسياسات الوصول والمغادرة'
    },

    // --- Nav Links and Topbar Items ---
    'Check-In Tamu': {
      en: 'Guest Check-In',
      ja: 'チェックイン受付',
      zh: '客人入住',
      ar: 'تسجيل وصول النزلاء'
    },
    'Check-Out Tamu': {
      en: 'Guest Check-Out',
      ja: 'チェックアウト受付',
      zh: '客人退房',
      ar: 'تسجيل مغادرة النزلاء'
    },
    'Kelola Reservasi': {
      en: 'Manage Bookings',
      ja: '予約管理',
      zh: '管理预订',
      ar: 'إدارة الحجوزات'
    },
    'Status Kamar': {
      en: 'Room Status',
      ja: '客室状況',
      zh: '客房状态',
      ar: 'حالة الغرف'
    },
    'Katalog Kamar': {
      en: 'Room Catalog',
      ja: '客室カタログ',
      zh: '客房目录',
      ar: 'كتالوج الغرف'
    },
    'Operasional': {
      en: 'Operations',
      ja: 'オペレーション',
      zh: '运营操作',
      ar: 'العمليات'
    },
    'Konfirmasi Booking': {
      en: 'Booking Confirmation',
      ja: '予約確認',
      zh: '预订确认',
      ar: 'تأكيد الحجز'
    },
    'Orven Yogyakarta Management': {
      en: 'Orven Yogyakarta Management',
      ja: 'ホテルク・ジョグジャカルタ 運営',
      zh: 'Orven 日惹酒店管理',
      ar: 'إدارة هوتيلكو يوجياكارتا'
    },
    'Front Desk Check-Out': {
      en: 'Front Desk Check-Out',
      ja: 'フロント チェックアウト',
      zh: '前台退房',
      ar: 'مكتب مغادرة النزلاء'
    },
    'Front Desk Check-In': {
      en: 'Front Desk Check-In',
      ja: 'フロント チェックイン',
      zh: '前台入住',
      ar: 'مكتب تسجيل الوصول'
    },
    'Front Desk Reservations': {
      en: 'Front Desk Reservations',
      ja: 'フロント 予約管理',
      zh: '前台预订',
      ar: 'مكتب الحجوزات'
    },
    'Resepsionis & Front Desk': {
      en: 'Receptionist & Front Desk',
      ja: '受付＆フロントデスク',
      zh: '接待与前台',
      ar: 'الاستقبال والمكتب الأمامي'
    },
    'ADMIN CONSOLE': {
      en: 'ADMIN CONSOLE',
      ja: '管理者コンソール',
      zh: '管理控制台',
      ar: 'لوحة تحكم المسؤول'
    },
    'FRONT DESK OPERATIONAL': {
      en: 'FRONT DESK OPERATIONAL',
      ja: 'フロント運用管理',
      zh: '前台运营',
      ar: 'تشغيل مكتب الاستقبال'
    }
  };

  // Dynamic Pattern Translators
  const REGEX_RULES = [
    {
      re: /^ID Reservasi:\s*([A-Za-z0-9_-]+)/i,
      fmt: {
        en: (m) => `Booking ID: ${m[1]}`,
        ja: (m) => `予約番号: ${m[1]}`,
        zh: (m) => `预订编号: ${m[1]}`,
        ar: (m) => `رقم الحجز: ${m[1]}`
      }
    },
    {
      re: /^Dibuat:\s*(.+)$/i,
      fmt: {
        en: (m) => `Created: ${m[1]}`,
        ja: (m) => `予約日時: ${m[1]}`,
        zh: (m) => `创建时间: ${m[1]}`,
        ar: (m) => `تاريخ الإنشاء: ${m[1]}`
      }
    },
    {
      re: /^(\d+)\s*malam$/i,
      fmt: {
        en: (m) => `${m[1]} night${Number(m[1]) > 1 ? 's' : ''}`,
        ja: (m) => `${m[1]} 泊`,
        zh: (m) => `${m[1]} 晚`,
        ar: (m) => `${m[1]} ليلة`
      }
    },
    {
      re: /^(.+)\s*\((\d+)\s*malam\)$/i,
      fmt: {
        en: (m) => `${m[1]} (${m[2]} night${Number(m[2]) > 1 ? 's' : ''})`,
        ja: (m) => `${m[1]} (${m[2]} 泊)`,
        zh: (m) => `${m[1]} (${m[2]} 晚)`,
        ar: (m) => `${m[1]} (${m[2]} ليلة)`
      }
    },
    {
      re: /^Late Check-out \((.+)\)$/i,
      fmt: {
        en: (m) => `Late Check-out (${m[1]})`,
        ja: (m) => `レイトチェックアウト (${m[1]})`,
        zh: (m) => `延迟退房 (${m[1]})`,
        ar: (m) => `تأخير المغادرة (${m[1]})`
      }
    },
    {
      re: /^Bellboy \((.+)\)$/i,
      fmt: {
        en: (m) => `Bellboy (${m[1]})`,
        ja: (m) => `ベルボーイ (${m[1]})`,
        zh: (m) => `行李员 (${m[1]})`,
        ar: (m) => `حامل الحقائب (${m[1]})`
      }
    },
    {
      re: /^Batas Check-Out:\s*(.+)$/i,
      fmt: {
        en: (m) => `Check-Out Deadline: ${m[1]}`,
        ja: (m) => `チェックアウト期限: ${m[1]}`,
        zh: (m) => `退房截止时间: ${m[1]}`,
        ar: (m) => `الموعد النهائي لتسجيل المغادرة: ${m[1]}`
      }
    }
  ];

  // Global translate helper
  window.t = function(text, lang) {
    if (!text || typeof text !== 'string') return text;
    const targetLang = lang || currentLang;
    if (targetLang === 'id') return text;

    const trimmed = text.trim();
    if (DICT[trimmed] && DICT[trimmed][targetLang]) {
      return DICT[trimmed][targetLang];
    }

    for (const rule of REGEX_RULES) {
      const match = trimmed.match(rule.re);
      if (match && rule.fmt[targetLang]) {
        return rule.fmt[targetLang](match);
      }
    }

    return text;
  };

  // Translate a single DOM element and its children
  function translateElementTree(el, lang) {
    if (!el || el.nodeType !== 1) return;

    // Skip elements marked explicitly as notranslate
    if (el.classList && (el.classList.contains('notranslate') || (el.closest && el.closest('.notranslate')))) {
      return;
    }

    // 0. Semantic HTML-based translation via data-i18n-html
    const i18nHtmlKey = el.getAttribute ? el.getAttribute('data-i18n-html') : null;
    if (i18nHtmlKey) {
      if (!el._origHtml) el._origHtml = el.innerHTML;
      if (lang === 'id') {
        el.innerHTML = el._origHtml;
      } else if (HTML_TRANSLATIONS[lang] && HTML_TRANSLATIONS[lang][i18nHtmlKey]) {
        el.innerHTML = HTML_TRANSLATIONS[lang][i18nHtmlKey];
      }
      return;
    }

    // 1. Semantic Key-based translation via data-i18n
    const i18nKey = el.getAttribute ? el.getAttribute('data-i18n') : null;
    if (i18nKey) {
      if (lang === 'id') {
        if (el.dataset && el.dataset.origText) el.textContent = el.dataset.origText;
      } else if (KEY_TRANSLATIONS[lang] && KEY_TRANSLATIONS[lang][i18nKey]) {
        if (el.dataset && !el.dataset.origText) el.dataset.origText = el.textContent.trim();
        el.textContent = KEY_TRANSLATIONS[lang][i18nKey];
      }
    }

    // 2. Translate Placeholder
    if (el.hasAttribute && el.hasAttribute('placeholder')) {
      if (el.dataset && !el.dataset.origPlaceholder) {
        el.dataset.origPlaceholder = el.getAttribute('placeholder');
      }
      const origPh = el.dataset ? el.dataset.origPlaceholder : el.getAttribute('placeholder');
      if (lang === 'id') {
        el.setAttribute('placeholder', origPh);
      } else if (DICT[origPh] && DICT[origPh][lang]) {
        el.setAttribute('placeholder', DICT[origPh][lang]);
      }
    }

    // 3. Direct Text Node translation (preserving icons, SVGs, child tags)
    if (!el.childNodes) return;
    for (let i = 0; i < el.childNodes.length; i++) {
      const child = el.childNodes[i];
      if (child.nodeType === 3) { // 3 === Node.TEXT_NODE
        const rawText = child.nodeValue;
        const trimmed = rawText.trim();
        if (trimmed.length > 0) {
          if (!child._origValue) {
            child._origValue = rawText;
          }
          const orig = child._origValue;
          const origTrimmed = orig.trim();

          if (lang === 'id') {
            child.nodeValue = orig;
          } else {
            let translated = null;
            if (DICT[origTrimmed] && DICT[origTrimmed][lang]) {
              translated = DICT[origTrimmed][lang];
            } else {
              for (const rule of REGEX_RULES) {
                const match = origTrimmed.match(rule.re);
                if (match && rule.fmt[lang]) {
                  translated = rule.fmt[lang](match);
                  break;
                }
              }
            }

            if (translated) {
              const leadingSpace = orig.match(/^\s*/)[0];
              const trailingSpace = orig.match(/\s*$/)[0];
              child.nodeValue = leadingSpace + translated + trailingSpace;
            }
          }
        }
      } else if (child.nodeType === 1) { // 1 === Node.ELEMENT_NODE
        translateElementTree(child, lang);
      }
    }
  }

  // Apply translations to entire document
  let isTranslating = false;
  function applyAllTranslations(lang) {
    if (isTranslating) return;
    isTranslating = true;

    try {
      // Document direction for Arabic
      if (lang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
      } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', lang);
      }

      // Translate title
      if (document.title) {
        if (!document._origTitle) document._origTitle = document.title;
        if (lang === 'id') {
          document.title = document._origTitle;
        } else {
          document.title = window.t(document._origTitle, lang);
        }
      }

      if (document.body) {
        translateElementTree(document.body, lang);
      }
    } finally {
      isTranslating = false;
    }
  }

  window.applyAllTranslations = applyAllTranslations;


  // Set Language Action
  window.setLanguage = function(langCode) {
    if (!LANGUAGES[langCode]) return;
    currentLang = langCode;
    localStorage.setItem('hotelku_lang', langCode);

    updateLanguageUI();
    applyAllTranslations(langCode);

    if (typeof window.updateRealtimeClock === 'function') {
      try { window.updateRealtimeClock(); } catch(e) {}
    }

    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: langCode } }));
  };

  // Synchronize dropdown state with currentLang
  function updateLanguageUI() {
    const lang = LANGUAGES[currentLang] || LANGUAGES['id'];
    document.querySelectorAll('.current-flag-el').forEach(el => {
      el.innerHTML = lang.flagSvg;
    });
    document.querySelectorAll('.lang-select-item').forEach(item => {
      const isActive = item.dataset.lang === currentLang;
      item.classList.toggle('active', isActive);
      const checkIcon = item.querySelector('.fa-check');
      if (isActive && !checkIcon) {
        const i = document.createElement('i');
        i.className = 'fas fa-check';
        i.style.cssText = 'font-size:0.65rem; color:#fbbf24;';
        item.appendChild(i);
      } else if (!isActive && checkIcon) {
        checkIcon.remove();
      }
    });
  }

  // Standalone Switcher Widget Builder
  function buildSwitcherWidget(uniqueId) {
    const currentLangObj = LANGUAGES[currentLang] || LANGUAGES['id'];
    const widget = document.createElement('div');
    widget.id = `hotelkuLangWidget_${uniqueId}`;
    widget.className = 'lang-curr-wrapper notranslate';
    widget.setAttribute('dir', 'ltr');

    const langItemsHTML = Object.values(LANGUAGES).map(l => `
      <div class="topbar-dropdown-item lang-select-item ${l.code === currentLang ? 'active' : ''}" data-lang="${l.code}">
        <div class="item-left">
          <span class="lang-flag-circle">${l.flagSvg}</span>
          <span>${l.name}</span>
        </div>
        ${l.code === currentLang ? '<i class="fas fa-check" style="font-size:0.65rem; color:#fbbf24;"></i>' : ''}
      </div>
    `).join('');

    widget.innerHTML = `
      <div class="topbar-dropdown" id="dropdown_${uniqueId}">
        <button type="button" class="topbar-dropdown-toggle" id="toggle_${uniqueId}" title="Select Language / Ganti Bahasa" aria-label="Select Language">
          <span class="lang-flag-circle current-flag-el">
            ${currentLangObj.flagSvg}
          </span>
          <i class="fas fa-chevron-down chevron"></i>
        </button>
        <div class="topbar-dropdown-menu" id="menu_${uniqueId}">
          <div style="padding: 4px 10px 6px; font-size: 0.68rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 4px;">
            Language / Bahasa
          </div>
          ${langItemsHTML}
        </div>
      </div>
    `;

    const dropdown = widget.querySelector(`#dropdown_${uniqueId}`);
    const toggleBtn = widget.querySelector(`#toggle_${uniqueId}`);

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.topbar-dropdown.active').forEach(d => {
          if (d !== dropdown) d.classList.remove('active');
        });
        if (dropdown) dropdown.classList.toggle('active');
      });
    }

    widget.querySelectorAll('.lang-select-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        window.setLanguage(item.dataset.lang);
        if (dropdown) dropdown.classList.remove('active');
      });
    });

    return widget;
  }

  // Dismiss dropdown on click outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.topbar-dropdown.active').forEach(d => {
      d.classList.remove('active');
    });
  });

  // Mount Switcher Widget into page navbar / topbar
  function mountSwitcherWidget() {
    const navActions = document.querySelector('.nav-actions');
    if (navActions && !document.getElementById('hotelkuLangWidget_navbar')) {
      const navWidget = buildSwitcherWidget('navbar');
      navActions.prepend(navWidget);
    }

    const topbarRight = document.querySelector('.topbar-right');
    if (topbarRight && !document.getElementById('hotelkuLangWidget_topbar') && !topbarRight.closest('.topbar-actions-floating')) {
      const topbarWidget = buildSwitcherWidget('topbar');
      topbarRight.appendChild(topbarWidget);
    }

    const floatingBar = document.querySelector('.topbar-actions-floating .topbar-right');
    if (floatingBar && !document.getElementById('hotelkuLangWidget_floating')) {
      const floatWidget = buildSwitcherWidget('floating');
      floatingBar.appendChild(floatWidget);
    }

    if (!document.querySelector('.lang-curr-wrapper')) {
      if (!document.body) return;
      let fallback = document.getElementById('hotelkuFloatingLangContainer');
      if (!fallback) {
        fallback = document.createElement('div');
        fallback.id = 'hotelkuFloatingLangContainer';
        fallback.style.cssText = 'position: fixed; top: 16px; right: 16px; z-index: 9999; display: inline-flex; align-items: center;';
        document.body.appendChild(fallback);
      }
      if (!fallback.querySelector('.lang-curr-wrapper')) {
        const fallbackWidget = buildSwitcherWidget('fallback');
        fallback.appendChild(fallbackWidget);
      }
    }
  }

  // Setup MutationObserver to translate dynamically rendered content (Fetch / AJAX)
  let mutationTimeout = null;
  function setupMutationObserver() {
    if (!window.MutationObserver || !document.body) return;

    const observer = new MutationObserver((mutations) => {
      if (isTranslating) return;
      if (currentLang === 'id') return; // default is Indonesian

      let shouldTranslate = false;
      for (const m of mutations) {
        if (m.type === 'childList' && m.addedNodes.length > 0) {
          for (const node of m.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('notranslate') && !node.closest('.notranslate')) {
              shouldTranslate = true;
              break;
            }
          }
        }
        if (shouldTranslate) break;
      }

      if (shouldTranslate) {
        clearTimeout(mutationTimeout);
        mutationTimeout = setTimeout(() => {
          applyAllTranslations(currentLang);
        }, 80);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // RTL support styles injection
  function injectRtlStyles() {
    if (document.getElementById('hotelku-rtl-style')) return;
    const style = document.createElement('style');
    style.id = 'hotelku-rtl-style';
    style.textContent = `
      [dir="rtl"] { text-align: right; }
      [dir="rtl"] .topbar-clock-badge,
      [dir="rtl"] .realtime-clock,
      [dir="rtl"] .realtime-date,
      [dir="rtl"] .lang-curr-wrapper,
      [dir="rtl"] .notranslate {
        direction: ltr !important;
        text-align: left !important;
      }
      [dir="rtl"] .nav-container { flex-direction: row-reverse; }
      [dir="rtl"] .nav-actions { margin-right: auto; margin-left: 0; }
      [dir="rtl"] .hotel-topbar .topbar-container { flex-direction: row-reverse; }
    `;
    document.head.appendChild(style);
  }

  // Initialize
  function init() {
    injectRtlStyles();
    mountSwitcherWidget();
    updateLanguageUI();
    if (currentLang !== 'id') {
      applyAllTranslations(currentLang);
    }
    setupMutationObserver();
    if (typeof window.updateRealtimeClock === 'function') {
      try { window.updateRealtimeClock(); } catch(e) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-run periodically during first 2 seconds to catch early dynamic frameworks
  setTimeout(init, 150);
  setTimeout(init, 500);
  setTimeout(init, 1200);
})();
