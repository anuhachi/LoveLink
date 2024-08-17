import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  HStack,
  Image,
  Center,
  Icon,
  Pressable,
} from '@gluestack-ui/themed';
import { ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../screens/Login/firebaseConfig'; // Adjust the import path as necessary
import { ref, onValue, get } from 'firebase/database'; // Firebase Database imports
import { useRouter } from 'expo-router'; // or 'react-router-dom' if it's a web project

const NewLikesSection = () => {
  const scrollViewRef = useRef(null);
  const scrollAmount = 400;
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isContentAtRight, setIsContentAtRight] = useState(true);
  const [profileImages, setProfileImages] = useState([]);
  const router = useRouter(); // Initialize the router

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      const uid = user.uid;

      const userRef = ref(FIREBASE_DB, `/users/${uid}`);

      const unsubscribe = onValue(userRef, async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const whoLikedMe = data.matches.whoLikedMe || [];
          const images = await Promise.all(
            whoLikedMe.map(async (likedUserId) => {
              const likedUserRef = ref(FIREBASE_DB, `/users/${likedUserId}`);
              const likedUserSnapshot = await get(likedUserRef);
              if (likedUserSnapshot.exists()) {
                const likedUserData = likedUserSnapshot.val();
                return {
                  id: likedUserId,
                  profileImage: likedUserData.profileImage || null,
                };
              }
              return null;
            })
          );

          setProfileImages(images.filter((image) => image !== null));
        } else {
          console.log('No data available');
        }
      });

      // Cleanup the listener when the component unmounts
      return () => unsubscribe();
    } else {
      console.log('No user is signed in.');
    }
  }, []);

  const handleScrollLeft = () => {
    const newScrollPosition = scrollPosition - scrollAmount;
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: newScrollPosition,
        animated: true,
      });
      setScrollPosition(newScrollPosition);
    }
  };

  const handleScrollRight = () => {
    const newScrollPosition = scrollPosition + scrollAmount;
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: newScrollPosition,
        animated: true,
      });
    }
    setScrollPosition(newScrollPosition);
  };

  const checkContentAtLeft = () => {
    return scrollPosition > 0;
  };

  const isCloseToRight = (event) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    return contentOffset.x + layoutMeasurement.width >= contentSize.width;
  };

  // Function to navigate to user's profile
  const handleImagePress = (userId) => {
    router.push(`/UserProfileDash/${userId}`);
  };

  return (
    <Box w="100%">
      <ScrollView
        horizontal
        style={{ width: '100%' }}
        showsHorizontalScrollIndicator={false}
        ref={scrollViewRef}
        scrollEventThrottle={50}
        onScroll={(event) => {
          setIsContentAtRight(!isCloseToRight(event));
          setScrollPosition(event.nativeEvent.contentOffset.x);
        }}
      >
        <HStack space="md" width="100%" px="$4" sx={{ '@md': { px: '$0' } }}>
          {profileImages.map((imageData, index) => (
            <Box key={index} flex={1}>
              <Pressable onPress={() => handleImagePress(imageData.id)}>
                <Image
                  source={{ uri: imageData.profileImage }}
                  alt={`profile-${index}`}
                  h="$32"
                  w="$32"
                  borderRadius="$md"
                  resizeMode="cover"
                />
              </Pressable>
            </Box>
          ))}
        </HStack>
      </ScrollView>
      <ScrollLeft
        handleScrollLeft={handleScrollLeft}
        disabled={!checkContentAtLeft()}
      />
      <ScrollRight
        handleScrollRight={handleScrollRight}
        disabled={!isContentAtRight}
      />
    </Box>
  );
};

const ScrollLeft = ({ handleScrollLeft, disabled }) => {
  return (
    <Center
      position="absolute"
      left="$0"
      h="100%"
      display="none"
      sx={{
        '@md': {
          display: 'flex',
        },
      }}
    >
      <Pressable
        p="$1"
        ml="$3"
        borderRadius="$full"
        borderColor="$borderLight300"
        borderWidth="$1"
        bg="$backgroundLight50"
        sx={{
          '@md': {
            ml: -16,
          },
          ':hover': {
            bg: '$backgroundLight100',
          },
          '_dark': {
            'bg': '$backgroundDark900',
            'borderColor': '$borderDark600',
            ':hover': {
              bg: '$backgroundDark800',
            },
          },
          'opacity': disabled ? 0 : 1,
        }}
        disabled={disabled}
        onPress={handleScrollLeft}
      >
        <Icon
          as={ChevronLeft}
          size="lg"
          color="$backgroundLight700"
          sx={{
            _dark: {
              color: '$backgroundDark300',
            },
          }}
        />
      </Pressable>
    </Center>
  );
};

const ScrollRight = ({ handleScrollRight, disabled }) => {
  return (
    <Center
      position="absolute"
      right="$0"
      h="100%"
      display="none"
      sx={{
        '@md': {
          display: 'flex',
        },
      }}
    >
      <Pressable
        p="$1"
        mr="$3"
        borderRadius="$full"
        borderColor="$borderLight300"
        borderWidth="$1"
        bg="$backgroundLight50"
        sx={{
          '@md': {
            mr: '-$4',
          },
          ':hover': {
            bg: '$backgroundLight100',
          },
          '_dark': {
            'bg': '$backgroundDark900',
            'borderColor': '$borderDark600',
            ':hover': {
              bg: '$backgroundDark800',
            },
          },
          'opacity': disabled ? 0 : 1,
        }}
        onPress={handleScrollRight}
        disabled={disabled}
      >
        <Icon
          as={ChevronRight}
          size="lg"
          color="$backgroundLight700"
          sx={{
            _dark: {
              color: '$backgroundDark300',
            },
          }}
        />
      </Pressable>
    </Center>
  );
};

export default NewLikesSection;
