import axios from './axiosClient';

//Đăng ký token cho thiết bị đang đăng nhập để lấy thông báo
export const registerDeviceToken = ({ token, platform = 'ANDROID' }) =>
  axios.post('/api/devices/register', { token, platform });

//Hủy đăng ký token cho thiết bị
export const unregisterDeviceToken = ({ token }) =>
  axios.post('/api/devices/unregister', { token });