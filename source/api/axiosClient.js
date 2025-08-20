
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
export const BASE_URL = `http://192.168.1.91:8080/boarding_house/api`;
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});


//Can token 
export const axiosDAuthApiInstance = (token) => {
  return axios.create({
    baseURL: BASE_URL,
    timeout: 200000,
    headers: {
      "Authorization": "Bearer " + token
    }
  })
}

export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem('@access_token', token);
    console.log('Token đã được lưu');
  } catch (error) {
    console.error('Lỗi khi lưu token: ', error);
  }
};

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('@access_token');
    return token;
  } catch (error) {
    console.error('Lỗi khi lấy token: ', error);
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('@access_token');
    console.log('Token đã bị xóa');
  } catch (error) {
    console.error('Lỗi khi xóa token: ', error);
  }
};
