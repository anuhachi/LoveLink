import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  HStack,
  Icon,
  Image,
  Pressable,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { ChevronRight, Heart } from 'lucide-react-native';
import { AnimatePresence, Motion } from '@legendapp/motion';
import { ScrollView } from 'react-native';
import { ref, onValue, set, get } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '../screens/Login/firebaseConfig';
import { useRouter } from 'expo-router';

import useFilterStore from './FilterStore';
import { UserItem } from '../types';

const tabsData = [
  { title: 'Explore users' },
  { title: 'Liked You' },
  { title: 'Favorites' },
  { title: 'Nearby' },
];

const HomestayInformationFold = ({ filters }) => {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [currentuseruid, setCurrentUserUid] = useState<any>(null);
  const [likes, setLikes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(tabsData[0]); // Add state for activeTab
  const [currentUser, setCurrentUser] = useState<any>({
    address: { city: '', street: '', zip: '' },
    age: '',
    bio: '',
    description: '',
    gender: '',
    genderPreference: '',
    hobby: '',
    interests: [],
    location: '',
    matches: { whoILiked: [], whoLikedMe: [] },
    messages: [],
    name: '',
    profilecomplete: false,
    DOB: false,
    profileImage: '',
    profileImages: [],
  });

  // Use Zustand store for filters
  const { minAge, maxAge, gender } = useFilterStore((state) => ({
    minAge: state.minAge,
    maxAge: state.maxAge,
    gender: state.gender,
  }));

  useEffect(() => {
    const fetchData = async () => {
      const usersRef = ref(FIREBASE_DB, 'users');

      const unsubscribe = onValue(usersRef, async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const usersArray = Object.values(data);
          setUsersList(usersArray);

          const uid = FIREBASE_AUTH.currentUser?.uid;
          setCurrentUserUid(uid);

          if (uid) {
            try {
              const currentUserRef = ref(FIREBASE_DB, `users/${uid}`);
              const userSnapshot = await get(currentUserRef);

              if (userSnapshot.exists()) {
                const userData = userSnapshot.val();
                setCurrentUser(userData);

                // Fetch likes for the current user after setting currentUser
                const userLikesRef = ref(
                  FIREBASE_DB,
                  `users/${uid}/matches/whoILiked`
                );
                const likesSnapshot = await get(userLikesRef);

                if (likesSnapshot.exists()) {
                  const likesData = likesSnapshot.val();
                  console.log('likesdata in the useeffect', likesData);
                  setLikes(likesData); // Now you can safely set likes
                }
              } else {
                console.log('No current user data found.');
              }
            } catch (error) {
              console.error('Error fetching data:', error);
            }
          }
        }
      });

      return () => unsubscribe();
    };

    fetchData();
  }, []);

  if (!currentUser) {
    console.log('No current user found');
    return null;
  }

  return (
    <Box pb="$8" px="$4" sx={{ '@md': { px: 0 } }}>
      <HomestayInfoTabs
        tabsData={tabsData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <TabPanelData
        usersList={usersList}
        currentUser={currentUser}
        filters={{ minAge, maxAge, gender }}
        currentUserUid={currentuseruid}
        likes={likes} // Pass likes here
        setLikes={setLikes} // Pass setLikes function here
        activeTab={activeTab} // Pass activeTab to TabPanelData
      />
    </Box>
  );
};

const HomestayInfoTabs = ({ tabsData, activeTab, setActiveTab }) => {
  return (
    <Box
      borderBottomWidth={1}
      borderColor="$borderLight50"
      sx={{
        '@md': { borderColor: 'transparent', borderBottomWidth: 0 },
        '_dark': { borderColor: '$borderDark900' },
      }}
    >
      <Box py="$5">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <HStack space="lg" mx="$0.5">
            {tabsData.map((tab) => (
              <Pressable
                key={tab.title}
                my="$0.5"
                py="$1"
                borderBottomWidth={activeTab === tab ? 3 : 0}
                borderColor="$borderLight900"
                sx={{
                  ':hover': {
                    borderBottomWidth: 3,
                    borderColor:
                      activeTab === tab ? '$borderLight900' : '$borderLight200',
                  },
                  '_dark': {
                    'borderColor': '$borderDark100',
                    ':hover': {
                      borderColor:
                        activeTab === tab ? '$borderDark100' : '$borderDark700',
                    },
                  },
                }}
                onPress={() => setActiveTab(tab)} // Update activeTab on press
              >
                <Text
                  size="sm"
                  color={activeTab === tab ? '$textLight900' : '$textLight600'}
                  sx={{
                    _dark: {
                      color: activeTab === tab ? '$textDark50' : '$textDark400',
                    },
                  }}
                  fontWeight="$medium"
                >
                  {tab.title}
                </Text>
              </Pressable>
            ))}
          </HStack>
        </ScrollView>
      </Box>
    </Box>
  );
};

// Filtering logic inside TabPanelData component
const TabPanelData = ({
  usersList,
  currentUser,
  filters,
  currentUserUid,
  likes,
  setLikes,
  activeTab, // Add activeTab as a prop
}) => {
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  const filterUsers = useCallback(
    (users: UserItem[], minAge: number, maxAge: number, gender: string) => {
      let filtered = users;

      // If "Liked You" tab is selected, filter users who have liked the current user
      if (activeTab.title === 'Liked You') {
        filtered = users.filter((user) =>
          currentUser.matches.whoLikedMe.includes(user.id)
        );
      } else if (activeTab.title === 'Favorites') {
        // Filter users who the current user has liked
        filtered = users.filter((user) => likes.includes(user.id));
      } else {
        filtered = users.filter((user) => {
          const isInAgeRange = user.age >= minAge && user.age <= maxAge;
          const matchesGender = gender ? user.gender === gender : true;
          const isNotCurrentUser = user.id !== currentUser.id;
          return isInAgeRange && matchesGender && isNotCurrentUser;
        });
      }

      setFilteredUsers(filtered);
    },
    [currentUser, activeTab] // Add activeTab to the dependency array
  );

  useEffect(() => {
    const fetchLikes = async () => {
      console.log('Fetching likes...', currentUser); // Add this to check if it's called

      if (currentUser) {
        const { minAge = 18, maxAge = 60, gender } = filters || {};
        if (minAge > maxAge) return;

        filterUsers(usersList, minAge, maxAge, gender);

        const userLikesRef = ref(
          FIREBASE_DB,
          `users/${currentUser.uid}/matches/whoILiked`
        );

        const snapshot = await get(userLikesRef);

        if (snapshot.exists()) {
          const likesData = snapshot.val();
          console.log('likesdata in the useeffect', likesData);
          setLikes(likesData || []);
        }
      }
    };

    fetchLikes();
  }, [usersList, currentUser, filters, filterUsers]);

  const handleLikePress = async (profileId: string) => {
    if (!profileId || !currentUserUid) return;

    const isLiked = likes.includes(profileId);
    const updatedLikes = isLiked
      ? likes.filter((id: string) => id !== profileId)
      : [...likes, profileId];

    try {
      // Update the current user's liked profiles
      const userRef = ref(
        FIREBASE_DB,
        `users/${currentUserUid}/matches/whoILiked`
      );
      await set(userRef, updatedLikes);

      // Update the other user's whoLikedMe list
      const otherUserRef = ref(
        FIREBASE_DB,
        `users/${profileId}/matches/whoLikedMe`
      );
      const otherUserSnapshot = await get(otherUserRef);
      const otherUserLikes = otherUserSnapshot.exists()
        ? otherUserSnapshot.val()
        : [];
      const updatedOtherUserLikes = isLiked
        ? otherUserLikes.filter((id: string) => id !== currentUserUid)
        : [...otherUserLikes, currentUserUid];
      await set(otherUserRef, updatedOtherUserLikes);

      // Sync the likes state
      console.log('dopo', updatedLikes);
      setLikes(updatedLikes);
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };
  const router = useRouter();
  console.log('yooooooo', likes);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    // Check if any of the inputs are undefined, null, or not numbers
    if (
      [lat1, lon1, lat2, lon2].some(
        (value) => value === undefined || value === null || isNaN(value)
      )
    ) {
      return 0; // Return 0 if there is an error in the input values
    }

    const toRadians = (angle: number) => (angle * Math.PI) / 180;

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in kilometers

    return distance;
  };

  const LikeButton = ({ profileId, likes, handleLikePress }) => (
    <Pressable
      onPress={() => handleLikePress(profileId)}
      position="absolute"
      top={12}
      right={16}
      h="$6"
      w="$6"
      justifyContent="center"
      alignItems="center"
    >
      <AnimatePresence>
        <Motion.View
          key={likes.includes(profileId) ? 'liked' : 'unliked'}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          transition={{
            type: 'spring',
            mass: 0.9,
            damping: 9,
            stiffness: 300,
          }}
          style={{ position: 'absolute' }}
        >
          <Icon
            as={Heart}
            size="lg"
            color={likes.includes(profileId) ? 'red' : 'white'}
            fill={likes.includes(profileId) ? 'red' : 'gray'}
          />
        </Motion.View>
      </AnimatePresence>
    </Pressable>
  );

  return (
    <Box
      sx={{
        'display': 'grid',
        'gap': '$4',
        'gridTemplateColumns': 'repeat(1, 1fr)',
        '@sm': { gridTemplateColumns: 'repeat(2, 1fr)' },
        '@lg': { gridTemplateColumns: 'repeat(3, 1fr)' },
      }}
    >
      {filteredUsers.map((profile) => (
        <Box key={profile.id} sx={{ 'my': '$2', '@lg': { my: 0 } }}>
          <Pressable
            w="100%"
            onPress={() => router.push(`/UserProfileDash/${profile.id}`)}
          >
            {(props) => (
              <>
                <Box overflow="hidden" borderRadius="$md" h="$72">
                  <Image
                    source={{ uri: profile.profileImage }}
                    h="$72"
                    w="100%"
                    transform={[{ scale: props.hovered ? 1.04 : 1 }]}
                    opacity={props.hovered ? 0.9 : 1}
                    alt={profile.name}
                  />
                </Box>
                {props.hovered && (
                  <Box
                    position="absolute"
                    bg="$backgroundDark950"
                    opacity={0.3}
                    w="100%"
                    h="100%"
                  />
                )}
                <Button
                  action="secondary"
                  variant="outline"
                  position="absolute"
                  top="45%"
                  bg="transparent"
                  borderColor="white"
                  alignSelf="center"
                  zIndex={5}
                  onPress={() => router.push(`/UserProfileDash/${profile.id}`)}
                  display={props.hovered ? 'flex' : 'none'}
                >
                  <Button.Text color="white">View Profile</Button.Text>
                  <Button.Icon as={ChevronRight} color="white" />
                </Button>
              </>
            )}
          </Pressable>
          <LikeButton
            profileId={profile.id}
            likes={likes}
            handleLikePress={handleLikePress}
          />

          <HStack
            justifyContent="space-between"
            py="$2"
            alignItems="flex-start"
          >
            <VStack space="xs" flex={1}>
              <Text
                fontWeight="$semibold"
                color="$textLight900"
                sx={{ _dark: { color: '$textDark200' } }}
              >
                {profile.name}, {profile.age}
              </Text>
              <Text
                size="sm"
                color="$textLight500"
                sx={{ _dark: { color: '$textDark500' } }}
              >
                {profile.address.city},{' '}
                {calculateDistance(
                  profile.address.latitude,
                  profile.address.longitude,
                  currentUser.address.latitude,
                  currentUser.address.longitude
                ).toFixed(1)}{' '}
                km away
              </Text>
              <Text
                size="sm"
                fontWeight="$semibold"
                color="$textLight900"
                sx={{ _dark: { color: '$textDark200' } }}
              >
                Interests:{' '}
                {profile.interests?.join(', ') || 'No interests listed'}
              </Text>
            </VStack>
          </HStack>
        </Box>
      ))}
    </Box>
  );
};

export default HomestayInformationFold;
