-- ============================================================
-- HOTELKU YOGYAKARTA — SUPABASE POSTGRESQL DATABASE SCHEMA
-- Jalankan skrip ini di Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ============================================================

-- 1. TABEL PENGGUNA (USERS)
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'guest',
  phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL KAMAR (ROOMS)
CREATE TABLE IF NOT EXISTS rooms (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  price NUMERIC NOT NULL,
  capacity INT NOT NULL,
  size INT NOT NULL,
  bed VARCHAR(100),
  description TEXT,
  facilities JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  total_units INT DEFAULT 4,
  occupied_units INT DEFAULT 0
);

-- 3. TABEL RESERVASI (RESERVATIONS)
CREATE TABLE IF NOT EXISTS reservations (
  id VARCHAR(50) PRIMARY KEY,
  room_id BIGINT REFERENCES rooms(id),
  user_id BIGINT,
  guest_name VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50),
  guest_email VARCHAR(255) NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_nights INT NOT NULL,
  total_price NUMERIC NOT NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  rejection_reason TEXT,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  payment_id VARCHAR(100),
  room_ready_notified BOOLEAN DEFAULT FALSE,
  room_ready_at VARCHAR(50),
  early_check_in_allowed BOOLEAN DEFAULT FALSE,
  checkout_confirmed_ready BOOLEAN DEFAULT FALSE,
  late_checkout_requested BOOLEAN DEFAULT FALSE,
  late_checkout_status VARCHAR(50) DEFAULT 'none',
  bellboy_requested BOOLEAN DEFAULT FALSE,
  bellboy_status VARCHAR(50) DEFAULT 'none',
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL ULASAN (REVIEWS)
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  reservation_id VARCHAR(50),
  room_id BIGINT REFERENCES rooms(id),
  user_id BIGINT,
  user_name VARCHAR(255) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DATA AWAL PENGGUNA (DEMO USERS)
INSERT INTO users (id, name, email, password, role, phone) VALUES
(1, 'Hendra Wijaya (GM)', 'admin@hotelku.com', 'admin123', 'admin', '081122334455'),
(2, 'Siti Rahma (Front Desk)', 'resepsionis@hotelku.com', 'resepsionis123', 'receptionist', '082233445566'),
(3, 'Budi Santoso', 'tamu@demo.com', 'tamu123', 'guest', '081234567890'),
(4, 'Sari Dewi', 'sari@demo.com', 'sari123', 'guest', '089876543210')
ON CONFLICT (email) DO NOTHING;

-- 6. DATA AWAL 6 TIPE KAMAR
INSERT INTO rooms (id, name, type, price, capacity, size, bed, description, facilities, photos, total_units, occupied_units) VALUES
(1, 'Standard Room', 'Standard', 350000, 2, 24, '1 Queen Bed', 'Kamar nyaman dengan desain minimalis modern, dilengkapi fasilitas lengkap untuk kenyamanan Anda.', '["WiFi Gratis", "AC", "TV LED 32\"", "Kamar Mandi Dalam", "Air Panas", "Meja Kerja"]'::jsonb, '["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80"]'::jsonb, 4, 1),
(2, 'Deluxe Room', 'Deluxe', 550000, 2, 32, '1 King Bed', 'Kamar luas dengan sentuhan etnik Jawa yang elegan. Dilengkapi balkon pribadi dengan pemandangan taman.', '["WiFi Gratis", "AC", "Smart TV 43\"", "Bathtub", "Air Panas", "Mini Bar", "Balkon", "Brankas"]'::jsonb, '["https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"]'::jsonb, 4, 1),
(3, 'Superior Room', 'Superior', 750000, 2, 38, '1 King Bed', 'Kamar superior dengan dekorasi batik premium dan furnitur kayu jati. Ruangan luas dengan area duduk terpisah.', '["WiFi Gratis", "AC", "Smart TV 50\"", "Bathtub & Shower", "Air Panas", "Mini Bar", "Sofa", "Brankas", "Jubah Mandi"]'::jsonb, '["https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80"]'::jsonb, 3, 1),
(4, 'Junior Suite', 'Suite', 1200000, 3, 48, '1 Super King + 1 Daybed', 'Suite mewah dengan ruang tamu terpisah bernuansa keraton Yogyakarta.', '["WiFi Gratis High-Speed", "AC Multi-Zone", "Smart TV 55\"", "Jacuzzi Pribadi", "Espresso Machine", "Walk-in Closet", "Layanan Butler"]'::jsonb, '["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"]'::jsonb, 2, 0),
(5, 'Executive Suite', 'Suite', 1850000, 4, 65, '2 King Beds', 'Suite eksekutif dengan panorama kota Yogyakarta yang memukau. Dua kamar tidur luas dengan ruang makan pribadi.', '["WiFi Gratis High-Speed", "AC Multi-Zone", "2x Smart TV 55\"", "Jacuzzi & Sauna Pribadi", "Dapur Bersih & Kulkas", "Balkon Luas", "Layanan Butler 24 Jam"]'::jsonb, '["https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"]'::jsonb, 2, 1),
(6, 'Presidential Suite', 'Suite', 3500000, 4, 110, '2 Super King Beds', 'Puncak kemewahan HotelKu. Dilengkapi kolam renang mini pribadi (plunge pool), ruang pertemuan VIP, dan interior ukiran kayu jati Jepara pilihan.', '["Akses Private Lift", "Private Plunge Pool", "Dining Room 8 Kursi", "Home Theater 65\"", "Master Bathroom Marmer", "Butler & Chef Pribadi 24 Jam", "Airport Transfer Alphard"]'::jsonb, '["https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80"]'::jsonb, 1, 0)
ON CONFLICT (id) DO NOTHING;

-- 7. REFRESH SEQUENCE ID
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- Nonaktifkan RLS agar backend / anon key dapat membaca dan menulis data
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
