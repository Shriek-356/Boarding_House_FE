import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SplashScreen from '../screens/SplashScreen';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../configs/toastConfig';
import MainTabNavigator from './MainTabNavigator';
import SearchResultScreen from '../screens/SearchResultScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTab" component={MainTabNavigator} />
        <Stack.Screen name="SearchResult" component={SearchResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    <Toast config={toastConfig} />
    </>
  );
}
