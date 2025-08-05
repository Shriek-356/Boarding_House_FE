import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SplashScreen from '../screens/SplashScreen';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../configs/toastConfig';
import MainTabNavigator from './MainTabNavigator';
import SearchResultScreen from '../screens/SearchResultScreen';
import BoardingDetailScreen from '../screens/BoardingZoneDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
const Stack = createNativeStackNavigator();
import { AuthProvider } from '../contexts/AuthContext';
import ChatScreen from '../screens/ChatScreen';
import { ChatProvider } from '../contexts/ChatContext';

export default function AppNavigator() {
  return (
    <>
      <AuthProvider>
        <ChatProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MainTab" component={MainTabNavigator} />
            <Stack.Screen name="SearchResult" component={SearchResultScreen} />
            <Stack.Screen name="BoardingZoneDetail" component={BoardingDetailScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        </ChatProvider>
      </AuthProvider>
      <Toast config={toastConfig} />
    </>
  );
}
