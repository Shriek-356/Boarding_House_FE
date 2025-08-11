// utils/amenities.js

/**
 * originalList: [{ id, amenityName }, ...] từ BE
 * selectedNames: ['Gác Lửng', 'Wifi', ...] người dùng đang chọn
 *
 * Trả:
 *  - toAddNames: tên tiện nghi cần tạo mới (POST)
 *  - toRemoveIds: id tiện nghi cần xoá (DELETE)
 */
export function diffAmenities(originalList = [], selectedNames = []) {
  const originalByName = new Map((originalList || []).map(o => [o.amenityName, o]));
  const selectedSet = new Set(selectedNames || []);

  const toAddNames  = (selectedNames || []).filter(n => !originalByName.has(n));
  const toRemoveIds = (originalList || [])
    .filter(o => !selectedSet.has(o.amenityName))
    .map(o => o.id);

  return { toAddNames, toRemoveIds };
}
