const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust reverse proxy (wajib untuk deploy di Render, Vercel, Railway, Heroku agar session cookie HTTPS berfungsi di HP)
app.set('trust proxy', 1);

// ================================================================
//  PERSISTENCE STORAGE (File JSON agar data tidak hilang saat restart)
// ================================================================

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const RESERVATIONS_FILE = path.join(DATA_DIR, 'reservations.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Persistent Session Store agar sesi login tidak hilang saat restart server
class JsonFileStore extends session.Store {
  constructor() {
    super();
    this.filePath = SESSIONS_FILE;
    this.sessions = {};
    this.load();
  }
  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        this.sessions = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
      }
    } catch (e) {
      this.sessions = {};
    }
  }
  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.sessions, null, 2), 'utf-8');
    } catch (e) {}
  }
  get(sid, callback) {
    this.load();
    const sess = this.sessions[sid];
    if (!sess) return callback(null, null);
    if (sess.cookie && sess.cookie.expires && new Date(sess.cookie.expires) <= new Date()) {
      delete this.sessions[sid];
      this.save();
      return callback(null, null);
    }
    return callback(null, sess);
  }
  set(sid, sess, callback) {
    this.sessions[sid] = sess;
    this.save();
    if (callback) callback(null);
  }
  destroy(sid, callback) {
    delete this.sessions[sid];
    this.save();
    if (callback) callback(null);
  }
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  store: new JsonFileStore(),
  secret: 'hotelku-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 hari aktif
    secure: 'auto',
    sameSite: 'lax'
  }
}));

// Default initial users
let users = [
  { id: 1, name: 'Hendra Wijaya (GM)', email: 'admin@hotelku.com', password: 'admin123', role: 'admin', phone: '081122334455' },
  { id: 2, name: 'Siti Rahma (Front Desk)', email: 'resepsionis@hotelku.com', password: 'resepsionis123', role: 'receptionist', phone: '082233445566' },
  { id: 3, name: 'Budi Santoso', email: 'tamu@demo.com', password: 'tamu123', role: 'guest', phone: '081234567890' },
  { id: 4, name: 'Sari Dewi', email: 'sari@demo.com', password: 'sari123', role: 'guest', phone: '089876543210' }
];

let userCounter = 4;

function saveUsers() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users.json:', err.message);
  }
}

function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) {
        users = data;
        userCounter = Math.max(...users.map(u => u.id || 0), 4);
      }
    } else {
      saveUsers();
    }
  } catch (err) {
    console.error('Error loading users.json:', err.message);
  }
}

loadUsers();

let hotelSettings = {
  hotelName: 'HotelKu Yogyakarta',
  tagline: 'Kemewahan Etnik Klasik di Jantung Yogyakarta',
  address: 'Jl. Gowongan Kidul No. 50, Jetis, Yogyakarta 55232',
  phone: '+62 274 123 4567',
  whatsapp: '+62 812 3456 7890',
  email: 'info@hotelku.com',
  promoBanner: '✨ Diskon Spesial Liburan 20% untuk Reservasi Langsung Melalui Website Resmi HotelKu!',
  promoActive: true,
  checkInTime: '14:00 WIB',
  checkOutTime: '12:00 WIB',
  cancellationPolicy: 'Pembatalan bebas biaya hingga 24 jam sebelum jadwal check-in. Pembatalan di bawah 24 jam dikenakan biaya 1 malam.'
};

const REVIEWS_FILE = path.join(__dirname, 'data', 'reviews.json');

let reviews = [
  {
    id: 1,
    reservationId: 'RSV-000',
    roomId: 2,
    userId: 3,
    userName: 'Budi Santoso',
    rating: 5,
    comment: 'Pelayanan sangat ramah, kamar bersih dengan suasana etnik Jawa yang sangat nyaman!',
    createdAt: '2026-09-15T10:00:00.000Z'
  },
  {
    id: 2,
    reservationId: 'RSV-000',
    roomId: 1,
    userId: 4,
    userName: 'Sari Dewi',
    rating: 5,
    comment: 'Suasana tenang di tengah kota Jogja, fasilitas lengkap dan bersih sekali.',
    createdAt: '2026-09-14T15:30:00.000Z'
  }
];

function saveReviews() {
  try {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving reviews.json:', err.message);
  }
}

function loadReviews() {
  try {
    if (fs.existsSync(REVIEWS_FILE)) {
      const data = JSON.parse(fs.readFileSync(REVIEWS_FILE, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) {
        reviews = data;
      }
    } else {
      saveReviews();
    }
  } catch (err) {
    console.error('Error loading reviews.json:', err.message);
  }
}

loadReviews();

let rooms = [
  {
    id: 1,
    name: 'Standard Room',
    type: 'Standard',
    price: 350000,
    capacity: 2,
    size: 24,
    bed: '1 Queen Bed',
    description: 'Kamar nyaman dengan desain minimalis modern, dilengkapi fasilitas lengkap untuk kenyamanan Anda. Cocok untuk traveler solo atau pasangan yang mencari penginapan berkualitas.',
    facilities: ['WiFi Gratis', 'AC', 'TV LED 32"', 'Kamar Mandi Dalam', 'Air Panas', 'Meja Kerja'],
    photos: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    ],
    totalUnits: 4,
    occupiedUnits: 1
  },
  {
    id: 2,
    name: 'Deluxe Room',
    type: 'Deluxe',
    price: 550000,
    capacity: 2,
    size: 32,
    bed: '1 King Bed',
    description: 'Kamar luas dengan sentuhan etnik Jawa yang elegan. Dilengkapi balkon pribadi dengan pemandangan taman dan fasilitas premium untuk pengalaman menginap istimewa.',
    facilities: ['WiFi Gratis', 'AC', 'Smart TV 43"', 'Bathtub', 'Air Panas', 'Mini Bar', 'Balkon', 'Brankas'],
    photos: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'
    ],
    totalUnits: 4,
    occupiedUnits: 1
  },
  {
    id: 3,
    name: 'Superior Room',
    type: 'Superior',
    price: 750000,
    capacity: 2,
    size: 38,
    bed: '1 King Bed',
    description: 'Kamar superior dengan dekorasi batik premium dan furnitur kayu jati. Ruangan luas dengan area duduk terpisah, ideal untuk tamu yang menginginkan kenyamanan ekstra.',
    facilities: ['WiFi Gratis', 'AC', 'Smart TV 50"', 'Bathtub & Shower', 'Air Panas', 'Mini Bar', 'Sofa', 'Brankas', 'Jubah Mandi'],
    photos: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80'
    ],
    totalUnits: 3,
    occupiedUnits: 1
  },
  {
    id: 4,
    name: 'Junior Suite',
    type: 'Suite',
    price: 1200000,
    capacity: 3,
    size: 48,
    bed: '1 King Bed + 1 Sofa Bed',
    description: 'Suite junior dengan ruang tamu terpisah yang luas. Dekorasi mewah bergaya Jawa kontemporer dengan sentuhan modern. Tersedia layanan kamar 24 jam.',
    facilities: ['WiFi Gratis', 'AC', 'Smart TV 55"', 'Jacuzzi', 'Air Panas', 'Mini Bar', 'Ruang Tamu', 'Brankas', 'Jubah Mandi', 'Mesin Kopi'],
    photos: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?auto=format&fit=crop&w=1200&q=80'
    ],
    totalUnits: 2,
    occupiedUnits: 0
  },
  {
    id: 5,
    name: 'Executive Suite',
    type: 'Suite',
    price: 2000000,
    capacity: 3,
    size: 62,
    bed: '1 King Bed + 1 Single Bed',
    description: 'Suite eksklusif dengan pemandangan kota Yogyakarta yang menakjubkan. Dilengkapi ruang kerja pribadi, ruang tamu mewah, dan akses ke executive lounge.',
    facilities: ['WiFi Gratis', 'AC', 'Smart TV 65"', 'Jacuzzi', 'Rain Shower', 'Mini Bar', 'Ruang Kerja', 'Ruang Tamu', 'Brankas', 'Mesin Kopi', 'Butler Service'],
    photos: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
    ],
    totalUnits: 2,
    occupiedUnits: 0
  },
  {
    id: 6,
    name: 'Presidential Suite',
    type: 'Presidential',
    price: 3500000,
    capacity: 4,
    size: 85,
    bed: '1 King Bed + 2 Single Beds',
    description: 'Pengalaman menginap tertinggi di HotelKu. Suite terluas dengan ruang tamu grand, ruang makan pribadi, dapur kecil, dan pemandangan panorama Yogyakarta. Termasuk butler service 24 jam.',
    facilities: ['WiFi Gratis', 'AC', 'Smart TV 75"', 'Jacuzzi', 'Sauna Pribadi', 'Rain Shower', 'Mini Bar', 'Dapur Kecil', 'Ruang Makan', 'Ruang Tamu Grand', 'Brankas', 'Mesin Kopi', 'Butler Service 24 Jam', 'Airport Transfer'],
    photos: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'
    ],
    totalUnits: 1,
    occupiedUnits: 0
  },
  {
    id: 7,
    name: 'Family Heritage Suite',
    type: 'Family',
    price: 1600000,
    capacity: 5,
    size: 58,
    bed: '2 Queen Beds + 1 Daybed',
    description: 'Suite keluarga luas bertema budaya keraton Yogyakarta yang hangat. Dilengkapi dua kamar tidur terhubung (connecting door), area santai keluarga, dan perlengkapan ramah anak untuk liburan keluarga sempurna.',
    facilities: ['WiFi Gratis', 'AC', 'Smart TV 55"', 'Bathtub & Shower', 'Air Panas', 'Connecting Door', 'Kulkas & Mini Bar', 'Kids Amenity Kit', 'Balkon Pemandangan Kolam', 'Brankas'],
    photos: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
    ],
    totalUnits: 3,
    occupiedUnits: 0
  },
  {
    id: 8,
    name: 'Royal Honeymoon Villa',
    type: 'Villa',
    price: 2750000,
    capacity: 2,
    size: 72,
    bed: '1 King Canopy Bed',
    description: 'Villa privat bernuansa romantis tropis dengan kolam renang pribadi (private plunge pool) dan gazebo khas Jawa. Didedikasikan khusus untuk pasangan yang menginginkan momen istimewa dan privasi maksimal.',
    facilities: ['Private Plunge Pool', 'WiFi Gratis', 'AC', 'Smart TV 60"', 'Jacuzzi Luar Ruang', 'Floating Breakfast', 'Mini Bar Premium', 'Mesin Kopi Nespresso', 'Set Romantis Honeymoon', 'Butler On-Call'],
    photos: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80'
    ],
    totalUnits: 2,
    occupiedUnits: 0
  },
  {
    id: 9,
    name: 'Grand Penthouse Suite',
    type: 'Presidential',
    price: 4800000,
    capacity: 6,
    size: 110,
    bed: '2 Super King Beds + 2 Single Beds',
    description: 'Penthouse termegah di lantai paling atas HotelKu dengan teras rooftop luas, panorama 360 derajat kota Yogyakarta dan Gunung Merapi. Menawarkan kemewahan tak tertandingi dengan butler 24 jam.',
    facilities: ['Rooftop Private Terrace', 'WiFi Ultra Cepat', 'AC Central', 'Smart TV 85" 4K', 'Jacuzzi Rooftop', 'Private Mini Bar & Wine', 'Dapur Modern', 'Ruang Tamu & Makan Grand', 'VIP Butler 24 Jam', 'Airport Limousine'],
    photos: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
    ],
    totalUnits: 1,
    occupiedUnits: 0
  },
  {
    id: 10,
    name: 'Deluxe Garden Twin',
    type: 'Deluxe',
    price: 600000,
    capacity: 2,
    size: 34,
    bed: '2 Twin Beds',
    description: 'Kamar Deluxe bernuansa asri dengan sepasang ranjang twin empuk dan akses langsung teras menghadap taman tropis. Pilihan tepat bagi teman seperjalanan atau pelancong bisnis.',
    facilities: ['WiFi Gratis', 'AC', 'Smart TV 43"', 'Kamar Mandi Marmer', 'Air Panas', 'Teras Taman Tropis', 'Mini Bar', 'Meja Kerja & Brankas'],
    photos: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
    ],
    totalUnits: 4,
    occupiedUnits: 0
  }
];

let roomCounter = 10;

// Concrete room units for Receptionist Live Room Status board
let roomUnits = [
  { unitNumber: '101', roomId: 1, floor: 1, status: 'occupied', guestName: 'Budi Santoso' },
  { unitNumber: '102', roomId: 1, floor: 1, status: 'available', guestName: '' },
  { unitNumber: '103', roomId: 1, floor: 1, status: 'cleaning', guestName: '' },
  { unitNumber: '104', roomId: 1, floor: 1, status: 'available', guestName: '' },
  { unitNumber: '201', roomId: 2, floor: 2, status: 'occupied', guestName: 'Sari Dewi' },
  { unitNumber: '202', roomId: 2, floor: 2, status: 'available', guestName: '' },
  { unitNumber: '203', roomId: 2, floor: 2, status: 'cleaning', guestName: '' },
  { unitNumber: '204', roomId: 2, floor: 2, status: 'available', guestName: '' },
  { unitNumber: '301', roomId: 3, floor: 3, status: 'occupied', guestName: 'Ahmad Fauzi' },
  { unitNumber: '302', roomId: 3, floor: 3, status: 'available', guestName: '' },
  { unitNumber: '303', roomId: 3, floor: 3, status: 'maintenance', guestName: '' },
  { unitNumber: '401', roomId: 4, floor: 4, status: 'available', guestName: '' },
  { unitNumber: '402', roomId: 4, floor: 4, status: 'available', guestName: '' },
  { unitNumber: '501', roomId: 5, floor: 5, status: 'available', guestName: '' },
  { unitNumber: '502', roomId: 5, floor: 5, status: 'available', guestName: '' },
  { unitNumber: '601', roomId: 6, floor: 6, status: 'available', guestName: '' },
  { unitNumber: '701', roomId: 7, floor: 7, status: 'available', guestName: '' },
  { unitNumber: '702', roomId: 7, floor: 7, status: 'available', guestName: '' },
  { unitNumber: '703', roomId: 7, floor: 7, status: 'available', guestName: '' },
  { unitNumber: 'V01', roomId: 8, floor: 1, status: 'available', guestName: '' },
  { unitNumber: 'V02', roomId: 8, floor: 1, status: 'available', guestName: '' },
  { unitNumber: '801', roomId: 9, floor: 8, status: 'available', guestName: '' },
  { unitNumber: '205', roomId: 10, floor: 2, status: 'available', guestName: '' },
  { unitNumber: '206', roomId: 10, floor: 2, status: 'available', guestName: '' },
  { unitNumber: '207', roomId: 10, floor: 2, status: 'available', guestName: '' },
  { unitNumber: '208', roomId: 10, floor: 2, status: 'available', guestName: '' }
];

let reservationCounter = 4;
let reservations = [
  {
    id: 'RSV-001',
    roomId: 2,
    userId: 3,
    guestName: 'Budi Santoso',
    guestPhone: '081234567890',
    guestEmail: 'tamu@demo.com',
    checkIn: '2024-12-20',
    checkOut: '2024-12-23',
    totalNights: 3,
    totalPrice: 1650000,
    notes: 'Minta kamar lantai atas',
    status: 'pending',
    rejectionReason: '',
    createdAt: '2024-12-15T10:30:00'
  },
  {
    id: 'RSV-002',
    roomId: 1,
    userId: 4,
    guestName: 'Sari Dewi',
    guestPhone: '089876543210',
    guestEmail: 'sari@demo.com',
    checkIn: '2024-12-18',
    checkOut: '2024-12-20',
    totalNights: 2,
    totalPrice: 700000,
    notes: '',
    status: 'approved',
    rejectionReason: '',
    createdAt: '2024-12-14T14:00:00'
  },
  {
    id: 'RSV-003',
    roomId: 3,
    userId: 3,
    guestName: 'Budi Santoso',
    guestPhone: '081234567890',
    guestEmail: 'tamu@demo.com',
    checkIn: '2024-12-10',
    checkOut: '2024-12-13',
    totalNights: 3,
    totalPrice: 2250000,
    notes: 'Honeymoon trip',
    status: 'checked-in',
    rejectionReason: '',
    createdAt: '2024-12-08T09:00:00'
  },
  {
    id: 'RSV-004',
    roomId: 2,
    userId: 4,
    guestName: 'Sari Dewi',
    guestPhone: '089876543210',
    guestEmail: 'sari@demo.com',
    checkIn: '2024-12-01',
    checkOut: '2024-12-03',
    totalNights: 2,
    totalPrice: 1100000,
    notes: 'Trip bisnis',
    status: 'checked-out',
    rejectionReason: '',
    createdAt: '2024-11-28T08:00:00'
  }
];

function saveReservations() {
  try {
    fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify(reservations, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving reservations.json:', err.message);
  }
}

function loadReservations() {
  try {
    if (fs.existsSync(RESERVATIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(RESERVATIONS_FILE, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) {
        reservations = data;
        const ids = reservations.map(r => parseInt(String(r.id).replace('RSV-', '')) || 0);
        reservationCounter = Math.max(...ids, 4);
      }
    } else {
      saveReservations();
    }
  } catch (err) {
    console.error('Error loading reservations.json:', err.message);
  }
}

loadReservations();

// ================================================================
//  DEPARTURE & ROOM READINESS ASSISTANT HELPERS
// ================================================================

let simulationSettings = {
  forceCheckoutReminder: false,
  forceRoomReady: false
};

function isApproachingCheckout(rsv) {
  if (rsv.status !== 'checked-in') return false;
  if (simulationSettings.forceCheckoutReminder) return true;

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  // If today is check-out date, reservation is approaching checkout
  if (rsv.checkOut === todayStr) {
    return true;
  }
  return false;
}

// ================================================================
//  RBAC MIDDLEWARES
// ================================================================

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  if (req.session.user.role !== 'admin') {
    if (req.session.user.role === 'receptionist') return res.redirect('/receptionist/dashboard');
    return res.redirect('/rooms');
  }
  next();
}

function requireStaff(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  if (req.session.user.role !== 'admin' && req.session.user.role !== 'receptionist') {
    return res.redirect('/rooms');
  }
  next();
}

function apiAuth(req, res, next) {
  if (req.session && req.session.user) return next();

  // 1. Fallback dari custom headers (dikirim otomatis oleh browser melalui localStorage)
  const fallbackUserId = req.headers['x-user-id'] || req.query.userId;
  const fallbackEmail = req.headers['x-user-email'] || req.body?.guestEmail;
  const rsvId = req.body?.reservationId || req.params?.id;

  if (fallbackUserId) {
    const u = users.find(x => x.id === parseInt(fallbackUserId));
    if (u) {
      req.session.user = { id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone || '' };
      return next();
    }
  }

  if (fallbackEmail) {
    const cleanMail = String(fallbackEmail).trim().toLowerCase();
    const u = users.find(x => x.email.toLowerCase() === cleanMail);
    if (u) {
      req.session.user = { id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone || '' };
      return next();
    }
  }

  // 2. Fallback jika aksi berkaitan dengan Reservasi (Check-in, Check-out, Beri Ulasan)
  if (rsvId) {
    const rsv = reservations.find(r => r.id === rsvId);
    if (rsv) {
      const u = users.find(x => x.id === rsv.userId);
      if (u) {
        req.session.user = { id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone || '' };
        return next();
      }
    }
  }

  // 3. Fallback jika mengajukan reservasi baru (diperbolehkan langsung sebagai tamu)
  if (req.path === '/api/reservations' && req.method === 'POST') {
    return next();
  }

  return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu' });
}

function apiAdmin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Akses ditolak: Hanya Administrator yang memiliki hak akses fitur ini' });
  }
  next();
}

function apiStaff(req, res, next) {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  if (req.session.user.role !== 'admin' && req.session.user.role !== 'receptionist') {
    return res.status(403).json({ success: false, message: 'Akses ditolak: Hanya Staf Hotel yang memiliki hak akses' });
  }
  next();
}

// ================================================================
//  PAGE ROUTES
// ================================================================

// General
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));

app.get('/login', (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === 'admin') return res.redirect('/admin/dashboard');
    if (req.session.user.role === 'receptionist') return res.redirect('/receptionist/dashboard');
    return res.redirect('/rooms');
  }
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === 'admin') return res.redirect('/admin/dashboard');
    if (req.session.user.role === 'receptionist') return res.redirect('/receptionist/dashboard');
    return res.redirect('/rooms');
  }
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/dashboard', requireLogin, (req, res) => {
  if (req.session.user.role === 'admin') return res.redirect('/admin/dashboard');
  if (req.session.user.role === 'receptionist') return res.redirect('/receptionist/dashboard');
  return res.redirect('/rooms');
});

// Guest Pages
app.get('/rooms', (req, res) => res.sendFile(path.join(__dirname, 'views', 'rooms.html')));
app.get('/rooms/:id', (req, res) => res.sendFile(path.join(__dirname, 'views', 'room-detail.html')));
app.get('/reservation/:roomId', requireLogin, (req, res) => res.sendFile(path.join(__dirname, 'views', 'reservation-form.html')));
app.get('/my-reservations', requireLogin, (req, res) => res.sendFile(path.join(__dirname, 'views', 'my-reservations.html')));
app.get('/profile', requireLogin, (req, res) => res.sendFile(path.join(__dirname, 'views', 'profile.html')));

// Admin Pages (Full Control)
app.get('/admin', requireAdmin, (req, res) => res.redirect('/admin/dashboard'));
app.get('/admin/dashboard', requireAdmin, (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin-dashboard.html')));
app.get('/admin/rooms', requireAdmin, (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin-rooms.html')));
app.get('/admin/users', requireAdmin, (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin-users.html')));
app.get('/admin/settings', requireAdmin, (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin-settings.html')));

// Receptionist & Operational Pages
app.get('/receptionist', requireStaff, (req, res) => res.redirect('/receptionist/dashboard'));
app.get('/receptionist/dashboard', requireStaff, (req, res) => res.sendFile(path.join(__dirname, 'views', 'receptionist-dashboard.html')));
app.get('/receptionist/rooms-status', requireStaff, (req, res) => res.sendFile(path.join(__dirname, 'views', 'receptionist-rooms-status.html')));
app.get('/receptionist/reservations', requireStaff, (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin-reservations.html')));
app.get('/receptionist/checkin', requireStaff, (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin-checkin.html')));
app.get('/receptionist/checkout', requireStaff, (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin-checkout.html')));

// Operational backward-compatibility routes (for staff)
app.get('/admin/reservations', requireStaff, (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin-reservations.html')));
app.get('/admin/checkin', requireStaff, (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin-checkin.html')));
app.get('/admin/checkout', requireStaff, (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin-checkout.html')));

// ================================================================
//  AUTH & PROFILE API
// ================================================================

// Register API (Tamu Baru)
app.post('/api/register', (req, res) => {
  const { name, email, phone, password, confirmPassword } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Nama lengkap, email, dan password wajib diisi' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();
  const cleanName = name.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ success: false, message: 'Format alamat email tidak valid (contoh: nama@gmail.com)' });
  }

  if (cleanPassword.length < 4) {
    return res.status(400).json({ success: false, message: 'Password minimal 4 karakter' });
  }

  if (confirmPassword && cleanPassword !== confirmPassword.trim()) {
    return res.status(400).json({ success: false, message: 'Konfirmasi password tidak cocok' });
  }

  const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({ success: false, message: 'Alamat email sudah terdaftar. Silakan gunakan email lain atau masuk di halaman Sign In.' });
  }

  const newUser = {
    id: ++userCounter,
    name: cleanName,
    email: cleanEmail,
    password: cleanPassword,
    role: 'guest',
    phone: phone ? phone.trim() : ''
  };

  users.push(newUser);
  saveUsers(); // Simpan permanen ke data/users.json!

  // Tamu tidak langsung login otomatis, melainkan dialihkan ke menu Masuk (login)
  res.json({
    success: true,
    message: `Pendaftaran akun berhasil! Silakan masuk dengan email dan password Anda.`,
    redirect: '/login?registered=1'
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email dan password harus diisi' });

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword);
  if (!user) return res.status(401).json({ success: false, message: 'Email atau password salah' });

  req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone || '' };
  res.json({ success: true, message: 'Login berhasil! Selamat datang, ' + user.name, user: req.session.user });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true, message: 'Logout berhasil' }));
});

app.get('/api/me', (req, res) => {
  if (!req.session.user) {
    const fallbackUserId = req.headers['x-user-id'] || req.query.userId;
    const fallbackEmail = req.headers['x-user-email'];
    if (fallbackUserId) {
      const u = users.find(x => x.id === parseInt(fallbackUserId));
      if (u) req.session.user = { id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone || '' };
    } else if (fallbackEmail) {
      const u = users.find(x => x.email.toLowerCase() === String(fallbackEmail).trim().toLowerCase());
      if (u) req.session.user = { id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone || '' };
    }
  }

  if (!req.session.user) return res.status(401).json({ success: false });
  const user = users.find(u => u.id === req.session.user.id);
  res.json({ success: true, user: user ? { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone || '' } : req.session.user });
});

app.post('/api/auth/restore-session', (req, res) => {
  const { userId, email } = req.body;
  let user = null;
  if (userId) user = users.find(u => u.id === parseInt(userId));
  if (!user && email) {
    const cleanEmail = String(email).trim().toLowerCase();
    user = users.find(u => u.email.toLowerCase() === cleanEmail);
  }
  if (user) {
    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone || '' };
    return res.json({ success: true, message: 'Sesi dipulihkan', user: req.session.user });
  }
  return res.status(401).json({ success: false, message: 'User tidak ditemukan' });
});

app.get('/api/profile', apiAuth, (req, res) => {
  const user = users.find(u => u.id === req.session.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone || '' } });
});

app.put('/api/profile', apiAuth, (req, res) => {
  const { name, phone, email, currentPassword, newPassword } = req.body;
  const user = users.find(u => u.id === req.session.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

  if (newPassword) {
    if (user.password !== currentPassword) {
      return res.status(400).json({ success: false, message: 'Password saat ini tidak sesuai' });
    }
    user.password = newPassword;
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (email) user.email = email;
  saveUsers();

  req.session.user.name = user.name;
  req.session.user.email = user.email;
  req.session.user.phone = user.phone;

  res.json({ success: true, message: 'Profil berhasil diperbarui!', user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
});

// ================================================================
//  ROOMS API (Public & Admin CRUD)
// ================================================================

app.get('/api/rooms', (req, res) => {
  const { search, type } = req.query;
  let result = rooms.map(r => {
    const roomReviews = reviews.filter(rev => rev.roomId === r.id);
    const reviewCount = roomReviews.length;
    const avgRating = reviewCount > 0 ? (roomReviews.reduce((sum, rev) => sum + rev.rating, 0) / reviewCount).toFixed(1) : '5.0';
    return {
      ...r,
      availableUnits: r.totalUnits - r.occupiedUnits,
      avgRating,
      reviewCount
    };
  });

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(r => r.name.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }
  if (type && type !== 'all') {
    result = result.filter(r => r.type.toLowerCase() === type.toLowerCase());
  }

  res.json({ success: true, rooms: result });
});

app.get('/api/rooms/:id', (req, res) => {
  const room = rooms.find(r => r.id === parseInt(req.params.id));
  if (!room) return res.status(404).json({ success: false, message: 'Kamar tidak ditemukan' });
  const roomReviews = reviews.filter(rev => rev.roomId === room.id);
  const reviewCount = roomReviews.length;
  const avgRating = reviewCount > 0 ? (roomReviews.reduce((sum, rev) => sum + rev.rating, 0) / reviewCount).toFixed(1) : '5.0';
  res.json({ success: true, room: { ...room, availableUnits: room.totalUnits - room.occupiedUnits, avgRating, reviewCount } });
});

// Admin: Tambah Kamar Baru
app.post('/api/admin/rooms', apiAdmin, (req, res) => {
  const { name, type, price, capacity, size, bed, description, facilities, photos, totalUnits } = req.body;
  if (!name || !price || !capacity) {
    return res.status(400).json({ success: false, message: 'Nama kamar, harga, dan kapasitas wajib diisi' });
  }

  const newRoom = {
    id: ++roomCounter,
    name,
    type: type || 'Standard',
    price: parseInt(price),
    capacity: parseInt(capacity),
    size: parseInt(size) || 25,
    bed: bed || '1 King Bed',
    description: description || 'Kamar nyaman dan mewah di HotelKu.',
    facilities: Array.isArray(facilities) ? facilities : (facilities ? facilities.split(',').map(s => s.trim()) : ['WiFi Gratis', 'AC']),
    photos: Array.isArray(photos) && photos.length ? photos : [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
    ],
    totalUnits: parseInt(totalUnits) || 3,
    occupiedUnits: 0
  };

  rooms.push(newRoom);

  // Generate initial units for this room
  for (let i = 1; i <= newRoom.totalUnits; i++) {
    roomUnits.push({
      unitNumber: `${newRoom.id}0${i}`,
      roomId: newRoom.id,
      floor: newRoom.id,
      status: 'available',
      guestName: ''
    });
  }

  res.json({ success: true, message: `Kamar baru "${newRoom.name}" berhasil ditambahkan!`, room: newRoom });
});

// Admin: Edit Kamar (Termasuk ubah harga, foto, deskripsi, fasilitas)
app.put('/api/admin/rooms/:id', apiAdmin, (req, res) => {
  const room = rooms.find(r => r.id === parseInt(req.params.id));
  if (!room) return res.status(404).json({ success: false, message: 'Kamar tidak ditemukan' });

  const { name, type, price, capacity, size, bed, description, facilities, photos, totalUnits } = req.body;

  if (name) room.name = name;
  if (type) room.type = type;
  if (price !== undefined) room.price = parseInt(price);
  if (capacity !== undefined) room.capacity = parseInt(capacity);
  if (size !== undefined) room.size = parseInt(size);
  if (bed) room.bed = bed;
  if (description) room.description = description;
  if (facilities) room.facilities = Array.isArray(facilities) ? facilities : facilities.split(',').map(s => s.trim());
  if (photos && Array.isArray(photos) && photos.length) room.photos = photos;
  if (totalUnits !== undefined) room.totalUnits = parseInt(totalUnits);

  res.json({ success: true, message: `Data kamar "${room.name}" berhasil diperbarui!`, room });
});

// Admin: Hapus Kamar
app.delete('/api/admin/rooms/:id', apiAdmin, (req, res) => {
  const idx = rooms.findIndex(r => r.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: 'Kamar tidak ditemukan' });

  const deletedName = rooms[idx].name;
  rooms.splice(idx, 1);
  // remove units
  roomUnits = roomUnits.filter(u => u.roomId !== parseInt(req.params.id));

  res.json({ success: true, message: `Tipe kamar "${deletedName}" berhasil dihapus dari sistem` });
});

// ================================================================
//  RECEPTIONIST: LIVE ROOM STATUS (Kosong / Terisi / Dibersihkan)
// ================================================================

app.get('/api/receptionist/rooms-status', apiStaff, (req, res) => {
  const unitsWithDetails = roomUnits.map(unit => {
    const room = rooms.find(r => r.id === unit.roomId);
    return {
      ...unit,
      roomName: room ? room.name : 'Unknown Room',
      roomType: room ? room.type : 'Standard',
      price: room ? room.price : 0
    };
  });

  const summary = {
    total: roomUnits.length,
    available: roomUnits.filter(u => u.status === 'available').length,
    occupied: roomUnits.filter(u => u.status === 'occupied').length,
    cleaning: roomUnits.filter(u => u.status === 'cleaning').length,
    maintenance: roomUnits.filter(u => u.status === 'maintenance').length
  };

  res.json({ success: true, units: unitsWithDetails, summary });
});

// Receptionist / Staff: Update individual room unit status (e.g. mark clean -> available)
app.put('/api/receptionist/rooms-status/:unitNumber', apiStaff, (req, res) => {
  const { status, guestName } = req.body;
  const unit = roomUnits.find(u => u.unitNumber === req.params.unitNumber);
  if (!unit) return res.status(404).json({ success: false, message: 'Nomor unit kamar tidak ditemukan' });

  const validStatuses = ['available', 'occupied', 'cleaning', 'maintenance'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Status kamar tidak valid' });
  }

  unit.status = status;
  if (guestName !== undefined) unit.guestName = guestName;
  if (status === 'available' || status === 'cleaning') unit.guestName = '';

  // sync aggregate occupiedUnits
  const room = rooms.find(r => r.id === unit.roomId);
  if (room) {
    room.occupiedUnits = roomUnits.filter(u => u.roomId === room.id && u.status === 'occupied').length;
  }

  res.json({ success: true, message: `Status kamar unit ${unit.unitNumber} berhasil diubah menjadi ${status}!`, unit });
});

// ================================================================
//  RESERVATIONS API
// ================================================================

// Create reservation (guest)
app.post('/api/reservations', apiAuth, (req, res) => {
  const { roomId, checkIn, checkOut, guestName, guestPhone, guestEmail, notes } = req.body;

  if (!roomId || !checkIn || !checkOut || !guestName || !guestPhone) {
    return res.status(400).json({ success: false, message: 'Semua field wajib harus diisi' });
  }

  const room = rooms.find(r => r.id === parseInt(roomId));
  if (!room) return res.status(404).json({ success: false, message: 'Kamar tidak ditemukan' });

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const totalNights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  if (totalNights < 1) return res.status(400).json({ success: false, message: 'Tanggal check-out harus setelah check-in' });

  if (room.totalUnits - room.occupiedUnits <= 0) {
    return res.status(400).json({ success: false, message: 'Maaf, seluruh unit kamar tipe ini sedang penuh' });
  }

  // Jika belum login, otomatis buat atau tautkan akun tamu berdasarkan email
  let rsvUserId = req.session.user ? req.session.user.id : null;
  if (!rsvUserId) {
    const cleanEmail = (guestEmail || '').trim().toLowerCase();
    let existingUser = cleanEmail ? users.find(u => u.email.toLowerCase() === cleanEmail) : null;
    if (!existingUser) {
      existingUser = {
        id: ++userCounter,
        name: guestName.trim(),
        email: cleanEmail || `tamu_${Date.now()}@hotelku.com`,
        password: 'tamu' + Math.floor(1000 + Math.random() * 9000),
        role: 'guest',
        phone: (guestPhone || '').trim()
      };
      users.push(existingUser);
      saveUsers();
    }
    rsvUserId = existingUser.id;
    req.session.user = {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
      phone: existingUser.phone || ''
    };
  }

  const paymentMethod = req.body.paymentMethod || 'QRIS';
  const paymentStatus = req.body.paymentStatus || (paymentMethod === 'Bayar di Hotel' ? 'pay_at_hotel' : 'paid');
  const paymentRef = req.body.paymentRef || ('PAY-' + Date.now().toString().slice(-6));
  const paidAt = paymentStatus === 'paid' ? new Date().toISOString() : null;

  const reservation = {
    id: 'RSV-' + String(++reservationCounter).padStart(3, '0'),
    roomId: parseInt(roomId),
    userId: rsvUserId,
    guestName, guestPhone,
    guestEmail: guestEmail || (req.session.user ? req.session.user.email : ''),
    checkIn, checkOut, totalNights,
    totalPrice: totalNights * room.price,
    notes: notes || '',
    status: 'pending',
    paymentStatus,
    paymentMethod,
    paymentRef,
    paidAt,
    rejectionReason: '',
    createdAt: new Date().toISOString()
  };

  reservations.push(reservation);
  saveReservations();
  res.json({
    success: true,
    message: 'Pembayaran berhasil dikonfirmasi! Permohonan reservasi Anda telah diteruskan ke Resepsionis untuk disetujui (ACC).',
    reservation,
    user: req.session.user
  });
});

// List reservations (Staff sees all, Guest sees own)
app.get('/api/reservations', apiAuth, (req, res) => {
  const { status } = req.query;
  let result;

  if (req.session.user.role === 'admin' || req.session.user.role === 'receptionist') {
    result = [...reservations];
  } else {
    result = reservations.filter(r => r.userId === req.session.user.id);
  }

  if (status && status !== 'all') {
    result = result.filter(r => r.status === status);
  }

  result = result.map(r => {
    const room = rooms.find(rm => rm.id === r.roomId);
    return { ...r, roomName: room ? room.name : 'Unknown', roomType: room ? room.type : '', roomPhoto: room ? room.photos[0] : '' };
  });

  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, reservations: result });
});

// Staff: Approve reservation (ACC)
app.put('/api/reservations/:id/approve', apiStaff, (req, res) => {
  const rsv = reservations.find(r => r.id === req.params.id);
  if (!rsv) return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan' });
  if (rsv.status !== 'pending') return res.status(400).json({ success: false, message: 'Reservasi tidak dalam status pending' });

  rsv.status = 'approved';
  rsv.approvedAt = new Date().toISOString();
  rsv.rejectionReason = '';
  saveReservations();
  res.json({ success: true, message: `Reservasi ${rsv.id} telah disetujui (ACC) oleh staf` });
});

// Staff: Reject reservation
app.put('/api/reservations/:id/reject', apiStaff, (req, res) => {
  const rsv = reservations.find(r => r.id === req.params.id);
  if (!rsv) return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan' });
  if (rsv.status !== 'pending') return res.status(400).json({ success: false, message: 'Reservasi tidak dalam status pending' });

  rsv.status = 'rejected';
  rsv.rejectionReason = req.body.reason || 'Kamar tidak tersedia pada jadwal yang diminta';
  saveReservations();
  res.json({ success: true, message: `Reservasi ${rsv.id} telah ditolak` });
});

// Staff: Approve & Check-In Langsung (1 langkah oleh Resepsionis)
app.put('/api/reservations/:id/approve-checkin', apiStaff, (req, res) => {
  const rsv = reservations.find(r => r.id === req.params.id);
  if (!rsv) return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan' });
  if (rsv.status !== 'pending' && rsv.status !== 'approved') {
    return res.status(400).json({ success: false, message: 'Reservasi tidak dalam status yang dapat di-check in' });
  }

  rsv.status = 'checked-in';
  rsv.approvedAt = rsv.approvedAt || new Date().toISOString();
  rsv.checkedInAt = new Date().toISOString();
  rsv.rejectionReason = '';

  const availableUnit = roomUnits.find(u => u.roomId === rsv.roomId && u.status === 'available');
  if (availableUnit) {
    availableUnit.status = 'occupied';
    availableUnit.guestName = rsv.guestName;
    rsv.unitNumber = availableUnit.unitNumber;
  }

  const room = rooms.find(r => r.id === rsv.roomId);
  if (room) room.occupiedUnits++;

  saveReservations();
  res.json({
    success: true,
    message: `Reservasi ${rsv.id} berhasil disetujui & langsung di-Check In oleh resepsionis ${availableUnit ? '(Unit ' + availableUnit.unitNumber + ')' : ''}`,
    reservation: rsv
  });
});

// HANYA STAF (Resepsionis / Admin): Check-in Tamu
app.put('/api/reservations/:id/checkin', apiStaff, (req, res) => {
  const rsv = reservations.find(r => r.id === req.params.id);
  if (!rsv) return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan' });

  if (rsv.status !== 'approved') return res.status(400).json({ success: false, message: 'Hanya reservasi yang sudah disetujui (ACC) yang dapat di-check in' });

  rsv.status = 'checked-in';
  rsv.checkedInAt = new Date().toISOString();

  // Assign an available unit of this room type
  const availableUnit = roomUnits.find(u => u.roomId === rsv.roomId && u.status === 'available');
  if (availableUnit) {
    availableUnit.status = 'occupied';
    availableUnit.guestName = rsv.guestName;
    rsv.unitNumber = availableUnit.unitNumber;
  }

  const room = rooms.find(r => r.id === rsv.roomId);
  if (room) room.occupiedUnits++;

  saveReservations();
  res.json({ success: true, message: `Check-In berhasil diproses oleh Resepsionis! ${availableUnit ? '(Kamar Unit ' + availableUnit.unitNumber + ')' : ''}`, reservation: rsv });
});

// HANYA STAF (Resepsionis / Admin): Check-out Tamu
app.put('/api/reservations/:id/checkout', apiStaff, (req, res) => {
  const rsv = reservations.find(r => r.id === req.params.id);
  if (!rsv) return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan' });

  if (rsv.status !== 'checked-in' && rsv.status !== 'approved') {
    return res.status(400).json({ success: false, message: 'Status reservasi belum check-in' });
  }

  rsv.status = 'checked-out';
  rsv.checkedOutAt = new Date().toISOString();

  // Mark room unit as cleaning so housekeeping can clean it
  const occupiedUnit = roomUnits.find(u => u.roomId === rsv.roomId && u.status === 'occupied' && u.guestName === rsv.guestName);
  if (occupiedUnit) {
    occupiedUnit.status = 'cleaning';
    occupiedUnit.guestName = '';
  } else {
    // fallback: pick first occupied
    const firstOcc = roomUnits.find(u => u.roomId === rsv.roomId && u.status === 'occupied');
    if (firstOcc) {
      firstOcc.status = 'cleaning';
      firstOcc.guestName = '';
    }
  }

  const room = rooms.find(r => r.id === rsv.roomId);
  if (room && room.occupiedUnits > 0) room.occupiedUnits--;

  saveReservations();
  res.json({ success: true, message: `Check-Out berhasil diproses oleh Resepsionis! Unit kamar dialihkan ke status pembersihan.`, reservation: rsv });
});

// ================================================================
//  DEPARTURE ASSISTANT (T-2 JAM) & ROOM READY NOTIFICATION API
// ================================================================

// Guest: Check active notifications (T-2 Check-out reminder & Room Ready)
app.get('/api/notifications/guest-alerts', apiAuth, (req, res) => {
  const userId = req.session.user.id;
  const userReservations = reservations.filter(r => r.userId === userId);

  let checkoutReminder = null;
  let roomReadyAlert = null;

  // 1. Check for active checked-in reservation approaching checkout
  const inHouseRsv = userReservations.find(r => r.status === 'checked-in' && isApproachingCheckout(r));
  if (inHouseRsv) {
    const room = rooms.find(rm => rm.id === inHouseRsv.roomId);
    const unit = roomUnits.find(u => u.roomId === inHouseRsv.roomId && u.status === 'occupied' && u.guestName === inHouseRsv.guestName);

    const officialCheckoutTime = inHouseRsv.lateCheckoutStatus === 'approved'
      ? `${12 + (inHouseRsv.lateCheckoutHours || 1)}:00 WIB (Diperpanjang)`
      : '12:00 WIB';

    checkoutReminder = {
      reservationId: inHouseRsv.id,
      guestName: inHouseRsv.guestName,
      roomName: room ? room.name : 'Kamar HotelKu',
      roomType: room ? room.type : '',
      unitNumber: unit ? unit.unitNumber : (inHouseRsv.unitNumber || '101'),
      checkOutTime: officialCheckoutTime,
      checkoutConfirmedReady: Boolean(inHouseRsv.checkoutConfirmedReady),
      lateCheckoutRequested: Boolean(inHouseRsv.lateCheckoutRequested),
      lateCheckoutHours: inHouseRsv.lateCheckoutHours || null,
      lateCheckoutStatus: inHouseRsv.lateCheckoutStatus || 'none', // none, pending, approved, rejected
      lateCheckoutReason: inHouseRsv.lateCheckoutReason || '',
      bellboyRequested: Boolean(inHouseRsv.bellboyRequested),
      bellboyStatus: inHouseRsv.bellboyStatus || 'none' // none, requested, dispatched, completed
    };
  }

  // 2. Room Ready Alert disabled per user request
  roomReadyAlert = null;

  res.json({
    success: true,
    data: {
      checkoutReminder,
      roomReadyAlert,
      simulationActive: simulationSettings.forceCheckoutReminder || simulationSettings.forceRoomReady,
      simulationSettings
    }
  });
});

// Guest: Submit Quick Action for Departure (Confirm Ready / Late Checkout / Bellboy)
app.post('/api/reservations/:id/checkout-action', apiAuth, (req, res) => {
  const { action, hours, reason, notes } = req.body;
  const rsv = reservations.find(r => r.id === req.params.id && r.userId === req.session.user.id);
  if (!rsv) return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan' });

  if (action === 'confirm-ready') {
    rsv.checkoutConfirmedReady = true;
    saveReservations();
    return res.json({
      success: true,
      message: 'Konfirmasi diterima! Front desk mencatat bahwa Anda siap check-out tepat waktu pukul 12:00 WIB.',
      reservation: rsv
    });
  }

  if (action === 'request-late-checkout') {
    const reqHours = parseInt(hours) || 1;
    rsv.lateCheckoutRequested = true;
    rsv.lateCheckoutHours = reqHours;
    rsv.lateCheckoutStatus = 'pending';
    rsv.lateCheckoutReason = reason || 'Perlu waktu tambahan berkemas';
    saveReservations();
    return res.json({
      success: true,
      message: `Permohonan Late Check-Out (+${reqHours} Jam s.d. ${12 + reqHours}:00 WIB) telah diteruskan ke resepsionis untuk verifikasi.`,
      reservation: rsv
    });
  }

  if (action === 'request-bellboy') {
    rsv.bellboyRequested = true;
    rsv.bellboyStatus = 'requested';
    rsv.bellboyNotes = notes || 'Bantuan angkut koper/barang dari kamar';
    saveReservations();
    return res.json({
      success: true,
      message: 'Panggilan bantuan porter / bellboy berhasil! Petugas hotel akan segera menuju kamar Anda.',
      reservation: rsv
    });
  }

  res.status(400).json({ success: false, message: 'Aksi tidak valid' });
});

// Staff: Respond to Late Check-out Request (Approve / Reject)
app.put('/api/reservations/:id/late-checkout/:decision', apiStaff, (req, res) => {
  const { decision } = req.params;
  const rsv = reservations.find(r => r.id === req.params.id);
  if (!rsv) return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan' });

  if (decision === 'approve') {
    rsv.lateCheckoutStatus = 'approved';
    const extendedHour = 12 + (rsv.lateCheckoutHours || 1);
    saveReservations();
    return res.json({
      success: true,
      message: `Permohonan Late Check-Out disetujui! Batas waktu check-out diperpanjang menjadi pukul ${extendedHour}:00 WIB.`
    });
  } else if (decision === 'reject') {
    rsv.lateCheckoutStatus = 'rejected';
    saveReservations();
    return res.json({
      success: true,
      message: `Permohonan Late Check-Out ditolak karena tingginya okupansi kedatangan tamu berikutnya.`
    });
  }

  res.status(400).json({ success: false, message: 'Keputusan tidak valid' });
});

// Staff: Update Bellboy Service Status (Dispatched / Completed)
app.put('/api/reservations/:id/bellboy/:status', apiStaff, (req, res) => {
  const { status } = req.params;
  const rsv = reservations.find(r => r.id === req.params.id);
  if (!rsv) return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan' });

  rsv.bellboyStatus = status;
  saveReservations();
  res.json({
    success: true,
    message: status === 'dispatched'
      ? `Petugas bellboy telah diberangkatkan untuk membantu ${rsv.guestName}!`
      : `Bantuan bellboy untuk kamar ${rsv.guestName} selesai.`
  });
});

// Staff: Notify Guest that Room is Ready for Check-in
app.put('/api/receptionist/notify-room-ready/:id', apiStaff, (req, res) => {
  const rsv = reservations.find(r => r.id === req.params.id);
  if (!rsv) return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan' });

  rsv.roomReadyNotified = true;
  rsv.earlyCheckInAllowed = true;
  const now = new Date();
  rsv.roomReadyAt = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
  saveReservations();

  res.json({
    success: true,
    message: `Notifikasi kesiapan kamar berhasil dikirimkan ke tamu ${rsv.guestName}!`,
    reservation: rsv
  });
});

// Staff: Get list of in-house guests approaching check-out (< 2 hours / today)
app.get('/api/receptionist/approaching-checkout', apiStaff, (req, res) => {
  const approaching = reservations.filter(r => r.status === 'checked-in' && isApproachingCheckout(r));
  const result = approaching.map(r => {
    const room = rooms.find(rm => rm.id === r.roomId);
    const unit = roomUnits.find(u => u.roomId === r.roomId && u.status === 'occupied' && u.guestName === r.guestName);
    return {
      ...r,
      roomName: room ? room.name : 'Kamar HotelKu',
      roomType: room ? room.type : '',
      unitNumber: unit ? unit.unitNumber : (r.unitNumber || '101'),
      isApproaching: true
    };
  });
  res.json({ success: true, count: result.length, reservations: result });
});

// Demo Simulation API (For presentations)
app.post('/api/demo/simulation', (req, res) => {
  const { forceCheckoutReminder, forceRoomReady, reset } = req.body;
  if (reset) {
    simulationSettings.forceCheckoutReminder = false;
    simulationSettings.forceRoomReady = false;
  } else {
    if (forceCheckoutReminder !== undefined) simulationSettings.forceCheckoutReminder = Boolean(forceCheckoutReminder);
    if (forceRoomReady !== undefined) simulationSettings.forceRoomReady = Boolean(forceRoomReady);
  }
  res.json({ success: true, message: 'Status mode simulasi diperbarui!', settings: simulationSettings });
});

app.get('/api/demo/simulation', (req, res) => {
  res.json({ success: true, settings: simulationSettings });
});

// ================================================================
//  REVIEWS API
// ================================================================

app.get('/api/reviews/room/:roomId', (req, res) => {
  const roomId = parseInt(req.params.roomId);
  const roomReviews = reviews.filter(r => r.roomId === roomId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = roomReviews.length;
  const avgRating = total > 0 ? (roomReviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : '5.0';

  res.json({
    success: true,
    reviews: roomReviews,
    total,
    avgRating,
    currentUserId: req.session?.user ? req.session.user.id : null
  });
});

app.get('/api/reviews/my', apiAuth, (req, res) => {
  const myReviews = reviews.filter(r => r.userId === req.session.user.id);
  res.json({ success: true, reviews: myReviews });
});

// Check if user has an unreviewed checked-out reservation for this room
app.get('/api/reviews/can-review/:roomId', (req, res) => {
  const roomId = parseInt(req.params.roomId);

  // Auto-resolve user if missing
  if (!req.session?.user && req.headers['x-user-id']) {
    const u = users.find(x => x.id === parseInt(req.headers['x-user-id']));
    if (u) req.session.user = { id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone || '' };
  }

  if (!req.session?.user) {
    return res.json({ success: true, canReview: false, reservation: null });
  }

  const reviewedReservationIds = new Set(reviews.filter(rv => rv.userId === req.session.user.id).map(rv => rv.reservationId));
  
  const eligibleRsv = reservations.find(r => 
    r.roomId === roomId && 
    (r.userId === req.session.user.id || (req.session.user.email && r.guestEmail === req.session.user.email)) && 
    r.status === 'checked-out' && 
    !reviewedReservationIds.has(r.id)
  );

  res.json({
    success: true,
    canReview: Boolean(eligibleRsv),
    reservation: eligibleRsv || null
  });
});

app.post('/api/reviews', apiAuth, (req, res) => {
  const { reservationId, rating, comment } = req.body;

  if (!reservationId || !rating || !comment) {
    return res.status(400).json({ success: false, message: 'Rating dan ulasan harus diisi' });
  }

  const rsv = reservations.find(r => r.id === reservationId);
  if (!rsv) return res.status(404).json({ success: false, message: 'Data reservasi tidak ditemukan' });

  // Auto-restore session user if missing
  if (!req.session?.user) {
    const u = users.find(x => x.id === rsv.userId);
    if (u) req.session.user = { id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone || '' };
  }

  if (rsv.status !== 'checked-out') {
    return res.status(400).json({ success: false, message: 'Ulasan hanya dapat diberikan setelah masa menginap selesai (Checked Out)' });
  }

  const existingReview = reviews.find(r => r.reservationId === reservationId);
  if (existingReview) {
    return res.status(400).json({ success: false, message: 'Anda sudah memberikan ulasan untuk reservasi ini' });
  }

  const reviewerUserId = (req.session?.user && req.session.user.id) || rsv.userId;
  const reviewerUserName = (req.session?.user && req.session.user.name) || rsv.guestName || 'Tamu HotelKu';

  const newReview = {
    id: reviews.length + 1,
    reservationId,
    roomId: rsv.roomId,
    userId: reviewerUserId,
    userName: reviewerUserName,
    rating: parseInt(rating),
    comment: String(comment).trim(),
    createdAt: new Date().toISOString()
  };

  reviews.push(newReview);
  saveReviews();
  res.json({ success: true, message: 'Terima kasih! Ulasan Anda berhasil disimpan dan ditampilkan pada kamar ini.', review: newReview });
});

// ================================================================
//  ADMIN: USER MANAGEMENT (Kelola Staf / Resepsionis / User lain)
// ================================================================

app.get('/api/admin/users', apiAdmin, (req, res) => {
  const safeUsers = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone || ''
  }));
  res.json({ success: true, users: safeUsers });
});

app.post('/api/admin/users', apiAdmin, (req, res) => {
  const { name, email, password, role, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi' });
  }

  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email sudah terdaftar untuk pengguna lain' });
  }

  const newUser = {
    id: ++userCounter,
    name,
    email,
    password,
    role: role || 'receptionist',
    phone: phone || ''
  };

  users.push(newUser);
  saveUsers();
  res.json({
    success: true,
    message: `Akun baru "${newUser.name}" (${newUser.role}) berhasil dibuat!`,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, phone: newUser.phone }
  });
});

app.put('/api/admin/users/:id', apiAdmin, (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

  const { name, email, role, phone, password } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (phone) user.phone = phone;
  if (password) user.password = password;
  saveUsers();

  res.json({ success: true, message: `Data pengguna "${user.name}" berhasil diperbarui!`, user });
});

app.delete('/api/admin/users/:id', apiAdmin, (req, res) => {
  if (parseInt(req.params.id) === req.session.user.id) {
    return res.status(400).json({ success: false, message: 'Anda tidak dapat menghapus akun Anda sendiri' });
  }

  const idx = users.findIndex(u => u.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

  const deleted = users[idx].name;
  users.splice(idx, 1);
  saveUsers();
  res.json({ success: true, message: `Akun "${deleted}" berhasil dihapus dari sistem` });
});

// ================================================================
//  ADMIN: LAPORAN & STATISTIK KESELURUHAN (Pendapatan & Okupansi)
// ================================================================

app.get('/api/admin/reports', apiAdmin, (req, res) => {
  const totalRooms = roomUnits.length;
  const occupiedUnits = roomUnits.filter(u => u.status === 'occupied').length;
  const cleaningUnits = roomUnits.filter(u => u.status === 'cleaning').length;
  const availableUnits = roomUnits.filter(u => u.status === 'available').length;
  const maintenanceUnits = roomUnits.filter(u => u.status === 'maintenance').length;

  const occupancyRate = totalRooms > 0 ? Math.round((occupiedUnits / totalRooms) * 100) : 0;

  // Revenue calculation from checked-in and checked-out
  const realizedRevenue = reservations
    .filter(r => r.status === 'checked-in' || r.status === 'checked-out')
    .reduce((sum, r) => sum + r.totalPrice, 0);

  const potentialRevenue = reservations
    .filter(r => r.status === 'approved' || r.status === 'pending')
    .reduce((sum, r) => sum + r.totalPrice, 0);

  // Revenue by room type
  const roomRevenueBreakdown = rooms.map(room => {
    const roomReservations = reservations.filter(r => r.roomId === room.id && (r.status === 'checked-in' || r.status === 'checked-out'));
    const totalRev = roomReservations.reduce((sum, r) => sum + r.totalPrice, 0);
    const bookingsCount = roomReservations.length;
    return {
      roomId: room.id,
      roomName: room.name,
      roomType: room.type,
      totalRevenue: totalRev,
      totalBookings: bookingsCount
    };
  });

  // Recent transaction records
  const transactionLogs = reservations
    .filter(r => r.status !== 'rejected')
    .map(r => {
      const room = rooms.find(rm => rm.id === r.roomId);
      return {
        id: r.id,
        guestName: r.guestName,
        roomName: room ? room.name : 'Room',
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        totalNights: r.totalNights,
        amount: r.totalPrice,
        status: r.status,
        date: r.createdAt
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({
    success: true,
    data: {
      totalRooms,
      occupiedUnits,
      cleaningUnits,
      availableUnits,
      maintenanceUnits,
      occupancyRate,
      realizedRevenue,
      potentialRevenue,
      totalGuests: users.filter(u => u.role === 'guest').length,
      totalStaff: users.filter(u => u.role === 'receptionist' || u.role === 'admin').length,
      roomRevenueBreakdown,
      transactionLogs
    }
  });
});

// ================================================================
//  ADMIN: GENERAL SETTINGS (Kontak, Promo, Kebijakan Hotel)
// ================================================================

app.get('/api/admin/settings', apiAdmin, (req, res) => {
  res.json({ success: true, settings: hotelSettings });
});

app.put('/api/admin/settings', apiAdmin, (req, res) => {
  const { hotelName, tagline, address, phone, whatsapp, email, promoBanner, promoActive, checkInTime, checkOutTime, cancellationPolicy } = req.body;

  if (hotelName) hotelSettings.hotelName = hotelName;
  if (tagline) hotelSettings.tagline = tagline;
  if (address) hotelSettings.address = address;
  if (phone) hotelSettings.phone = phone;
  if (whatsapp) hotelSettings.whatsapp = whatsapp;
  if (email) hotelSettings.email = email;
  if (promoBanner !== undefined) hotelSettings.promoBanner = promoBanner;
  if (promoActive !== undefined) hotelSettings.promoActive = Boolean(promoActive);
  if (checkInTime) hotelSettings.checkInTime = checkInTime;
  if (checkOutTime) hotelSettings.checkOutTime = checkOutTime;
  if (cancellationPolicy) hotelSettings.cancellationPolicy = cancellationPolicy;

  res.json({ success: true, message: 'Pengaturan umum website berhasil diperbarui!', settings: hotelSettings });
});

// Public settings endpoint
app.get('/api/settings', (req, res) => {
  res.json({
    success: true,
    settings: {
      hotelName: hotelSettings.hotelName,
      tagline: hotelSettings.tagline,
      address: hotelSettings.address,
      phone: hotelSettings.phone,
      whatsapp: hotelSettings.whatsapp,
      email: hotelSettings.email,
      promoBanner: hotelSettings.promoActive ? hotelSettings.promoBanner : '',
      checkInTime: hotelSettings.checkInTime,
      checkOutTime: hotelSettings.checkOutTime,
      cancellationPolicy: hotelSettings.cancellationPolicy
    }
  });
});

// ================================================================
//  RECEPTIONIST: OPERATIONAL DASHBOARD STATS
// ================================================================

app.get('/api/receptionist/dashboard', apiStaff, (req, res) => {
  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const approvedReservations = reservations.filter(r => r.status === 'approved'); // siap checkin
  const inHouseGuests = reservations.filter(r => r.status === 'checked-in'); // sedang menginap
  const approachingCheckoutReservations = reservations
    .filter(r => r.status === 'checked-in' && isApproachingCheckout(r))
    .map(r => {
      const room = rooms.find(rm => rm.id === r.roomId);
      const unit = roomUnits.find(u => u.roomId === r.roomId && u.status === 'occupied' && u.guestName === r.guestName);
      return {
        ...r,
        roomName: room ? room.name : 'Kamar HotelKu',
        unitNumber: unit ? unit.unitNumber : (r.unitNumber || '101')
      };
    });

  const statusSummary = {
    totalUnits: roomUnits.length,
    availableUnits: roomUnits.filter(u => u.status === 'available').length,
    occupiedUnits: roomUnits.filter(u => u.status === 'occupied').length,
    cleaningUnits: roomUnits.filter(u => u.status === 'cleaning').length,
    maintenanceUnits: roomUnits.filter(u => u.status === 'maintenance').length
  };

  res.json({
    success: true,
    data: {
      pendingCount: pendingReservations.length,
      readyToCheckInCount: approvedReservations.length,
      inHouseCount: inHouseGuests.length,
      approachingCheckoutCount: approachingCheckoutReservations.length,
      approachingReservations: approachingCheckoutReservations,
      statusSummary,
      recentPending: pendingReservations.slice(0, 5)
    }
  });
});

// ================================================================
//  START SERVER
// ================================================================

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`   🏨 HotelKu Server with Full RBAC!`);
  console.log(`   🌐 http://localhost:${PORT}`);
  console.log(`   📋 Login: http://localhost:${PORT}/login`);
  console.log(`========================================`);
  console.log(`\nDemo Credentials:`);
  console.log(`  🔑 Admin       : admin@hotelku.com / admin123`);
  console.log(`  🛎️ Resepsionis : resepsionis@hotelku.com / resepsionis123`);
  console.log(`  🧳 Tamu        : tamu@demo.com / tamu123\n`);
});

module.exports = app;
