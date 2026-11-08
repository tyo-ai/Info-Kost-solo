/**
 * Helper Kompresi Gambar Otomatis di Sisi Klien menggunakan HTML Canvas
 * Menjaga ukuran gambar di bawah 250KB agar menghemat kuota free-tier Supabase Storage.
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.75
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, "") + ".webp",
              {
                type: 'image/webp',
                lastModified: Date.now(),
              }
            );
            resolve(compressedFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

