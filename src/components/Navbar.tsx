'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const adminPhoneNumber = '6282146837575'; // Nomor WhatsApp Resmi Info Kost Solo (082146837575)
  const defaultMessage = encodeURIComponent(
`Halo Admin Info Kost Solo! Saya pemilik/pengelola properti dan ingin mendaftarkan kost saya ke katalog Info Kost Solo:

📋 FORMULIR PENDAFTARAN KOST:
• Nama Kost: 
• Tipe (Putra / Putri / Campur): 
• Alamat Lengkap di Solo: 
• Kecamatan (Jebres / Banjarsari / Laweyan / Kartasura / Lainnya): 
• Patokan / Dekat Kampus: (Contoh: 3 menit ke UNS / UMS)
• Jumlah Kamar Kosong: 
• Harga Sewa / Bulan: Rp 
• Fasilitas Kamar & Umum: (AC / KM Dalam / WiFi / dll)
• Nama Pemilik: 

Mohon bantu proses pendataannya agar tampil di web. Terima kasih!`
  );
  const waUrl = `https://wa.me/${adminPhoneNumber}?text=${defaultMessage}`;

  useEffect(() => {
    // Cek session awal
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email ?? '';
        setUserEmail(email);
        setIsAdmin(email.toLowerCase() === 'kostsoloadmin@gmail.com');
      } else {
        setUserEmail(null);
        setIsAdmin(false);
      }
      setIsLoadingAuth(false);
    });

    // Listener auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const email = session.user.email ?? '';
        setUserEmail(email);
        setIsAdmin(email.toLowerCase() === 'kostsoloadmin@gmail.com');
      } else {
        setUserEmail(null);
        setIsAdmin(false);
      }
      setIsLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    setIsAdmin(false);
    router.replace('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-orange-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            K
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-orange-700 transition">
              Info Kost <span className="text-orange-700">Solo</span>
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-600 -mt-1">
              Surakarta Kost Network
            </span>
          </div>
        </Link>

        {/* Action Group */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!isLoadingAuth && (
            <>
              {userEmail ? (
                // State: Sudah Login (Admin atau User)
                <div className="flex items-center gap-2">
                  {isAdmin ? (
                    <Link
                      href="/admin/dashboard"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition"
                    >
                      <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse"></span>
                      <span>Dashboard Admin</span>
                    </Link>
                  ) : (
                    <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
                      <span className="text-slate-400">👤</span>
                      <span className="max-w-[120px] truncate">{userEmail}</span>
                    </div>
                  )}

                  <button
                    onClick={handleLogout}
                    title="Keluar"
                    className="text-xs font-semibold text-slate-600 hover:text-rose-600 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition border border-transparent hover:border-rose-100"
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                // State: Belum Login
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-orange-700 px-3 py-2 rounded-lg hover:bg-orange-50 transition"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Masuk / Login</span>
                </Link>
              )}
            </>
          )}

          {/* Tombol Titip / Daftar Kost via WhatsApp */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg shadow-sm transition-all hover:shadow active:scale-95"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
            </svg>
            <span className="hidden xs:inline">Titip / Daftar Kost</span>
            <span className="xs:hidden">Daftar Kost</span>
          </a>
        </div>
      </div>
    </header>
  );
}
