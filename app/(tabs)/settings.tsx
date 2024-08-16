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
import { useWindowDimensions, Image } from 'react-native';
import { get, ref } from 'firebase/database'; // Firebase Database imports
import { FIREBASE_DB, FIREBASE_AUTH } from '../../screens/Login/firebaseConfig'; // Adjust the import path as necessary

export default function Settings() {
  const { width } = useWindowDimensions();
  const [user_auth_data, setUserAuthData] = useState(null);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    address: '',
    gender: '',
    dob: '',
    lookingFor: '',
    maxDistance: '',
  });

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser; // Get the current authenticated user
    if (user) {
      const uid = user.uid; // Retrieve the user's UID
      setUserAuthData(user); // Set the user data to the state
      console.log('User UID:', uid); // Log the UID to the console

      // Reference to the specific user's data in the Firebase Realtime Database
      const userRef = ref(FIREBASE_DB, `/users/${uid}`);

      // Fetch the user data once (not using real-time listener)
      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            console.log('User Data:', data); // Log the user data to the console
            setUserData({
              name: data.name || '',
              email: data.email || '',
              address: data.address || '',
              gender: data.gender || '',
              dob: data.dob || '',
              lookingFor: data.lookingFor || '',
              maxDistance: data.maxDistance || '',
            });
          } else {
            console.log('No data available');
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        });
    } else {
      console.log('No user is signed in.');
    }
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, flexDirection: 'row' }}
      >
        {width > 768 && (
          <Box flex={1}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1620403724159-40363e84a155?q=80&w=2646&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </Box>
        )}

        <VStack flex={2} p="$4">
          <Box
            bg="$primary100"
            p="$5"
            flexDirection="row"
            mb="$4"
            borderRadius="$md"
          >
            <Avatar mr="$4">
              <AvatarFallbackText fontFamily="$heading">JD</AvatarFallbackText>
              <AvatarImage
                source={{
                  uri: 'https://images.unsplash.com/photo-1620403724159-40363e84a155?q=80&w=2646&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                }}
              />
              <AvatarBadge bg="green.500" />
            </Avatar>
            <VStack>
              <Heading size="md" fontFamily="$heading" mb="$1">
                {userData.name || 'Jane Doe'}
              </Heading>
              <Text size="sm" fontFamily="$heading">
                {user_auth_data?.email || 'Missing email'}
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
          </VStack>

          <VStack mb="$4">
            <Heading size="sm" mb="$3">
              Preferences
            </Heading>
            <FormControl>
              <Input>
                <InputField placeholder="Username" value={userData.name} />
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
            <FormControl mb="$3">
              <Button bg="$darkBlue600">
                <ButtonText fontSize="$sm" fontWeight="$medium">
                  Update your profile Data
                </ButtonText>
              </Button>
            </FormControl>
            <FormControl>
              <Button bg="$darkBlue600">
                <ButtonText fontSize="$sm" fontWeight="$medium">
                  Logout
                </ButtonText>
              </Button>
            </FormControl>
          </VStack>
        </VStack>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
