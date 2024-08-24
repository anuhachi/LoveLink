import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Text,
  Image,
  VStack,
  Avatar,
  AlertDialog,
  AvatarFallbackText,
  AvatarImage,
  AvatarBadge,
  Divider,
  ButtonText,
  Heading,
  Card,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@gluestack-ui/themed';
import { FIREBASE_DB, FIREBASE_AUTH } from '../screens/Login/firebaseConfig'; // Adjust the import path as necessary
import { ref, onValue, update, set } from 'firebase/database'; // Firebase Database imports
import { onAuthStateChanged } from 'firebase/auth';


import useFilterStore from './FilterStore'

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
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentViewedUserId, setCurrentViewedUserId] = useState<string | null>(
    null
  );

  // Accessing Zustand store values
  const { minAge, maxAge, gender, ageRange } = useFilterStore();

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

  useEffect(() => {
    if (users.length > 0) {
      // Apply filters to the users array

      const filtered = users.filter((user) => {
        // Example filter logic
        const meetsAgeCriteria = user.age >= minAge && user.age <= maxAge;

        const meetsGenderCriteria =
          gender === 'other' || user.gender === gender;

        return meetsAgeCriteria && meetsGenderCriteria;
      });

      setFilteredUsers(filtered);

      if (filtered.length > 0) {
        setCurrentViewedUserId(filtered[0].id);
        setCurrentIndex(0);
      } else {
        setCurrentViewedUserId(null);
        setCurrentIndex(0);
      }
    }
  }, [users, minAge, maxAge, gender, ageRange]); // Re-run this effect whenever the Zustand store values change

  const CreateNewChat = async (userId1: string, userId2: string) => {
    try {
      // Function to generate a unique chat ID based on the user IDs
      const generateChatId = (userId1: string, userId2: string) => {
        const [firstId, secondId] = [userId1, userId2].sort();
        return `${firstId}_${secondId}`;
      };

      const chatId = generateChatId(userId1, userId2);

      // Reference to the chat in the Firebase database
      const chatRef = ref(FIREBASE_DB, `chats/${chatId}`);

      // Data for the new chat
      const chatData = {
        chatId,
        participants: {
          [userId1]: true,
          [userId2]: true,
        },
        messages: [],
        createdAt: new Date().toISOString(),
      };

      // Save the new chat in the database
      await set(chatRef, chatData);

      console.log('New chat created successfully:', chatId);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

const handleLike = async () => {
  if (currentUser && currentViewedUserId) {
    try {
      // Destructure properties with nullish fallback for arrays
      const whoILiked = currentUser.matches?.whoILiked ?? [];
      const userRef = ref(FIREBASE_DB, `users/${currentUser.id}/matches`);

      const likedUser = users.find((user) => user.id === currentViewedUserId);
      const whoLikedMe = likedUser?.matches?.whoLikedMe ?? [];

      // Prepare updates in one operation
      const updates = {
        [`users/${currentUser.id}/matches/whoILiked`]: [...whoILiked, currentViewedUserId],
      };

      // If the current user is not already in the likedUser's whoLikedMe array, update it
      if (!whoLikedMe.includes(currentUser.id)) {
        updates[`users/${currentViewedUserId}/matches/whoLikedMe`] = [
          ...whoLikedMe,
          currentUser.id,
        ];
      }

      // Move to the next user immediately after registering the like
      handleNextUser();

      // Perform Firebase updates in the background without blocking the UI
      const updatePromise = update(ref(FIREBASE_DB), updates);

      // Check for a mutual match in the background
      if (whoLikedMe.includes(currentUser.id)) {
        setShowModal(true);
        await CreateNewChat(currentUser.id, currentViewedUserId); // Assuming this is async
      }

      // Await the Firebase updates (this happens in the background)
      await updatePromise;

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
          const userRef = ref(FIREBASE_DB, `users/${currentUser.id}/matches`);
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
      {filteredUsers.length > 0 ? (
        filteredUsers.map((user, index) => (
          <Box
            key={user.id}
            display={index === currentIndex ? 'block' : 'none'}
          >
            <Card mt="$3" p="$3" borderRadius="$lg" maxWidth={700} m="$1">
              <Box flexDirection="row">
                <Avatar mr="$4">
                  <AvatarFallbackText fontFamily="$heading">
                    JD
                  </AvatarFallbackText>
                  <AvatarImage
                    source={{
                      uri: user.profileImage,
                    }}
                  />
                </Avatar>
                <VStack>
                  <Heading size="md" fontFamily="$heading" mb="$1">
                    {user.name}
                  </Heading>
                  <Text size="sm" fontFamily="$heading">
                    {user.age} years old{' '}
                  </Text>
                </VStack>
              </Box>
              <Box
                my="$5"
                sx={{
                  'flexDirection': 'column',
                  '@sm': {
                    my: '$6',
                    flexDirection: 'row',
                  },
                }}
              >
                <Text size="sm" fontFamily="$heading">
                  {user.bio}
                </Text>
              </Box>
              <Box
                mb="$5"
                sx={{
                  'flexDirection': 'column',
                  '@sm': {
                    mb: '$6',
                    flexDirection: 'row',
                  },
                }}
              >
                {user.profileImages && user.profileImages.length > 0 ? (
                  <Box
                    mb="$5"
                    sx={{
                      'flexDirection': 'column',
                      '@sm': {
                        mb: '$6',
                        flexDirection: 'colum',
                      },
                      '@md': {
                        mb: '$6',
                        flexDirection: 'row',
                      }
                    }}
                  >
                    <Image
                      mb="$3"
                      borderRadius="$md"
                      alt={`${user.name}'s profile image`} // Add alt prop here
                      sx={{
                        'width': '100%',
                        'height': 230,
                        '@sm': {
                          mb: '$3',
                          mr: '$3',
                          width: 320,
                          height: 200,
                        },
                        '@md': {
                          mb: '$0',
                          mr: '$4', // Slightly larger right margin for medium screens
                          width: 300,
                          height: 300,
                        },
                      }}
                      source={{
                        uri: user.profileImages[0], // Display the first image in the array
                      }}
                    />
                    {user.profileImages.length > 1 ? (
                      <Image
                        mb="$0"
                        borderRadius="$md"
                        alt={`${user.name}'s profile image`} // Add alt prop here
                        sx={{
                          'width': '$full',
                          'height': 230,
                          '@sm': {
                            mb: '$0',
                            mr: '$3',
                            width: 320,
                            height: 200,
                          },
                          '@md': {
                            mb: '$0',
                            mr: '$4', // Slightly larger right margin for medium screens
                            width: 300,
                            height: 300,
                          },
                        }}
                        source={{
                          uri: user.profileImages[1], // Display the second image in the array
                        }}
                      />
                    ) : (<></>) }
                  </Box>
                ) : (
                  <Image
                    mb="$3"
                    borderRadius="$md"
                    sx={{
                      'width': '$full',
                      'height': 140,
                      '@sm': {
                        mb: '$0',
                        mr: '$3',
                        width: 150,
                        height: 154,
                      },
                    }}
                    alt={`${user.name}'s profile image`} // Add alt prop here
                    source={{
                      uri: 'https://default-image-url.com', // Fallback image if no profileImages are available
                    }}
                  />
                )}
              </Box>
              <Button onPress={handleLike} mb="$2" py="$2" px="$4">
                <ButtonText size="sm">Like</ButtonText>
              </Button>
              <Button onPress={handleDislike} variant="outline" py="$2" px="$4">
                <ButtonText size="sm">Dislike</ButtonText>
              </Button>
            </Card>
          </Box>
        ))
      ) : (
        <Text>No more users to show</Text>
      )}

      {/* Modal Component */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)} // Ensure onClose properly updates state
      >
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">its a match!</Heading>
            <ModalCloseButton></ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Text>You have a new compatibility</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              bg="$darkBlue600"
              size="sm"
              mr="$3"
              onPress={() => setShowModal(false)} // Ensure button closes the modal
            >
              <ButtonText fontSize="$sm" fontWeight="$medium">
                Close
              </ButtonText>
            </Button>
            <Button
              bg="$darkBlue600"
              size="sm"
              mr="$3"
              onPress={() => setShowModal(false)} // Ensure button closes the modal
            >
              <ButtonText fontSize="$sm" fontWeight="$medium">
                Go to Chat
              </ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MatchSwipe;
