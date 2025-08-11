import * as ImageManipulator from 'expo-image-manipulator';

// nén 1 ảnh
export async function compressAsset(asset, opts = {}) {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.6, // 0..1
  } = opts;

  const w = asset.width || 0;
  const h = asset.height || 0;

  const actions = [];
  if (w && h && (w > maxWidth || h > maxHeight)) {
    const ratio = Math.min(maxWidth / w, maxHeight / h);
    actions.push({
      resize: { width: Math.round(w * ratio), height: Math.round(h * ratio) },
    });
  }

  const result = await ImageManipulator.manipulateAsync(
    asset.uri,
    actions,
    { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
  );

  return {
    ...asset,
    uri: result.uri,
    width: result.width,
    height: result.height,
    mimeType: 'image/jpeg',
    fileName: asset.fileName || `compressed_${Date.now()}.jpg`,
  };
}

// nén nhiều ảnh theo batch (song song vừa phải)
export async function compressMany(assets, opts = {}, concurrency = 3) {
  const out = [];
  for (let i = 0; i < assets.length; i += concurrency) {
    const chunk = assets.slice(i, i + concurrency);
    const done = await Promise.all(
      chunk.map(a => compressAsset(a, opts).catch(() => a)) // lỗi thì trả ảnh gốc
    );
    out.push(...done);
  }
  return out;
}
