import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
  HStack,
  VStack,
  Box,
  Text,
  View,
} from '@gluestack-ui/themed';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Button } from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import UserProfile from '../../components/Header/UserProfile';
import UsersNearYou from '../../components/UsersNearYou';
import { FIREBASE_AUTH } from '../../screens/Login/firebaseConfig'; // Adjust the import path as necessary
import { ScrollView } from 'react-native';
import { Input, InputField, InputIcon, InputSlot } from '@gluestack-ui/themed';
import Sidebar from '../../components/Sidebar';
import HeaderTabs from '../../components/Header/HeaderTabs';
import LoveLinkLogo from '../../components/Header/LoveLinkLogo';
import NewLikesSection from '../../components/NewLikesSection';
import MainContentHeader from '../../components/MainContentHeader';

const [selectedTab, setSelectedTab] = React.useState('Explore');

export default function Tab({ activeTab, setActiveTab }: any) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
      setUser(currentUser);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(FIREBASE_AUTH).catch((error) => {
      // Handle errors here, if any
      console.error('Error signing out:', error);
    });
  };

  /* return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text>Welcome, {user.email}</Text>
          <Button title="Logout" onPress={handleLogout} />
        </>
      ) : (
        <Text>No user is logged in</Text>
      )}
    </View>
  );
*/

  return (
    <>
      <Box
        w="100%"
        sx={{
          display: 'flex',
        }}
      >
        {/* header */}
        <Box>
          {/* big screen */}
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
              {/* logo and hedear here */}
              <LoveLinkLogo />
              <HeaderTabs
                setSelectedTab={setSelectedTab}
                selectedTab={selectedTab}
              />
              <HStack space="lg" alignItems="center" pr="$1.5">
                {/*<ToggleMode />*/}
                <UserProfile />
              </HStack>
            </HStack>
          </Box>
          {/* small screen */}
          <Box
            p="$5"
            sx={{
              '@md': {
                display: 'none',
              },
            }}
            w="100%"
          >
            <Input variant="rounded" size="sm" w="100%">
              <InputField placeholder="Anywhere • Any week • Add guests" />
              <InputSlot
                bg="$primary500"
                borderRadius="$full"
                h="$6"
                w="$6"
                m="$1.5"
              >
                <InputIcon
                  as={FontAwesome}
                  name="search"
                  color="white"
                  size={20}
                />
              </InputSlot>
            </Input>
          </Box>
        </Box>
      </Box>

      <ScrollView>
        <Box
          sx={{
            'display': 'flex',
            '@md': { display: 'none' },
          }}
        >
          <Box
            sx={{
              '@md': { maxHeight: 'calc(100vh - 144px)', pr: '$16', pl: '$8' },
            }}
            flex={1}
          >
            <Box>
              <MainContentHeader />
              <NewLikesSection />
              {/* explore page homestay info fold 2 */}
              <UsersNearYou />
            </Box>
          </Box>
        </Box>
      </ScrollView>

      <HStack w="100%" display="none" sx={{ '@md': { display: 'flex' } }}>
        <Box
          w="25%" // Set the width of the Sidebar to 25% of the page
          sx={{ '@md': { width: '25%' } }} // Ensure it applies only on medium and larger screens
        >
          <Sidebar />
        </Box>
        <ScrollView style={{ flex: 1 }}>
          <Box
            sx={{
              '@md': { maxHeight: 'calc(100vh - 144px)', pr: '$16', pl: '$8' },
            }}
            flex={1}
          >
            <Box>
              <MainContentHeader />
              <NewLikesSection />
              {/* explore page homestay info fold 2 */}
              <UsersNearYou />
            </Box>
          </Box>
        </ScrollView>
      </HStack>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
