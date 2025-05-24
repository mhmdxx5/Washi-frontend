// navigation/RootNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import BookingScreen from '../screens/BookingScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import AdminBookingScreen from '../screens/AdminBookingScreen';
import AdminProductScreen from '../screens/AdminProductScreen';
import SplashScreen from '../screens/SplashScreen';
import SupportScreen from '../screens/SupportScreen';
import AdminSupportScreen from '../screens/AdminSupportScreen';
import PreparationScreen from '../screens/CarPreparationScreen';
import AdminUploadScreen from '../screens/AdminUploadScreen'
import ChatScreen from '../screens/ChatScreen'

const Stack = createStackNavigator();

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Preparation" component={PreparationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminBooking" component={AdminBookingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Support" component={SupportScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminUpload" component={AdminUploadScreen} options={{ title: 'העלאת תמונה' ,headerShown: false}} />
      <Stack.Screen name="AdminSupport" component={AdminSupportScreen} options={{ headerShown: false ,headerShown: false }} />
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminProduct" component={AdminProductScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen}   options={{ headerShown: false }}/>
        <Stack.Screen name="MyBookings" component={MyBookingsScreen}   options={{ headerShown: false }}/>
        <Stack.Screen name="Register" component={RegisterScreen}  options={{ headerShown: false }}/>
        <Stack.Screen name="Home" component={HomeScreen}  options={{ headerShown: false }}/>
        <Stack.Screen name="Booking" component={BookingScreen} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
