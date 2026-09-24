require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const db = require('./db/supabase');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust reverse proxy (wajib untuk deploy di Render, Vercel, Railway, Heroku agar session cookie HTTPS berfungsi di HP)
app.set('trust proxy', 1);

// ================================================================
//  PERSISTENCE STORAGE (File JSON agar data tidak hilang saat restart)
// ================================================================

const IS_VERCEL = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = IS_VERCEL ? '/tmp/hotel_data' : path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
}

// Seed initial files on Vercel if /tmp/hotel_data is fresh
if (IS_VERCEL) {
  try {
    const seedDir = path.join(__dirname, 'data');
    ['users.json', 'reservations.json', 'reviews.json'].forEach(f => {
      const target = path.join(DATA_DIR, f);
      const src = path.join(seedDir, f);
      if (!fs.existsSync(target) && fs.existsSync(src)) {
        try { fs.copyFileSync(src, target); } catch (e) {}
      }
    });
  } catch (e) {}
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
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
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

function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      const key = parts.shift().trim();
      const val = parts.join('=');
      try {
        list[key] = decodeURIComponent(val);
      } catch (e) {
        list[key] = val;
      }
    });
  }
  return list;
}

// Cookie Auth Middleware: Keeps user logged in across Vercel serverless cold starts & direct page navigations
app.use((req, res, next) => {
  if (!req.session) req.session = {};
  if (!req.session.user) {
    const cookies = parseCookies(req);
    if (cookies.hotelku_auth) {
      try {
        const u = JSON.parse(cookies.hotelku_auth);
        if (u && (u.id || u.email)) {
          req.session.user = {
            id: u.id,
            name: u.name || 'Tamu',
            email: u.email,
            role: u.role || 'guest',
            phone: u.phone || ''
          };
        }
      } catch (e) {}
    }
  }
  next();
});

// Default initial users
let users = [
  { id: 1, name: 'Hendra Wijaya (GM)', email: 'admin@hotelku.com', password: 'admin123', role: 'admin', phone: '081122334455' },
  { id: 2, name: 'Siti Rahma (Front Desk)', email: 'resepsionis@hotelku.com', password: 'resepsionis123', role: 'receptionist', phone: '082233445566' },
  { id: 3, name: 'Budi Santoso', email: 'tamu@demo.com', password: 'tamu123', role: 'guest', phone: '081234567890' },
  { id: 4, name: 'Sari Dewi', email: 'sari@demo.com', password: 'sari123', role: 'guest', phone: '089876543210' }
];

let userCounter = 4;

function saveUsers(userToSync) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users.json:', err.message);
  }
  const toSync = userToSync || (users.length > 0 ? users[users.length - 1] : null);
  if (toSync) {
    db.upsertUser(toSync).catch(e => console.error('[Supabase] Sync user error:', e.message));
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

const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');

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

function saveReviews(revToSync) {
  try {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving reviews.json:', err.message);
  }
  const toSync = revToSync || (reviews.length > 0 ? reviews[reviews.length - 1] : null);
  if (toSync) {
    db.insertReview(toSync).catch(e => console.error('[Supabase] Sync review error:', e.message));
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
    name: 'Royal Honeymoon Suite',
    type: 'Suite',
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

const ROOMS_FILE = path.join(DATA_DIR, 'rooms.json');
const ROOM_UNITS_FILE = path.join(DATA_DIR, 'room_units.json');

function saveRooms(roomToSync, deletedRoomId) {
  try {
    fs.writeFileSync(ROOMS_FILE, JSON.stringify(rooms, null, 2), 'utf-8');
    fs.writeFileSync(ROOM_UNITS_FILE, JSON.stringify(roomUnits, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving rooms.json:', err.message);
  }
  if (roomToSync) {
    db.upsertRoom(roomToSync).catch(e => console.error('[Supabase] Sync room error:', e.message));
  }
  if (deletedRoomId) {
    db.deleteRoom(deletedRoomId).catch(e => console.error('[Supabase] Delete room error:', e.message));
  }
}

function loadRooms() {
  try {
    if (fs.existsSync(ROOMS_FILE)) {
      const data = JSON.parse(fs.readFileSync(ROOMS_FILE, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) {
        rooms = data;
        roomCounter = Math.max(...rooms.map(r => r.id || 0), 10);
      }
    } else {
      saveRooms();
    }
    if (fs.existsSync(ROOM_UNITS_FILE)) {
      const uData = JSON.parse(fs.readFileSync(ROOM_UNITS_FILE, 'utf-8'));
      if (Array.isArray(uData) && uData.length > 0) {
        roomUnits = uData;
      }
    }
  } catch (err) {
    console.error('Error loading rooms.json:', err.message);
  }
}

loadRooms();

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

function saveReservations(rsvToSync) {
  try {
    fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify(reservations, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving reservations.json:', err.message);
  }
  const toSync = rsvToSync || (reservations.length > 0 ? reservations[reservations.length - 1] : null);
  if (toSync) {
    db.upsertReservation(toSync).catch(e => console.error('[Supabase] Sync reservation error:', e.message));
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
//  DATABASE SYNC (Supabase PostgreSQL + In-Memory Caching)
// ================================================================
let isDbInitialized = false;
let dbInitPromise = null;

async function initDatabase() {
  try {
    const isConn = await db.checkConnection();
    if (isConn) {
      console.log('  ⚡ Supabase: Terhubung & Aktif!');
      const suUsers = await db.getUsers();
      if (suUsers && suUsers.length > 0) {
        users = suUsers;
        userCounter = Math.max(...users.map(u => u.id || 0), 4);
      }
      const suRooms = await db.getRooms();
      if (suRooms && suRooms.length > 0) {
        rooms = suRooms;
        roomCounter = Math.max(...rooms.map(r => r.id || 0), 10);
        try {
          fs.writeFileSync(ROOMS_FILE, JSON.stringify(rooms, null, 2), 'utf-8');
        } catch (e) {}
      }
      const suRsv = await db.getReservations();
      if (suRsv && suRsv.length > 0) {
        reservations = suRsv;
        const ids = reservations.map(r => parseInt(String(r.id).replace('RSV-', '')) || 0);
        reservationCounter = Math.max(...ids, 4);
      }
      const suRev = await db.getReviews();
      if (suRev && suRev.length > 0) {
        reviews = suRev;
      }
      isDbInitialized = true;
      return true;
    } else {
      console.log('  📁 Database: Menggunakan penyimpanan lokal');
      return false;
    }
  } catch (err) {
    console.log('  📁 Database fallback lokal:', err.message);
    return false;
  }
}

function ensureDatabase() {
  if (isDbInitialized) return Promise.resolve(true);
  if (!dbInitPromise) {
    dbInitPromise = initDatabase().then(res => {
      isDbInitialized = true;
      return res;
    }).catch(err => {
      console.error('[Supabase Init Error]:', err.message);
      dbInitPromise = null;
      return false;
    });
  }
  return dbInitPromise;
}

// Auto-trigger initialization on startup
ensureDatabase();

// Middleware to ensure database data is loaded before handling any API or page request
app.use(async (req, res, next) => {
  try {
    await ensureDatabase();
  } catch (e) {}
  next();
});

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
  if (req.session && req.session.user) return next();
  const cookies = parseCookies(req);
  if (cookies.hotelku_auth) {
    try {
      const u = JSON.parse(cookies.hotelku_auth);
      if (u && (u.id || u.email)) {
        req.session.user = u;
        return next();
      }
    } catch (e) {}
  }
  return res.redirect('/login');
}

function requireAdmin(req, res, next) {
  if (!req.session?.user) {
    const cookies = parseCookies(req);
    if (cookies.hotelku_auth) {
      try {
        const u = JSON.parse(cookies.hotelku_auth);
        if (u && (u.id || u.email)) req.session.user = u;
      } catch (e) {}
    }
  }
  if (!req.session?.user) return res.redirect('/login');
  if (req.session.user.role !== 'admin') {
    if (req.session.user.role === 'receptionist') return res.redirect('/receptionist/dashboard');
    return res.redirect('/rooms');
  }
  next();
}

function requireStaff(req, res, next) {
  if (!req.session?.user) {
    const cookies = parseCookies(req);
    if (cookies.hotelku_auth) {
      try {
        const u = JSON.parse(cookies.hotelku_auth);
        if (u && (u.id || u.email)) req.session.user = u;
      } catch (e) {}
    }
  }
  if (!req.session?.user) return res.redirect('/login');
  if (req.session.user.role !== 'admin' && req.session.user.role !== 'receptionist') {
    return res.redirect('/rooms');
  }
  next();
}

function apiAuth(req, res, next) {
  if (req.session && req.session.user) return next();

  // 0. Fallback dari cookie hotelku_auth
  const cookies = parseCookies(req);
  if (cookies.hotelku_auth) {
    try {
      const u = JSON.parse(cookies.hotelku_auth);
      if (u && (u.id || u.email)) {
        req.session.user = u;
        return next();
      }
    } catch (e) {}
  }

  // 1. Fallback dari custom headers (dikirim otomatis oleh browser melalui localStorage)
  const fallbackUserId = req.headers['x-user-id'] || req.query.userId;
  const fallbackEmail = req.headers['x-user-email'] || req.body?.guestEmail;
  const rsvId = req.body?.reservationId || req.params?.id;

  if (fallbackUserId || fallbackEmail) {
    const cleanMail = fallbackEmail ? String(fallbackEmail).trim().toLowerCase() : '';
    const cleanId = fallbackUserId ? parseInt(fallbackUserId) : null;

    let u = users.find(x => (cleanId && x.id === cleanId) || (cleanMail && x.email.toLowerCase() === cleanMail));
    if (!u) {
      u = {
        id: cleanId || ++userCounter,
        name: req.headers['x-user-name'] ? decodeURIComponent(req.headers['x-user-name']) : 'Tamu',
        email: cleanMail || `tamu_${cleanId || Date.now()}@hotelku.com`,
        role: req.headers['x-user-role'] || 'guest',
        phone: req.headers['x-user-phone'] ? decodeURIComponent(req.headers['x-user-phone']) : ''
      };
      users.push(u);
    }
    req.session.user = { id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone || '' };
    return next();
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
  if (!req.session?.user) {
    const cookies = parseCookies(req);
    if (cookies.hotelku_auth) {
      try {
        const u = JSON.parse(cookies.hotelku_auth);
        if (u && (u.id || u.email)) req.session.user = u;
      } catch (e) {}
    }
  }

  if (!req.session?.user) {
    const fallbackUserId = req.headers['x-user-id'] || req.query.userId;
    const fallbackEmail = req.headers['x-user-email'];
    const fallbackRole = req.headers['x-user-role'];
    if (fallbackUserId || fallbackEmail || fallbackRole) {
      const cleanMail = fallbackEmail ? String(fallbackEmail).trim().toLowerCase() : '';
      const cleanId = fallbackUserId ? parseInt(fallbackUserId) : null;
      let u = users.find(x => (cleanId && x.id === cleanId) || (cleanMail && x.email.toLowerCase() === cleanMail));
      if (u) {
        req.session.user = { id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone || '' };
      } else if (fallbackRole === 'admin') {
        req.session.user = {
          id: cleanId || 1,
          name: req.headers['x-user-name'] ? decodeURIComponent(req.headers['x-user-name']) : 'Administrator',
          email: cleanMail || 'admin@hotelku.com',
          role: 'admin'
        };
      }
    }
  }

  if (!req.session?.user) return res.status(401).json({ success: false, message: 'Silakan login sebagai administrator' });
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Akses ditolak: Hanya Administrator yang memiliki hak akses fitur ini' });
  }
  next();
}

function apiStaff(req, res, next) {
  if (!req.session?.user) {
    const cookies = parseCookies(req);
    if (cookies.hotelku_auth) {
      try {
        const u = JSON.parse(cookies.hotelku_auth);
        if (u && (u.id || u.email)) req.session.user = u;
      } catch (e) {}
    }
  }

  if (!req.session?.user) {
    const fallbackUserId = req.headers['x-user-id'] || req.query.userId;
    const fallbackEmail = req.headers['x-user-email'];
    const fallbackRole = req.headers['x-user-role'];
    if (fallbackUserId || fallbackEmail || fallbackRole) {
      const cleanMail = fallbackEmail ? String(fallbackEmail).trim().toLowerCase() : '';
      const cleanId = fallbackUserId ? parseInt(fallbackUserId) : null;
      let u = users.find(x => (cleanId && x.id === cleanId) || (cleanMail && x.email.toLowerCase() === cleanMail));
      if (u) {
        req.session.user = { id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone || '' };
      } else if (fallbackRole === 'admin' || fallbackRole === 'receptionist') {
        req.session.user = {
          id: cleanId || 2,
          name: req.headers['x-user-name'] ? decodeURIComponent(req.headers['x-user-name']) : 'Staf Hotel',
          email: cleanMail || 'resepsionis@hotelku.com',
          role: fallbackRole
        };
      }
    }
  }

  if (!req.session?.user) return res.status(401).json({ success: false, message: 'Silakan login sebagai staf hotel' });
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

// Google OAuth Flow (Supabase)
app.get(['/auth/google', '/api/auth/google'], async (req, res) => {
  try {
    const client = db.getClient();
    if (!client) {
      return res.redirect('/login?error=supabase_not_configured');
    }
    const host = req.get('host');
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const redirectTo = `${protocol}://${host}/auth/callback`;

    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo
      }
    });

    if (error || !data || !data.url) {
      console.error('[Google OAuth Error]:', error ? error.message : 'No URL generated');
      return res.redirect('/login?error=oauth_init_failed');
    }

    res.redirect(data.url);
  } catch (err) {
    console.error('[Google OAuth Error]:', err.message);
    res.redirect('/login?error=oauth_exception');
  }
});

app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  const client = db.getClient();

  if (code && client) {
    try {
      const { data, error } = await client.auth.exchangeCodeForSession(code);
      if (!error && data?.session?.user) {
        const authUser = data.session.user;
        const email = authUser.email ? authUser.email.toLowerCase().trim() : '';
        const name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || email.split('@')[0] || 'Tamu Google';
        const phone = authUser.phone || authUser.user_metadata?.phone || '';

        if (email) {
          let user = users.find(u => u.email.toLowerCase() === email);
          if (!user) {
            user = {
              id: ++userCounter,
              name,
              email,
              password: 'google_oauth_' + Math.random().toString(36).slice(2),
              role: 'guest',
              phone
            };
            users.push(user);
            saveUsers(user);
          }

          req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone || '' };
          res.cookie('hotelku_auth', JSON.stringify(req.session.user), {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: false,
            sameSite: 'lax',
            path: '/'
          });

          return res.send(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Berhasil — HotelKu</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #1A1A1A 0%, #2A241E 100%); color: #fff; }
    .card { background: rgba(35, 30, 26, 0.95); border: 1px solid rgba(196, 162, 101, 0.3); padding: 40px; border-radius: 16px; text-align: center; max-width: 400px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .spinner { width: 44px; height: 44px; border: 4px solid rgba(196, 162, 101, 0.2); border-top-color: #C4A265; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 20px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { color: #E8D7B5; margin: 0 0 8px; font-size: 1.3rem; }
    p { color: #A99E91; font-size: 0.9rem; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h2>Login Berhasil!</h2>
    <p>Selamat datang, ${user.name}. Mengalihkan...</p>
  </div>
  <script>
    localStorage.setItem('hotelku_user', JSON.stringify(${JSON.stringify(req.session.user)}));
    localStorage.removeItem('hotelku_my_rsv');
    setTimeout(() => {
      window.location.href = '/rooms';
    }, 600);
  </script>
</body>
</html>`);
        }
      }
    } catch (e) {
      console.error('[OAuth exchangeCode error]:', e.message);
    }
  }

  // Fallback for Implicit Grant (#access_token=... in URL fragment, handled on client)
  res.sendFile(path.join(__dirname, 'views', 'auth-callback.html'));
});

app.post('/api/auth/google/callback', (req, res) => {
  const { email, name, phone } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email tidak ditemukan' });

  const cleanEmail = email.toLowerCase().trim();
  let user = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    user = {
      id: ++userCounter,
      name: name || cleanEmail.split('@')[0],
      email: cleanEmail,
      password: 'google_oauth_' + Math.random().toString(36).slice(2),
      role: 'guest',
      phone: phone || ''
    };
    users.push(user);
    saveUsers(user);
  }

  req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone || '' };
  res.cookie('hotelku_auth', JSON.stringify(req.session.user), {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: false,
    sameSite: 'lax',
    path: '/'
  });

  res.json({ success: true, user: req.session.user });
});

app.get('/dashboard', requireLogin, (req, res) => {
  if (req.session.user.role === 'admin') return res.redirect('/admin/dashboard');
  if (req.session.user.role === 'receptionist') return res.redirect('/receptionist/dashboard');
  return res.redirect('/rooms');
});

// Guest Pages
app.get('/rooms', (req, res) => res.sendFile(path.join(__dirname, 'views', 'rooms.html')));
app.get('/rooms/:id', (req, res) => res.sendFile(path.join(__dirname, 'views', 'room-detail.html')));
app.get('/reservation/:roomId', (req, res) => res.sendFile(path.join(__dirname, 'views', 'reservation-form.html')));
app.get('/my-reservations', (req, res) => res.sendFile(path.join(__dirname, 'views', 'my-reservations.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, 'views', 'profile.html')));

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
app.post('/api/register', async (req, res) => {
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

  let existing = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!existing) {
    try {
      const suUsers = await db.getUsers();
      if (suUsers && suUsers.length > 0) {
        users = suUsers;
        existing = users.find(u => u.email.toLowerCase() === cleanEmail);
      }
    } catch (e) {}
  }
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
  saveUsers(newUser);

  // Directly await saving to Supabase Cloud so the record is guaranteed to exist immediately
  try {
    const saved = await db.upsertUser(newUser);
    if (saved && saved.id) {
      newUser.id = saved.id;
    }
  } catch (e) {
    console.error('[Supabase] Register upsert error:', e.message);
  }

  // Pastikan sesi akun lama dibersihkan agar tidak terbawa ke akun baru
  if (req.session) {
    req.session.user = null;
  }
  res.clearCookie('hotelku_auth', { path: '/' });

  // Tamu tidak langsung login otomatis, melainkan dialihkan ke menu Masuk (login)
  res.json({
    success: true,
    message: `Pendaftaran akun berhasil! Silakan masuk dengan email dan password Anda.`,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      password: cleanPassword
    },
    redirect: '/login?registered=1'
  });
});

app.post('/api/login', async (req, res) => {
  const { email, password, localAccount } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email dan password harus diisi' });

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  let user = users.find(u => 
    ((u.email && u.email.toLowerCase() === cleanEmail) || 
     (u.username && u.username.toLowerCase() === cleanEmail)) && 
    u.password === cleanPassword
  );

  // Directly lookup in Supabase Cloud if not found in current memory instance
  if (!user) {
    try {
      const suUsers = await db.getUsers();
      if (suUsers && suUsers.length > 0) {
        users = suUsers;
        user = users.find(u => 
          ((u.email && u.email.toLowerCase() === cleanEmail) || 
           (u.username && u.username.toLowerCase() === cleanEmail)) && 
          u.password === cleanPassword
        );
      }
    } catch (e) {
      console.error('[Supabase] Login check error:', e.message);
    }
  }

  // Fallback for Vercel Serverless: If serverless instance cold-started without the newly registered user
  if (!user && localAccount && localAccount.email && localAccount.password) {
    if (localAccount.email.trim().toLowerCase() === cleanEmail && localAccount.password.trim() === cleanPassword) {
      user = {
        id: localAccount.id || ++userCounter,
        name: (localAccount.name || 'Tamu').trim(),
        email: cleanEmail,
        password: cleanPassword,
        role: localAccount.role || 'guest',
        phone: (localAccount.phone || '').trim()
      };
      users.push(user);
      saveUsers(user);
      db.upsertUser(user).catch(() => {});
    }
  }

  if (!user) return res.status(401).json({ success: false, message: 'Email atau password salah' });

  req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone || '' };
  res.cookie('hotelku_auth', JSON.stringify(req.session.user), {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: false,
    sameSite: 'lax',
    path: '/'
  });
  res.json({ success: true, message: 'Login berhasil! Selamat datang, ' + user.name, user: req.session.user });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('hotelku_auth', { path: '/' });
  req.session.destroy(() => res.json({ success: true, message: 'Logout berhasil' }));
});

app.get('/api/me', (req, res) => {
  if (!req.session.user) {
    const cookies = parseCookies(req);
    if (cookies.hotelku_auth) {
      try {
        const u = JSON.parse(cookies.hotelku_auth);
        if (u && (u.id || u.email)) req.session.user = u;
      } catch (e) {}
    }
    const fallbackUserId = req.headers['x-user-id'] || req.query.userId;
    const fallbackEmail = req.headers['x-user-email'];
    if (!req.session.user) {
      if (fallbackUserId) {
        const u = users.find(x => x.id === parseInt(fallbackUserId));
        if (u) req.session.user = { id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone || '' };
      } else if (fallbackEmail) {
        const u = users.find(x => x.email.toLowerCase() === String(fallbackEmail).trim().toLowerCase());
        if (u) req.session.user = { id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone || '' };
      }
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
    res.cookie('hotelku_auth', JSON.stringify(req.session.user), {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: false,
      sameSite: 'lax',
      path: '/'
    });
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

  const cleanPrice = parseInt(price);
  const cleanCapacity = parseInt(capacity);
  const cleanTotalUnits = parseInt(totalUnits) || 3;
  const cleanSize = parseInt(size) || 25;

  const newRoom = {
    id: ++roomCounter,
    name: name.trim(),
    type: type || 'Standard',
    price: cleanPrice,
    capacity: cleanCapacity,
    size: cleanSize,
    bed: bed ? bed.trim() : '1 King Bed',
    description: description ? description.trim() : 'Kamar nyaman dan mewah di HotelKu.',
    facilities: Array.isArray(facilities) ? facilities : (facilities ? facilities.split(',').map(s => s.trim()).filter(Boolean) : ['WiFi Gratis', 'AC']),
    photos: Array.isArray(photos) && photos.length ? photos : [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
    ],
    totalUnits: cleanTotalUnits,
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

  saveRooms(newRoom);

  res.json({ success: true, message: `Kamar baru "${newRoom.name}" berhasil ditambahkan!`, room: newRoom });
});

// Admin: Edit Kamar (Termasuk ubah harga, foto, deskripsi, fasilitas, unit)
app.put('/api/admin/rooms/:id', apiAdmin, (req, res) => {
  const targetId = parseInt(req.params.id);
  const room = rooms.find(r => r.id === targetId);
  if (!room) return res.status(404).json({ success: false, message: 'Kamar tidak ditemukan' });

  const { name, type, price, capacity, size, bed, description, facilities, photos, totalUnits } = req.body;

  if (name) room.name = name.trim();
  if (type) room.type = type;
  if (price !== undefined) room.price = parseInt(price);
  if (capacity !== undefined) room.capacity = parseInt(capacity);
  if (size !== undefined) room.size = parseInt(size);
  if (bed) room.bed = bed.trim();
  if (description !== undefined) room.description = description.trim();
  if (facilities) room.facilities = Array.isArray(facilities) ? facilities : facilities.split(',').map(s => s.trim()).filter(Boolean);
  if (photos && Array.isArray(photos) && photos.length) room.photos = photos;

  if (totalUnits !== undefined) {
    const newTotal = parseInt(totalUnits);
    if (!isNaN(newTotal) && newTotal > 0 && newTotal !== room.totalUnits) {
      const oldTotal = room.totalUnits;
      room.totalUnits = newTotal;
      if (newTotal > oldTotal) {
        for (let i = oldTotal + 1; i <= newTotal; i++) {
          roomUnits.push({
            unitNumber: `${room.id}0${i}`,
            roomId: room.id,
            floor: room.id,
            status: 'available',
            guestName: ''
          });
        }
      } else if (newTotal < oldTotal) {
        const currentUnits = roomUnits.filter(u => u.roomId === room.id);
        const excess = currentUnits.slice(newTotal);
        roomUnits = roomUnits.filter(u => !excess.includes(u));
      }
    }
  }

  saveRooms(room);

  res.json({ success: true, message: `Data kamar "${room.name}" berhasil diperbarui!`, room });
});

// Admin: Hapus Kamar
app.delete('/api/admin/rooms/:id', apiAdmin, (req, res) => {
  const targetId = parseInt(req.params.id);
  const idx = rooms.findIndex(r => r.id === targetId);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Kamar tidak ditemukan' });

  // Cegah hapus kamar jika ada reservasi aktif
  const hasActiveRsv = reservations.some(r => r.roomId === targetId && ['pending', 'approved', 'checked-in'].includes(r.status));
  if (hasActiveRsv) {
    return res.status(400).json({
      success: false,
      message: `Tidak dapat menghapus kamar "${rooms[idx].name}" karena masih ada reservasi aktif (pending, disetujui, atau sedang menginap).`
    });
  }

  const deletedName = rooms[idx].name;
  rooms.splice(idx, 1);
  // remove units
  roomUnits = roomUnits.filter(u => u.roomId !== targetId);

  saveRooms(null, targetId);

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
app.post('/api/reservations', apiAuth, async (req, res) => {
  const { roomId, checkIn, checkOut, guestName, guestPhone, guestEmail, notes, userId } = req.body;

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

  // Prioritaskan user ID dari sesi login atau body/header
  let rsvUserId = (req.session && req.session.user && req.session.user.id)
    ? req.session.user.id
    : (userId || req.headers['x-user-id']);

  if (rsvUserId) {
    rsvUserId = parseInt(rsvUserId);
    if (!req.session.user) {
      req.session.user = {
        id: rsvUserId,
        name: guestName.trim(),
        email: (guestEmail || '').trim().toLowerCase(),
        role: 'guest',
        phone: (guestPhone || '').trim()
      };
    }
  }

  // Jika belum ada ID pengguna terdaftar, cari atau buat akun tamu baru
  if (!rsvUserId) {
    const cleanEmail = (guestEmail || '').trim().toLowerCase();
    let existingUser = cleanEmail ? users.find(u => u.email.toLowerCase() === cleanEmail) : null;
    if (!existingUser && cleanEmail) {
      try {
        const suUsers = await db.getUsers();
        if (suUsers && suUsers.length > 0) {
          users = suUsers;
          existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);
        }
      } catch (e) {}
    }
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
      saveUsers(existingUser);
      try {
        const saved = await db.upsertUser(existingUser);
        if (saved && saved.id) existingUser.id = saved.id;
      } catch (e) {}
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
    roomName: room.name,
    roomType: room.type,
    roomPhoto: (room.photos && room.photos[0]) ? room.photos[0] : 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
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
  saveReservations(reservation);

  // Directly await saving to Supabase Cloud
  try {
    await db.upsertReservation(reservation);
  } catch (e) {
    console.error('[Supabase] Reservation direct upsert error:', e.message);
  }

  // Set auth cookie so browser maintains session seamlessly on page redirect
  if (req.session.user) {
    res.cookie('hotelku_auth', JSON.stringify(req.session.user), {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: false,
      sameSite: 'lax',
      path: '/'
    });
  }

  res.json({
    success: true,
    message: 'Pembayaran berhasil dikonfirmasi! Permohonan reservasi Anda telah diteruskan ke Resepsionis untuk disetujui (ACC).',
    reservation,
    user: req.session.user
  });
});

// List reservations (Staff sees all, Guest sees own)
app.get('/api/reservations', apiAuth, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  const { status } = req.query;

  // Always refresh latest reservations from Supabase Cloud
  try {
    const suRsv = await db.getReservations();
    if (suRsv && suRsv.length > 0) {
      reservations = suRsv;
    }
  } catch (e) {
    console.error('[Supabase] GET /api/reservations refresh error:', e.message);
  }

  let result;
  if (req.session.user.role === 'admin' || req.session.user.role === 'receptionist') {
    result = [...reservations];
  } else {
    const sId = parseInt(req.session.user.id);
    const sEmail = (req.session.user.email || '').trim().toLowerCase();
    const sName = (req.session.user.name || '').trim().toLowerCase();

    result = reservations.filter(r => {
      if (!r) return false;
      const rEmail = (r.guestEmail || '').trim().toLowerCase();
      const rName = (r.guestName || '').trim().toLowerCase();
      const rId = r.userId ? parseInt(r.userId) : null;

      // 1. Email adalah identitas unik utama akun tamu
      if (sEmail && rEmail) {
        return rEmail === sEmail;
      }
      // 2. Jika email tidak tercatat pada reservasi, cocokkan id dan nama
      if (sId && rId && sId === rId) {
        if (sName && rName && sName !== rName) return false;
        return true;
      }
      if (sName && rName && sName === rName) {
        return true;
      }
      return false;
    });
  }

  if (status && status !== 'all') {
    result = result.filter(r => r.status === status);
  }

  result = result.map(r => {
    const room = rooms.find(rm => rm.id === parseInt(r.roomId));
    const finalRoomName = (r.roomName && r.roomName !== 'undefined') ? r.roomName : (room ? room.name : 'Standard Room');
    const finalRoomType = (r.roomType && r.roomType !== 'undefined') ? r.roomType : (room ? room.type : 'Standard');
    const finalRoomPhoto = (r.roomPhoto && r.roomPhoto !== 'undefined') ? r.roomPhoto : (room && room.photos && room.photos[0] ? room.photos[0] : 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80');
    return {
      ...r,
      roomName: finalRoomName,
      roomType: finalRoomType,
      roomPhoto: finalRoomPhoto
    };
  });

  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, reservations: result });
});

// Helper: Find reservation in memory or pull fresh from Supabase
async function findReservationById(id) {
  let rsv = reservations.find(r => r.id === id);
  if (!rsv) {
    try {
      const dbRsvs = await db.getReservations();
      if (dbRsvs && dbRsvs.length > 0) {
        reservations = dbRsvs;
        rsv = reservations.find(r => r.id === id);
      }
    } catch (e) {
      console.error('[Supabase] findReservationById refresh error:', e.message);
    }
  }
  return rsv;
}

// Staff: Approve reservation (ACC)
app.put('/api/reservations/:id/approve', apiStaff, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const rsv = await findReservationById(req.params.id);
  if (!rsv) return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan' });
  if (rsv.status !== 'pending') {
    if (rsv.status === 'approved') {
      return res.json({ success: true, message: `Reservasi ${rsv.id} sudah disetujui (ACC)`, reservation: rsv });
    }
    return res.status(400).json({ success: false, message: `Reservasi tidak dalam status pending (Status saat ini: ${rsv.status})` });
  }

  rsv.status = 'approved';
  rsv.approvedAt = new Date().toISOString();
  rsv.rejectionReason = '';
  saveReservations(rsv);
  try {
    await db.upsertReservation(rsv);
  } catch (e) {
    console.error('[Supabase] Approve direct upsert error:', e.message);
  }
  res.json({ success: true, message: `Reservasi ${rsv.id} telah disetujui (ACC) oleh staf`, reservation: rsv });
});

// Staff: Reject reservation
app.put('/api/reservations/:id/reject', apiStaff, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const rsv = await findReservationById(req.params.id);
  if (!rsv) return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan' });
  if (rsv.status !== 'pending') {
    if (rsv.status === 'rejected') {
      return res.json({ success: true, message: `Reservasi ${rsv.id} sudah ditolak`, reservation: rsv });
    }
    return res.status(400).json({ success: false, message: 'Reservasi tidak dalam status pending' });
  }

  rsv.status = 'rejected';
  rsv.rejectionReason = req.body.reason || 'Kamar tidak tersedia pada jadwal yang diminta';
  saveReservations(rsv);
  try {
    await db.upsertReservation(rsv);
  } catch (e) {
    console.error('[Supabase] Reject direct upsert error:', e.message);
  }
  res.json({ success: true, message: `Reservasi ${rsv.id} telah ditolak`, reservation: rsv });
});

// Staff: Approve & Check-In Langsung (1 langkah oleh Resepsionis)
app.put('/api/reservations/:id/approve-checkin', apiStaff, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const rsv = await findReservationById(req.params.id);
  if (!rsv) return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan' });
  if (rsv.status === 'checked-in') {
    return res.json({ success: true, message: `Reservasi ${rsv.id} sudah di-check-in`, reservation: rsv });
  }
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

  saveReservations(rsv);
  try {
    await db.upsertReservation(rsv);
  } catch (e) {
    console.error('[Supabase] Approve-checkin direct upsert error:', e.message);
  }
  res.json({
    success: true,
    message: `Reservasi ${rsv.id} berhasil disetujui & langsung di-Check In oleh resepsionis ${availableUnit ? '(Unit ' + availableUnit.unitNumber + ')' : ''}`,
    reservation: rsv
  });
});

// HANYA STAF (Resepsionis / Admin): Check-in Tamu
app.put('/api/reservations/:id/checkin', apiStaff, async (req, res) => {
  const rsv = await findReservationById(req.params.id);
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

  saveReservations(rsv);
  try {
    await db.upsertReservation(rsv);
  } catch (e) {
    console.error('[Supabase] Checkin direct upsert error:', e.message);
  }
  res.json({ success: true, message: `Check-In berhasil diproses oleh Resepsionis! ${availableUnit ? '(Kamar Unit ' + availableUnit.unitNumber + ')' : ''}`, reservation: rsv });
});

// HANYA STAF (Resepsionis / Admin): Check-out Tamu
app.put('/api/reservations/:id/checkout', apiStaff, async (req, res) => {
  const rsv = await findReservationById(req.params.id);
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

  saveReservations(rsv);
  try {
    await db.upsertReservation(rsv);
  } catch (e) {
    console.error('[Supabase] Checkout direct upsert error:', e.message);
  }
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
app.put('/api/reservations/:id/late-checkout/:decision', apiStaff, async (req, res) => {
  const { decision } = req.params;
  const rsv = await findReservationById(req.params.id);
  if (!rsv) return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan' });

  if (decision === 'approve') {
    rsv.lateCheckoutStatus = 'approved';
    const extendedHour = 12 + (rsv.lateCheckoutHours || 1);
    saveReservations(rsv);
    try { await db.upsertReservation(rsv); } catch(e) {}
    return res.json({
      success: true,
      message: `Permohonan Late Check-Out disetujui! Batas waktu check-out diperpanjang menjadi pukul ${extendedHour}:00 WIB.`
    });
  } else if (decision === 'reject') {
    rsv.lateCheckoutStatus = 'rejected';
    saveReservations(rsv);
    try { await db.upsertReservation(rsv); } catch(e) {}
    return res.json({
      success: true,
      message: `Permohonan Late Check-Out ditolak karena tingginya okupansi kedatangan tamu berikutnya.`
    });
  }

  res.status(400).json({ success: false, message: 'Keputusan tidak valid' });
});

// Staff: Update Bellboy Service Status (Dispatched / Completed)
app.put('/api/reservations/:id/bellboy/:status', apiStaff, async (req, res) => {
  const { status } = req.params;
  const rsv = await findReservationById(req.params.id);
  if (!rsv) return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan' });

  rsv.bellboyStatus = status;
  saveReservations(rsv);
  try { await db.upsertReservation(rsv); } catch(e) {}
  res.json({
    success: true,
    message: status === 'dispatched'
      ? `Petugas bellboy telah diberangkatkan untuk membantu ${rsv.guestName}!`
      : `Bantuan bellboy untuk kamar ${rsv.guestName} selesai.`
  });
});

// Staff: Notify Guest that Room is Ready for Check-in
app.put('/api/receptionist/notify-room-ready/:id', apiStaff, async (req, res) => {
  const rsv = await findReservationById(req.params.id);
  if (!rsv) return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan' });

  rsv.roomReadyNotified = true;
  rsv.earlyCheckInAllowed = true;
  const now = new Date();
  rsv.roomReadyAt = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
  saveReservations(rsv);
  try { await db.upsertReservation(rsv); } catch(e) {}

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

app.get('/api/admin/users', apiAdmin, async (req, res) => {
  try {
    const suUsers = await db.getUsers();
    if (suUsers && suUsers.length > 0) {
      users = suUsers;
    }
  } catch (e) {}

  const safeUsers = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    username: u.username || '',
    gender: u.gender || '',
    address: u.address || '',
    role: u.role,
    phone: u.phone || ''
  }));
  res.json({ success: true, users: safeUsers });
});

app.post('/api/admin/users', apiAdmin, async (req, res) => {
  const { name, email, password, role, phone, gender, address, username } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username ? username.trim().toLowerCase() : '';

  const existing = users.find(u => 
    (u.email && u.email.toLowerCase() === cleanEmail) || 
    (cleanUsername && u.username && u.username.toLowerCase() === cleanUsername)
  );
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email atau username sudah terdaftar untuk pengguna lain' });
  }

  const newUser = {
    id: ++userCounter,
    name: name.trim(),
    email: cleanEmail,
    username: cleanUsername,
    gender: gender || '',
    address: address ? address.trim() : '',
    password,
    role: role || 'receptionist',
    phone: phone ? phone.trim() : ''
  };

  users.push(newUser);
  saveUsers(newUser);
  try { 
    const saved = await db.upsertUser(newUser); 
    if (saved && saved.id) newUser.id = saved.id;
  } catch(e) {
    console.error('[Supabase] Create user error:', e.message);
  }

  res.json({
    success: true,
    message: `Akun baru "${newUser.name}" (${newUser.role}) berhasil dibuat!`,
    user: newUser
  });
});

app.put('/api/admin/users/:id', apiAdmin, async (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

  const { name, email, role, phone, password, gender, address, username } = req.body;
  if (name) user.name = name.trim();
  if (email) user.email = email.trim().toLowerCase();
  if (username !== undefined) user.username = username.trim().toLowerCase();
  if (gender !== undefined) user.gender = gender;
  if (address !== undefined) user.address = address.trim();
  if (role) user.role = role;
  if (phone !== undefined) user.phone = phone.trim();
  if (password) user.password = password;
  saveUsers(user);
  try { 
    await db.upsertUser(user); 
  } catch(e) {
    console.error('[Supabase] Update user error:', e.message);
  }

  res.json({ success: true, message: `Data pengguna "${user.name}" berhasil diperbarui!`, user });
});

app.delete('/api/admin/users/:id', apiAdmin, async (req, res) => {
  const targetId = parseInt(req.params.id);
  if (targetId === req.session.user.id) {
    return res.status(400).json({ success: false, message: 'Anda tidak dapat menghapus akun Anda sendiri' });
  }

  if (targetId === 1) {
    return res.status(400).json({ success: false, message: 'Akun Administrator Utama (GM) tidak dapat dihapus' });
  }

  const idx = users.findIndex(u => u.id === targetId);
  if (idx === -1) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

  const deleted = users[idx].name;
  users.splice(idx, 1);
  saveUsers();

  // Hapus langsung dari Supabase Cloud (Single Source of Truth)
  try {
    await db.deleteUser(targetId);
  } catch (e) {
    console.error('[Supabase] Delete user error:', e.message);
  }

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

app.get('/api/receptionist/dashboard', apiStaff, async (req, res) => {
  try {
    const dbRsvs = await db.getReservations();
    if (dbRsvs && dbRsvs.length > 0) reservations = dbRsvs;
  } catch (e) {}

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
