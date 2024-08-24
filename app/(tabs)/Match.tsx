import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Heading,
  Button,
  Icon,
  Toast,
  ToastTitle,
  useToast,
  Image,
  ModalCloseButton,
} from '@gluestack-ui/themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import UserProfile from '../../components/Header/UserProfile';
import MatchSwipe from '../../components/MatchSwipe';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../screens/Login/firebaseConfig'; // Adjust the import path as necessary
import Sidebar from '../../components/Sidebar';
import HeaderTabs from '../../components/Header/HeaderTabs';
import LoveLinkLogo from '../../components/Header/LoveLinkLogo';
import NewLikesSection from '../../components/NewLikesSection';
import MainContentHeader from '../../components/MainContentHeader';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

import { get, ref, update, remove } from 'firebase/database'; // Firebase Database imports

export default function Tab({ activeTab, setActiveTab }: any) {
  const [selectedTab, setSelectedTab] = useState('Match');
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [filters, setFilters] = useState({
    minAge: 18,
    maxAge: 60,
    genderValues: ['male', 'female', 'other'],
    ageRange: '18-25',
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const router = useRouter(); // Use expo-router's useRouter hook

  const [user_auth_data, setUserAuthData] = useState(null);
  const [userData, setUserData] = useState({
    address: {
      city: '', // Add default or user-provided values
      street: '',
      zip: '',
    },
    age: '', // Default or user-provided value
    bio: '',
    description: '',
    gender: '',
    genderPreference: '',
    hobby: '',
    interests: [],
    location: '',
    matches: {
      whoILiked: [],
      whoLikedMe: [],
    },
    messages: [],
    name: '', // Add default or user-provided values
    profilecomplete: false, // Default value
    DOB: false, // Default value
    profileImage: '', // Default or user-provided URL
    profileImages: [], // Default or user-provided URLs
  });
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const fileInputRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      const uid = user.uid;
      setUserAuthData(user);

      const userRef = ref(FIREBASE_DB, `/users/${uid}`);

      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            console.log('Fetched user data:', data);
            setUserData((prevState) => ({
              ...prevState,
              ...data,
              interests: data.interests || [], // Ensure interests is always an array
              profileImages: data.profileImages || [], // Ensure profileImages is always an array
            }));
          } else {
            console.log('No data available');
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        });
    } else {
      console.log('No user is signed in.');
    }
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box w="100%" sx={{ display: 'flex' }}>
    
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
        contentContainerStyle={{ flex: 1, flexDirection: 'row' }}
      >
      
          <Box flex={1} display="none" sx={{ '@lg': { display: 'flex' }, '@sm': { display: 'none' } }} >
            <Sidebar onFilterChange={handleFilterChange} />
          </Box>
 

        <ScrollView>
          <VStack flex={2} p="$4">
            <VStack mb="$4">
              <MatchSwipe />
              
            </VStack>
          </VStack>
        </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
