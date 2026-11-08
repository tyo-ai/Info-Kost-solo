'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
            'Email belum dikonfirmasi. Silakan periksa inbox/spam email Anda, atau hubungi admin jika email confirmation dinonaktifkan di Supabase.'
          );
        } else if (signInError.message.includes('Invalid login credentials')) {
          setError('Email atau kata sandi tidak cocok. Silakan periksa kembali.');
        } else {
          setError('Gagal masuk: ' + signInError.message);
        }
        setIsLoading(false);
        return;
      }

      // Berhasil login -> Arahkan berdasarkan role
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

      // Jika session langsung aktif (email confirmation off)
      if (data.session) {
        if (cleanEmail === 'kostsoloadmin@gmail.com') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/');
        }
      } else {
        // Jika perlu konfirmasi email
        setSuccessMsg(
          'Pendaftaran berhasil! Silakan periksa inbox email Anda untuk mengonfirmasi akun sebelum masuk.'
        );
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-9 h-9 rounded-full border-3 border-orange-700 border-t-transparent"></div>
          <span className="text-xs text-slate-500 font-medium">Memeriksa sesi login...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Circles */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-orange-700/10 rounded-full blur-3xl pointer-events-none" />

      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="w-full max-w-md relative z-10 my-8">
        {/* Card Utama */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          {/* Header Portal */}
          <div className="bg-gradient-to-r from-orange-700 via-orange-600 to-amber-600 px-8 py-7 text-center relative overflow-hidden">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
              <span className="text-white font-black text-2xl tracking-tight">K</span>
            </div>
            <h1 className="text-white font-extrabold text-xl tracking-tight">Info Kost Solo</h1>
            <p className="text-orange-100 text-xs mt-1 font-medium">
              Portal Akun Pencari Kost & Pengelola Admin
            </p>
          </div>

          {/* Toggle Tab Masuk / Daftar */}
          <div className="p-6 pb-2">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-white text-orange-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Masuk (Login)
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
                    ? 'bg-white text-orange-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daftar Akun Baru
              </button>
            </div>
          </div>

          {/* Alert Error / Success */}
          <div className="px-6">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl leading-relaxed flex items-start gap-2.5">
                <span className="text-rose-500 font-bold mt-0.5 shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl leading-relaxed flex items-start gap-2.5">
                <span className="text-emerald-500 font-bold mt-0.5 shrink-0">✅</span>
                <span>{successMsg}</span>
              </div>
            )}
          </div>

          {/* FORM LOGIN */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="p-6 pt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                    placeholder="nama@email.com atau kostsoloadmin@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600 bg-slate-50/60 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600 bg-slate-50/60 transition"
                  />
                </div>
              </div>

              <div className="bg-orange-50/70 border border-orange-100 rounded-xl p-3 text-[11px] text-orange-950 leading-relaxed">
                <span className="font-bold text-orange-700">Info Akses:</span> Akun admin otomatis dialihkan ke <strong>Dashboard Pengelola</strong>, sedangkan akun pengguna diarahkan ke <strong>Katalog Kamar</strong>.
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-700 hover:bg-orange-800 disabled:bg-orange-400 text-white font-bold py-2.5 rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Memverifikasi Masuk...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Masuk Sekarang</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* FORM REGISTER */
            <form onSubmit={handleRegister} className="p-6 pt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600 bg-slate-50/60 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Alamat Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="nama@email.com"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600 bg-slate-50/60 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Kata Sandi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600 bg-slate-50/60 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Konfirmasi Kata Sandi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Ulangi kata sandi"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600 bg-slate-50/60 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-700 hover:bg-orange-800 disabled:bg-orange-400 text-white font-bold py-2.5 rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Mendaftarkan Akun...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Daftar Akun Baru</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Back Link */}
          <div className="p-6 pt-0 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-orange-700 font-medium transition"
            >
              <span>← Kembali ke Katalog Info Kost Solo</span>
            </Link>
          </div>
        </div>

        {/* Small Notice */}
        <p className="text-center text-xs text-slate-400 mt-5">
          Info Kost Solo &bull; Menghubungkan Pencari & Pemilik Kost di Surakarta
        </p>
      </div>
    </div>
  );
}

