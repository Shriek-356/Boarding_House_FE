import { axiosDAuthApiInstance, getToken } from './axiosClient';

// Chuẩn hóa 1 item thông báo
function normalize(n, idx) {
  const deliveryId = n.deliveryId ?? n.id ?? `tmp-${Date.now()}-${idx}`;
  return {
    deliveryId,
    title: n.title ?? '',
    body: n.body ?? '',
    createdAt: n.createdAt ?? n.time ?? n.timestamp ?? null,
    seenAt: n.seenAt ?? n.readAt ?? null,
    type: n.type ?? null,
    dataJson: n.dataJson ?? n.data ?? null,
  };
}

// GET /api/notifications?page=&size=  ->  { content, last }
export const listNotifications = async (page = 0, size = 20) => {
  const token = await getToken();
  const api = axiosDAuthApiInstance(token);

  // KHÔNG ghép query string thủ công; dùng params cho sạch
  const res = await api.get('/notifications', { params: { page, size } });

  // Backend của bạn trả Page<NotificationDTO> => res.data có { content, last, ... }
  const pageObj = res.data?.data ?? res.data ?? {};
  const raw = Array.isArray(pageObj.content) ? pageObj.content : [];
  const content = raw.map(normalize);

  // Nếu thiếu 'last', tự suy bằng kích thước mảng
  const last = typeof pageObj.last === 'boolean' ? pageObj.last : content.length < size;

  return { content, last };
};

// PATCH /api/notifications/{deliveryId}/seen
export const markSeen = async (deliveryId) => {
  const token = await getToken();
  const api = axiosDAuthApiInstance(token);
  await api.patch(`/notifications/${deliveryId}/seen`);
};
