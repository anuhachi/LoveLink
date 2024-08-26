import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useWindowDimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import {
  Avatar,
  AvatarImage,
  HStack,
  VStack,
  Box,
  Text,
  Heading,
  FlatList,
  Pressable,
  Image,
  Textarea,
  TextareaInput,
} from '@gluestack-ui/themed';

import ChatDetails from '../../components/ChatDetails'
import { ChatItem, UserItem, ParticipantInfoItem, ChatDetailsParams } from '../../types'
import HeaderTabs from '../../components/Header/HeaderTabs';
import LoveLinkLogo from '../../components/Header/LoveLinkLogo';
import UserProfile from '../../components/Header/UserProfile';

import { get, ref, onValue } from 'firebase/database';
import { User } from 'firebase/auth'
import { FIREBASE_DB, FIREBASE_AUTH } from '../../screens/Login/firebaseConfig';

{/* Props for ChatItem type */}
type ChatDetailsProps = {
  item: ChatItem;
};

export default function Tab() {
  
  {/* 1. HOOKS */}

  {/* Custom Hooks */}
  const { width } = useWindowDimensions(); // Width of the screen
  const navigation = useNavigation(); // Navigation hook
  
  {/* State variables for managing UI components */}
  const [selectedTab, setSelectedTab] = useState('Chat'); // Selected tab of the Header bar
  const [searchQuery, setSearchQuery] = useState(''); // Search query for filtering chats
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatItem>({ // Currently selected chat
    id: '',
    participants: [],
    participantsInfo: {},
    messages: [],
    lastMessage: '',
    lastMessageTimestamp: '',
  });  
  
  {/* State variables for user data */}
  const [user_auth_data, setUserAuthData] = useState<User | null>(null);
  const [user_db_data, setUserDbData] = useState<UserItem | null>(null);
  
  {/* 2. FUNCTIONS */}

  {/* Get the other chat participant name to filter chats  */}
  function getOtherParticipantInfo(chat: ChatItem, currentUserId: string): ParticipantInfoItem | undefined {
    const otherParticipantId = chat.participants.find(id => id !== currentUserId);
    if (otherParticipantId) {
      return chat.participantsInfo[otherParticipantId];
    }
    return undefined;
  }

  {/* Filter chats by text of search query  */}
  const filteredChats = chats.filter(chat => {
    const otherParticipantInfo = getOtherParticipantInfo(chat, FIREBASE_AUTH.currentUser?.uid || '');
    return otherParticipantInfo?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  {/* Format the timestamp of the last message  */}
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();

    const isToday = date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const isYesterday = date.getDate() === today.getDate() - 1 &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    if (isToday) {
      return `${hours}:${minutes}`;
    } else if (isYesterday) {
      return `Yesterday`;
    } else {
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      return `${formattedDate}`;
    }
  };

  {/* Handle the messages display when chat is selected  */}
  const handlePress = (item: ChatItem) => {
    if (width >= 768) {
      setSelectedChat(item);
    } else {
      (navigation.navigate('chat-details', {
        id: item.id,
        participants: item.participants,
        participantsInfo: item.participantsInfo,
        messages: item.messages,
        lastMessage: item.lastMessage,
        lastMessageTimestamp: item.lastMessageTimestamp,
      }));
    }
  }

  {/* 3. FUNCTIONS */}

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
  
    if (user) {
      const uid = user.uid;
      const userRef = ref(FIREBASE_DB, `/users/${uid}`);
  
      // Listener for user data
      const unsubscribeUser = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val() as UserItem;
          setUserDbData(data);
  
          if (data.chats && data.chats.length > 0) {
            const chatListeners: (() => void)[] = [];
            const chatRefs = data.chats.map(chatId => ref(FIREBASE_DB, `/chats/${chatId}`));
            
            // Helper function to update chats
            const updateChats = () => {
              Promise.all(chatRefs.map(chatRef => get(chatRef).then(snapshot => snapshot.val() as ChatItem)))
                .then(fetchedChats => {
                  const sortedChats = fetchedChats.sort((a, b) => 
                    new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime()
                  );
                  setChats(sortedChats);
                  
                  if (sortedChats.length > 0) {
                    setSelectedChat(sortedChats[0]);
                  }
                })
                .catch(error => console.error('Error fetching chats:', error));
            };
  
            // Initial fetch and set up real-time listeners for each chat
            updateChats();
            chatRefs.forEach((chatRef, index) => {
              const unsubscribeChat = onValue(chatRef, updateChats);
              chatListeners.push(unsubscribeChat);
            });
  
            // Cleanup all chat listeners on unmount
            return () => {
              chatListeners.forEach(unsubscribe => unsubscribe());
              unsubscribeUser();
            };
          } else {
            setChats([]);
            setSelectedChat({
              id: '',
              participants: [],
              participantsInfo: {},
              messages: [],
              lastMessage: '',
              lastMessageTimestamp: '',
            }); // Clear selected chat if no chats exist
          }
        }
      }, (error) => {
        console.error('Error fetching user data:', error);
      });
  
      // Cleanup the user listener on unmount
      return () => unsubscribeUser();
    }
  }, []);  
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1}}
      >
        {/* A. HEADER */}
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
              
            {/* 1. LOGO AND HEADER TABS */}
            <LoveLinkLogo />
            <HeaderTabs
              setSelectedTab={setSelectedTab}
              selectedTab={selectedTab}
            />
              
            {/* 2. USER PROFILE */}
            <HStack space="lg" alignItems="center" pr="$1.5">
              <UserProfile />
            </HStack>

          </HStack>
        </Box>
        
        {/* B. MAIN CONTENT */}
        <Box
          flex={1}
          flexDirection="row"
        >
          <Box
            flex={2}
            borderColor="$trueGray300"
            $dark-borderColor="$trueGray100"
            borderRightWidth={width > 768 ? "$1" : "$0"}
          >
            <VStack p="$4">
              
              {/* 1. HEADING */}
              <Box>
                <Heading size="xl" pt="$2" pb="$3">
                  Chats
                </Heading>
              </Box>
                
              {/* 2. SEARCH BAR */}
              <Box bg="$background" borderRadius="$md">
                <Textarea
                  size="md"
                  isReadOnly={false}
                  isInvalid={false}
                  isDisabled={false}
                  borderRadius="$2xl"
                  mb="$4"
                  style={{ height: 50}}
                >
                  <TextareaInput 
                    placeholder="Search for a person"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </Textarea>
              </Box>

              {/* 3. CHATS LIST */}
              <Box
                sx={{
                  '@md': { maxHeight: 'calc(100vh - 245px)' },
                }}
                flex={1}
              >
                <FlatList
                  data={filteredChats}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }: ChatDetailsProps) => {
                    const currentUserId = FIREBASE_AUTH.currentUser?.uid || '';
                    const otherParticipantInfo = getOtherParticipantInfo(item, currentUserId);

                    return (
                      <Box $base-pl={0} $base-pr={0} $sm-pl="$4" $sm-pr="$5" py="$2">
                        <Pressable onPress={() => handlePress(item)}>
                          <HStack space="md" justifyContent="space-between" alignItems="flex-start">
                            <Avatar size="md">
                              <AvatarImage
                                alt="Profile pic"
                                source={{ uri: otherParticipantInfo?.profileImage }}
                                style={{ width: 48, height: 48, borderRadius: 24 }}
                              />
                              {
                              //<AvatarBadge bg={otherParticipantInfo?.isOnline === "true" ? "green.500" : "#DC143C"} />
                              }
                            </Avatar>
                            <VStack flex={1}>
                              <Text color="$coolGray800" fontWeight="$bold" $dark-color="$warmGray100">
                                {otherParticipantInfo?.name}, {otherParticipantInfo?.age}
                              </Text>
                              <Text color="$coolGray600" $dark-color="$warmGray200">
                                {item.lastMessage.length > 45 ? item.lastMessage.slice(0, 45) + "..." : item.lastMessage}
                              </Text>
                            </VStack>
                            <Text fontSize="$xs" color="$coolGray800" alignSelf="center" $dark-color="$warmGray100">
                              {formatTimestamp(item.lastMessageTimestamp)}
                            </Text>
                          </HStack>
                        </Pressable>
                      </Box>
                    );
                  }}
                />
              </Box>
            </VStack>
          </Box>

          {/* 4. SIDEBAR: Visible on screens wider than 768px */}
          {width > 768 && (
            <Box flex={3}>
              <ChatDetails selectedChat={selectedChat} />
            </Box>
          )}

        </Box>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
