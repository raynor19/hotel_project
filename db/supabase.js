require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

let supabase = null;
let isConnected = false;

function getClient() {
  if (supabase) return supabase;
  const SUPABASE_URL = process.env.SUPABASE_URL || '';
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false }
      });
    } catch (err) {
      console.error('[Supabase] Init error:', err.message);
    }
  }
  return supabase;
}

// Check database connection and table availability
async function checkConnection() {
  const client = getClient();
  if (!client) return false;
  try {
    const { data, error } = await client.from('rooms').select('id').limit(1);
    if (!error) {
      isConnected = true;
      return true;
    }
    console.error('[Supabase] checkConnection query error:', error.message);
    isConnected = false;
    return false;
  } catch (e) {
    console.error('[Supabase] checkConnection exception:', e.message);
    isConnected = false;
    return false;
  }
}

// ----------------- ROOMS MAPPING -----------------
function mapRoomToDb(r) {
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    price: r.price,
    capacity: r.capacity,
    size: r.size,
    bed: r.bed,
    description: r.description,
    facilities: r.facilities || [],
    photos: r.photos || [],
    total_units: r.totalUnits !== undefined ? r.totalUnits : 4,
    occupied_units: r.occupiedUnits !== undefined ? r.occupiedUnits : 0
  };
}

function mapRoomFromDb(row) {
  return {
    id: Number(row.id),
    name: row.name,
    type: row.type,
    price: Number(row.price),
    capacity: Number(row.capacity),
    size: Number(row.size),
    bed: row.bed,
    description: row.description,
    facilities: row.facilities || [],
    photos: row.photos || [],
    totalUnits: Number(row.total_units !== undefined ? row.total_units : 4),
    occupiedUnits: Number(row.occupied_units !== undefined ? row.occupied_units : 0)
  };
}

// ----------------- USERS MAPPING -----------------
function mapUserToDb(u) {
  return {
    ...(u.id ? { id: u.id } : {}),
    name: u.name,
    email: u.email.toLowerCase(),
    password: u.password,
    role: u.role || 'guest',
    phone: u.phone || ''
  };
}

function mapUserFromDb(row) {
  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role,
    phone: row.phone || ''
  };
}

// ----------------- RESERVATIONS MAPPING -----------------
function mapReservationToDb(rsv) {
  return {
    id: rsv.id,
    room_id: rsv.roomId,
    user_id: rsv.userId,
    guest_name: rsv.guestName,
    guest_phone: rsv.guestPhone || '',
    guest_email: rsv.guestEmail,
    check_in: rsv.checkIn,
    check_out: rsv.checkOut,
    total_nights: rsv.totalNights,
    total_price: rsv.totalPrice,
    notes: rsv.notes || '',
    status: rsv.status || 'pending',
    rejection_reason: rsv.rejectionReason || '',
    payment_method: rsv.paymentMethod || '',
    payment_status: rsv.paymentStatus || 'unpaid',
    payment_id: rsv.paymentId || '',
    room_ready_notified: !!rsv.roomReadyNotified,
    room_ready_at: rsv.roomReadyAt || '',
    early_check_in_allowed: !!rsv.earlyCheckInAllowed,
    checkout_confirmed_ready: !!rsv.checkoutConfirmedReady,
    late_checkout_requested: !!rsv.lateCheckoutRequested,
    late_checkout_status: rsv.lateCheckoutStatus || 'none',
    bellboy_requested: !!rsv.bellboyRequested,
    bellboy_status: rsv.bellboyStatus || 'none',
    checked_in_at: rsv.checkedInAt || null,
    checked_out_at: rsv.checkedOutAt || null,
    created_at: rsv.createdAt || new Date().toISOString()
  };
}

function mapReservationFromDb(row) {
  return {
    id: row.id,
    roomId: Number(row.room_id),
    userId: Number(row.user_id),
    guestName: row.guest_name,
    guestPhone: row.guest_phone || '',
    guestEmail: row.guest_email,
    checkIn: row.check_in,
    checkOut: row.check_out,
    totalNights: Number(row.total_nights),
    totalPrice: Number(row.total_price),
    notes: row.notes || '',
    status: row.status,
    rejectionReason: row.rejection_reason || '',
    paymentMethod: row.payment_method || '',
    paymentStatus: row.payment_status || 'unpaid',
    paymentId: row.payment_id || '',
    roomReadyNotified: !!row.room_ready_notified,
    roomReadyAt: row.room_ready_at || '',
    earlyCheckInAllowed: !!row.early_check_in_allowed,
    checkoutConfirmedReady: !!row.checkout_confirmed_ready,
    lateCheckoutRequested: !!row.late_checkout_requested,
    lateCheckoutStatus: row.late_checkout_status || 'none',
    bellboyRequested: !!row.bellboy_requested,
    bellboyStatus: row.bellboy_status || 'none',
    checkedInAt: row.checked_in_at,
    checkedOutAt: row.checked_out_at,
    createdAt: row.created_at
  };
}

// ----------------- REVIEWS MAPPING -----------------
function mapReviewToDb(rev) {
  return {
    ...(rev.id ? { id: rev.id } : {}),
    reservation_id: rev.reservationId,
    room_id: rev.roomId,
    user_id: rev.userId,
    user_name: rev.userName,
    rating: rev.rating,
    comment: rev.comment,
    created_at: rev.createdAt || new Date().toISOString()
  };
}

function mapReviewFromDb(row) {
  return {
    id: Number(row.id),
    reservationId: row.reservation_id,
    roomId: Number(row.room_id),
    userId: Number(row.user_id),
    userName: row.user_name,
    rating: Number(row.rating),
    comment: row.comment,
    createdAt: row.created_at
  };
}

// ----------------- CRUD API -----------------
const db = {
  getClient,
  checkConnection,

  // USERS
  async getUsers() {
    const client = getClient();
    if (!client) return null;
    const { data, error } = await client.from('users').select('*').order('id', { ascending: true });
    if (error) {
      console.error('[Supabase] getUsers error:', error.message);
      return null;
    }
    return data.map(mapUserFromDb);
  },

  async upsertUser(user) {
    const client = getClient();
    if (!client) return null;
    const payload = mapUserToDb(user);
    const { data, error } = await client.from('users').upsert(payload, { onConflict: 'email' }).select().single();
    if (error) {
      console.error('[Supabase] upsertUser error:', error.message);
      return null;
    }
    return mapUserFromDb(data);
  },

  // ROOMS
  async getRooms() {
    const client = getClient();
    if (!client) return null;
    const { data, error } = await client.from('rooms').select('*').order('id', { ascending: true });
    if (error) {
      console.error('[Supabase] getRooms error:', error.message);
      return null;
    }
    return data.map(mapRoomFromDb);
  },

  async upsertRoom(room) {
    const client = getClient();
    if (!client) return null;
    const payload = mapRoomToDb(room);
    const { data, error } = await client.from('rooms').upsert(payload, { onConflict: 'id' }).select().single();
    if (error) {
      console.error('[Supabase] upsertRoom error:', error.message);
      return null;
    }
    return mapRoomFromDb(data);
  },

  // RESERVATIONS
  async getReservations() {
    const client = getClient();
    if (!client) return null;
    const { data, error } = await client.from('reservations').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('[Supabase] getReservations error:', error.message);
      return null;
    }
    return data.map(mapReservationFromDb);
  },

  async upsertReservation(rsv) {
    const client = getClient();
    if (!client) return null;
    const payload = mapReservationToDb(rsv);
    const { data, error } = await client.from('reservations').upsert(payload, { onConflict: 'id' }).select().single();
    if (error) {
      console.error('[Supabase] upsertReservation error:', error.message);
      return null;
    }
    return mapReservationFromDb(data);
  },

  // REVIEWS
  async getReviews() {
    const client = getClient();
    if (!client) return null;
    const { data, error } = await client.from('reviews').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('[Supabase] getReviews error:', error.message);
      return null;
    }
    return data.map(mapReviewFromDb);
  },

  async insertReview(rev) {
    const client = getClient();
    if (!client) return null;
    const payload = mapReviewToDb(rev);
    const { data, error } = await client.from('reviews').insert(payload).select().single();
    if (error) {
      console.error('[Supabase] insertReview error:', error.message);
      return null;
    }
    return mapReviewFromDb(data);
  }
};

module.exports = db;
