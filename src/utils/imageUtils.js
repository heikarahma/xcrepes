const DEFAULT_OPTIONS = {
  maxWidth: 1280,
  maxHeight: 1280,
  maxBytes: 300 * 1024,
  quality: 0.82,
  minQuality: 0.58,
  mimeType: 'image/webp'
};

const readAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
  reader.readAsDataURL(file);
});

const loadImage = (source) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('File gambar tidak dapat diproses.'));
  image.src = source;
});

const canvasToBlob = (canvas, mimeType, quality) => new Promise((resolve, reject) => {
  canvas.toBlob(
    (blob) => blob ? resolve(blob) : reject(new Error('Gagal mengompres gambar.')),
    mimeType,
    quality
  );
});

export const compressImageFile = async (file, options = {}) => {
  if (!file) throw new Error('File gambar tidak ditemukan.');

  const config = { ...DEFAULT_OPTIONS, ...options };
  if (file.type === 'image/svg+xml') return readAsDataUrl(file);

  const originalDataUrl = await readAsDataUrl(file);
  const image = await loadImage(originalDataUrl);
  const scale = Math.min(1, config.maxWidth / image.naturalWidth, config.maxHeight / image.naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Browser tidak mendukung kompresi gambar.');
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  let quality = config.quality;
  let blob = await canvasToBlob(canvas, config.mimeType, quality);
  while (blob.size > config.maxBytes && quality > config.minQuality) {
    quality = Math.max(config.minQuality, quality - 0.08);
    blob = await canvasToBlob(canvas, config.mimeType, quality);
  }

  return readAsDataUrl(blob);
};
