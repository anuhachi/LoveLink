import React, { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { Tabs } from 'expo-router';
import { useRouter } from 'expo-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../screens/Login/firebaseConfig'; // Adjust the import path as necessary
import { Search, MessageCircle, Heart, Settings } from 'lucide-react-native'; // Update with actual icon names from Lucide

export default function TabLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const router = useRouter();
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push('/login'); // Redirect to login if not authenticated
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const updateScreenSize = () => {
      const screenWidth = Dimensions.get('window').width;
      setIsLargeScreen(screenWidth >= 768); // Adjust this value as needed
    };

    updateScreenSize(); // Initial check
    Dimensions.addEventListener('change', updateScreenSize); // Listen to screen size changes

    return () => Dimensions.removeEventListener('change', updateScreenSize);
  }, []);

  if (isAuthenticated === null) {
    return null; // Optionally show a loading spinner while checking authentication state
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'blue',
        tabBarShowLabel: false,
        tabBarStyle: isLargeScreen ? { display: 'none' } : {}, // Hide tab bar on large screens
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color }) => (
            <Search size={24} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Chat"
        options={{
          tabBarIcon: ({ color }) => (
            <MessageCircle size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Match"
        options={{
          tabBarIcon: ({ color }) => (
            <Heart size={24} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Settings"
        options={{
          tabBarIcon: ({ color }) => (
            <Settings size={24} color={color} />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
