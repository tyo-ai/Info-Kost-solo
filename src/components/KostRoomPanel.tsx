'use client';

import React, { useState } from 'react';
import { PropertyItem, RoomItem } from './PropertyCard';

interface KostRoomPanelProps {
  kost: PropertyItem;
  onBack: () => void;
  onSelectBooking: (kost: PropertyItem, room?: RoomItem) => void;
}

export default function KostRoomPanel({ kost, onBack, onSelectBooking }: KostRoomPanelProps) {
  const [copied, setCopied] = useState(false);

  const defaultRooms: RoomItem[] = [
    {
      id: 1,
      room_number: 'Kamar 01 (Utama)',
      price_per_month: kost.rooms?.[0]?.price_per_month || 850000,
      is_available: true,
      facilities: ['Kamar Mandi Dalam', 'Kasur Springbed', 'AC', 'WiFi Cepat', 'Lemari & Meja'],
    },
  ];

  const rooms = (kost.rooms && kost.rooms.length > 0) ? kost.rooms : defaultRooms;
  const adminPhoneNumber = '6282146837575'; // Nomor WhatsApp Resmi Info Kost Solo (082146837575)

  // Template Pesan WhatsApp untuk Tanya Kost / Kamar
  const getRoomWaUrl = (room: RoomItem) => {
    const message = encodeURIComponent(
`Halo Admin Info Kost Solo! Saya tertarik dan ingin menanyakan ketersediaan kamar:

━━━━━━━━━━━━━━━━━━
🏠 INFORMASI KOST:
• Nama Kost: ${kost.name}
• Alamat: ${kost.address}
• Patokan / Wilayah: ${kost.landmark_proximity || kost.subdistrict}
• Kamar yang Diminati: ${room.room_number || 'Kamar Kost'}
• Harga Sewa: Rp ${Number(room.price_per_month).toLocaleString('id-ID')}/bulan
━━━━━━━━━━━━━━━━━━

❓ PERTANYAAN SAYA:
1. Apakah kamar tersebut saat ini masih tersedia?
2. Apakah bisa survey lokasi terlebih dahulu?
3. Mulai kapan kamar bisa ditempati?

Mohon informasinya ya min, terima kasih!`
    );
    return `https://wa.me/${adminPhoneNumber}?text=${message}`;
  };

  const generalWaMessage = encodeURIComponent(
`Halo Admin Info Kost Solo! Saya tertarik dan ingin menanyakan ketersediaan kamar di:

━━━━━━━━━━━━━━━━━━
🏠 INFORMASI KOST:
• Nama Kost: ${kost.name}
• Alamat: ${kost.address} (${kost.subdistrict})
• Patokan: ${kost.landmark_proximity || 'Solo Raya'}
━━━━━━━━━━━━━━━━━━

Apakah saat ini masih ada kamar yang kosong untuk disewa dan bisa dibantu jadwal surveynya? Terima kasih!`
  );
  const generalWaUrl = `https://wa.me/${adminPhoneNumber}?text=${generalWaMessage}`;

  return (
    <div className="bg-white rounded-2xl border border-[#e8e4db] shadow-md overflow-hidden animate-fadeIn space-y-5">
      {/* Top Header Toolbar Bersih: Hanya Nama Properti & Tombol Silang (✕) */}
      <div className="bg-[#f6f3eb] border-b border-[#e8e4db] px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate pr-2">
          <span className="text-xs font-bold text-slate-800 truncate">{kost.name}</span>
        </div>

        {/* Tombol Tanda Silang (✕) Tunggal */}
        <button
          onClick={onBack}
          type="button"
          title="Tutup dan kembali ke daftar semua kost"
          aria-label="Tutup dan kembali"
          className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-[#e8e4db] flex items-center justify-center text-xs font-bold transition shadow-2xs group shrink-0"
        >
          <span className="group-hover:rotate-90 transition-transform duration-200">✕</span>
        </button>
      </div>

      {/* Hero Kost */}
      <div className="px-5 space-y-4">
        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
          <img
            src={
              kost.image_url ||
              'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
            }
            alt={kost.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            <span
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase shadow-sm ${
                kost.type === 'putra'
                  ? 'bg-sky-50 text-sky-800 border border-sky-200'
                  : kost.type === 'putri'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}
            >
              Kost {kost.type}
            </span>
            <span className="bg-slate-900/80 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[10px] font-medium">
              Kec. {kost.subdistrict}
            </span>
          </div>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{kost.name}</h2>
            <a
              href={generalWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border border-[#25D366]/30 px-3.5 py-1.5 rounded-full transition self-start sm:self-auto shadow-2xs"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
              </svg>
              <span>Tanya Kost via WA</span>
            </a>
          </div>

          <p className="text-xs text-slate-600 mt-1 flex items-start gap-1.5">
            <svg className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{kost.address}</span>
          </p>
          {kost.landmark_proximity && (
            <p className="text-xs text-slate-700 font-semibold mt-1.5 bg-[#f6f3eb] border border-[#e8e4db] p-2 rounded-xl inline-block">
              📍 Dekat: {kost.landmark_proximity}
            </p>
          )}
          {kost.description && (
            <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {kost.description}
            </p>
          )}
        </div>
      </div>

      {/* Daftar Kamar Kost */}
      <div className="px-5 pb-5 space-y-4">
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Daftar Pilihan Kamar</span>
            <span className="bg-[#f6f3eb] text-slate-800 border border-[#e8e4db] px-2 py-0.5 rounded-full text-[10px] font-bold">
              {rooms.length} Kamar
            </span>
          </h3>
          <span className="text-[11px] text-slate-500">Pilih kamar untuk pemesanan</span>
        </div>

        <div className="space-y-3">
          {rooms.map((room) => {
            const roomWaUrl = getRoomWaUrl(room);
            return (
              <div
                key={room.id}
                className="border border-[#e8e4db] hover:border-slate-400 bg-white rounded-xl p-4 transition shadow-xs hover:shadow-md space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#f6f3eb] text-slate-700 flex items-center justify-center font-bold text-xs border border-[#e8e4db]">
                      🚪
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{room.room_number || 'Kamar Kost'}</h4>
                      <span className="text-[10px] text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {room.is_available ? 'Tersedia' : 'Penuh'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-slate-900">
                      Rp {Number(room.price_per_month).toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-slate-500 block -mt-0.5">/bulan</span>
                  </div>
                </div>

                {/* Fasilitas Kamar */}
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Fasilitas Kamar:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(room.facilities || ['Kamar Mandi Dalam', 'Kasur Springbed', 'WiFi']).map((fac, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-[#f6f3eb] text-slate-700 px-2 py-0.5 rounded-md border border-[#e8e4db]"
                      >
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons: Midnight Slate Clean */}
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => onSelectBooking(kost, room)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition active:scale-95 text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Ajukan Sewa {room.room_number || 'Kamar Ini'}</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>

                  <a
                    href={roomWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#f6f3eb] hover:bg-[#eae5d8] text-slate-700 hover:text-slate-900 border border-[#e8e4db] text-xs font-bold px-3 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95"
                    title="Tanya Kamar Ini ke WhatsApp"
                  >
                    <svg className="w-4 h-4 fill-emerald-600" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                    </svg>
                    <span>Tanya WA</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Rekening Pembayaran */}
        <div className="bg-[#f6f3eb] border border-[#e8e4db] rounded-xl p-3.5 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-bold text-slate-900">Pembayaran Transfer Manual:</p>
            <p className="mt-0.5">
              Bank: <strong>{kost.bank_name || 'BCA'}</strong> • No. Rekening:{' '}
              <strong className="text-slate-900 tracking-wider font-mono">{kost.bank_account_number || '0158923120'}</strong>
            </p>
            <p className="text-[11px] text-slate-500">
              A.n: {kost.bank_account_holder || 'Info Kost Solo Official'} (Upload bukti resi saat ajukan sewa)
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const num = kost.bank_account_number || '0158923120';
              navigator.clipboard.writeText(num);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-2xs ${
              copied
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-[#e8e4db] text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {copied ? (
              <>
                <span>✓</span>
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>Salin No. Rek</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
