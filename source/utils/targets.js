// utils/targets.js
/**
 * originalList: [{ id, targetGroup }, ...] từ BE
 * selectedNames: ['Đi học', 'Đi làm', ...] người dùng đang chọn
 *
 * Trả:
 *  - toAddNames: tên đối tượng cần tạo mới (POST)
 *  - toRemoveIds: id đối tượng cần xoá (DELETE)
 */
export function diffTargets(originalList = [], selectedNames = []) {
  const originalByName = new Map((originalList || []).map(o => [o.targetGroup, o]));
  const selectedSet = new Set(selectedNames || []);

  const toAddNames  = (selectedNames || []).filter(n => !originalByName.has(n));
  const toRemoveIds = (originalList || [])
    .filter(o => !selectedSet.has(o.targetGroup))
    .map(o => o.id);

  return { toAddNames, toRemoveIds };
}
