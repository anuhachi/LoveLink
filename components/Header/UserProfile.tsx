import React, { useEffect, useState } from 'react';
import {
  Avatar,
  AlertDialog,
  AvatarFallbackText,
  AvatarImage,
  AvatarBadge,
  Menu,
  Text,
  MenuItem,
  Button,
  MenuItemLabel,
  Pressable,
  Heading,
  AlertDialogBackdrop,
  AlertDialogContent,
  ButtonText,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogBody,
  AlertDialogFooter,
} from '@gluestack-ui/themed';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../screens/Login/firebaseConfig'; // Adjust the import path as necessary
import { ref, onValue } from 'firebase/database'; // For Realtime Database
// import { doc, getDoc } from 'firebase/firestore'; // Uncomment for Firestore
import { useRouter } from 'expo-router';

const userMenuItems = [
  {
    title: 'Home',
    route: '/Home',
  },
  {
    title: 'Messages',
    route: '/Chat',
  },
  {
    title: 'Match',
    route: '/Match',
  },
  {
    title: 'Settings',
    route: '/Settings',
  },
  {
    title: 'Log out',
  },
];

const UserProfile = () => {
  const [openLogoutAlertDialog, setOpenLogoutAlertDialog] = useState(false);
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(null); // State to store the profile image URL

  useEffect(() => {
    const fetchProfileImage = async (uid) => {
      try {
        const profileImageRef = ref(FIREBASE_DB, `/users/${uid}/profileImage`); // Adjust path if needed
        onValue(profileImageRef, (snapshot) => {
          if (snapshot.exists()) {
            setProfileImage(snapshot.val());
          }
        });

        // For Firestore:
        // const profileDoc = await getDoc(doc(FIREBASE_DB, 'users', uid));
        // if (profileDoc.exists()) {
        //   setProfileImage(profileDoc.data().profileImage);
        // }
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    };

    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        fetchProfileImage(user.uid);
      }
    });

    return () => unsubscribe(); // Clean up the subscription on component unmount
  }, []);

  const handleClose = () => {
    setOpenLogoutAlertDialog(false);
  };

  const handleLogout = () => {
    signOut(FIREBASE_AUTH)
      .then(() => {
        // Optionally handle post-logout actions here (e.g., redirect to login page)
        console.log('Successfully signed out');
      })
      .catch((error) => {
        // Handle errors here, if any
        console.error('Error signing out:', error);
      })
      .finally(() => {
        setOpenLogoutAlertDialog(false); // Close the alert dialog after logging out
      });
  };

  const handleSelectionChange = (selectedKey: string) => {
    const selectedItem = userMenuItems.find(
      (item) => item.title === selectedKey
    );
    if (selectedItem) {
      if (selectedKey === 'Log out') {
        setOpenLogoutAlertDialog(true);
      } else {
        router.push(selectedItem.route);
      }
    }
  };

  return (
    <>
      <Menu
        offset={10}
        placement="bottom right"
        selectionMode="single"
        onSelectionChange={(e: any) => handleSelectionChange(e.currentKey)}
        trigger={({ ...triggerProps }) => (
          <Pressable {...triggerProps}>
            <Avatar size="sm" bg="$backgroundLight600">
              <AvatarFallbackText>Henry Stan</AvatarFallbackText>
              <AvatarImage
                source={{
                  uri: profileImage || 'https://placehold.co/600x400/png', // Use default URL if profileImage is null
                }}
              />
              <AvatarBadge
                bg="$primary500"
                sx={{
                  _dark: {
                    borderColor: '$backgroundDark900',
                  },
                }}
              />
            </Avatar>
          </Pressable>
        )}
      >
        {userMenuItems.map((item) => (
          <MenuItem
            key={item.title}
            textValue={item.title}
            onPress={() => handleSelectionChange(item.title)}
          >
            <MenuItemLabel>{item.title}</MenuItemLabel>
          </MenuItem>
        ))}
      </Menu>

      {openLogoutAlertDialog && (
        <AlertDialog isOpen={openLogoutAlertDialog} onClose={handleClose}>
          <AlertDialogBackdrop />
          <AlertDialogContent>
            <AlertDialogHeader>
              <Heading>Logout</Heading>
              <AlertDialogCloseButton></AlertDialogCloseButton>
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text>Are you sure, you want to logout?</Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                variant="outline"
                action="secondary"
                onPress={handleClose}
                mr="$3"
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button action="negative" onPress={handleLogout}>
                <ButtonText>Logout</ButtonText>
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default UserProfile;
