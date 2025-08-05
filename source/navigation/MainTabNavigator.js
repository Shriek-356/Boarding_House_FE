// source/navigation/MainTabNavigator.js
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import AccountScreen from '../screens/AccountScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ChatRoomListScreen from '../screens/ChatRoomListScreen';
const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
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
        name="Account"
        component={AccountScreen}
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-circle-outline" color={color} size={size} />
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
        }}
      />
    </Tab.Navigator>
  );
}
