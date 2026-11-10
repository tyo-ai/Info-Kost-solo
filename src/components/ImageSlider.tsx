'use client';

import React, { useState, useEffect, useRef } from 'react';

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
  // Filter gambar valid
  const validImages = Array.isArray(images) && images.length > 0
    ? images.filter(Boolean)
    : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Pastikan index valid jika images berubah
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

  // Keyboard navigation untuk fullscreen / slider
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, validImages.length]);

  // Touch Swipe Handlers untuk HP/Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    setTouchStart(null);
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
        className={`relative ${aspectClass} w-full rounded-2xl overflow-hidden bg-slate-900 border border-[#e8e4db] group cursor-pointer`}
        onClick={() => setIsFullscreen(true)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Gambar Aktif */}
        <img
          src={validImages[currentIndex]}
          alt={`${alt} - Foto ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.02]"
        />

        {/* Gradasi Halus di Bawah & Atas untuk Kontras Kontrol */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

        {/* Badges Custom (misal gender & wilayah) */}
        {badges && (
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap z-10 pointer-events-none">
            {badges}
          </div>
        )}

        {/* Tombol Perbesar / Lightbox Icon */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsFullscreen(true);
          }}
          title="Perbesar Foto"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center text-xs backdrop-blur-xs transition shadow-xs z-10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>

        {/* Navigasi Panah Kiri & Kanan (Jika lebih dari 1 foto) */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Foto Sebelumnya"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center text-sm font-bold backdrop-blur-xs transition shadow-md opacity-90 hover:opacity-100 hover:scale-105 active:scale-95 z-10"
            >
              ❮
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Foto Berikutnya"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center text-sm font-bold backdrop-blur-xs transition shadow-md opacity-90 hover:opacity-100 hover:scale-105 active:scale-95 z-10"
            >
              ❯
            </button>
          </>
        )}

        {/* Indikator Jumlah Foto (Counter Badge) */}
        {validImages.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs z-10">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{currentIndex + 1} / {validImages.length}</span>
          </div>
        )}

        {/* Dot Indicators di bagian bawah */}
        {validImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {validImages.map((_, idx) => (
              <span
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? 'w-5 h-1.5 bg-white'
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Bar (Rasio Tetap Kecil untuk Klik Langsung) */}
      {showThumbnails && validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`relative aspect-video w-16 sm:w-20 shrink-0 rounded-xl overflow-hidden border transition-all ${
                currentIndex === idx
                  ? 'border-slate-900 ring-2 ring-slate-900 shadow-xs scale-95'
                  : 'border-[#e8e4db] opacity-60 hover:opacity-100 hover:border-slate-400'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fade-in"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Header Lightbox */}
          <div className="flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base">{alt}</span>
              <span className="text-xs text-white/60">
                ({currentIndex + 1} dari {validImages.length} Foto)
              </span>
            </div>

            {/* Tombol Tutup Silang (✕) */}
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg font-bold transition shadow-xs"
            >
              ✕
            </button>
          </div>

          {/* Area Foto Tengah Lightbox dengan Rasio Tetap & Object Contain */}
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
            />

            {validImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white text-xl font-bold flex items-center justify-center transition hover:scale-105 active:scale-95"
                >
                  ❮
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white text-xl font-bold flex items-center justify-center transition hover:scale-105 active:scale-95"
                >
                  ❯
                </button>
              </>
            )}
          </div>

          {/* Footer Thumbnails Lightbox */}
          {validImages.length > 1 && (
            <div
              className="flex justify-center gap-2 overflow-x-auto py-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {validImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`aspect-video w-14 sm:w-20 rounded-lg overflow-hidden border-2 transition-all ${
                    currentIndex === idx
                      ? 'border-white scale-105 shadow-md'
                      : 'border-transparent opacity-50 hover:opacity-90'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
