export const MAX_STORE_CHARS = 900000;

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function compressImageDataUrl(dataUrl, maxWidth, quality) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export async function processMediaFile(file) {
  const isVideo = file.type.startsWith('video/');
  const rawDataUrl = await readFileAsDataURL(file);
  if (isVideo) {
    return { dataUrl: rawDataUrl, type: 'video', name: file.name, tooLargeToStore: rawDataUrl.length > MAX_STORE_CHARS };
  }
  let finalUrl = rawDataUrl;
  if (finalUrl.length > MAX_STORE_CHARS) {
    try { finalUrl = await compressImageDataUrl(rawDataUrl, 700, 0.6); } catch (e) { /* keep raw */ }
  }
  if (finalUrl.length > MAX_STORE_CHARS) {
    try { finalUrl = await compressImageDataUrl(rawDataUrl, 450, 0.45); } catch (e) { /* keep raw */ }
  }
  return { dataUrl: finalUrl, type: 'image', name: file.name, tooLargeToStore: finalUrl.length > MAX_STORE_CHARS };
}
