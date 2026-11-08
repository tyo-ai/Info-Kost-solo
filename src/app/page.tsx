'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from '@/components/Navbar';
import PropertyCard, { PropertyItem, RoomItem } from '@/components/PropertyCard';
import KostRoomPanel from '@/components/KostRoomPanel';
import CatalogMap from '@/components/CatalogMap';
import BookingModal from '@/components/BookingModal';
import RoomDetailModal from '@/components/RoomDetailModal';
import { supabase } from '@/lib/supabaseClient';

const DUMMY_SOLO_KOSTS: PropertyItem[] = [
  {
    id: 1,
    name: 'Kost Wisma Kentingan Asri',
    type: 'putri',
    subdistrict: 'Jebres',
    landmark_proximity: '3 menit ke Gerbang Belakang UNS Solo',
    address: 'Jl. Surya Utama No. 14, Kentingan, Jebres, Solo',
    description: 'Kost putri tenang dengan lingkungan aman dan fasilitas lengkap.',
    image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    latitude: -7.5585,
    longitude: 110.8550,
    bank_name: 'BCA',
    bank_account_number: '0158923120',
    bank_account_holder: 'Info Kost Solo Official',
    rooms: [
      {
        id: 101,
        room_number: 'Kamar 01',
        price_per_month: 850000,
        is_available: true,
        facilities: ['Kamar Mandi Dalam', 'Kasur Springbed', 'AC', 'WiFi ID', 'Lemari & Meja'],
      },
    ],
  },
  {
    id: 2,
    name: 'Kost Griya Manahan Executive',
    type: 'campur',
    subdistrict: 'Banjarsari',
    landmark_proximity: '500m dari Stadion Manahan & Stasiun Balapan',
    address: 'Jl. Menteri Supeno No. 8, Manahan, Solo',
    description: 'Kost eksklusif dekat pusat kuliner Manahan & stasiun Solo Balapan.',
    image_url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
    latitude: -7.5535,
    longitude: 110.8095,
    bank_name: 'BCA',
    bank_account_number: '0158923120',
    bank_account_holder: 'Info Kost Solo Official',
    rooms: [
      {
        id: 102,
        room_number: 'Kamar 01 (Executive)',
        price_per_month: 1600000,
        is_available: true,
        facilities: ['Water Heater', 'Kamar Mandi Dalam', 'Smart TV', 'AC 1 PK', 'WiFi High Speed'],
      },
    ],
  },
  {
    id: 3,
    name: 'Kost Putra Kartasura Kampus',
    type: 'putra',
    subdistrict: 'Kartasura',
    landmark_proximity: '4 menit ke Kampus 1 & 2 UMS Solo',
    address: 'Jl. Garuda Mas No. 21, Pabelan, Kartasura',
    description: 'Kost khusus mahasiswa putra UMS dengan akses internet cepat.',
    image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    latitude: -7.5552,
    longitude: 110.7712,
    bank_name: 'BCA',
    bank_account_number: '0158923120',
    bank_account_holder: 'Info Kost Solo Official',
    rooms: [
      {
        id: 103,
        room_number: 'Kamar 01',
        price_per_month: 650000,
        is_available: true,
        facilities: ['Kasur Busa Tebal', 'WiFi 100Mbps', 'Parkir Motor Luas', 'Dapur Bersama'],
      },
    ],
  },
  {
    id: 4,
    name: 'Kost Mangkubumen Heritage',
    type: 'putri',
    subdistrict: 'Banjarsari',
    landmark_proximity: 'Dekat Solo Paragon Mall & RS Kasih Ibu',
    address: 'Jl. Dr. Supomo No. 34, Mangkubumen, Solo',
    description: 'Hunian kost nyaman di pusat kota Surakarta.',
    image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    latitude: -7.5610,
    longitude: 110.8150,
    bank_name: 'BCA',
    bank_account_number: '0158923120',
    bank_account_holder: 'Info Kost Solo Official',
    rooms: [
      {
        id: 104,
        room_number: 'Kamar 01',
        price_per_month: 1100000,
        is_available: true,
        facilities: ['Kamar Mandi Dalam', 'Kasur Springbed', 'AC Dingin', 'WiFi Bersama', 'CCTV 24 Jam'],
      },
    ],
  },
];

export default function CatalogPage() {
  const [kosts, setKosts] = useState<PropertyItem[]>(DUMMY_SOLO_KOSTS);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('semua');
  
  // State untuk kost yang dipilih dari peta / tombol "Cek Kamar"
  const [selectedKostId, setSelectedKostId] = useState<number | null>(null);
  
  // Modal states
  const [selectedKostForDetail, setSelectedKostForDetail] = useState<PropertyItem | null>(null);
  const [selectedKostForBooking, setSelectedKostForBooking] = useState<PropertyItem | null>(null);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<RoomItem | null>(null);

  const leftColumnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadKostsFromSupabase() {
      try {
        const { data, error } = await supabase
          .from('kosts')
          .select(`
            id, name, type, subdistrict, landmark_proximity, address, description, image_url, latitude, longitude,
            bank_name, bank_account_number, bank_account_holder,
            rooms ( id, room_number, price_per_month, is_available, facilities )
          `);

        if (!error && data && data.length > 0) {
          // Bersihkan kamar ganda/dobel jika ada
          const sanitizedKosts = data.map((item: any) => {
            const seenRooms = new Set<string>();
            const uniqueRooms = (item.rooms || []).filter((r: any) => {
              const nameKey = (r.room_number || '').trim().toLowerCase();
              if (seenRooms.has(nameKey)) return false;
              seenRooms.add(nameKey);
              return true;
            });
            return {
              ...item,
              rooms: uniqueRooms.length > 0 ? uniqueRooms : item.rooms,
            };
          });

          setKosts(sanitizedKosts as any);
          setIsConnected(true);
        }
      } catch (e) {
        console.info('Menggunakan data fallback lokal Solo');
      }
    }
    loadKostsFromSupabase();
  }, []);

  // Filter kosts berdasarkan search dan filter gender
  const filteredKosts = useMemo(() => {
    return kosts.filter((item) => {
      const matchType = filterType === 'semua' || item.type === filterType;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.subdistrict.toLowerCase().includes(q) ||
        (item.landmark_proximity && item.landmark_proximity.toLowerCase().includes(q)) ||
        item.address.toLowerCase().includes(q);

      return matchType && matchSearch;
    });
  }, [kosts, filterType, searchQuery]);

  // Kost yang sedang aktif / diklik dari peta
  const activeKost = useMemo(() => {
    if (!selectedKostId) return null;
    return kosts.find((k) => k.id === selectedKostId) || null;
  }, [kosts, selectedKostId]);

  // Handler saat titik peta diklik
  const handleMarkerClick = (id: number) => {
    setSelectedKostId(id);
    // Scroll lembut ke kolom kiri terutama saat di perangkat mobile
    if (leftColumnRef.current) {
      leftColumnRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col text-slate-800">
      <Navbar />

      {/* Main Container Split Screen */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {/* Header & Filter Bar Khas Solo */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Katalog Kost Surakarta</h1>
            <p className="text-xs text-slate-600 mt-1">
              Temukan hunian sewa dekat kampus UNS, UMS, Manahan, dan stasiun di Solo. Klik titik peta di kanan untuk langsung melihat kamar di kiri.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Cari UNS, UMS, Jebres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#e8e4db] rounded-full focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-2xs"
              />
              <svg className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filter Gender/Tipe */}
            <div className="inline-flex p-1 bg-white border border-[#e8e4db] rounded-full shadow-2xs">
              {['semua', 'putra', 'putri', 'campur'].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setFilterType(t);
                    setSelectedKostId(null);
                  }}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold capitalize transition ${
                    filterType === t
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-[#f6f3eb]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Layout Split: Kiri Grid Kartu / Panel Kamar, Kanan Peta Realtime */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
          {/* Kolom Kiri: Menampilkan Kamar Kost Terpilih ATAU Grid Semua Kost */}
          <div ref={leftColumnRef} className="lg:col-span-7 space-y-4">
            {activeKost ? (
              /* Tampilan Kamar Kost Saat Titik Peta Diklik */
              <KostRoomPanel
                kost={activeKost}
                onBack={() => setSelectedKostId(null)}
                onSelectBooking={(k, r) => {
                  setSelectedKostForBooking(k);
                  setSelectedRoomForBooking(r || null);
                }}
              />
            ) : filteredKosts.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2">
                <p className="font-bold text-slate-800 text-sm">Tidak ada kost yang sesuai pencarian Anda</p>
                <p className="text-xs text-slate-500">Coba ganti kata kunci seperti "UNS", "UMS", atau pilih kategori "Semua".</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('semua');
                    setSelectedKostId(null);
                  }}
                  className="mt-2 text-xs text-orange-700 font-bold hover:underline"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              /* Grid Standar Semua Kost Solo */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredKosts.map((kost) => (
                  <PropertyCard
                    key={kost.id}
                    kost={kost}
                    isSelected={kost.id === selectedKostId}
                    onSelectDetail={(k) => setSelectedKostId(k.id)}
                    onSelectBooking={(k) => {
                      setSelectedKostForBooking(k);
                      setSelectedRoomForBooking(null);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Kolom Kanan: Peta Sebaran Fixed Height di Desktop */}
          <div className="lg:col-span-5 h-[380px] lg:h-[calc(100vh-170px)] lg:sticky lg:top-20">
            <CatalogMap
              kosts={filteredKosts.map((k) => ({
                id: k.id,
                name: k.name,
                latitude: Number(k.latitude),
                longitude: Number(k.longitude),
                price: Number(k.rooms?.[0]?.price_per_month || 0),
                type: k.type,
              }))}
              selectedKostId={selectedKostId}
              onSelectKost={handleMarkerClick}
            />
          </div>
        </div>
      </main>

      {/* Modal Detail Kamar & Fasilitas Tambahan (jika dibuka dari tempat lain) */}
      <RoomDetailModal
        kost={selectedKostForDetail}
        onClose={() => setSelectedKostForDetail(null)}
        onProceedBooking={(k) => {
          setSelectedKostForDetail(null);
          setSelectedKostForBooking(k);
          setSelectedRoomForBooking(null);
        }}
      />

      {/* Modal Booking Sewa Manual & Upload Resi */}
      <BookingModal
        kost={selectedKostForBooking}
        selectedRoom={selectedRoomForBooking}
        onClose={() => {
          setSelectedKostForBooking(null);
          setSelectedRoomForBooking(null);
        }}
      />
    </div>
  );
}
