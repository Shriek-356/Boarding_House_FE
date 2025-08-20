// utils/LocationHelper.js
import * as Location from 'expo-location';

/**
 * Lấy quận/tỉnh đáng tin cậy.
 * - restrictToVN: true -> nếu ngoài VN sẽ dùng fallback (nếu có)
 * - fallbackArea: { district, province } -> dùng khi OUTSIDE_VN / SERVICES_OFF / PERMISSION_DENIED / NO_POSITION / NO_ADDRESS / TIMEOUT
 * - devOverride: { district, province } -> ép khu vực khi dev/emulator
 * - timeoutMs: ngắt nếu getCurrentPosition quá lâu
 *
 * Trả về:
 * {
 *   district, province, country, accuracy, precise,
 *   isFallback: boolean,
 *   source: 'DEV_OVERRIDE' | 'FALLBACK' | 'CURRENT' | 'LAST_KNOWN',
 *   reasonCode: null | 'OUTSIDE_VN' | 'SERVICES_OFF' | 'PERMISSION_DENIED' | 'NO_POSITION' | 'NO_ADDRESS' | 'TIMEOUT'
 * }
 */
export async function getAdminAreaSafe({
  restrictToVN = true,
  fallbackArea,          // { district, province }
  devOverride,
  timeoutMs = 8000,
} = {}) {
  // 0) DEV override (dành cho emulator/test)
  if (devOverride?.district && devOverride?.province) {
    return {
      district: devOverride.district,
      province: devOverride.province,
      country: 'VN',
      accuracy: null,
      precise: true,
      isFallback: true,
      source: 'DEV_OVERRIDE',
      reasonCode: 'DEV_OVERRIDE',
    };
  }

  // 1) Dịch vụ vị trí có bật không?
  const enabled = await Location.hasServicesEnabledAsync();
  if (!enabled) {
    if (fallbackArea?.district && fallbackArea?.province) {
      return { ...fallbackArea, isFallback: true, source: 'FALLBACK', reasonCode: 'SERVICES_OFF' };
    }
    const e = new Error('SERVICES_OFF'); e.code = 'SERVICES_OFF'; throw e;
  }

  // 2) Quyền
  let perm = await Location.getForegroundPermissionsAsync();
  if (perm.status !== 'granted') {
    perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') {
      if (fallbackArea?.district && fallbackArea?.province) {
        return { ...fallbackArea, isFallback: true, source: 'FALLBACK', reasonCode: 'PERMISSION_DENIED' };
      }
      const e = new Error('PERMISSION_DENIED'); e.code = 'PERMISSION_DENIED'; throw e;
    }
  }
  const precise = perm.scope ? perm.scope === 'fine' : true;

  // 3) Lấy toạ độ: ưu tiên lastKnown -> current (race với timeout)
  const last = await Location.getLastKnownPositionAsync(); // có thể null
  const acc = precise ? Location.Accuracy.High : Location.Accuracy.Balanced;

  const currentPromise = Location.getCurrentPositionAsync({ accuracy: acc });
  const timeoutPromise = new Promise((_, rej) =>
    setTimeout(() => rej(Object.assign(new Error('TIMEOUT'), { code: 'TIMEOUT' })), timeoutMs)
  );

  let pos = last;
  try {
    pos = await Promise.race([currentPromise, timeoutPromise]);
  } catch (_) {
    // giữ nguyên last nếu current timeout
  }
  if (!pos) {
    if (fallbackArea?.district && fallbackArea?.province) {
      return { ...fallbackArea, isFallback: true, source: 'FALLBACK', reasonCode: 'NO_POSITION' };
    }
    const e = new Error('NO_POSITION'); e.code = 'NO_POSITION'; throw e;
  }

  // 4) Reverse geocode
  const [addr] = await Location.reverseGeocodeAsync({
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
  });
  if (!addr) {
    if (fallbackArea?.district && fallbackArea?.province) {
      return { ...fallbackArea, isFallback: true, source: 'FALLBACK', reasonCode: 'NO_ADDRESS' };
    }
    const e = new Error('NO_ADDRESS'); e.code = 'NO_ADDRESS'; throw e;
  }

  const country = (addr.isoCountryCode || addr.country || '').toUpperCase();
  if (restrictToVN && country && country !== 'VN') {
    if (fallbackArea?.district && fallbackArea?.province) {
      return { ...fallbackArea, isFallback: true, source: 'FALLBACK', reasonCode: 'OUTSIDE_VN' };
    }
    const e = new Error('OUTSIDE_VN'); e.code = 'OUTSIDE_VN'; throw e;
  }

  const district = addr.district || addr.subregion || addr.city || '';
  const province = addr.region || addr.city || addr.administrativeArea || '';

  return {
    district,
    province,
    country,
    accuracy: pos.coords.accuracy ?? null,
    precise,
    isFallback: false,
    source: last && pos === last ? 'LAST_KNOWN' : 'CURRENT',
    reasonCode: null,
  };
}
