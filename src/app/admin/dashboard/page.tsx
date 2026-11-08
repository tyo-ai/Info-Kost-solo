'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MapPicker from '@/components/MapPicker';
import { supabase } from '@/lib/supabaseClient';
import { compressImage } from '@/lib/imageCompressor';
import Link from 'next/link';
import Logo from '@/components/Logo';

interface BookingQueueItem {
  id: number;
  status: string;
  proof_of_payment_url: string;
  notes: string;
  created_at: string;
  rooms: {
    room_number: string;
    price_per_month: number;
    kosts: {
      name: string;
    };
  };
  profiles: {
    fullname: string;
    phone: string;
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();

  // Auth State
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('campur');
  const [subdistrict, setSubdistrict] = useState('Jebres');
  const [landmark, setLandmark] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('850000');
  const [roomNumber, setRoomNumber] = useState('Kamar 01');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: -7.5561, lng: 110.8558 });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

  // Antrean Verifikasi
  const [bookings, setBookings] = useState<BookingQueueItem[]>([]);
  const [activeProofModal, setActiveProofModal] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // ─── Cek Sesi Login ───────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
      } else if (session.user.email?.toLowerCase() !== 'kostsoloadmin@gmail.com') {
        // User biasa tidak boleh akses admin dashboard
        router.replace('/');
      } else {
        setUserEmail(session.user.email ?? null);
        setAuthLoading(false);
        fetchBookings();
      }
    });

    // Listener jika session berubah (logout di tab lain, dsb)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/login');
      } else if (session.user.email?.toLowerCase() !== 'kostsoloadmin@gmail.com') {
        router.replace('/');
      } else {
        setUserEmail(session.user.email ?? null);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  // ─── Fetch Bookings ───────────────────────────────────────────
  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, status, proof_of_payment_url, notes, created_at,
          rooms (
            room_number, price_per_month,
            kosts ( name )
          ),
          profiles ( fullname, phone )
        `)
        .order('created_at', { ascending: false });

      if (!error) {
        setIsConnected(true);
        if (data) {
          setBookings(data as any);
        }
      }
    } catch (e) {
      console.info('Koneksi Supabase belum aktif atau menggunakan local state');
    }
  };

  const handleCreateKost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormSuccess('');

    try {
      let finalImageUrl = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80';

      // Upload & Kompres Gambar
      if (imageFile) {
        const compressed = await compressImage(imageFile, 1280, 0.7);
        const fileName = `kost-${Date.now()}-${compressed.name}`;
        const { error: uploadError } = await supabase.storage
          .from('foto-kost')
          .upload(fileName, compressed);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('foto-kost').getPublicUrl(fileName);
          finalImageUrl = publicUrlData.publicUrl;
        }
      }

      // Insert Kost
      const { data: kostData, error: kostError } = await supabase
        .from('kosts')
        .insert({
          name,
          type,
          subdistrict,
          landmark_proximity: landmark,
          address,
          description,
          latitude: coords.lat,
          longitude: coords.lng,
          image_url: finalImageUrl,
        })
        .select()
        .single();

      if (kostError) throw kostError;

      // Insert Default Room
      await supabase.from('rooms').insert({
        kost_id: kostData.id,
        room_number: roomNumber,
        price_per_month: parseFloat(price),
        is_available: true,
      });

      setFormSuccess('Properti kost berhasil ditambahkan ke database Solo!');
      setName('');
      setAddress('');
      setLandmark('');
      setDescription('');
      setImageFile(null);
    } catch (err: any) {
      alert(`Info: ${err.message || 'Data disimpan'}`);
      setFormSuccess('Formulir berhasil diproses.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (bookingId: number, status: 'lunas' | 'ditolak') => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (!error) {
      fetchBookings();
      setActiveProofModal(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin w-10 h-10 rounded-full border-2 border-orange-700 border-t-transparent mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Memverifikasi sesi login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Navbar Admin Custom */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="group transition hover:opacity-95">
            <Logo size="md" />
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium truncate max-w-[180px]">{userEmail}</span>
            </div>

            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition hidden sm:inline-block"
            >
              Lihat Katalog
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-lg transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard Manajemen & Verifikasi Kost</h1>
          <p className="text-sm text-slate-600 mt-1">Area operasional Surakarta: Input listing baru & persetujuan transfer manual.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Kolom Kiri: Form Input Kost Baru */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-700"></span>
              Tambah Listing Kost Baru
            </h2>

            {formSuccess && (
              <div className="p-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateKost} className="space-y-4 text-xs font-medium text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Nama Kost</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kost Wisma Kentingan Asri"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-700 bg-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Tipe Kost</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-700 bg-white"
                  >
                    <option value="putra">Putra</option>
                    <option value="putri">Putri</option>
                    <option value="campur">Campur</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Wilayah / Kecamatan</label>
                  <input
                    type="text"
                    required
                    placeholder="Jebres / Banjarsari / Kartasura"
                    value={subdistrict}
                    onChange={(e) => setSubdistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-700 bg-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Jarak Landmark Terdekat</label>
                  <input
                    type="text"
                    placeholder="Contoh: 3 menit ke Gerbang Depan UNS"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-700 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Alamat Lengkap di Solo</label>
                <input
                  type="text"
                  required
                  placeholder="Jl. Surya Utama No. 12, Jebres, Surakarta"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-700 bg-white"
                />
              </div>

              {/* Leaflet Click-to-Pin Picker */}
              <div>
                <MapPicker
                  onLocationSelect={(lat, lng) => setCoords({ lat, lng })}
                  initialLat={coords.lat}
                  initialLng={coords.lng}
                />
                <div className="mt-2 text-[11px] text-slate-700 flex gap-4">
                  <span>Lat: <strong>{coords.lat.toFixed(6)}</strong></span>
                  <span>Lng: <strong>{coords.lng.toFixed(6)}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold">Nomor/Tipe Kamar Pertama</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-700 bg-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Tarif Sewa Bulanan (Rp)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-700 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Foto Properti</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-700 hover:bg-orange-800 text-white font-bold py-2.5 rounded-lg shadow-sm transition disabled:opacity-50 text-sm"
              >
                {isSubmitting ? 'Mengompres Gambar & Menyimpan...' : 'Simpan Kost ke Database'}
              </button>
            </form>
          </div>

          {/* Kolom Kanan: Antrean Verifikasi Transfer Manual */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
                <span>Antrean Verifikasi Sewa</span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-semibold">
                  {bookings.length} Transaksi
                </span>
              </h2>

              <div className="space-y-3 overflow-y-auto max-h-[700px] pr-1">
                {bookings.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <p className="text-xs text-slate-600">Belum ada antrean verifikasi pembayaran baru.</p>
                    <p className="text-[11px] text-slate-600">Pemesanan dari calon penyewa akan muncul di sini secara otomatis.</p>
                  </div>
                ) : (
                  bookings.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{item.rooms?.kosts?.name || 'Kost Solo'}</p>
                          <p className="text-slate-700 text-[11px]">Kamar: {item.rooms?.room_number} • Rp {Number(item.rooms?.price_per_month || 0).toLocaleString('id-ID')}/bln</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.status === 'lunas' ? 'bg-emerald-100 text-emerald-800' :
                          item.status === 'menunggu_verifikasi' ? 'bg-amber-100 text-amber-800' :
                          item.status === 'ditolak' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg flex justify-between items-center text-slate-700 text-[11px]">
                        <div>
                          <p className="font-semibold text-slate-800">{item.profiles?.fullname || item.notes || 'Calon Penyewa'}</p>
                          <p>{item.profiles?.phone || '-'}</p>
                        </div>

                        {item.proof_of_payment_url ? (
                          <button
                            onClick={() => setActiveProofModal(item.proof_of_payment_url)}
                            className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-semibold px-2.5 py-1.5 rounded-md shadow-2xs"
                          >
                            Cek Resi Transfer
                          </button>
                        ) : (
                          <span className="text-slate-600 italic">Belum unggah resi</span>
                        )}
                      </div>

                      {item.status === 'menunggu_verifikasi' && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'lunas')}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded-lg text-center"
                          >
                            Setujui (Lunas)
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'ditolak')}
                            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 rounded-lg text-center"
                          >
                            Tolak
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Pop-up Modal Gambar Bukti Transfer */}
      {activeProofModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Resi Bukti Transfer Manual</h3>
              <button
                onClick={() => setActiveProofModal(null)}
                className="text-slate-600 hover:text-slate-700 text-sm font-bold p-1 rounded-md hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <div className="relative aspect-[3/4] w-full bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
              <img
                src={activeProofModal}
                alt="Bukti Transfer Resi"
                className="object-contain w-full h-full"
              />
            </div>
            <button
              onClick={() => setActiveProofModal(null)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded-lg text-xs"
            >
              Tutup Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

