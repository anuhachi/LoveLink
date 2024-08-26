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
  Image,
} from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { get, ref } from 'firebase/database'; // Firebase Database imports
import { FIREBASE_DB, FIREBASE_AUTH } from '../../screens/Login/firebaseConfig'; // Adjust the import path as necessary
import { useLocalSearchParams } from 'expo-router'; // Import from expo-router
import UserProfile from '../../components/Header/UserProfile';
import LoveLinkLogo from '../../components/Header/LoveLinkLogo';
import HeaderTabs from '../../components/Header/HeaderTabs';
import Swiper from 'react-native-swiper';

export default function UserProfileDash() {
  const [selectedTab, setSelectedTab] = useState('null');
  const params = useLocalSearchParams();
  const userId = params.id;

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

  const [loggedUserInterests, setLoggedUserInterests] = useState([]);
  const [isPerfectMatch, setIsPerfectMatch] = useState(false);
  const [interestMatchCount, setInterestMatchCount] = useState(0);


  // Fetch logged-in user data
  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      const uid = user.uid;

      const loggedUserRef = ref(FIREBASE_DB, `/users/${uid}`);

      get(loggedUserRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setLoggedUserInterests(data.interests || []);
          } else {
            console.log('No data available for logged-in user');
          }
        })
        .catch((error) => {
          console.error('Error fetching logged-in user data:', error);
        });
    } else {
      console.log('No user is signed in.');
    }
  }, []);

  // Fetch viewed user data
  useEffect(() => {
    if (userId) {
      const userRef = ref(FIREBASE_DB, `/users/${userId}`);
  
      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const interests = data.interests || [];
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
              interests: interests,
            });
  
            // Count the number of matching interests
            const matchingInterests = interests.filter(interest =>
              loggedUserInterests.includes(interest)
            );
  
            setInterestMatchCount(matchingInterests.length);
  
            // Check if all interests match
            const allInterestsMatch = interests.length === loggedUserInterests.length &&
              interests.every(interest => loggedUserInterests.includes(interest));
            setIsPerfectMatch(allInterestsMatch);
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
  }, [userId, loggedUserInterests]);
  

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
        {userData.profileImages.length > 0 && (
          <Box flex={1}  flex={1}
          display="none"
          sx={{ '@md': { display: 'flex' }, '@sm': { display: 'none' } }}>
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
                />
              ))}
            </Swiper>
          </Box>
        )}

        <VStack flex={2} p="$4">
          <Box
            bg="$primary200" // Updated color for reference box
            p="$5"
            flexDirection="row"
            mb="$4"
            borderRadius="$md"
            borderColor="$primary300"
            borderWidth={1}
          >
            <Avatar mr="$4">
              <AvatarFallbackText fontFamily="$heading">JD</AvatarFallbackText>
              <AvatarImage
                source={{
                  uri:
                    userData.profileImage || 'https://via.placeholder.com/150',
                }}
              />
              <AvatarBadge bg="$green.500" />
            </Avatar>
            <VStack>
              <Heading size="md" fontFamily="$heading" mb="$1">
                {userData.name || 'Jane Doe'}
              </Heading>
              {isPerfectMatch ? (
                <Text
                  size="md"
                  fontFamily="$heading"
                  color="green" // Color for "Perfect Match" text
                  fontWeight="bold"
                  textAlign="center"
                  mb="$2"
                >
                  Perfect Match
                </Text>
              ) : (
                <Text
                  size="md"
                  fontFamily="$heading"
                  color={interestMatchCount > 0 ? 'green' : 'red'} // Color based on matches
                  fontWeight={interestMatchCount === 0 ? 'bold' : 'normal'}
                  textAlign="center"
                  mb="$2"
                >
                  {interestMatchCount === 0 && 'No common interests.'}
                  {interestMatchCount === 1 && '1 interest in common.'}
                  {interestMatchCount === 2 && '2 interests in common.'}
                </Text>
              )}
              {userData.email && (
                <Text size="sm" fontFamily="$heading">
                  {userData.email}
                </Text>
              )}
            </VStack>
          </Box>

          {userData.bio && (
            <Box
              bg="$primary100" // Lighter color
              p="$4"
              borderRadius="$md"
              borderColor="$primary300"
              borderWidth={1}
              mb="$4"
            >
              <Heading size="sm" mb="$2">
                Bio
              </Heading>
              <Text>{userData.bio}</Text>
            </Box>
          )}

          {userData.description && (
            <Box
              bg="$primary100" // Lighter color
              p="$4"
              borderRadius="$md"
              borderColor="$primary300"
              borderWidth={1}
              mb="$4"
            >
              <Heading size="sm" mb="$2">
                Description
              </Heading>
              <Text>{userData.description}</Text>
            </Box>
          )}

          {userData.interests.length > 0 && (
            <Box
              bg="$primary100" // Lighter color
              p="$4"
              borderRadius="$md"
              borderColor="$primary300"
              borderWidth={1}
              mb="$4"
            >
              <Heading size="sm" mb="$2">
                Interests
              </Heading>
              {userData.interests.map((interest, index) => {
                const isCommonInterest = loggedUserInterests.includes(interest);
                return (
                  <Text
                    key={index}
                    mb="$1"
                    color="black"
                  >
                    {interest}{' '}
                    {isCommonInterest && (
                      <Text
                      size="sm" 
                      fontWeight="bold"  
                      color="green">  In common with you!</Text> // Color for match message
                    )}
                  </Text>
                );
              })}
            </Box>
          )}
        </VStack>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
