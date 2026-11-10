'use client';

import React, { useState, useEffect } from 'react';

const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80';

interface ImageSliderProps {
  images: string[];
  alt?: string;
  aspectRatio?: '16/9' | '4/3' | '16/10';
  className?: string;
  showThumbnails?: boolean;
  badges?: React.ReactNode;
}

export default function ImageSlider({
  images,
  alt = 'Foto Kamar Kost',
  aspectRatio = '16/9',
  className = '',
  showThumbnails = true,
  badges,
}: ImageSliderProps) {
  // Gunakan HANYA foto asli yang dimasukkan admin; fallback ke placeholder jika kosong
  const validImages: string[] =
    Array.isArray(images) && images.filter(Boolean).length > 0
      ? images.filter(Boolean)
      : [DEFAULT_PLACEHOLDER];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Drag & Swipe states (Support Touch HP & Mouse Desktop)
  const [startX, setStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Pastikan index valid jika list gambar berubah
  useEffect(() => {
    if (currentIndex >= validImages.length) {
      setCurrentIndex(0);
    }
  }, [validImages.length, currentIndex]);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation untuk ArrowLeft, ArrowRight, dan Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, validImages.length]);

  // Touch handlers (HP/Mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX === null) return;
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (diff > 35) {
      handleNext();
    } else if (diff < -35) {
      handlePrev();
    }
    setStartX(null);
  };

  // Mouse drag handlers (Desktop Mouse Swipe)
  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (startX !== null) {
      const diff = Math.abs(e.clientX - startX);
      if (diff > 8) {
        setIsDragging(true);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (startX !== null) {
      const diff = startX - e.clientX;
      if (diff > 40) {
        handleNext();
      } else if (diff < -40) {
        handlePrev();
      }
    }
    setStartX(null);
    setTimeout(() => setIsDragging(false), 50);
  };

  // Mapping Rasio Tetap
  const aspectClass = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '16/10': 'aspect-[16/10]',
  }[aspectRatio] || 'aspect-video';

  return (
    <div className={`space-y-2 select-none ${className}`}>
      {/* Container Utama Slider dengan Rasio Tetap */}
      <div
        className={`relative ${aspectClass} w-full rounded-2xl overflow-hidden bg-slate-900 border border-[#e8e4db] group shadow-sm`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Gambar Aktif dengan Smooth Fade Transition */}
        <img
          key={currentIndex}
          src={validImages[currentIndex]}
          alt={`${alt} - Foto ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          draggable={false}
        />

        {/* Gradasi Lembut untuk Kontras Navigasi */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/25 pointer-events-none" />

        {/* Badges Custom (misal Jenis Kost & Wilayah) */}
        {badges && (
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap z-10 pointer-events-none">
            {badges}
          </div>
        )}

        {/* Tombol Khusus Perbesar / Fullscreen (Pojok Kanan Atas) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsFullscreen(true);
          }}
          title="Buka Foto Layar Penuh"
          aria-label="Perbesar foto"
          className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] font-bold backdrop-blur-md transition shadow-md hover:scale-105 active:scale-95 z-20"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <span className="hidden sm:inline">Perbesar</span>
        </button>

        {/* Navigasi Panah Kiri (❮) Selalu Tampil Jelas */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Foto Sebelumnya"
          title="Foto Sebelumnya"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center text-lg font-black backdrop-blur-md transition-all shadow-lg hover:scale-110 active:scale-95 z-20 cursor-pointer"
        >
          ❮
        </button>

        {/* Navigasi Panah Kanan (❯) Selalu Tampil Jelas */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Foto Berikutnya"
          title="Foto Berikutnya"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center text-lg font-black backdrop-blur-md transition-all shadow-lg hover:scale-110 active:scale-95 z-20 cursor-pointer"
        >
          ❯
        </button>

        {/* Counter Badge Foto (Pojok Kanan Bawah) */}
        <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md z-10 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{currentIndex + 1} / {validImages.length} Foto</span>
        </div>

        {/* Dot Indicators di Bagian Bawah Tengah */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full">
          {validImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Pindah ke foto ${idx + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                currentIndex === idx
                  ? 'w-6 h-1.5 bg-white'
                  : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Baris Thumbnail Rasio Tetap (Bisa Diklik Langsung untuk Berpindah Foto) */}
      {showThumbnails && validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`relative aspect-video w-16 sm:w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                currentIndex === idx
                  ? 'border-slate-900 ring-2 ring-slate-900/30 scale-95 shadow-sm'
                  : 'border-[#e8e4db] opacity-60 hover:opacity-100 hover:border-slate-400'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
              <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-white bg-black/60 px-1 rounded">
                #{idx + 1}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL DENGAN KONTROL LENGKAP */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Header Lightbox */}
          <div className="flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base">{alt}</span>
              <span className="text-xs text-white/70 bg-white/10 px-2.5 py-0.5 rounded-full">
                Foto {currentIndex + 1} dari {validImages.length}
              </span>
            </div>

            {/* Tombol Tutup Silang (✕) Bulat */}
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              aria-label="Tutup foto penuh"
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center text-lg font-bold transition shadow-xs cursor-pointer group"
            >
              <span className="group-hover:rotate-90 transition-transform duration-200">✕</span>
            </button>
          </div>

          {/* Area Foto Tengah Lightbox dengan Panah Navigasi */}
          <div
            className="relative flex-1 flex items-center justify-center my-4"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={validImages[currentIndex]}
              alt={`${alt} - Foto ${currentIndex + 1}`}
              className="max-h-[75vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl transition-all"
              draggable={false}
            />

            {/* Tombol Navigasi Panah Kiri di Mode Layar Penuh */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Foto Sebelumnya"
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/70 hover:bg-black text-white text-2xl font-bold flex items-center justify-center transition hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
            >
              ❮
            </button>

            {/* Tombol Navigasi Panah Kanan di Mode Layar Penuh */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Foto Berikutnya"
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/70 hover:bg-black text-white text-2xl font-bold flex items-center justify-center transition hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
            >
              ❯
            </button>
          </div>

          {/* Baris Thumbnail Bawah di Lightbox */}
          <div
            className="flex justify-center gap-2 overflow-x-auto py-2 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {validImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`aspect-video w-14 sm:w-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  currentIndex === idx
                    ? 'border-white scale-105 shadow-md'
                    : 'border-transparent opacity-50 hover:opacity-90'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" draggable={false} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
