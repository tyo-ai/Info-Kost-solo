'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';

export interface KostLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  price: number;
  type: string;
}

interface CatalogMapProps {
  kosts: KostLocation[];
  selectedKostId?: number | null;
  onSelectKost?: (id: number) => void;
}

const DynamicCatalogMap = dynamic(
  async () => {
    const { MapContainer, TileLayer, Marker, Popup, useMap } = await import('react-leaflet');
    const L = (await import('leaflet')).default;
    await import('leaflet/dist/leaflet.css');

    const getPinIcon = (type: string, isSelected: boolean) => {
      const color = type === 'putra' ? '#0284c7' : type === 'putri' ? '#db2777' : '#c2410c';
      const size = isSelected ? 22 : 14;
      const border = isSelected ? '3.5px solid #ffffff' : '2.5px solid #ffffff';
      const shadow = isSelected
        ? '0 0 0 5px rgba(234, 88, 12, 0.45), 0 3px 10px rgba(0,0,0,0.5)'
        : '0 1px 4px rgba(0,0,0,0.35)';

      return L.divIcon({
        className: 'custom-pin',
        html: `<div style="background-color: ${isSelected ? '#ea580c' : color}; width: ${size}px; height: ${size}px; border: ${border}; border-radius: 50%; box-shadow: ${shadow}; transition: all 0.25s ease;"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    };

    function MapFlyController({ activeKost }: { activeKost?: KostLocation | null }) {
      const map = useMap();
      useEffect(() => {
        if (activeKost && activeKost.latitude && activeKost.longitude) {
          map.flyTo([activeKost.latitude, activeKost.longitude], 15, {
            duration: 0.8,
            easeLinearity: 0.25,
          });
        }
      }, [activeKost, map]);
      return null;
    }

    return function CatalogMapComponent({ kosts, selectedKostId, onSelectKost }: CatalogMapProps) {
      // Pusat Surakarta: Stasiun Purwosari / Solo Grand Mall
      const centerSolo: [number, number] = [-7.5600, 110.8250];
      const activeKost = kosts.find((k) => k.id === selectedKostId) || null;

      return (
        <MapContainer
          center={centerSolo}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-full rounded-2xl border border-slate-200 z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapFlyController activeKost={activeKost} />

          {kosts.map((k) => {
            const isSelected = k.id === selectedKostId;
            return (
              <Marker
                key={k.id}
                position={[k.latitude, k.longitude]}
                icon={getPinIcon(k.type, isSelected)}
                eventHandlers={{
                  click: () => {
                    if (onSelectKost) onSelectKost(k.id);
                  },
                }}
              >
                <Popup>
                  <div className="text-xs p-1 space-y-1.5 min-w-[150px]">
                    <span className="font-extrabold text-slate-900 block text-sm">{k.name}</span>
                    <span className="text-orange-700 font-bold block">
                      Rp {k.price.toLocaleString('id-ID')} /bulan
                    </span>
                    <span className="text-[10px] text-slate-600 capitalize block">Tipe: {k.type}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectKost) onSelectKost(k.id);
                      }}
                      className="w-full mt-2 bg-orange-700 hover:bg-orange-800 text-white font-bold text-[11px] py-1.5 px-2 rounded-lg transition shadow-2xs text-center"
                    >
                      Buka Kamar di Kiri →
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      );
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center text-xs text-slate-600">
        Memuat Peta Solo...
      </div>
    ),
  }
);

export default function CatalogMap(props: CatalogMapProps) {
  return <DynamicCatalogMap {...props} />;
}
