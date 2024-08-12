import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../screens/Login/firebaseConfig'; // Adjust the import path as necessary

export default function TabLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const router = useRouter();

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

  if (isAuthenticated === null) {
    return null; // Optionally show a loading spinner while checking authentication state
  }

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="Home"
        options={{
          title: 'Test',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="cog" color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="comments" color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Match"
        options={{
          title: 'Match',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="fire" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
