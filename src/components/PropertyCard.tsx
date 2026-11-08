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
  onSelectBooking: (kost: PropertyItem) => void;
  onSelectDetail: (kost: PropertyItem) => void;
}

export default function PropertyCard({
  kost,
  isSelected = false,
  onSelectBooking,
  onSelectDetail,
}: PropertyCardProps) {
  const lowestPrice = kost.rooms?.[0]?.price_per_month || 850000;

  return (
    <div
      id={`kost-card-${kost.id}`}
      className={`group bg-white rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden ${
        isSelected
          ? 'border-slate-900 ring-2 ring-slate-900 shadow-md scale-[1.01]'
          : 'border-[#e8e4db] hover:border-slate-400 shadow-xs hover:shadow-md'
      }`}
    >
      {/* Container Gambar Rasio 16:10 */}
      <div
        className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 cursor-pointer"
        onClick={() => onSelectDetail(kost)}
      >
        <img
          src={
            kost.image_url ||
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
          }
          alt={kost.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Badge Gender & Wilayah Solo */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase shadow-sm ${
              kost.type === 'putra'
                ? 'bg-sky-50 text-sky-800 border border-sky-200'
                : kost.type === 'putri'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}
          >
            {kost.type}
          </span>
          <span className="bg-slate-900/80 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[10px] font-medium">
            {kost.subdistrict}
          </span>
        </div>
      </div>

      {/* Konten Kartu */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3
            onClick={() => onSelectDetail(kost)}
            className="font-bold text-slate-900 text-base leading-snug group-hover:text-amber-800 transition cursor-pointer"
          >
            {kost.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{kost.landmark_proximity || kost.address}</span>
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Mulai dari</span>
            <div className="text-slate-900 font-extrabold text-sm sm:text-base tracking-tight">
              Rp {Number(lowestPrice).toLocaleString('id-ID')}
              <span className="text-[11px] font-normal text-slate-400"> /bln</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelectDetail(kost)}
              className="bg-[#f6f3eb] hover:bg-[#eae5d8] text-slate-700 text-xs font-semibold px-2.5 py-2 rounded-lg transition border border-[#e8e4db]"
            >
              Cek Kamar
            </button>
            <button
              onClick={() => onSelectBooking(kost)}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-2xs transition active:scale-95"
            >
              Ajukan Sewa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
