'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ImageCropperModalProps {
  imageUrl: string;
  onCropComplete: (croppedBlob: Blob, croppedUrl: string) => void;
  onCancel: () => void;
  aspectRatio?: number; // default 16 / 9 (1.7778)
}

export default function ImageCropperModal({
  imageUrl,
  onCropComplete,
  onCancel,
  aspectRatio = 16 / 9,
}: ImageCropperModalProps) {
  // Zoom scale: 1 = pas memenuhi frame crop (fit cover)
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Dimensi natural gambar & ukuran base container
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [baseLayout, setBaseLayout] = useState<{ width: number; height: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Ukur gambar saat pertama kali load
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setNaturalSize({ width: naturalWidth, height: naturalHeight });
    recalculateBase(naturalWidth, naturalHeight);
  };

  // Hitung ukuran dasar gambar agar "cover" secara pas di viewport crop tanpa zoom berlebih
  const recalculateBase = (imgW: number, imgH: number) => {
    const container = containerRef.current;
    if (!container) return;

    const boxW = container.clientWidth;
    const boxH = container.clientHeight;

    const imgAspect = imgW / imgH;
    const boxAspect = boxW / boxH;

    let baseW = boxW;
    let baseH = boxH;

    if (imgAspect > boxAspect) {
      // Gambar lebih lebar: pas-kan tinggi, lebar menyesuaikan
      baseH = boxH;
      baseW = boxH * imgAspect;
    } else {
      // Gambar lebih tinggi (portrait/square): pas-kan lebar, tinggi menyesuaikan
      baseW = boxW;
      baseH = boxW / imgAspect;
    }

    setBaseLayout({ width: baseW, height: baseH });
    setOffset({ x: 0, y: 0 });
    setZoom(1);
  };

  // Recalculate saat resize jendela
  useEffect(() => {
    const handleResize = () => {
      if (naturalSize) {
        recalculateBase(naturalSize.width, naturalSize.height);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [naturalSize]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers (Mobile/HP)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Hitung dan Simpan Hasil Crop ke Canvas dengan Rasio Tetap 16:9
  const handleSaveCrop = useCallback(() => {
    if (!naturalSize || !baseLayout || !containerRef.current) return;

    const container = containerRef.current;
    const boxW = container.clientWidth;
    const boxH = container.clientHeight;

    const currentW = baseLayout.width * zoom;
    const currentH = baseLayout.height * zoom;

    // Posisi top-left gambar relatif terhadap container
    const imgLeft = (boxW - currentW) / 2 + offset.x;
    const imgTop = (boxH - currentH) / 2 + offset.y;

    // Koordinat crop relatif terhadap gambar yang ditampilkan
    const cropXInDisplayed = -imgLeft;
    const cropYInDisplayed = -imgTop;

    // Konversi ke koordinat natural image (pixel asli)
    const scaleFactor = naturalSize.width / currentW;

    const naturalCropX = cropXInDisplayed * scaleFactor;
    const naturalCropY = cropYInDisplayed * scaleFactor;
    const naturalCropW = boxW * scaleFactor;
    const naturalCropH = boxH * scaleFactor;

    // Target output: 1280 x 720 (16:9)
    const targetW = 1280;
    const targetH = Math.round(targetW / aspectRatio);

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background hitam jika ada area transparan di luar gambar
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, targetW, targetH);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      ctx.drawImage(
        img,
        naturalCropX,
        naturalCropY,
        naturalCropW,
        naturalCropH,
        0,
        0,
        targetW,
        targetH
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const newUrl = URL.createObjectURL(blob);
            onCropComplete(blob, newUrl);
          }
        },
        'image/webp',
        0.85
      );
    };
  }, [naturalSize, baseLayout, zoom, offset, aspectRatio, imageUrl, onCropComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-[#e8e4db] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e8e4db]">
          <div>
            <h3 className="font-black text-slate-900 text-sm sm:text-base">
              Atur Posisi Foto (Rasio Tetap 16:9)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Geser foto atau atur zoom untuk menentukan fokus tampilan di katalog.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-[#f6f3eb] hover:bg-[#eae5d8] text-slate-700 flex items-center justify-center text-xs font-bold transition group"
          >
            <span className="group-hover:rotate-90 transition-transform duration-200">✕</span>
          </button>
        </div>

        {/* Viewport Frame Rasio Tetap 16:9 */}
        <div
          ref={containerRef}
          className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-amber-400 select-none cursor-grab active:cursor-grabbing flex items-center justify-center"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Gambar Foto */}
          <img
            src={imageUrl}
            alt="Crop View"
            onLoad={onImageLoad}
            style={
              baseLayout
                ? {
                    width: `${baseLayout.width * zoom}px`,
                    height: `${baseLayout.height * zoom}px`,
                    transform: `translate(${offset.x}px, ${offset.y}px)`,
                    maxWidth: 'none',
                    maxHeight: 'none',
                  }
                : { width: '100%', height: '100%', objectFit: 'cover' }
            }
            className="select-none pointer-events-none transition-transform duration-75"
            draggable={false}
          />

          {/* Grid Garis Panduan 3x3 (Rule of Thirds) */}
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20">
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-white" />
            <div className="border-r border-white" />
            <div />
          </div>

          {/* Label Rasio 16:9 di Pojok */}
          <span className="absolute top-2.5 left-2.5 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs pointer-events-none">
            Frame 16:9
          </span>
        </div>

        {/* Slider Zoom & Kontrol */}
        <div className="space-y-2 bg-[#f6f3eb] p-3 rounded-2xl border border-[#e8e4db] text-xs">
          <div className="flex items-center justify-between font-bold text-slate-700 text-[11px]">
            <span>🔍 Zoom Foto:</span>
            <span className="text-slate-900 bg-white px-2 py-0.5 rounded border border-[#e8e4db]">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 font-bold">Pas (1x)</span>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 font-bold">2.5x</span>
          </div>

          <div className="flex justify-between items-center pt-1 text-[11px] text-slate-500">
            <span>💡 Klik & seret foto untuk memilih posisi yang pas.</span>
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setOffset({ x: 0, y: 0 });
              }}
              className="text-slate-800 hover:text-black font-bold underline cursor-pointer"
            >
              Reset ke Posisi Pas
            </button>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-[#e8e4db] hover:bg-slate-100 text-slate-700 font-bold text-xs transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSaveCrop}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm active:scale-[0.99]"
          >
            ✓ Terapkan Posisi Ini
          </button>
        </div>
      </div>
    </div>
  );
}
