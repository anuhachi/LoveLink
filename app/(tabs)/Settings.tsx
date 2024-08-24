import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
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
  Toast,
  ToastTitle,
  useToast,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Image,
} from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Platform } from 'react-native';
import { get, ref, update, remove } from 'firebase/database'; // Firebase Database imports
import {
  FIREBASE_DB,
  FIREBASE_AUTH,
  FIREBASE_STORAGE,
} from '../../screens/Login/firebaseConfig'; // Adjust the import path as necessary
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'; // Firebase Storage imports
import UserProfile from '../../components/Header/UserProfile';
import LoveLinkLogo from '../../components/Header/LoveLinkLogo';
import HeaderTabs from '../../components/Header/HeaderTabs';
import Swiper from 'react-native-swiper';
import * as ImagePicker from 'expo-image-picker';
import useFilterStore from '../../components/FilterStore';
import LottieView from 'lottie-react-native';

export default function Settings() {
  const router = useRouter(); // Use expo-router's useRouter hook

  const [user_auth_data, setUserAuthData] = useState(null);
  const [selectedTab, setSelectedTab] = useState('Settings');
  const [showModalUncomplite, setShowModalUncomplite] = useState(false);
  const [userData, setUserData] = useState({
    address: {
      city: '', // Add default or user-provided values
      street: '',
      zip: '',
    },
    age: '', // Default or user-provided value
    bio: '',
    description: '',
    gender: '',
    genderPreference: '',
    hobby: '',
    interests: [],
    location: '',
    matches: {
      whoILiked: [],
      whoLikedMe: [],
    },
    messages: [],
    name: '', // Add default or user-provided values
    profilecomplete: false, // Default value
    DOB: false, // Default value
    profileImage: '', // Default or user-provided URL
    profileImages: [], // Default or user-provided URLs
  });
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const fileInputRef = useRef(null);
  const toast = useToast();
  const setGender = useFilterStore((state) => state.setGender); // Get the setGender method from Zustand store
  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      const uid = user.uid;
      setUserAuthData(user);

      const userRef = ref(FIREBASE_DB, `/users/${uid}`);

      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            console.log('Fetched user data:', data);
            setUserData((prevState) => ({
              ...prevState,
              ...data,
              interests: data.interests || [], // Ensure interests is always an array
              profileImages: data.profileImages || [], // Ensure profileImages is always an array
            }));
            setGender(data.genderPreference); // Set the gender in the Zustand store
            checkIncompleteFields(data); // Call the function to check incomplete fields
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

  // Function to check for incomplete fields
  const checkIncompleteFields = (data) => {
    if (!data.name || !data.bio || !data.description) {
      console.log('Some fields are incomplete');
      setShowModalUncomplite(true);
    }
  };

  // Function to pick and upload image
  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Launch image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log('Image picker result:', result);

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      console.log('Picked image URI:', uri);

      try {
        // Upload the image to Firebase Storage
        const filename = uri.split('/').pop();
        const uploadUri =
          Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
        const imageRef = storageRef(
          FIREBASE_STORAGE,
          `profileImages/${filename}`
        );

        const response = await fetch(uploadUri);
        const blob = await response.blob();
        console.log('Uploading image to Firebase Storage...');

        await uploadBytes(imageRef, blob);

        // Get the image URL and update Firestore
        const downloadURL = await getDownloadURL(imageRef);
        console.log('Download URL:', downloadURL);
        const user = FIREBASE_AUTH.currentUser;
        if (user) {
          const uid = user.uid;
          const userRef = ref(FIREBASE_DB, `/users/${uid}`);
          const newProfileImages = [...userData.profileImages, downloadURL];

          // Update the user's profileImages array in Firestore
          await update(userRef, { profileImages: newProfileImages });
          console.log('Updated profile images in Firestore.');

          // Update state
          setUserData((prevState) => ({
            ...prevState,
            profileImages: newProfileImages,
          }));
        }

        toast.show({
          placement: 'top right',

          render: ({ id }) => {
            return (
              <Toast id={id} action="success" variant="accent">
                <ToastTitle>Image uploaded successfully!</ToastTitle>
              </Toast>
            );
          },
        });
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.show({
          placement: 'top right',

          render: ({ id }) => {
            return (
              <Toast id={id} action="error" variant="accent">
                <ToastTitle>Image upload failed. Try again!</ToastTitle>
              </Toast>
            );
          },
        });
      }
    }
  };

  const handleDeleteImage = async (imageUri) => {
    try {
      // Check if there is only one image left
      if (userData.profileImages.length <= 1) {
        // Prevent deletion if there's only one image
        toast.show({
          placement: 'top right',
          render: ({ id }) => {
            return (
              <Toast id={id} variant="accent" action="warning">
                <ToastTitle>You cannot delete the last image left</ToastTitle>
              </Toast>
            );
          },
        });
        return;
      }

      // Create a new array excluding the image to be deleted
      const updatedImages = userData.profileImages.filter(
        (img) => img !== imageUri
      );

      // Get the current user
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        const uid = user.uid;
        const userRef = ref(FIREBASE_DB, `/users/${uid}`);

        // Update the user's profileImages array in the database
        await update(userRef, { profileImages: updatedImages });

        console.log('Removed image from profileImages array in Firestore.');

        toast.show({
          placement: 'top right',

          render: ({ id }) => {
            return (
              <Toast id={id} action="success" variant="accent">
                <ToastTitle>Image deleted successfully!</ToastTitle>
              </Toast>
            );
          },
        });

        // Update local state
        setUserData((prevState) => ({
          ...prevState,
          profileImages: updatedImages,
        }));
      }
    } catch (error) {
      console.error('Error removing image from profileImages array:', error);

      toast.show({
        placement: 'top right',

        render: ({ id }) => {
          return (
            <Toast id={id} action="error" variant="accent">
              <ToastTitle>Failed to delete image. Try again!</ToastTitle>
            </Toast>
          );
        },
      });
    }
  };

  const handleSetProfileImage = async (imageUri) => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        const uid = user.uid;
        const userRef = ref(FIREBASE_DB, `/users/${uid}`);
        await update(userRef, { profileImage: imageUri });
        console.log('Updated profile image in Firestore.');
        setUserData((prevState) => ({
          ...prevState,
          profileImage: imageUri,
        }));
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
    }
  };

  // Logout function

  const handleLogout = async () => {
    try {
      await FIREBASE_AUTH.signOut(); // Sign out the user

      router.replace('/login'); // Redirect to the login page using expo-router
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Function to update profile data
  const updateProfileData = async () => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        const uid = user.uid;
        const userRef = ref(FIREBASE_DB, `/users/${uid}`);

        await update(userRef, userData);
        console.log('Updated profile data in Firestore.');

        toast.show({
          placement: 'top right',

          render: ({ id }) => {
            return (
              <Toast id={id} action="success" variant="accent">
                <ToastTitle>Updated profile data in Firestore.</ToastTitle>
              </Toast>
            );
          },
        });
      }
    } catch (error) {
      console.error('Error updating profile data:', error);
      toast.show({
        placement: 'top right',

        render: ({ id }) => {
          return (
            <Toast id={id} action="error" variant="accent">
              <ToastTitle>Error updating profile data:</ToastTitle>
            </Toast>
          );
        },
      });
    }
  };

  const handleInputChange = (fieldName, value) => {
    console.log('Field:', fieldName, 'Value:', value);
    const fields = fieldName.split('.');
    setUserData((prevState) => {
      if (fields.length > 1) {
        return {
          ...prevState,
          [fields[0]]: {
            ...prevState[fields[0]],
            [fields[1]]: value,
          },
        };
      } else {
        return {
          ...prevState,
          [fieldName]: value,
        };
      }
    });
  };

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
        contentContainerStyle={{ flex: 1, flexDirection: 'row' }}
      >
        <Box
          flex={1}
          sx={{ '@md': { display: 'flex' }, '@sm': { display: 'none' } }}
        >
          <Swiper
            showsPagination
            loop
            style={{ width: '100%', height: '100%' }}
            onIndexChanged={(index) => setSelectedImageIndex(index)}
          >
            {userData.profileImages.map((imageUri, index) => (
              <React.Fragment key={imageUri}>
                {' '}
                {/* Use the imageUri as the key */}
                <HStack width="100%">
                  <Button
                    m="$1"
                    flex={1}
                    variant="outline"
                    onPress={() => handleDeleteImage(imageUri)}
                  >
                    <ButtonText fontSize="$sm" fontWeight="$medium">
                      Delete The Image
                    </ButtonText>
                  </Button>
                  <Button
                    m="$1"
                    flex={1}
                    variant="outline"
                    onPress={() => handleSetProfileImage(imageUri)}
                  >
                    <ButtonText fontSize="$sm" fontWeight="$medium">
                      Set as Profile Image
                    </ButtonText>
                  </Button>
                </HStack>
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                  alt="LoveLinnk"
                />
              </React.Fragment>
            ))}
          </Swiper>
        </Box>

        <ScrollView>
          <Box
            flex={1}
            sx={{ '@md': { display: 'none' }, '@sm': { display: 'flex' } }}
          >
            <Swiper
              showsPagination
              loop
              style={{ width: '100%', height: '100%' }}
              onIndexChanged={(index) => setSelectedImageIndex(index)}
            >
              {userData.profileImages.map((imageUri, index) => (
                <React.Fragment key={imageUri}>
                  {' '}
                  {/* Use the imageUri as the key */}
                  <HStack width="100%">
                    <Button
                      m="$1"
                      flex={1}
                      onPress={() => handleDeleteImage(imageUri)}
                    >
                      <ButtonText fontSize="$sm" fontWeight="$medium">
                        Delete
                      </ButtonText>
                    </Button>
                    <Button
                      m="$1"
                      flex={1}
                      onPress={() => handleSetProfileImage(imageUri)}
                    >
                      <ButtonText fontSize="$sm" fontWeight="$medium">
                        Set Profile Image
                      </ButtonText>
                    </Button>
                  </HStack>
                  <Image
                    source={{ uri: imageUri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                    alt="LoveLinnk"
                  />
                </React.Fragment>
              ))}
            </Swiper>
          </Box>

          <VStack flex={2} p="$4">
            <Box
              bg="$primary100"
              p="$5"
              flexDirection="row"
              mb="$4"
              borderRadius="$md"
            >
              <Avatar mr="$4">
                <AvatarFallbackText fontFamily="$heading">
                  <Text>JD</Text>
                </AvatarFallbackText>
                <AvatarImage
                  source={{
                    uri:
                      userData.profileImage ||
                      'https://via.placeholder.com/150',
                  }}
                />
                <AvatarBadge bg="green.500" />
              </Avatar>

              <VStack>
                <Heading size="md" fontFamily="$heading" mb="$1">
                  <Text>
                    {userData.name || 'Name is missing must be added'}
                  </Text>
                </Heading>
                <Text size="sm" fontFamily="$heading">
                  {user_auth_data?.email || 'Missing email'}
                </Text>
              </VStack>
            </Box>

            <VStack mb="$4">
              <Heading size="sm" mb="$3">
                <Text>Personal Informations</Text>
              </Heading>
              <FormControl mb="$4">
                <Input mb="$2">
                  <InputField
                    placeholder="name"
                    value={userData.name}
                    onChangeText={(text) => handleInputChange('name', text)}
                  />
                </Input>
                <Input>
                  <InputField
                    placeholder="Bio"
                    value={userData.bio}
                    onChangeText={(text) => handleInputChange('bio', text)}
                  />
                </Input>
              </FormControl>
              <FormControl mb="$4">
                <Input>
                  <InputField
                    placeholder="Description"
                    value={userData.description}
                    onChangeText={(text) =>
                      handleInputChange('description', text)
                    }
                  />
                </Input>
              </FormControl>
              <FormControl mb="$4">
                <Input>
                  <InputField
                    onChangeText={(text) => handleInputChange('hobby', text)}
                    placeholder="hobby"
                    value={userData.hobby}
                  />
                </Input>
              </FormControl>
              <Heading size="sm" mb="$3">
                <Text>Address Information</Text>
              </Heading>
              <FormControl mb="$4">
                <Input mb="$2">
                  <InputField
                    placeholder="city"
                    value={userData.address.city}
                    onChangeText={(text) =>
                      handleInputChange('address.city', text)
                    }
                  />
                </Input>
                <Input mb="$2">
                  <InputField
                    placeholder="street"
                    value={userData.address.street}
                    onChangeText={(text) =>
                      handleInputChange('address.street', text)
                    }
                  />
                </Input>
                <Input mb="$2">
                  <InputField
                    placeholder="zip"
                    value={userData.address.zip}
                    onChangeText={(text) =>
                      handleInputChange('address.zip', text)
                    }
                  />
                </Input>
              </FormControl>

              <Heading size="sm" mb="$3">
                <Text>Your Gender</Text>
              </Heading>
              <FormControl mb="$2">
                <Select
                  value={userData.gender} // Bind the selected value
                  onValueChange={(value) => handleInputChange('gender', value)} // Handle value change
                >
                  <SelectTrigger mb="$2">
                    <SelectInput placeholder="Gender" value={userData.gender} />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent mb="$3">
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <SelectItem label="Male" value="male" />
                      <SelectItem label="Female" value="female" />
                      <SelectItem label="Other" value="Other" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
                <Heading size="sm" mb="$3">
                  <Text>Looking for</Text>
                </Heading>
                <Select
                  value={userData.genderPreference} // Bind the selected value
                  onValueChange={(value) =>
                    handleInputChange('genderPreference', value)
                  } // Handle value change
                >
                  <SelectTrigger mb="$2">
                    <SelectInput
                      placeholder="Gender"
                      value={userData.genderPreference}
                    />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent mb="$3">
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <SelectItem label="Male" value="male" />
                      <SelectItem label="Female" value="female" />
                      <SelectItem label="Other" value="Other" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </FormControl>
            </VStack>

            <VStack mb="$4">
              <FormControl mb="$4">
                <Heading size="sm" mt="$2" mb="$2">
                  <Text> Interests </Text>
                </Heading>
                {userData.interests.map((interest, index) => (
                  <Input key={index} mb="$1">
                    <InputField
                      placeholder="Your interests"
                      value={interest}
                      onChangeText={(text) =>
                        handleInputChange('interests', text)
                      }
                    />
                  </Input>
                ))}
              </FormControl>

              <Button mb="$2" bg="$darkBlue600" onPress={pickImage}>
                <ButtonText>Add An Image</ButtonText>
              </Button>
              <FormControl mb="$3">
                <Button bg="$darkBlue600" onPress={updateProfileData}>
                  <ButtonText fontSize="$sm" fontWeight="$medium">
                    Update your profile Data
                  </ButtonText>
                </Button>
              </FormControl>
              <FormControl>
                <Button onPress={handleLogout} bg="$darkBlue600">
                  <ButtonText fontSize="$sm" fontWeight="$medium">
                    Logout
                  </ButtonText>
                </Button>
              </FormControl>
            </VStack>
          </VStack>
        </ScrollView>
        {/* Modal Component */}
        <Modal
          isOpen={showModalUncomplite}
          onClose={() => setShowModalUncomplite(false)} // Ensure onClose properly updates state
        >
          <ModalContent>
            <ModalHeader>
              <Heading size="lg">
                <Text>Complite your profile!!</Text>
              </Heading>
              <ModalCloseButton></ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <Text>Some data are incomplte</Text>
            </ModalBody>
            <ModalFooter>
              <Button
                bg="$darkBlue600"
                size="sm"
                mr="$3"
                onPress={() => setShowModalUncomplite(false)} // Ensure button closes the modal
              >
                <ButtonText fontSize="$sm" fontWeight="$medium">
                  <Text>Close</Text>
                </ButtonText>
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
