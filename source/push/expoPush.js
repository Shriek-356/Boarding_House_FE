import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { registerDeviceToken,unregisterDeviceToken } from '../api/deviceApi';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false
  }),
});

async function ensureAndroidChannel() {
  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
  });
}

export async function registerForPush(navigateByData) {
  if (!Device.isDevice) return null;

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') ({ status } = await Notifications.requestPermissionsAsync());
  if (status !== 'granted') return null;

  await ensureAndroidChannel();

  const projectId = Constants?.expoConfig?.extra?.eas?.projectId
                 || Constants?.easConfig?.projectId;
  const { data: fcmToken } = await Notifications.getDevicePushTokenAsync({ projectId });

  try { await registerDeviceToken({ token: fcmToken, platform: 'ANDROID' }); } catch {}

  const subRecv = Notifications.addNotificationReceivedListener(n => {
    // muốn thì hiện toast/badge ở đây
  });

  const subClick = Notifications.addNotificationResponseReceivedListener(resp => {
    const data = resp.notification.request.content.data || {};
    navigateByData?.(data);
  });

  const initial = await Notifications.getLastNotificationResponseAsync();
  if (initial?.notification) {
    navigateByData?.(initial.notification.request.content.data || {});
  }

  return {
    fcmToken,
    detach() { subRecv.remove(); subClick.remove(); }
  };
}

export async function unregisterPush(token) {
  try { if (token) await unregisterDeviceToken({ token }); } catch {}
}
