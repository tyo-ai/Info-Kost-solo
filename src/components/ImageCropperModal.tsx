'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ImageCropperModalProps {
  imageUrl: string;
  onCropComplete: (croppedBlob: Blob, croppedUrl: string) => void;
  onCancel: () => void;
  aspectRatio?: number; // default 16 / 9
}

export default function ImageCropperModal({
  imageUrl,
  onCropComplete,
  onCancel,
  aspectRatio = 16 / 9,
}: ImageCropperModalProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Batasi drag agar gambar tidak hilang dari viewport crop
  const handleMouseDown = (e: React.MouseEvent) => {
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

  // Touch handlers untuk HP
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

  // Handle tombol Simpan Hasil Crop
  const handleSaveCrop = useCallback(() => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const cropBox = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    // Canvas target berukuran rasio tetap 16:9 (1280 x 720)
    const targetWidth = 1280;
    const targetHeight = Math.round(targetWidth / aspectRatio);

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Hitung posisi relative gambar terhadap kotak crop
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    const displayedScale = (imgRect.width) / naturalWidth;

    const cropXInImg = (cropBox.left - imgRect.left) / displayedScale;
    const cropYInImg = (cropBox.top - imgRect.top) / displayedScale;
    const cropWidthInImg = cropBox.width / displayedScale;
    const cropHeightInImg = cropBox.height / displayedScale;

    ctx.drawImage(
      img,
      cropXInImg,
      cropYInImg,
      cropWidthInImg,
      cropHeightInImg,
      0,
      0,
      targetWidth,
      targetHeight
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
  }, [aspectRatio, onCropComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-[#e8e4db] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e8e4db]">
          <div>
            <h3 className="font-black text-slate-900 text-base">Sesuaikan Posisi Foto (Rasio Tetap 16:9)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Geser dan perbesar foto agar pas di dalam frame 16:9
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

        {/* Viewport Crop dengan Rasio Tetap 16:9 */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-amber-400 select-none cursor-move flex items-center justify-center">
          <div
            ref={containerRef}
            className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center"
          >
            {/* Grid Panduan 3x3 (Rule of Thirds) */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-25">
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
          </div>

          <img
            ref={imgRef}
            src={imageUrl}
            alt="Crop Preview"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              maxHeight: 'none',
              maxWidth: 'none',
            }}
            className="transition-transform duration-75 select-none touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            draggable={false}
          />
        </div>

        {/* Slider Zoom & Petunjuk */}
        <div className="space-y-2 bg-[#f6f3eb] p-3.5 rounded-2xl border border-[#e8e4db] text-xs">
          <div className="flex items-center justify-between font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <span>🔍 Perbesar / Zoom:</span>
            </span>
            <span className="text-slate-900 bg-white px-2 py-0.5 rounded-md border border-[#e8e4db]">
              {Math.round(scale * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-bold">1x</span>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400 font-bold">3x</span>
          </div>
          <div className="flex justify-between items-center pt-1 text-[11px] text-slate-500">
            <span>💡 <strong>Tips:</strong> Klik & seret (drag) foto untuk menggeser posisi terbaik.</span>
            <button
              type="button"
              onClick={() => {
                setScale(1);
                setOffset({ x: 0, y: 0 });
              }}
              className="text-slate-700 hover:text-slate-900 font-bold underline cursor-pointer"
            >
              Reset Posisi
            </button>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex gap-3 pt-2">
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
            ✓ Terapkan Crop (16:9)
          </button>
        </div>
      </div>
    </div>
  );
}
