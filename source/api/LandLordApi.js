import { axiosDAuthApiInstance } from './axiosClient';

const fileFromUri = (uri, fallback = 'image.jpg') => {
  const name = uri?.split('/').pop() || fallback;
  const ext = (name.split('.').pop() || 'jpg').toLowerCase();
  const type = ext === 'png' ? 'image/png'
            : (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg'
            : 'application/octet-stream';
  return { uri, name, type };
};

export const addLandlordRequest = async ({ userId, identityNumber, images = [] }, token) => {
  const formData = new FormData();
  formData.append('userId', String(userId));           // ⬅️ string
  formData.append('identityNumber', String(identityNumber));

  images.forEach((uri, idx) => {
    if (uri) formData.append('file', fileFromUri(uri, `img_${idx + 1}.jpg`)); // key 'file'
  });

  const api = axiosDAuthApiInstance(token);
  // chắn chắc không có Content-Type mặc định json còn sót
  if (api.defaults.headers?.post) delete api.defaults.headers.post['Content-Type'];

  const res = await api.post('/add-landlord-request', formData, {
    timeout: 60000,               // ⬅️ thêm timeout tại call
    transformRequest: v => v,     // ⬅️ giữ nguyên FormData
  });
  return res.data;
};
