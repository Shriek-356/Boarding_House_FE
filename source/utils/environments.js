// utils/environments.js
/**
 * originalList: [{ id, environmentType }, ...] từ BE
 * selectedNames: ['Chợ', 'Siêu thị', ...] người dùng đang chọn
 *
 * Trả:
 *  - toAddNames: tên môi trường cần tạo mới (POST)
 *  - toRemoveIds: id môi trường cần xoá (DELETE)
 */
export function diffEnvironments(originalList = [], selectedNames = []) {
  const originalByName = new Map((originalList || []).map(o => [o.environmentType, o]));
  const selectedSet = new Set(selectedNames || []);

  const toAddNames  = (selectedNames || []).filter(n => !originalByName.has(n));
  const toRemoveIds = (originalList || [])
    .filter(o => !selectedSet.has(o.environmentType))
    .map(o => o.id);

  return { toAddNames, toRemoveIds };
}
