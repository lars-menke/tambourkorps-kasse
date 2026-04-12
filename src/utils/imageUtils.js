/**
 * Compress an image file to a target max size (default 1MB).
 * Returns a base64 dataURL string.
 */
export async function compressImage(file, maxBytes = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Scale down if image is very large
      const MAX_DIM = 1920;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Try progressively lower quality until under maxBytes
      let quality = 0.85;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);

      while (dataUrl.length * 0.75 > maxBytes && quality > 0.1) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }

      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Bild konnte nicht geladen werden'));
    };

    img.src = url;
  });
}

export function generateId(prefix = 'x') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
