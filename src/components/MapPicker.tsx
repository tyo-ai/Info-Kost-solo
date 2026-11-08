'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

const MapComponent = dynamic(
  async () => {
    const { MapContainer, TileLayer, Marker, useMapEvents } = await import('react-leaflet');
    const L = (await import('leaflet')).default;
    await import('leaflet/dist/leaflet.css');

    const customPin = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #c2410c; width: 16px; height: 16px; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    function LocationMarker({ onSelect, pos }: { onSelect: (lat: number, lng: number) => void; pos: [number, number] | null }) {
      const [position, setPosition] = useState<[number, number] | null>(pos);

      useMapEvents({
        click(e) {
          setPosition([e.latlng.lat, e.latlng.lng]);
          onSelect(e.latlng.lat, e.latlng.lng);
        },
      });

      return position === null ? null : <Marker position={position} icon={customPin} />;
    }

    return function DynamicLeafletMap({ onSelect, initialPos }: { onSelect: (lat: number, lng: number) => void; initialPos: [number, number] }) {
      return (
        <MapContainer
          center={initialPos}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-72 rounded-xl border border-slate-200 z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker onSelect={onSelect} pos={initialPos} />
        </MapContainer>
      );
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-72 w-full bg-slate-100 rounded-xl animate-pulse flex items-center justify-center text-xs text-slate-600">
        Memuat Peta Surakarta...
      </div>
    )
  }
);

export default function MapPicker({ onLocationSelect, initialLat = -7.5693, initialLng = 110.8285 }: MapPickerProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
        <span>Klik pada peta untuk menentukan titik koordinat kost:</span>
        <span className="text-orange-700">Area Surakarta & Sekitarnya</span>
      </div>
      <MapComponent onSelect={onLocationSelect} initialPos={[initialLat, initialLng]} />
    </div>
  );
}

