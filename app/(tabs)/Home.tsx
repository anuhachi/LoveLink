import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import {
  Box,
  HStack,
  Text,
  Fab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Heading,
  Icon,
  ModalCloseButton,
} from '@gluestack-ui/themed';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import UserProfile from '../../components/Header/UserProfile';
import UsersNearYou from '../../components/UsersNearYou';
import { FIREBASE_AUTH } from '../../screens/Login/firebaseConfig'; // Adjust import path as needed
import Sidebar from '../../components/Sidebar';
import HeaderTabs from '../../components/Header/HeaderTabs';
import LoveLinkLogo from '../../components/Header/LoveLinkLogo';
import NewLikesSection from '../../components/NewLikesSection';
import MainContentHeader from '../../components/MainContentHeader';

export default function Tab({ activeTab, setActiveTab }: any) {
  const [showModal, setShowModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Home');
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
      <Fab
        bg="$indigo600"
        height="$9"
        position="absolute"
        bottom="$6"
        right="$4"
        sx={{
          '@md': { display: 'none' },
        }}
        onPress={() => setShowModal(true)} // Open modal when FAB is pressed
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FontAwesome
            name="filter"
            size={20}
            color="white"
            style={{ marginRight: 2 }}
          />
          <Text color="white" ml="$3">
            Filters
          </Text>
        </View>
      </Fab>

      <ScrollView style={{ flexGrow: 1 }}>
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
              <UsersNearYou />
            </Box>
          </Box>
        </Box>
      </ScrollView>

      <HStack w="100%" display="none" sx={{ '@md': { display: 'flex' } }}>
        <Box w="25%" sx={{ '@md': { width: '25%' } }}>
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
              <UsersNearYou />
            </Box>
          </Box>
        </ScrollView>
      </HStack>

      {/* Modal Component */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)} // Ensure onClose properly updates state
      >
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">Filters</Heading>
            <ModalCloseButton></ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <ScrollView style={{ flex: 1 }}>
              <Sidebar />
            </ScrollView>
          </ModalBody>
          <ModalFooter>
            <Button
              size="sm"
              action="positive"
              mr="$3"
              onPress={() => setShowModal(false)} // Ensure button closes the modal
            >
              <Text>Close</Text>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
}
