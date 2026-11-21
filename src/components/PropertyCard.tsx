'use client';

import React from 'react';

export interface RoomItem {
  id: number;
  price_per_month: number;
  room_number: string;
  is_available?: boolean;
  facilities?: string[];
}

export interface PropertyItem {
  id: number;
  name: string;
  type: 'putra' | 'putri' | 'campur';
  subdistrict: string;
  landmark_proximity: string;
  address: string;
  description?: string;
  image_url: string;
  images?: string[];
  latitude: number;
  longitude: number;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_holder?: string;
  rooms?: RoomItem[];
}

interface PropertyCardProps {
  kost: PropertyItem;
  isSelected?: boolean;
  isAdmin?: boolean;
  onSelectBooking: (kost: PropertyItem) => void;
  onSelectDetail: (kost: PropertyItem) => void;
  onDeleteKost?: (kost: PropertyItem) => void;
}

export default function PropertyCard({
  kost,
  isSelected = false,
  isAdmin = false,
  onSelectBooking,
  onSelectDetail,
  onDeleteKost,
}: PropertyCardProps) {
  const lowestPrice = kost.rooms?.[0]?.price_per_month || 850000;

  return (
    <div
      id={`kost-card-${kost.id}`}
      className={`group bg-white rounded-3xl border transition-all duration-200 flex flex-col overflow-hidden ${
        isSelected
          ? 'border-slate-900 ring-2 ring-slate-900 shadow-lg scale-[1.01]'
          : 'border-[#e8e4db] hover:border-slate-300 shadow-sm hover:shadow-xl'
      }`}
    >
      {/* Container Gambar Rasio 4:3 */}
      <div
        className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 cursor-pointer"
        onClick={() => onSelectDetail(kost)}
      >
        <img
          src={
            kost.image_url ||
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
          }
          alt={kost.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badge Gender & Wilayah Solo */}
        <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
          <span
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide uppercase shadow-md backdrop-blur-sm ${
              kost.type === 'putra'
                ? 'bg-sky-50/95 text-sky-800 border border-sky-200'
                : kost.type === 'putri'
                ? 'bg-rose-50/95 text-rose-800 border border-rose-200'
                : 'bg-amber-50/95 text-amber-900 border border-amber-200'
            }`}
          >
            {kost.type}
          </span>
          <span className="bg-slate-900/85 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-xs font-semibold">
            {kost.subdistrict}
          </span>
        </div>

        {/* Tombol Hapus Kost Khusus Admin */}
        {isAdmin && onDeleteKost && (
          <button
            type="button"
            title="Hapus Kost Ini dari Katalog & Database"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteKost(kost);
            }}
            className="absolute top-4 right-4 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-xl shadow-lg transition transform hover:scale-105 active:scale-95 flex items-center gap-2 z-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="text-xs font-bold">Hapus</span>
          </button>
        )}

        {/* Badge Jumlah Foto Galeri */}
        {kost.images && kost.images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{kost.images.length} Foto</span>
          </div>
        )}
      </div>

      {/* Konten Kartu */}
      <div className="p-6 flex flex-col flex-1 justify-between gap-5">
        <div className="space-y-2">
          <h3
            onClick={() => onSelectDetail(kost)}
            className="font-black text-slate-900 text-lg leading-snug group-hover:text-amber-800 transition cursor-pointer line-clamp-2"
          >
            {kost.name}
          </h3>
          <p className="text-sm text-slate-500 flex items-start gap-2 leading-relaxed">
            <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-2">{kost.landmark_proximity || kost.address}</span>
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-end justify-between gap-3">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">Mulai dari</span>
            <div className="text-slate-900 font-black text-xl sm:text-2xl tracking-tight">
              Rp {Number(lowestPrice).toLocaleString('id-ID')}
            </div>
            <span className="text-xs font-normal text-slate-400">/bulan</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onSelectDetail(kost)}
              className="bg-[#f6f3eb] hover:bg-[#eae5d8] text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-2xl transition border border-[#e8e4db]"
            >
              Cek Kamar
            </button>
            <button
              onClick={() => onSelectBooking(kost)}
              className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-5 py-2.5 rounded-2xl shadow-sm transition active:scale-95"
            >
              Ajukan Sewa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
