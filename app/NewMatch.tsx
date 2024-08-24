import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
  HStack,
  VStack,
  Box,
  Text,
  Heading,
  Input,
  Button,
  Select,
  ButtonText,
  SelectPortal,
  FormControl,
  SelectItem,
  SelectBackdrop,
  SelectTrigger,
  SelectInput,
  SelectContent,
  SelectIcon,
  Icon,
  InputField,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  Toast,
  ToastTitle,
  useToast,
} from '@gluestack-ui/themed';
import Sidebar from '../components/Sidebar';
import MatchSwipe from '../components/MatchSwipe';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { get, ref, update, remove } from 'firebase/database'; // Firebase Database imports
import {
  FIREBASE_DB,
  FIREBASE_AUTH,
  FIREBASE_STORAGE,
} from '../screens/Login/firebaseConfig'; // Adjust the import path as necessary
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'; // Firebase Storage imports
import UserProfile from '../components/Header/UserProfile';
import LoveLinkLogo from '../components/Header/LoveLinkLogo';
import HeaderTabs from '../components/Header/HeaderTabs';
import Swiper from 'react-native-swiper';
import * as ImagePicker from 'expo-image-picker';

export default function Tab({ filters }: any) {
  const router = useRouter(); // Use expo-router's useRouter hook

  const [user_auth_data, setUserAuthData] = useState(null);
  const [selectedTab, setSelectedTab] = useState('Settings');
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
      
          <Box flex={1} flex={1} display="none" sx={{ '@lg': { display: 'flex' }, '@sm': { display: 'none' } }} >
            <Sidebar onFilterChange={handleFilterChange} />
          </Box>
    

        <ScrollView>
          <VStack flex={2} p="$4">
            <VStack mb="$4">
              <MatchSwipe filters={filters} />
            </VStack>
          </VStack>
        </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
