'use client';

import React from 'react';
import { PropertyItem } from './PropertyCard';

interface RoomDetailModalProps {
  kost: PropertyItem | null;
  onClose: () => void;
  onProceedBooking: (kost: PropertyItem) => void;
}

export default function RoomDetailModal({ kost, onClose, onProceedBooking }: RoomDetailModalProps) {
  if (!kost) return null;

  const room = kost.rooms?.[0] || { id: 1, price_per_month: 850000, room_number: 'Kamar 01' };
  const adminPhoneNumber = '6282146837575'; // Nomor WhatsApp Resmi Info Kost Solo (082146837575)

  const waMessage = encodeURIComponent(
`Halo Admin Info Kost Solo! Saya tertarik dan ingin menanyakan ketersediaan kamar:

━━━━━━━━━━━━━━━━━━
🏠 INFORMASI KOST:
• Nama Kost: ${kost.name}
• Alamat: ${kost.address}
• Patokan / Wilayah: ${kost.landmark_proximity || kost.subdistrict}
• Kamar: ${room.room_number}
• Tarif: Rp ${Number(room.price_per_month).toLocaleString('id-ID')}/bulan
━━━━━━━━━━━━━━━━━━

❓ PERTANYAAN SAYA:
1. Apakah kamar tersebut saat ini masih tersedia?
2. Apakah bisa survey lokasi terlebih dahulu?
3. Mulai kapan kamar bisa ditempati?

Mohon informasinya ya min, terima kasih!`
  );
  const waUrl = `https://wa.me/${adminPhoneNumber}?text=${waMessage}`;

  const facilities = [
    'Kamar Mandi Dalam',
    'Kasur Springbed',
    'Air Conditioner (AC)',
    'WiFi Internet Cepat',
    'Meja & Lemari Pakaian',
    'Parkir Motor Aman & Berpagar',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative my-8">
        {/* Tombol Tanda Silang (✕) Tutup & Kembali */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Tutup dan kembali"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#f6f3eb] hover:bg-[#eae5d8] text-slate-700 hover:text-slate-900 flex items-center justify-center text-sm font-bold shadow-xs transition group z-10"
        >
          <span className="group-hover:rotate-90 transition-transform duration-200">✕</span>
        </button>

        {/* Gambar Properti */}
        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
          <img
            src={kost.image_url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'}
            alt={kost.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase shadow-sm ${
              kost.type === 'putra'
                ? 'bg-sky-50 text-sky-800 border border-sky-200'
                : kost.type === 'putri'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              Kost {kost.type}
            </span>
            <span className="bg-slate-900/80 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[10px] font-medium">
              Kec. {kost.subdistrict}
            </span>
          </div>
        </div>

        {/* Info Header */}
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{kost.name}</h2>
          <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-orange-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{kost.address}</span>
          </p>
          <p className="text-xs text-orange-700 font-semibold mt-0.5">
            📍 {kost.landmark_proximity || 'Dekat pusat aktivitas Surakarta'}
          </p>
        </div>

        {/* Fasilitas Kamar */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
            Fasilitas Kamar & Bersama
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
            {facilities.map((fac, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-2 rounded-lg">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{fac}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Harga & Tombol Aksi */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Harga Sewa Bulanan</span>
            <div className="text-slate-900 font-extrabold text-lg tracking-tight">
              Rp {Number(room.price_per_month).toLocaleString('id-ID')}
              <span className="text-xs font-normal text-slate-500"> /bulan</span>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-lg shadow-sm transition flex items-center gap-1.5 active:scale-95"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
              </svg>
              <span>Tanya WA</span>
            </a>
            <button
              onClick={() => {
                onClose();
                onProceedBooking(kost);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm transition active:scale-95"
            >
              Ajukan Sewa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

