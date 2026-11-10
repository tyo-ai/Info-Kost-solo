'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Logo from '@/components/Logo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
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

  if (!isOpen) return null;

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
        console.error('Supabase Sign In Error:', signInError);
        if (
          signInError.message.toLowerCase().includes('email not confirmed') ||
          signInError.message.toLowerCase().includes('not confirmed')
        ) {
          setError(
            'Email belum dikonfirmasi! Buka email Anda untuk klik link konfirmasi, atau matikan "Confirm email" di pengaturan Supabase.'
          );
        } else if (
          signInError.message.toLowerCase().includes('invalid login credentials') ||
          signInError.message.toLowerCase().includes('invalid_grant')
        ) {
          setError('Email atau kata sandi tidak cocok. Silakan periksa kembali ketikan sandi Anda.');
        } else {
          setError(signInError.message);
        }
        setIsLoading(false);
        return;
      }

      // Berhasil login
      setIsLoading(false);
      onClose();

      if (cleanEmail === 'kostsoloadmin@gmail.com') {
        router.push('/admin/dashboard');
      } else {
        if (onSuccess) onSuccess();
        router.refresh();
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
        setIsLoading(false);
        onClose();
        if (cleanEmail === 'kostsoloadmin@gmail.com') {
          router.push('/admin/dashboard');
        } else {
          if (onSuccess) onSuccess();
          router.refresh();
        }
      } else {
        setSuccessMsg(
          'Pendaftaran berhasil! Akun Anda telah dibuat. Silakan masuk menggunakan email dan kata sandi Anda.'
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      {/* Backdrop Gelap dengan Blur */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Pop-up Modal yang Muncul dari Bawah */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#e8e4db] p-6 sm:p-8 z-10 max-h-[92vh] overflow-y-auto transform transition-all animate-in slide-in-from-bottom-8 duration-300">
        
        {/* Tombol Tanda Silang (✕) Tunggal di Pojok Kanan Atas */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Tutup dan kembali"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full bg-[#f6f3eb] hover:bg-[#eae5d8] text-slate-600 hover:text-slate-900 flex items-center justify-center text-base font-bold transition shadow-xs group"
        >
          <span className="group-hover:rotate-90 transition-transform duration-200">✕</span>
        </button>

        {/* Header Modal */}
        <div className="text-center mb-6 pt-1">
          <div className="flex justify-center mb-2.5">
            <Logo size="lg" showText={false} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {mode === 'login' ? 'Masuk ke Akun Anda' : 'Daftar Akun Baru'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login'
              ? 'Akses pemesanan kamar dan portal Info Kost Solo'
              : 'Daftar sekarang untuk kemudahan mencari hunian kost'}
          </p>
        </div>

        {/* Tab Navigasi Masuk / Daftar */}
        <div className="flex bg-[#f6f3eb] p-1 rounded-xl mb-5 border border-[#e8e4db]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-slate-900 text-white shadow-xs'
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
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {/* Feedback Alert */}
        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl leading-relaxed flex items-start gap-2.5">
            <span className="text-rose-500 font-bold shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl leading-relaxed flex items-start gap-2.5">
            <span className="text-emerald-500 font-bold shrink-0">✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Masuk (Login) */}
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
                  className="w-full pl-10 pr-4 py-2.5 border border-[#e2ded4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white transition"
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
                  className="w-full pl-10 pr-10 py-2.5 border border-[#e2ded4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white transition"
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
              className="w-full mt-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-2.5 rounded-xl shadow-xs transition active:scale-[0.99] flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Masuk Sekarang</span>
              )}
            </button>
          </form>
        ) : (
          /* Form Daftar (Register) */
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
                className="w-full px-3.5 py-2.5 border border-[#e2ded4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white transition"
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
                className="w-full px-3.5 py-2.5 border border-[#e2ded4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white transition"
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
                className="w-full px-3.5 py-2.5 border border-[#e2ded4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white transition"
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
                className="w-full px-3.5 py-2.5 border border-[#e2ded4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-2.5 rounded-xl shadow-xs transition active:scale-[0.99] flex items-center justify-center gap-2 text-sm"
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
    </div>
  );
}
