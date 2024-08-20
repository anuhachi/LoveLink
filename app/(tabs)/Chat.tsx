import { StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
  HStack,
  VStack,
  Box,
  Text,
  View,
  Heading,
  Input,
  Button,
  Select,
  FormControl,
} from '@gluestack-ui/themed';
import HeaderTabs from '../../components/Header/HeaderTabs';
import LoveLinkLogo from '../../components/Header/LoveLinkLogo';
import UserProfile from '../../components/Header/UserProfile';

import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useWindowDimensions, Image } from 'react-native';
import { get, ref, onValue } from 'firebase/database'; // Firebase Database imports
import { FIREBASE_DB, FIREBASE_AUTH } from '../../screens/Login/firebaseConfig'; // Adjust the import path as necessary

export default function Tab() {
  const { width } = useWindowDimensions();
  const [selectedTab, setSelectedTab] = useState('Messages');

  const [user_auth_data, setUserAuthData] = useState(null);
  const [user_db_data, setUserDbData] = useState(null);

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser; // Get the current authenticated user
    if (user) {
      const uid = user.uid; // Retrieve the user's UID
      setUserAuthData(user); // Set the user data to the state
      console.log('User UID:', uid); // Log the UID to the console

      // Reference to the specific user's data in the Firebase Realtime Database
      const userRef = ref(FIREBASE_DB, `/users/${uid}`);

      // Set up a real-time listener for the user's data
      const unsubscribe = onValue(
        userRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setUserDbData(data);
            console.log('User Data:', data); // Log the user data to the console
          } else {
            console.log('No data available');
          }
        },
        (error) => {
          console.error('Error fetching user data:', error);
        }
      );

      // Cleanup listener on component unmount
      return () => unsubscribe();
    } else {
      console.log('No user is signed in.');
    }
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box w="100%" sx={{ display: 'flex' }}>
        {/* Header */}
        <Box
          px="$16"
          w="100%"
          borderBottomWidth={1}
          display="none"
          sx={{
            '@md': {
              display: 'flex',
            },
            '_light': { borderColor: '$borderLight300' },
            '_dark': { borderColor: '$borderDark900' },
          }}
        >
          <HStack
            alignItems="center"
            justifyContent="space-between"
            mx="auto"
            w="100%"
          >
            <LoveLinkLogo />
            <HeaderTabs
              setSelectedTab={setSelectedTab}
              selectedTab={selectedTab}
            />
            <HStack space="lg" alignItems="center" pr="$1.5">
              <UserProfile />
            </HStack>
          </HStack>
        </Box>
      </Box>

      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, flexDirection: 'row' }}
      >
        {/* Sidebar: Only visible on screens wider than 768px */}
        {width > 768 && (
          <Box flex={1}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1620403724159-40363e84a155?q=80&w=2646&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              alt="LoveLinnk"
            />
          </Box>
        )}

        {/* Main content */}
        <VStack flex={2} p="$4">
          {/* Profile Section */}
          <Box
            bg="$primary100"
            p="$5"
            flexDirection="row"
            mb="$4"
            borderRadius="$md"
          >
            <Avatar mr="$4">
              <AvatarFallbackText fontFamily="$heading">JD</AvatarFallbackText>
              <AvatarImage
                source={{
                  uri: 'https://images.unsplash.com/photo-1620403724159-40363e84a155?q=80&w=2646&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                }}
              />
              <AvatarBadge bg="green.500" />
            </Avatar>
            <VStack>
              <Heading size="md" fontFamily="$heading" mb="$1">
                Jane Doe
              </Heading>
              <Text size="sm" fontFamily="$heading">
                janedoe@sample.com
              </Text>
            </VStack>
          </Box>
        </VStack>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
