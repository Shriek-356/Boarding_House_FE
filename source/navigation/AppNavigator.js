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
import DiscussionPostScreen from '../screens/DiscussionPostScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LandlordRequestScreen from '../screens/LandLordRequestScreen';
import BoardingZoneManagerScreen from '../screens/BoardingZoneManagerScreen';
import CreateBoardingZoneScreen from '../screens/CreateBoardingZoneScreen';
export default function AppNavigator() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
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
            <Stack.Screen name="DiscussionPost" component={DiscussionPostScreen} />
            <Stack.Screen name="LandlordRequest" component={LandlordRequestScreen} />
            <Stack.Screen name="BoardingZoneManager" component={BoardingZoneManagerScreen} />
            <Stack.Screen name="CreateBoardingZone" component={CreateBoardingZoneScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        </ChatProvider>
      </AuthProvider>
      <Toast config={toastConfig} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
