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
import { get, ref } from 'firebase/database'; // Firebase Database imports

const MatchSwipe = () => {
  return (
    <Box pb="$8" px="$4" sx={{ '@md': { px: 0 } }}>
      <TabPanelData />
    </Box>
  );
};

const TabPanelData = () => {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const usersRef = ref(FIREBASE_DB, 'users');

    get(usersRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const usersList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setUsers(usersList);
        } else {
          console.log('No data available');
        }
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  }, []);

  const handleLike = () => {
    console.log('Liked:', users[currentIndex]?.id);
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const handleDislike = () => {
    console.log('Disliked:', users[currentIndex]?.id);
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  return (
    <Box>
      {users.length > 0 && currentIndex < users.length ? (
        <Box flex={1} justifyContent="center" alignItems="center">
          {/* Render the current user card */}
          <Card p="$3" borderRadius="$lg" maxWidth={600} m="$3">
            <Image
              mb="$6"
              h={240}
              width="$full"
              borderRadius="$md"
              source={{
                uri: users[currentIndex].profileImage, // Replace with actual image URL from user data
              }}
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
              {users[currentIndex].interests}{' '}
            </Text>
            <VStack mb="$6">
              <Heading size="md" fontFamily="$heading" mb="$4">
                {users[currentIndex].name} {/* Replace with actual name */}
              </Heading>
              <Text size="sm" fontFamily="$heading">
                {users[currentIndex].bio}{' '}
                {/* Replace with actual description */}
              </Text>
            </VStack>
          </Card>

          {/* Like and Dislike Buttons */}
          <HStack mt="$2" mb="$5" width="100%">
            <Button
              onPress={handleDislike}
              variant="outline"
              colorScheme="red"
              flex={1}
              ml="$2"
              mr="$2"
            >
              <Text>Dislike</Text>
            </Button>
            <Button
              onPress={handleLike}
              colorScheme="green"
              flex={1}
              ml="$2"
              mr="$2"
            >
              <Text>Like</Text>
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
