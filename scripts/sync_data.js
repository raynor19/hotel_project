require('dotenv').config();
const path = require('path');
const fs = require('fs');
const db = require('../db/supabase');

async function sync() {
  console.log('--- Checking Supabase Connection ---');
  const isConnected = await db.checkConnection();
  if (!isConnected) {
    console.error('❌ Supabase belum terhubung atau tabel belum dibuat!');
    console.log('Silakan jalankan skrip SQL di Supabase SQL Editor terlebih dahulu (buka file scripts/setup_supabase.sql).');
    process.exit(1);
  }

  console.log('✓ Supabase terhubung!');

  // 1. Sync Rooms
  console.log('\n--- Syncing Rooms ---');
  try {
    const roomsFile = path.join(__dirname, '../data/rooms.json');
    let roomsData = [];
    if (fs.existsSync(roomsFile)) {
      roomsData = JSON.parse(fs.readFileSync(roomsFile, 'utf8'));
    }
    // If not in file, take from server.js rooms initial
    for (const r of roomsData) {
      await db.upsertRoom(r);
      console.log(`✓ Room synced: ${r.name}`);
    }
  } catch (e) {
    console.log('Rooms sync notice:', e.message);
  }

  // 2. Sync Users
  console.log('\n--- Syncing Users ---');
  try {
    const usersFile = path.join(__dirname, '../data/users.json');
    if (fs.existsSync(usersFile)) {
      const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      for (const u of usersData) {
        await db.upsertUser(u);
        console.log(`✓ User synced: ${u.email} (${u.role})`);
      }
    }
  } catch (e) {
    console.log('Users sync notice:', e.message);
  }

  // 3. Sync Reservations
  console.log('\n--- Syncing Reservations ---');
  try {
    const rsvFile = path.join(__dirname, '../data/reservations.json');
    if (fs.existsSync(rsvFile)) {
      const rsvData = JSON.parse(fs.readFileSync(rsvFile, 'utf8'));
      for (const r of rsvData) {
        await db.upsertReservation(r);
        console.log(`✓ Reservation synced: ${r.id} (${r.guestName})`);
      }
    }
  } catch (e) {
    console.log('Reservations sync notice:', e.message);
  }

  // 4. Sync Reviews
  console.log('\n--- Syncing Reviews ---');
  try {
    const revFile = path.join(__dirname, '../data/reviews.json');
    if (fs.existsSync(revFile)) {
      const revData = JSON.parse(fs.readFileSync(revFile, 'utf8'));
      for (const r of revData) {
        await db.insertReview(r);
        console.log(`✓ Review synced: Room ${r.roomId} by ${r.userName}`);
      }
    }
  } catch (e) {
    console.log('Reviews sync notice:', e.message);
  }

  console.log('\n🎉 SINKRONISASI KE SUPABASE SELESAI!');
  process.exit(0);
}

sync().catch(err => {
  console.error(err);
  process.exit(1);
});
