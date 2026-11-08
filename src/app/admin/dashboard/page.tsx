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
    router.replace('/');
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

      if (!error && data) {
        setBookings(data as any);
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
        facilities: ['Kamar Mandi Dalam', 'Kasur Springbed', 'AC', 'WiFi Cepat', 'Lemari & Meja'],
      });

      setFormSuccess('Listing properti kost baru berhasil ditambahkan ke database!');
      setName('');
      setAddress('');
      setLandmark('');
      setDescription('');
      setImageFile(null);
    } catch (err: any) {
      alert('Gagal menambahkan listing kost: ' + (err.message || 'Error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (bookingId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;
      fetchBookings();
    } catch (e: any) {
      alert('Gagal update status: ' + e.message);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Memverifikasi sesi admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-800">
      {/* Navbar Admin Theme Khas Rukita (Warm Beige & Midnight Slate) */}
      <header className="sticky top-0 z-40 bg-[#f6f3eb]/95 backdrop-blur-md border-b border-[#e8e4db] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="group transition hover:opacity-95">
            <Logo size="md" />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-[#e8e4db] px-3.5 py-1.5 rounded-full whitespace-nowrap shadow-2xs">
              <span className="text-slate-400">👤</span>
              <span className="max-w-[180px] truncate">{userEmail}</span>
            </div>

            <Link
              href="/"
              className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-[#e8e4db] transition shadow-2xs hidden sm:inline-block"
            >
              Lihat Katalog
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-900 bg-white hover:bg-rose-50 border border-[#e8e4db] hover:border-rose-200 px-3.5 py-1.5 rounded-full transition shadow-2xs"
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
        <div className="mb-8 border-b border-[#e8e4db] pb-4">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard Manajemen & Verifikasi Kost</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Area operasional Surakarta: Input listing properti baru & verifikasi transfer manual.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Kolom Kiri: Form Input Kost Baru */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-3xl border border-[#e8e4db] shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Tambah Listing Kost Baru
            </h2>

            {formSuccess && (
              <div className="p-3.5 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl leading-relaxed flex items-start gap-2">
                <span className="font-bold">✓</span>
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateKost} className="space-y-4 text-xs font-medium text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 font-bold text-slate-800">Nama Kost</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kost Wisma Kentingan Asri"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#e2ded4] rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 font-bold text-slate-800">Tipe Kost</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#e2ded4] rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
                  >
                    <option value="putra">Putra</option>
                    <option value="putri">Putri</option>
                    <option value="campur">Campur</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 font-bold text-slate-800">Wilayah / Kecamatan</label>
                  <select
                    value={subdistrict}
                    onChange={(e) => setSubdistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#e2ded4] rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
                  >
                    <option value="Jebres">Jebres (UNS)</option>
                    <option value="Banjarsari">Banjarsari (Manahan / Balapan)</option>
                    <option value="Laweyan">Laweyan (Pusat Batik)</option>
                    <option value="Kartasura">Kartasura (UMS)</option>
                    <option value="Serengan">Serengan</option>
                    <option value="Pasar Kliwon">Pasar Kliwon</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 font-bold text-slate-800">Jarak Landmark Terdekat</label>
                  <input
                    type="text"
                    placeholder="Contoh: 3 menit ke Gerbang Depan UNS"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#e2ded4] rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-slate-800">Alamat Lengkap di Solo</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Jl. Surya Utama No. 12, Jebres, Surakarta"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#e2ded4] rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-slate-800">Deskripsi Kost</label>
                <textarea
                  rows={2}
                  placeholder="Fasilitas umum, jam malam, lingkungan sekitar..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#e2ded4] rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
                />
              </div>

              {/* Map Picker */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-bold text-slate-800">Tentukan Titik Koordinat Peta</label>
                  <span className="text-[11px] text-slate-500">Area Surakarta & Sekitarnya</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-[#e8e4db]">
                  <MapPicker
                    initialPosition={coords}
                    onPositionChange={(pos) => setCoords(pos)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 font-bold text-slate-800">Nomor/Tipe Kamar Pertama</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#e2ded4] rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 font-bold text-slate-800">Tarif Sewa Bulanan (Rp)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#e2ded4] rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-slate-800">Foto Properti</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-700 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#f6f3eb] file:text-slate-800 hover:file:bg-[#eae5d8] cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-xs transition active:scale-[0.99] disabled:opacity-50 text-sm"
              >
                {isSubmitting ? 'Mengompres Gambar & Menyimpan...' : 'Simpan Kost ke Database'}
              </button>
            </form>
          </div>

          {/* Kolom Kanan: Antrean Verifikasi Transfer Manual */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#e8e4db] shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Antrean Verifikasi Sewa</h2>
                <span className="text-xs bg-[#f6f3eb] text-slate-800 border border-[#e8e4db] px-3 py-1 rounded-full font-bold">
                  {bookings.length} Transaksi
                </span>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[700px] pr-1">
                {bookings.length === 0 ? (
                  <div className="text-center py-12 space-y-1.5">
                    <p className="text-xs text-slate-600 font-semibold">Belum ada antrean verifikasi pembayaran baru.</p>
                    <p className="text-[11px] text-slate-400">Pemesanan dari calon penyewa akan muncul di sini secara otomatis.</p>
                  </div>
                ) : (
                  bookings.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-[#e8e4db] bg-white hover:border-slate-400 transition space-y-2.5 text-xs"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{item.rooms?.kosts?.name || 'Kost Solo'}</p>
                          <p className="text-slate-500 text-[11px]">Kamar: {item.rooms?.room_number} • Rp {Number(item.rooms?.price_per_month || 0).toLocaleString('id-ID')}/bln</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.status === 'lunas' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          item.status === 'menunggu_verifikasi' ? 'bg-amber-50 text-amber-900 border border-amber-200' :
                          item.status === 'ditolak' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="bg-[#f6f3eb] border border-[#e8e4db] p-3 rounded-xl flex justify-between items-center text-slate-700 text-[11px]">
                        <div>
                          <p className="font-bold text-slate-900">{item.profiles?.fullname || item.notes || 'Calon Penyewa'}</p>
                          <p className="text-slate-500">{item.profiles?.phone || '-'}</p>
                        </div>

                        {item.proof_of_payment_url ? (
                          <button
                            onClick={() => setActiveProofModal(item.proof_of_payment_url)}
                            className="bg-white border border-[#e8e4db] hover:bg-slate-50 text-slate-800 font-bold px-3 py-1.5 rounded-lg shadow-2xs transition"
                          >
                            Cek Resi Transfer
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">Belum unggah resi</span>
                        )}
                      </div>

                      {item.status === 'menunggu_verifikasi' && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'lunas')}
                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-center transition"
                          >
                            Setujui (Lunas)
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'ditolak')}
                            className="flex-1 bg-white hover:bg-rose-50 text-rose-700 border border-[#e8e4db] hover:border-rose-200 font-bold py-2 rounded-xl text-center transition"
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

      {/* Pop-up Modal Gambar Bukti Transfer dengan Tombol Silang (✕) */}
      {activeProofModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-[#e8e4db] relative">
            <div className="flex justify-between items-center pb-2 border-b border-[#e8e4db]">
              <h3 className="font-bold text-slate-900 text-sm">Resi Bukti Transfer Manual</h3>
              <button
                onClick={() => setActiveProofModal(null)}
                aria-label="Tutup preview"
                className="w-8 h-8 rounded-full bg-[#f6f3eb] hover:bg-[#eae5d8] text-slate-700 flex items-center justify-center text-xs font-bold transition group"
              >
                <span className="group-hover:rotate-90 transition-transform duration-200">✕</span>
              </button>
            </div>
            <div className="relative aspect-[3/4] w-full bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center border border-[#e8e4db]">
              <img
                src={activeProofModal}
                alt="Bukti Transfer Resi"
                className="object-contain w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
