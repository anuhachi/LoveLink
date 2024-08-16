import React, { useEffect, useState } from 'react';
import { StyleSheet, Button, ScrollView, SafeAreaView } from 'react-native';
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
  Fab,
  FabIcon,
  FabLabel,
  Input,
  InputField,
  InputIcon,
  InputSlot,
} from '@gluestack-ui/themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import UserProfile from '../../components/Header/UserProfile';
import UsersNearYou from '../../components/UsersNearYou';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../screens/Login/firebaseConfig'; // Adjust the import path as necessary
import { get, ref } from 'firebase/database'; // Firebase Database imports
import Sidebar from '../../components/Sidebar';
import HeaderTabs from '../../components/Header/HeaderTabs';
import LoveLinkLogo from '../../components/Header/LoveLinkLogo';
import NewLikesSection from '../../components/NewLikesSection';
import MainContentHeader from '../../components/MainContentHeader';

export default function Tab({ activeTab, setActiveTab }: any) {
  const [selectedTab, setSelectedTab] = useState('Explore');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
      setUser(currentUser);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(FIREBASE_AUTH).catch((error) => {
      // Handle errors here, if any
      console.error('Error signing out:', error);
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box w="100%" sx={{ display: 'flex' }}>
        {/* header */}

        {/* big screen */}
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
            {/* logo and header here */}
            <LoveLinkLogo />
            <HeaderTabs
              setSelectedTab={setSelectedTab}
              selectedTab={selectedTab}
            />
            <HStack space="lg" alignItems="center" pr="$1.5">
              {/*<ToggleMode />*/}
              <UserProfile />
            </HStack>
          </HStack>
        </Box>
      </Box>

      <Fab
        bg="$indigo600"
        height="$9"
        position="absolute"
        bottom="$4"
        right="$4"
        sx={{
          '@md': { display: 'none' },
        }}
      >
        <FabLabel> Go to Map</FabLabel>
      </Fab>

      <ScrollView style={{ flex: 1 }}>
        <Box
          sx={{
            'display': 'flex',
            '@md': { display: 'none' },
          }}
        >
          <Box
            sx={{
              '@md': {
                maxHeight: '100vh',
                pr: '$16',
                pl: '$8',
              },
            }}
            flex={1}
          >
            <Box>
              <MainContentHeader />
              <NewLikesSection />
              {/* explore page homestay info fold 2 */}
              <UsersNearYou />
            </Box>
          </Box>
        </Box>
      </ScrollView>

      <HStack w="100%" display="none" sx={{ '@md': { display: 'flex' } }}>
        <Box
          w="25%" // Set the width of the Sidebar to 25% of the page
          sx={{ '@md': { width: '25%' } }} // Ensure it applies only on medium and larger screens
        >
          <Sidebar />
        </Box>
        <ScrollView style={{ flex: 1 }}>
          <Box
            sx={{
              '@md': { maxHeight: 'calc(100vh - 144px)', pr: '$16', pl: '$8' },
            }}
            flex={1}
          >
            <Box>
              <MainContentHeader />
              <NewLikesSection />
              {/* explore page homestay info fold 2 */}
              <UsersNearYou />
            </Box>
          </Box>
        </ScrollView>
      </HStack>
    </SafeAreaView>
  );
}
