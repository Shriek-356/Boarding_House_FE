import * as Location from 'expo-location';

export async function getUserAdminArea() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    const err = new Error('Location permission denied');
    err.code = 'PERMISSION_DENIED';
    throw err;
  }
  const last = await Location.getLastKnownPositionAsync();
  const pos = last || await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });

  const [addr] = await Location.reverseGeocodeAsync({
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
  });

  const rawDistrict = addr?.district || addr?.subregion || addr?.city || '';
  const rawProvince = addr?.region || addr?.city || addr?.administrativeArea || '';

  const { district, province } = normalizeVNAdminArea(rawDistrict, rawProvince);
  return { lat: pos.coords.latitude, lng: pos.coords.longitude, district, province };
}

// đổi "District 1" -> "Quận 1", "Ho Chi Minh City" -> "TP. Hồ Chí Minh"
export function normalizeVNAdminArea(districtRaw, provinceRaw) {
  const p = (provinceRaw || '').trim().toLowerCase();
  let province = provinceRaw;

  if (['ho chi minh city','thanh pho ho chi minh','tp hcm','hcm','hồ chí minh'].includes(p))
    province = 'TP. Hồ Chí Minh';
  else if (['ha noi','hanoi','hà nội'].includes(p))
    province = 'Hà Nội';
  else if (['da nang','đà nẵng','danang'].includes(p))
    province = 'Đà Nẵng';

  let district = (districtRaw || '').trim();
  const m = district.match(/district\s*(\d+)/i);
  if (m) district = `Quận ${m[1]}`;
  district = district.replace(/^quan\s+/i, 'Quận ');
  district = district.replace(/^q\.\s*/i, 'Quận ');
  district = district.trim();

  return { district, province };
}