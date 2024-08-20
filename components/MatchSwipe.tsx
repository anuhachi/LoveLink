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
import { FIREBASE_DB, FIREBASE_AUTH } from '../screens/Login/firebaseConfig'; // Adjust the import path as necessary
import { ref, onValue, update } from 'firebase/database'; // Firebase Database imports
import { getAuth } from 'firebase/auth'; // Firebase Auth imports
import { onAuthStateChanged } from 'firebase/auth';

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
    const unsubscribeAuth = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        const currentUserId = user.uid; // Get the current user's UID

        const usersRef = ref(FIREBASE_DB, 'users');

        const unsubscribeDatabase = onValue(usersRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const usersList = Object.keys(data).map((key) => ({
              id: key,
              ...data[key],
            }));

            // Check if the users list has changed before updating state
            if (JSON.stringify(usersList) !== JSON.stringify(users)) {
              setUsers(usersList);

              // Find the current user's data in the list
              const currentUserData = usersList.find(
                (user) => user.id === currentUserId
              );
              setCurrentUser(currentUserData);

              if (usersList.length > 0) {
                setCurrentViewedUserId(usersList[0].id);
              }
            }
          } else {
            console.log('No data available');
          }
        });

        return () => unsubscribeDatabase();
      } else {
        console.log('User not authenticated');
      }
    });

    return () => unsubscribeAuth();
  }, [users]);

  const handleLike = async () => {
    if (currentUser && currentViewedUserId) {
      try {
        // Ensure whoILiked is treated as an array
        const whoILiked = Array.isArray(currentUser.matches?.whoILiked)
          ? currentUser.matches.whoILiked
          : [];

        // Check if the like is already present
        if (whoILiked.includes(currentViewedUserId)) {
          console.log('User already liked');
          return; // Exit early if the user is already liked
        }

        // Update current user's whoILiked list
        const userRef = ref(
          FIREBASE_DB,
          `users/${currentUser.id}/matches`
        );
        const updatedLikes = [...whoILiked, currentViewedUserId];
        await update(userRef, { whoILiked: updatedLikes });

        // Ensure whoLikedMe is treated as an array
        const likedUser = users.find((user) => user.id === currentViewedUserId);
        const whoLikedMe = Array.isArray(likedUser?.matches?.whoLikedMe)
          ? likedUser.matches.whoLikedMe
          : [];

        // Check if the current user is already in the whoLikedMe list
        if (!whoLikedMe.includes(currentUser.id)) {
          // Update the liked user's whoLikedMe list
          const likedUserRef = ref(
            FIREBASE_DB,
            `users/${currentViewedUserId}/matches`
          );
          const updatedWhoLikedMe = [...whoLikedMe, currentUser.id];
          await update(likedUserRef, { whoLikedMe: updatedWhoLikedMe });
        }

        handleNextUser();
      } catch (error) {
        console.error('Error updating like:', error);
      }
    } else {
      console.log('Current user or current viewed user ID is missing');
    }
  };

  const handleDislike = async () => {
    if (currentUser && currentViewedUserId) {
      try {
        // Ensure whoILiked is treated as an array
        const whoILiked = Array.isArray(currentUser.matches?.whoILiked)
          ? currentUser.matches.whoILiked
          : [];

        // Check if the user is in the whoILiked list before attempting to remove
        if (whoILiked.includes(currentViewedUserId)) {
          // Update current user's whoILiked list by removing the disliked user
          const userRef = ref(
            FIREBASE_DB,
            `users/${currentUser.id}/matches`
          );
          const updatedLikes = whoILiked.filter(
            (id) => id !== currentViewedUserId
          );
          await update(userRef, { whoILiked: updatedLikes });
        }

        // Get the disliked user data
        const dislikedUser = users.find(
          (user) => user.id === currentViewedUserId
        );
        const whoLikedMe = Array.isArray(dislikedUser?.matches?.whoLikedMe)
          ? dislikedUser.matches.whoLikedMe
          : [];

        // Check if the current user is in the disliked user's whoLikedMe list before removing
        if (whoLikedMe.includes(currentUser.id)) {
          // Update the disliked user's whoLikedMe list by removing the current user
          const dislikedUserRef = ref(
            FIREBASE_DB,
            `users/${currentViewedUserId}/matches`
          );
          const updatedWhoLikedMe = whoLikedMe.filter(
            (id) => id !== currentUser.id
          );
          await update(dislikedUserRef, { whoLikedMe: updatedWhoLikedMe });
        }

        handleNextUser();
      } catch (error) {
        console.error('Error updating dislike:', error);
      }
    } else {
      console.log('Current user or current viewed user ID is missing');
    }
  };

  const handleNextUser = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < users.length) {
      setCurrentIndex(nextIndex);
      setCurrentViewedUserId(users[nextIndex].id);
    } else {
      setCurrentIndex(users.length); // Set index to out-of-bound value to show "No more users"
    }
  };

  return (
    <Box>
      {users.length > 0 ? (
        users.map((user, index) => (
          <Box
            key={user.id}
            display={index === currentIndex ? 'block' : 'none'}
          >
            <Card p="$3" borderRadius="$lg" m="$3" >
            <Box
        mb="$5"
        sx={{
          flexDirection: "column",
          "@sm": {
            mb: "$6",
            flexDirection: "row",
          },
        }}
      >
              <Image
                mb="$3"
                width="100%" // Set image width to full
                borderRadius="$md"
                alt="LoveLinnk"
                sx={{
                  width: "$full",
                  height: 300,
                  "@md": {
                    width: 300,
                    height: 300,
                  },
                }}
                source={{
                  uri: user.profileImage, // Replace with actual image URL from user data
                }}
                resizeMode="cover" // Adjust image scaling if needed
              />
              <Image
                ml="$3"
                width="100%" // Set image width to full
                borderRadius="$md"
                alt="LoveLinnk"
                sx={{
                  width: "$full",
                  display: 'none',
                  height: 300,
                  "@md": {
                    display: 'flex',  
                    width: 300,
                    height: 300,
                  },
                }}
                source={{
                  uri: user.profileImage, // Replace with actual image URL from user data
                }}
                resizeMode="cover" // Adjust image scaling if needed
              />
              </Box>
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
              ></Text>
              <VStack mb="$6">
                <Heading size="md" fontFamily="$heading" mb="$4">
                  {user.name}
                </Heading>
                <Text size="sm" fontFamily="$heading">
                  {user.bio}
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
        ))
      ) : (
        <Text>No more users to show</Text>
      )}
    </Box>
  );
};

export default MatchSwipe;
