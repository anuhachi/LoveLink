import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Text,
  Image,
  VStack,
  Heading,
  Card,
} from '@gluestack-ui/themed';
import { FIREBASE_DB } from '../screens/Login/firebaseConfig'; // Adjust the import path as necessary
import { ref, onValue, update } from 'firebase/database'; // Firebase Database imports

const MatchSwipe = () => {
  return (
    <Box pb="$8" px="$4" sx={{ '@md': { px: 0 } }}>
      <TabPanelData />
    </Box>
  );
};

const TabPanelData = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentViewedUserId, setCurrentViewedUserId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const usersRef = ref(FIREBASE_DB, 'users');

    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const usersList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        // Check if the users list has changed before updating state
        if (JSON.stringify(usersList) !== JSON.stringify(users)) {
          setUsers(usersList);

          const currentUserData = usersList.find((user) => user.id === '14');
          setCurrentUser(currentUserData);
          if (usersList.length > 0) {
            setCurrentViewedUserId(usersList[0].id);
          }
        }
      } else {
        console.log('No data available');
      }
    });

    return () => unsubscribe();
  }, [users]);

  const handleLike = async () => {
    if (currentUser && currentViewedUserId) {
      try {
        // Update current user's whoILiked list
        const userRef = ref(
          FIREBASE_DB,
          `users/${currentUser.id}/matches/whoILiked`
        );
        const updatedLikes = [
          ...(currentUser.matches?.whoILiked || []),
          currentViewedUserId,
        ];
        await update(userRef, updatedLikes);

        // Update the liked user's whoLikedMe list
        const likedUserRef = ref(
          FIREBASE_DB,
          `users/${currentViewedUserId}/matches/whoLikedMe`
        );
        await update(
          likedUserRef,
          (currentUser.matches?.whoLikedMe || []).concat(currentUser.id)
        );

        console.log('Liked:', currentViewedUserId);
      } catch (error) {
        console.error('Error updating like:', error);
      }

      setCurrentIndex((prevIndex) => prevIndex + 1);
      setCurrentViewedUserId(users[currentIndex + 1]?.id || null);
    }
  };

  const handleDislike = async () => {
    if (currentUser && currentViewedUserId) {
      try {
        // Update current user's whoILiked list
        const userRef = ref(
          FIREBASE_DB,
          `users/${currentUser.id}/matches/whoILiked`
        );
        const updatedLikes = (currentUser.matches?.whoILiked || []).filter(
          (id) => id !== currentViewedUserId
        );
        await update(userRef, updatedLikes);

        // Update the disliked user's whoLikedMe list
        const dislikedUserRef = ref(
          FIREBASE_DB,
          `users/${currentViewedUserId}/matches/whoLikedMe`
        );
        await update(
          dislikedUserRef,
          (currentUser.matches?.whoLikedMe || []).filter(
            (id) => id !== currentUser.id
          )
        );

        console.log('Disliked:', currentViewedUserId);
      } catch (error) {
        console.error('Error updating dislike:', error);
      }

      setCurrentIndex((prevIndex) => prevIndex + 1);
      setCurrentViewedUserId(users[currentIndex + 1]?.id || null);
    }
  };

  return (
    <Box>
      {users.length > 0 && currentIndex < users.length ? (
        <Box>
          <Card p="$3" borderRadius="$lg" maxWidth="100%" m="$3">
            <Image
              mb="$6"
              width="100%" // Set image width to full
              height={400} // Adjust height as needed, or use a ratio
              borderRadius="$md"
              source={{
                uri: users[currentIndex].profileImage, // Replace with actual image URL from user data
              }}
              resizeMode="cover" // Adjust image scaling if needed
            />
            <Text
              fontSize="$sm"
              fontStyle="normal"
              fontFamily="$heading"
              fontWeight="$normal"
              lineHeight="$sm"
              mb="$2"
              sx={{
                color: '$textLight700',
                _dark: {
                  color: '$textDark200',
                },
              }}
            >
              {users[currentIndex].interests.join(', ')}{' '}
            </Text>
            <VStack mb="$6">
              <Heading size="md" fontFamily="$heading" mb="$4">
                {users[currentIndex].name}
              </Heading>
              <Text size="sm" fontFamily="$heading">
                {users[currentIndex].bio}
              </Text>
            </VStack>
          </Card>

          <HStack mt="$2" mb="$5" width="100%">
            <Button
              onPress={handleDislike}
              variant="outline"
              flex={1}
              ml="$2"
              mr="$2"
            >
              <Text>Dislike</Text>
            </Button>
            <Button onPress={handleLike} flex={1} ml="$2" mr="$2">
              <Text style={{ color: 'white' }}>Like</Text>
            </Button>
          </HStack>
        </Box>
      ) : (
        <Text>No more users to show</Text>
      )}
    </Box>
  );
};

export default MatchSwipe;
