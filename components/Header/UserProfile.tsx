import React, { useState } from 'react';
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
import LogoutAlertDialog from './LogoutAlertDialog';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../screens/Login/firebaseConfig'; // Adjust the import path as necessary

const userMenuItems = [
  {
    title: 'Messages',
  },
  {
    title: 'Match',
  },
  {
    title: 'Settings',
  },
  {
    title: 'Help',
  },
  {
    title: 'Log out',
  },
];

const UserProfile = () => {
  const [openLogoutAlertDialog, setOpenLogoutAlertDialog] = useState(false);

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
    if (selectedKey === 'Log out') {
      setOpenLogoutAlertDialog(true);
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
                  uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
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
              <Button action="negative" onPress={handleClose}>
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
