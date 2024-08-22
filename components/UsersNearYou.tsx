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

const tabsData = [
  { title: 'Explore users' },
  { title: 'Messages' },
  { title: 'Liked You' },
  { title: 'Nearby' },
  { title: 'Favorites' },
  { title: 'Visitors' },
  { title: 'Preferences' },
];

const HomestayInformationFold = ({ filters }) => {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [currentuseruid, setCurrentUserUid] = useState<any>(null);
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

  useEffect(() => {
    const usersRef = ref(FIREBASE_DB, 'users');

    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const usersArray = Object.values(data);
        setUsersList(usersArray);

        const uid = FIREBASE_AUTH.currentUser?.uid;
        setCurrentUserUid(uid);

        const currentUserRef = ref(FIREBASE_DB, `users/${uid}`);
        get(currentUserRef)
          .then((userSnapshot) => {
            if (userSnapshot.exists()) {
              setCurrentUser(userSnapshot.val());
            } else {
              console.log('No current user data found.');
            }
          })
          .catch((error) => {
            console.error('Error fetching current user:', error);
          });
      }
    });

    return () => unsubscribe();
  }, []);

  if (!currentUser) return null;

  return (
    <Box pb="$8" px="$4" sx={{ '@md': { px: 0 } }}>
      <HomestayInfoTabs tabsData={tabsData} />
      <TabPanelData
        usersList={usersList}
        currentUser={currentUser}
        filters={filters}
        currentUserUid={currentuseruid}
      />
    </Box>
  );
};

const HomestayInfoTabs = ({ tabsData }) => {
  const [activeTab, setActiveTab] = useState(tabsData[0]);

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
                onPress={() => setActiveTab(tab)}
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

const TabPanelData = ({ usersList, currentUser, filters, currentUserUid }) => {
  const router = useRouter();
  const [likes, setLikes] = useState<string[]>(
    currentUser?.matches?.whoILiked || []
  );
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  const filterUsers = useCallback(
    (users, minAge, maxAge, gender) => {
      const filtered = users.filter((user) => {
        const isInAgeRange = user.age >= minAge && user.age <= maxAge;
        const matchesGender = gender ? user.gender === gender : true;
        const isNotCurrentUser = user.id !== currentUser.id;
        return isInAgeRange && matchesGender && isNotCurrentUser;
      });
      setFilteredUsers(filtered);
    },
    [currentUser]
  );

  useEffect(() => {
    const fetchLikes = async () => {
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
          setLikes(likesData || []);
        }
      }
    };

    fetchLikes();
  }, [usersList, currentUser, filters, filterUsers]);

  const handleLikePress = async (profileId) => {
    if (!profileId || !currentUserUid) return;

    const isLiked = likes.includes(profileId);
    const updatedLikes = isLiked
      ? likes.filter((id) => id !== profileId)
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
        ? otherUserLikes.filter((id) => id !== currentUserUid)
        : [...otherUserLikes, currentUserUid];
      await set(otherUserRef, updatedOtherUserLikes);

      // Sync the likes state
      console.log('dopo', updatedLikes);
      setLikes(updatedLikes);
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

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
          <Pressable
            onPress={() => handleLikePress(profile.id)}
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
                key={likes.includes(profile.id) ? 'liked' : 'unliked'}
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
                  color={likes.includes(profile.id) ? 'red' : 'white'}
                  fill={likes.includes(profile.id) ? 'red' : 'gray'}
                />
              </Motion.View>
            </AnimatePresence>
          </Pressable>
          <HStack
            justifyContent="space-between"
            py="$2"
            alignItems="flex-start"
          >
            <VStack space="$sm" flex={1}>
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
                {profile.location}
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
