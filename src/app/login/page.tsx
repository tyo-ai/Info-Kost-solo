'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Logo from '@/components/Logo';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  // Cek apakah sudah login
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        if (session.user.email?.toLowerCase() === 'kostsoloadmin@gmail.com') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/');
        }
      } else {
        setCheckingSession(false);
      }
    });
  }, [router]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Email not confirmed')) {
          setError(
            'Email belum dikonfirmasi. Silakan periksa kotak masuk email Anda atau konfirmasi via Supabase.'
          );
        } else if (signInError.message.includes('Invalid login credentials')) {
          setError('Email atau kata sandi tidak cocok. Silakan periksa kembali.');
        } else {
          setError('Gagal masuk: ' + signInError.message);
        }
        setIsLoading(false);
        return;
      }

      // Berhasil login
      if (cleanEmail === 'kostsoloadmin@gmail.com') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      setError(message);
      setIsLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setError('Kata sandi minimal harus 6 karakter.');
      return;
    }

    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim() || undefined,
          },
        },
      });

      if (signUpError) {
        setError('Gagal mendaftar: ' + signUpError.message);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        if (cleanEmail === 'kostsoloadmin@gmail.com') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/');
        }
      } else {
        setSuccessMsg(
          'Pendaftaran berhasil! Akun Anda telah dibuat. Silakan masuk menggunakan email dan sandi Anda.'
        );
        setMode('login');
        setIsLoading(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      setError(message);
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 rounded-full border-2 border-[#0c8a7e] border-t-transparent" />
          <span className="text-xs text-slate-500 font-medium">Memuat portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col text-slate-800">
      {/* Navbar Rukita Theme */}
      <Navbar />

      {/* Konten Login */}
      <main className="flex-1 flex justify-center pt-8 sm:pt-12 pb-16 px-4">
        <div className="w-full max-w-md">
          {/* Card Form */}
          <div className="bg-white rounded-3xl border border-[#e8e4db] shadow-xl shadow-slate-200/50 p-6 sm:p-8 transition-all relative">
            {/* Tombol Tanda Silang (✕) di Pojok Kanan Atas */}
            <Link
              href="/"
              title="Kembali ke Beranda"
              aria-label="Tutup dan kembali ke beranda"
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full bg-[#f6f3eb] hover:bg-[#eae5d8] text-slate-600 hover:text-slate-900 flex items-center justify-center text-sm font-bold transition shadow-2xs group"
            >
              <span className="group-hover:rotate-90 transition-transform duration-200">✕</span>
            </Link>

            {/* Header Brand */}
            <div className="text-center mb-6 pt-1">
              <div className="flex justify-center mb-3">
                <Logo size="lg" showText={false} />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {mode === 'login' ? 'Masuk ke Akun Anda' : 'Buat Akun Baru'}
              </h1>
              <p className="text-xs text-slate-500 mt-1 h-8 flex items-center justify-center">
                {mode === 'login'
                  ? 'Akses katalog kamar dan portal Info Kost Solo'
                  : 'Daftar untuk kemudahan pemesanan hunian kost di Surakarta'}
              </p>
            </div>

            {/* Tab Navigasi Masuk / Daftar */}
            <div className="flex bg-[#f6f3eb] p-1 rounded-xl mb-6 border border-[#e8e4db]">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-[#0c8a7e] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'register'
                    ? 'bg-[#0c8a7e] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daftar Akun
              </button>
            </div>

            {/* Feedback Alert */}
            {error && (
              <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl leading-relaxed flex items-start gap-2.5">
                <span className="text-rose-500 font-bold shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl leading-relaxed flex items-start gap-2.5">
                <span className="text-emerald-500 font-bold shrink-0">✅</span>
                <span>{successMsg}</span>
              </div>
            )}

            {/* FORM MASUK (LOGIN) */}
            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <svg
                      className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="nama@email.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-[#e2ded4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0c8a7e]/20 focus:border-[#0c8a7e] bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <svg
                      className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Masukkan kata sandi"
                      className="w-full pl-10 pr-10 py-2.5 border border-[#e2ded4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0c8a7e]/20 focus:border-[#0c8a7e] bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 text-xs"
                      title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 bg-[#0c8a7e] hover:bg-[#097368] disabled:bg-[#0c8a7e]/50 text-white font-bold py-2.5 rounded-xl shadow-xs transition active:scale-[0.99] flex items-center justify-center gap-2 text-sm"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <span>Masuk ke Akun</span>
                  )}
                </button>
              </form>
            ) : (
              /* FORM DAFTAR (REGISTER) */
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Budi Pratama"
                    className="w-full px-3.5 py-2.5 border border-[#e2ded4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0c8a7e]/20 focus:border-[#0c8a7e] bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Alamat Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="nama@email.com"
                    className="w-full px-3.5 py-2.5 border border-[#e2ded4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0c8a7e]/20 focus:border-[#0c8a7e] bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kata Sandi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3.5 py-2.5 border border-[#e2ded4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0c8a7e]/20 focus:border-[#0c8a7e] bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Konfirmasi Kata Sandi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Ulangi kata sandi"
                    className="w-full px-3.5 py-2.5 border border-[#e2ded4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0c8a7e]/20 focus:border-[#0c8a7e] bg-white transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 bg-[#0c8a7e] hover:bg-[#097368] disabled:bg-[#0c8a7e]/50 text-white font-bold py-2.5 rounded-xl shadow-xs transition active:scale-[0.99] flex items-center justify-center gap-2 text-sm"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Mendaftarkan...</span>
                    </>
                  ) : (
                    <span>Daftar Akun Baru</span>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer Subtext */}
          <p className="text-center text-xs text-slate-400 mt-6">
            &copy; 2026 Info Kost Solo &bull; Surakarta Kost Network
          </p>
        </div>
      </main>
    </div>
  );
}
