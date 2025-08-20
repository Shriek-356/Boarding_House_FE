const strip = (s) => (s || '').trim();
const norm  = (s) => strip(s).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

function toModalProvince(province = '') {
  const p = strip(province);
  const n = norm(province);

  // đã có tiền tố -> quy về đúng chữ
  if (/^tp\.?\s+/i.test(p))       return p.replace(/^tp\.?\s+/i, 'Thành phố ');
  if (/^thành phố\s+/i.test(p))   return p.replace(/^thành phố\s+/i, 'Thành phố ');
  if (/^tỉnh\s+/i.test(p))        return p.replace(/^tỉnh\s+/i, 'Tỉnh ');

  // 3 thành phố trực thuộc TW
  if (['ho chi minh', 'ho chi minh city', 'hcm', 'sai gon'].includes(n))
    return 'Thành phố Hồ Chí Minh';
  if (['ha noi', 'hanoi'].includes(n))    return 'Thành phố Hà Nội';
  if (['da nang', 'danang'].includes(n))  return 'Thành phố Đà Nẵng';

  // các tỉnh khác
  return `Tỉnh ${p}`;
}

function toModalDistrict(district = '') {
  const d = strip(district);
  const n = norm(district);

  // đã có tiền tố -> giữ (chuẩn hoá "tp." thành "Thành phố")
  if (/^quận\s+/i.test(d))        return d.replace(/^quận\s+/i, 'Quận ');
  if (/^huyện\s+/i.test(d))       return d.replace(/^huyện\s+/i, 'Huyện ');
  if (/^thị xã\s+/i.test(d))      return d.replace(/^thị xã\s+/i, 'Thị xã ');
  if (/^tp\.?\s+/i.test(d))       return d.replace(/^tp\.?\s+/i, 'Thành phố ');
  if (/^thành phố\s+/i.test(d))   return d.replace(/^thành phố\s+/i, 'Thành phố ');

  // District/Q -> Quận
  if (/^district\s*\d+$/i.test(d)) return `Quận ${d.replace(/\D+/g, '')}`;
  if (/^q\s*\d+$/i.test(n))        return `Quận ${n.replace(/\D+/g, '')}`;

  // mặc định: Quận
  return `Quận ${d}`;
}

/** Chuẩn hoá object area theo style modal */
export function toModalArea(area) {
  return {
    ...area,
    district: toModalDistrict(area?.district),
    province: toModalProvince(area?.province),
  };
}

/** Label hiển thị cho UI */
export function formatAreaLabel(area) {
  const a = toModalArea(area);
  return `${a.district}, ${a.province}`;
}