// utils/imageForm.js
import * as FileSystem from 'expo-file-system';

export const MAX_IMAGES = 10;

const guessMime = (ext) => {
  switch ((ext || '').toLowerCase()) {
    case 'png':  return 'image/png';
    case 'webp': return 'image/webp';
    default:     return 'image/jpeg';
  }
};

export async function urlToFile(url, i = 0) {
  const clean = (url || '').split('?')[0] || '';
  const ext = ['jpg','jpeg','png','webp'].includes(clean.split('.').pop()?.toLowerCase())
    ? clean.split('.').pop().toLowerCase()
    : 'jpg';

  const target = `${FileSystem.cacheDirectory}keep_${i}.${ext}`;
  const { uri } = await FileSystem.downloadAsync(url, target);
  return { uri, name: `keep_${i}.${ext}`, type: guessMime(ext) };
}

export function assetToFile(asset, i = 0) {
  return {
    uri: asset.uri,
    name: asset.fileName || `new_${Date.now()}_${i}.jpg`,
    type: asset.mimeType || 'image/jpeg',
  };
}

/**
 * Gộp toàn bộ ảnh hiện có (URL còn giữ) + ảnh mới -> FormData
 */
export async function buildRoomUpdateForm(fields, keptUrls = [], newAssets = []) {
  const form = new FormData();

  // Fields text (Map<String,String> ở BE)
  Object.entries(fields || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null) form.append(k, String(v));
  });

  // Ảnh cũ (download về file tạm) + append
  const keptFiles = await Promise.all(
    (keptUrls || []).map((u, i) => urlToFile(u, i).catch(() => null))
  );
  keptFiles.filter(Boolean).forEach(f => form.append('images', f));

  // Ảnh mới (từ ImagePicker)
  (newAssets || []).forEach((a, i) => form.append('images', assetToFile(a, i)));

  // Sanity check: phải có ít nhất 1 ảnh
  const hasImages = Array.isArray(form._parts) && form._parts.some(([k]) => k === 'images');
  if (!hasImages) throw new Error('Phòng phải có ít nhất 1 ảnh.');

  return form;
}
