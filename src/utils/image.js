// Mengecilkan gambar (resize + kompres) sebelum disimpan sebagai data URL.
// Penting supaya foto dari kamera HP (biasanya 2-8MB) tidak bikin localStorage
// penuh — logo cukup kecil (dipakai maksimal ~64px di layar), jadi kita batasi
// dimensinya ke maxSize piksel dan kompres ke format JPEG kualitas sedang.
export function compressImage(file, { maxSize = 400, quality = 0.85 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("File bukan gambar yang valid."));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height / width) * maxSize);
            width = maxSize;
          } else {
            width = Math.round((width / height) * maxSize);
            height = maxSize;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
