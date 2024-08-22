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
  const [showModal, setShowModal] = useState(false);
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
        // Ensure whoILiked is treated as an array
        const whoILiked = Array.isArray(currentUser.matches?.whoILiked)
          ? currentUser.matches.whoILiked
          : [];

        // Update current user's whoILiked list
        const userRef = ref(FIREBASE_DB, `users/${currentUser.id}/matches`);
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

        // Check for a mutual match
        if (whoLikedMe.includes(currentUser.id)) {
          // Both users have liked each other, show the modal
          setShowModal(true);
          CreateNewChat(currentUser.id, currentViewedUserId);
          handleNextUser();
        } else {
          // Proceed to the next user if no mutual match
          handleNextUser();
        }
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
      {users.length > 0 ? (
        users.map((user, index) => (
          <Box
            key={user.id}
            display={index === currentIndex ? 'block' : 'none'}
          >
            <Card p="$3" borderRadius="$lg" maxWidth={600} m="$1">
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
                        flexDirection: 'row',
                      },
                    }}
                  >
                    {/* First Image */}
                    <Image
                      mb="$3"
                      borderRadius="$md"
                      alt={`${user.name}'s profile image`} // Add alt prop here
                      sx={{
                        'width': '$full',
                        'height': 140,
                        '@sm': {
                          mb: '$0',
                          mr: '$3',
                          width: 200,
                          height: 200,
                        },
                      }}
                      source={{
                        uri: user.profileImages[0], // Display the first image in the array
                      }}
                    />
                    {/* Second Image, if available */}
                    {user.profileImages.length > 1 && (
                      <Image
                        mb="$3"
                        borderRadius="$md"
                        alt={`${user.name}'s profile image`} // Add alt prop here
                        sx={{
                          'width': '$full',
                          'height': 140,
                          '@sm': {
                            mb: '$0',
                            mr: '$3',
                            width: 200,
                            height: 200,
                          },
                        }}
                        source={{
                          uri: user.profileImages[1], // Display the second image in the array
                        }}
                      />
                    )}
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
