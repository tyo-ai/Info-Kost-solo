'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Logo from '@/components/Logo';
import AuthModal from '@/components/AuthModal';

export default function Navbar() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const email = session.user.email ?? '';
      setUserEmail(email);
      setIsAdmin(email.toLowerCase() === 'kostsoloadmin@gmail.com');
    } else {
      setUserEmail(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const email = session.user.email ?? '';
        setUserEmail(email);
        setIsAdmin(email.toLowerCase() === 'kostsoloadmin@gmail.com');
      } else {
        setUserEmail(null);
        setIsAdmin(false);
      }
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
    <>
      {/* Header dengan Warna Beige / Cream Khas Rukita */}
      <header className="sticky top-0 z-40 bg-[#f6f3eb]/95 backdrop-blur-md border-b border-[#e8e4db] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="group transition hover:opacity-95 shrink-0">
            <Logo size="md" />
          </Link>

          {/* Action Group */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {userEmail ? (
              // State: Sudah Login (Admin atau User)
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <Link
                    href="/admin/dashboard"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full hover:bg-amber-100 transition whitespace-nowrap shadow-2xs"
                  >
                    <span>Dashboard Admin</span>
                  </Link>
                ) : (
                  <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-[#e8e4db] px-3 py-1.5 rounded-full whitespace-nowrap shadow-2xs">
                    <span className="text-slate-400">👤</span>
                    <span className="max-w-[130px] truncate">{userEmail}</span>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  title="Keluar"
                  className="text-xs font-semibold text-slate-600 hover:text-rose-600 px-3 py-1.5 rounded-full hover:bg-rose-50 transition border border-transparent hover:border-rose-200 whitespace-nowrap"
                >
                  Keluar
                </button>
              </div>
            ) : (
              // State: Belum Login -> KLIK TIDAK PINDAH TAB, TAPI MEMUNCULKAN POP-UP DARI BAWAH
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-slate-950 px-3.5 py-2 rounded-full hover:bg-white/80 transition whitespace-nowrap border border-transparent hover:border-[#e8e4db]"
              >
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Masuk / Daftar</span>
              </button>
            )}

            {/* Tombol Titip / Daftar Kost via WhatsApp */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 sm:py-2.5 rounded-full shadow-sm transition-all hover:shadow active:scale-95 whitespace-nowrap shrink-0"
            >
              <svg className="w-4 h-4 fill-emerald-400 shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
              </svg>
              <span className="hidden sm:inline">Titip / Daftar Kost</span>
              <span className="sm:hidden">Daftar Kost</span>
            </a>
          </div>
        </div>
      </header>

      {/* Pop-up Auth Modal yang Muncul dari Bawah dengan Tombol Silang (✕) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => checkAuth()}
      />
    </>
  );
}
