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
} from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Image, ScrollView } from 'react-native';
import { get, ref } from 'firebase/database'; // Firebase Database imports
import { FIREBASE_DB } from '../../screens/Login/firebaseConfig'; // Adjust the import path as necessary
import { useLocalSearchParams } from 'expo-router'; // Import from expo-router
import UserProfile from '../../components/Header/UserProfile';
import LoveLinkLogo from '../../components/Header/LoveLinkLogo';
import HeaderTabs from '../../components/Header/HeaderTabs';
import Swiper from 'react-native-swiper';

export default function UserProfileDash() {
  const [selectedTab, setSelectedTab] = useState('null');
  const params = useLocalSearchParams();
  const userId = params.id;
  console.log(userId);

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    address: '',
    gender: '',
    dob: '',
    lookingFor: '',
    maxDistance: '',
    bio: '',
    description: '',
    profileImage: '',
    profileImages: [],
    interests: [],
  });

  useEffect(() => {
    if (userId) {
      const userRef = ref(FIREBASE_DB, `/users/${userId}`);

      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            console.log(data);
            setUserData({
              name: data.name || '',
              email: data.email || '',
              address: data.address || '',
              gender: data.gender || '',
              dob: data.dob || '',
              lookingFor: data.lookingFor || '',
              maxDistance: data.maxDistance || '',
              bio: data.bio || '',
              description: data.description || '',
              profileImage: data.profileImage || '',
              profileImages: data.profileImages || [],
              interests: data.interests || [],
            });
          } else {
            console.log('No data available');
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        });
    } else {
      console.log('No user ID provided.');
    }
  }, [userId]);

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
        contentContainerStyle={{ flexGrow: 1, flexDirection: 'row' }}
      >
        <Box
          flex={1}
          display="none"
          sx={{ '@md': { display: 'flex' }, '@sm': { display: 'none' } }}
        >
          <Swiper
            showsPagination
            autoplay
            loop
            style={{ width: '100%', height: '100%' }}
          >
            {userData.profileImages.map((imageUri, index) => (
              <Image
                key={index}
                source={{ uri: imageUri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                alt="LoveLinnk"
              />
            ))}
          </Swiper>
        </Box>


        <ScrollView>
          <VStack flex={2} p="$4">
            <Box
              bg="$primary100"
              p="$5"
              flexDirection="row"
              mb="$4"
              borderRadius="$md"
            >
              <Avatar mr="$4">
                <AvatarFallbackText fontFamily="$heading">
                  JD
                </AvatarFallbackText>
                <AvatarImage
                  source={{
                    uri:
                      userData.profileImage ||
                      'https://via.placeholder.com/150',
                  }}
                />
                <AvatarBadge bg="green.500" />
              </Avatar>
              <VStack>
                <Heading size="md" fontFamily="$heading" mb="$1">
                  {userData.name || 'Jane Doe'}
                </Heading>
                <Text size="sm" fontFamily="$heading">
                  {userData.email || 'Missing email'}
                </Text>
              </VStack>
            </Box>

            <VStack mb="$4">
              <Heading size="sm" mb="$3">
                Personal Information
              </Heading>
              <FormControl mb="$4">
                <Input>
                  <InputField placeholder="Email" value={userData.email} />
                </Input>
              </FormControl>
              <FormControl mb="$4">
                <Input>
                  <InputField placeholder="Password" secureTextEntry />
                </Input>
              </FormControl>
              <FormControl mb="$4">
                <Input>
                  <InputField placeholder="Bio" value={userData.bio} />
                </Input>
              </FormControl>
              <FormControl mb="$4">
                <Input>
                  <InputField
                    placeholder="Description"
                    value={userData.description}
                  />
                </Input>
              </FormControl>
            </VStack>

            <VStack mb="$4">
              <Heading size="sm" mb="$3">
                Preferences
              </Heading>
              <FormControl>
                <Input>
                  <InputField placeholder={userData.name} />
                </Input>
              </FormControl>
              <FormControl mb="$3">
                <Select>
                  <SelectTrigger>
                    <SelectInput placeholder="Country" />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent mb="$3">
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <SelectItem label="India" value="India" />
                      <SelectItem label="Sri Lanka" value="Sri Lanka" />
                      <SelectItem label="Uganda" value="Uganda" />
                      <SelectItem label="Japan" value="Japan" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </FormControl>
              <FormControl mb="$4">
                <Heading size="sm" mb="$2">
                  Interests
                </Heading>
                {userData.interests.map((interest, index) => (
                  <Text key={index} mb="$1">
                    {interest}
                  </Text>
                ))}
              </FormControl>
            </VStack>
          </VStack>
        </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
