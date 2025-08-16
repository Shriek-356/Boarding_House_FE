// source/navigation/MainTabNavigator.js
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import AccountScreen from '../screens/AccountScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ChatRoomListScreen from '../screens/ChatRoomListScreen';
import { ChatContext } from '../contexts/ChatContext';
import { useContext } from 'react';
import DiscussionListScreen from '../screens/DiscussionListScreen';
import NotificationsScreen from '../screens/NotificationScreen';
import { useState } from 'react';
import { useEffect } from 'react';
const Tab = createBottomTabNavigator();
import { listNotifications } from '../api/notificationApi';

export default function MainTabNavigator() {
  // Lấy số thông báo chưa đọc từ backend
  const { totalUnread } = useContext(ChatContext);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await listNotifications(0, 20);
        // Lọc thông báo chưa đọc (seenAt == null)
        if(!res){setUnreadNotifications(0); return}
        const unreadCount = res.data.content.filter(n => !n.seenAt).length;
        setUnreadNotifications(unreadCount);
      } catch (err) {
        console.error("Lỗi lấy thông báo:", err);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0099FF',
        tabBarStyle: { paddingBottom: 5, height: 60 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="DiscussionList"
        component={DiscussionListScreen}
        options={{
          title: 'Bài đăng',
          tabBarIcon: ({ color, size }) => (
            <Icon name="chat-question-outline" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="ChatRoomList"
        component={ChatRoomListScreen}
        options={{
          title: 'TTin nhắn',
          tabBarIcon: ({ color, size }) => (
            <Icon name="message-outline" color={color} size={size} />
          ),
          tabBarBadge: totalUnread > 0 ? totalUnread : undefined,
        }}
      />

      {/* Tab thông báo */}
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Thông báo',
          tabBarIcon: ({ color, size }) => (
            <Icon name="bell-outline" color={color} size={size} />
          ),
          tabBarBadge: unreadNotifications > 0 ? unreadNotifications : undefined,
        }}
      />
      
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
