import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useWindowDimensions} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import React, { useRef, useEffect, useState } from 'react';
import EmojiSelector from 'react-native-emoji-selector';

import {
  Avatar,
  AvatarFallbackText,
  AvatarBadge,
  AvatarImage,
  HStack,
  VStack,
  Box,
  Text,
  Heading,
  FlatList,
  Pressable,
  Textarea,
  TextareaInput,
  ArrowLeftIcon,
  View,
  ScrollView,
} from '@gluestack-ui/themed';

import { ChatItem, MessageItem, UserItem, ParticipantInfoItem } from '../types';

import { get, set, ref, onValue } from 'firebase/database';
import { User } from 'firebase/auth'
import { FIREBASE_DB, FIREBASE_AUTH } from '../screens/Login/firebaseConfig';

type ChatDetailsProps = {
  selectedChat: ChatItem;
};

export default function ChatDetails({ selectedChat }: ChatDetailsProps) {
  
  {/* 1. VARIABLES */}
  
  const participants = selectedChat.participants;
  const participantsInfo = selectedChat.participantsInfo;
  //const messages: MessageItem[] = selectedChat.messages;
  //const name = selectedChat.name;
  //const isOnline = selectedChat.isOnline;
  //const lastSeen = selectedChat.lastSeen;
  //const profileImage = selectedChat.profileImage;
  
  {/* 2. HOOKS */}

  {/* Custom Hooks */}
  const { height, width } = useWindowDimensions();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  
  {/* State variables for managing UI components */}
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputHeight, setInputHeight] = useState(12); // The value 40 will be the initial height of the text area
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  //const [shouldAdjustHeight, setShouldAdjustHeight] = useState<boolean>(true); // Flag to control height adjustment

  {/* State variables for user data */}
  const [user_auth_data, setUserAuthData] = useState<User | null>(null);
  const [user_db_data, setUserDbData] = useState<UserItem | null>(null);
  const [chat_db_data, setChatDbData] = useState<ChatItem | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<ParticipantInfoItem | null>(null);

  const [onlineStatus, setOnlineStatus] = useState<boolean>(false);
  const [lastSeen, setLastSeen] = useState<string>("");

  {/* 3. FUNCTIONS */}

  {/* Format the last seen timestamp */}
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();

    const isToday = date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const isYesterday = date.getDate() === today.getDate() - 1 &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return 'Today';
    } else if (isYesterday) {
      return 'Yesterday';
    } else {
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      return `${formattedDate}`;
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(message + emoji); // Append selected emoji to the input
    setShowEmojiPicker(false); // Hide emoji picker after selection
  };

  const generateChatId = (userId1: string, userId2: string) => {
    const [firstId, secondId] = [userId1, userId2].sort();
    return `${firstId}_${secondId}`;
  };

  {/* 3. LISTENERS */}

  {/* Determine the current other participant */}
  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser; // Get the current authenticated user
    if (user) {
      const uid = user.uid; // Retrieve the user's UID
      setUserAuthData(user); // Set the user data to the state
      console.log('User UID:', uid); // Log the UID to the console
      
      // Reference to the specific user's data in the Firebase Realtime Database
      const userRef = ref(FIREBASE_DB, `/users/${uid}`);

      // Set up a real-time listener for the user's data
      const unsubscribe = onValue(
        userRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setUserDbData(data);
            console.log('User Data:', data); // Log the user data to the console
            
            const participantId = participants.find(id => id !== user.uid);
            if (participantId) {
              setCurrentParticipant(participantsInfo[participantId]);
            }
            } else {
              console.log('No participant info available');
            }
        },
        (error) => {
          console.error('Error fetching user data:', error);
        }
      );
      // Cleanup listener on component unmount
      return () => unsubscribe();
    } else {
      console.log('No user is signed in.');
    }
  }, [participants, participantsInfo]);

  {/* Retrieve all messages from chat */}
  useEffect(() => {
    
    if (user_auth_data && participants.length > 0) {
      const senderId = user_auth_data.uid;
      const receiverId = participants.find(id => id !== senderId);
  
      if (receiverId) {
        const chatId = generateChatId(senderId, receiverId);
        const messagesRef = ref(FIREBASE_DB, `/chats/${chatId}/messages`);
        console.log("Listening at:", `/chats/${chatId}/messages`);
  
        const unsubscribe = onValue(
          messagesRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              console.log("New message added:", data);
              const messageList: MessageItem[] = Object.values(data);
              setChatDbData((prevChat) => {
                return prevChat
                  ? {
                      ...prevChat,
                      messages: messageList,
                    }
                  : null;
              });
              setMessages(messageList);
            } else {
              console.log('No messages available');
            }
          },
          (error) => {
            console.error('Error fetching messages:', error);
          }
        );
        return () => unsubscribe();
      }
    }
  }, [user_auth_data, participants]);

  const handleSendMessage = async () => {
    if (message.trim() !== "" && user_auth_data) {
      const senderId = user_auth_data.uid;
      console.log("The senderId is: ", senderId)
      const receiverId = participants.find(id => id !== senderId);
      
      if (receiverId) {
        const now = new Date();
        const isoString = now.toISOString();
        const formattedTimestamp = isoString.slice(0, 19) + 'Z';
  
        // Generate the chat ID
        const chatId = generateChatId(senderId, receiverId);
        
        try {
          // Reference to the chat in the chats database
          const chatRef = ref(FIREBASE_DB, `/chats/${chatId}`);
          
          // Retrieve the existing chat data to merge with
          const chatSnapshot = await get(chatRef);
          const existingChat = chatSnapshot.val() || {};
          
          // Update the chat's last message and timestamp, preserving other data
          await set(chatRef, {
            ...existingChat,
            lastMessage: message,
            lastMessageTimestamp: formattedTimestamp
          });
          
          // Reference to the messages within the chat
          const messagesRef = ref(FIREBASE_DB, `/chats/${chatId}/messages`);
          
          // Retrieve the current sender's messages to calculate the next index
          const messagesSnapshot = await get(messagesRef);
          const listMessages = messagesSnapshot.val() || [];
          const messagesNextIndex = listMessages.length;
          
          // Add the new message with the next index as the key
          const newMessageRef = ref(FIREBASE_DB, `/chats/${chatId}/messages/${messagesNextIndex}`);
          await set(newMessageRef, {
            message: message,
            timestamp: formattedTimestamp,
            senderId: senderId,
            receiverId: receiverId,
            seen: false,
          });

          // Clear the input field
          setMessage('');
          setInputHeight(12);
          //setShouldAdjustHeight(true); // Ensure height adjustment after sending a messages
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }
    }
  };
  
  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser; // Get the current authenticated user
    if (user) {
      const uid = user.uid; // Retrieve the user's UID
      setUserAuthData(user); // Set the user data to the state
      console.log('User UID:', uid); // Log the UID to the console

      const participantId = participants.find(id => id !== uid);
      console.log('Participants: ', participants)
      if (participantId) {
        const participantInfo = participantsInfo[participantId];
        setCurrentParticipant(participantInfo);

        // Reference to the specific participant's data in Firebase
        const participantRef = ref(FIREBASE_DB, `/users/${participantId}`);

        // Set up a listener for the participant's online status and last seen
        const unsubscribe = onValue(
          participantRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const participantData = snapshot.val();
              setOnlineStatus(participantData.isOnline);
              setLastSeen(participantData.lastSeen);
              console.log('Participant Online Status:', participantData.isOnline);
              console.log('Participant Last Seen:', participantData.lastSeen);
            } else {
              console.log('No participant info available');
            }
          },
          (error) => {
            console.error('Error fetching participant data:', error);
          }
        );

        // Cleanup listener on component unmount
        return () => unsubscribe();
      } else {
        console.log('No other participant found');
      }
    } else {
      console.log('No user is signed in.');
    }
  }, [participants, participantsInfo]);

  const handleInputChange = (text: string) => {
    setMessage(text);
  };

  // Create a ref for FlatList
  const flatListRef = useRef<FlatList>(null);

  // Function to scroll to the end
  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    if (isFocused) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isFocused]); // This hook will run when the screen is focused
  
  // Call scrollToBottom when content size changes
  const handleMessagesListLengthChange= () => {
    scrollToBottom();
  };

  const renderMessageWithTimestamp = ({ item, index }: { item: MessageItem; index: number }) => {
    
    // Check if user authentication data is available
    const uid = user_auth_data?.uid;
  
    const currentMessageDate = new Date(item.timestamp);
    const previousMessageDate =
      index > 0 ? new Date(messages[index - 1].timestamp) : null;
  
    const isNewDay =
      !previousMessageDate ||
      currentMessageDate.toDateString() !== previousMessageDate?.toDateString();
  
    const isCurrentUser = item.senderId === uid; // Check if the message is sent by the current user
  
    return (
      <>
        {isNewDay && (
          <Box
            alignItems="center"
            mb="$4"
            bg="$secondary300"
            p="$2"
            flexDirection="row"
            justifyContent="center"
            borderRadius="$xl"
            alignSelf="center"
          >
            <Text color="#212121">
              {formatDate(item.timestamp)}
            </Text>
          </Box>
        )}
        <Box
          pr="$4"
          mb="$4"
          borderRadius="$md"
          flexDirection={isCurrentUser ? 'row-reverse' : 'row'}
        >
          <Box
            flex={1}
            borderRadius="$2xl"
            borderBottomRightRadius={isCurrentUser ? '$none' : '$2xl'}
            borderBottomLeftRadius={isCurrentUser ? '$2xl' : '$none'}
            bg={isCurrentUser ? '#00796B' : '#E1BEE7'}
            maxWidth="60%"
            style={{
              padding: 10,
              flexWrap: 'wrap',
            }}
          >
            <Text
              color={isCurrentUser ? '#FFFFFF' : '#333333'}
              style={{ flexWrap: 'wrap' }}
            >
              {item.message}
            </Text>
          </Box>
        </Box>
      </>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <VStack p="$4" mb="$3" flex={1} justifyContent="space-between">
                
          {/* 1. HEADER */} 
          <Box
            bg="$secondary200"
            p="$3"
            mr="$4"
            flexDirection="row"
            mb="$4"
            borderRadius="$xl"
          >
            {/* Left Arrow */}
            {width < 768 && (
              <VStack justifyContent="center" pr="$3">
                <Pressable
                  onPress={() => navigation.goBack()}
                >
                  <ArrowLeftIcon 
                      size="md"
                      color={"black"} 
                  />
                </Pressable>
              </VStack>
            )}
            

            {/* 1.1 Profile Picture */}
            <Avatar mr="$4">
              <AvatarFallbackText fontFamily="$heading">JD</AvatarFallbackText>
              <AvatarImage
                alt="Profile pic"
                source={{
                    uri: currentParticipant?.profileImage,
                  }}
                style={{ width: 48, height: 48 }}
              />
              <AvatarBadge bg={onlineStatus ? "green.500" : "#DC143C"} />
            </Avatar>
            

            {/* 1.2 Name and Last Seen */}
            <VStack>
              <Heading size="md" fontFamily="$heading" mb="$1">
                {currentParticipant?.name}
              </Heading>
              
              {onlineStatus && (
                <Text size="sm" fontFamily="$heading">
                  Online
                </Text>
              )}
              {!onlineStatus && (
                <Text size="sm" fontFamily="$heading">
                  Last seen {formatDate(lastSeen)} at {formatTime(lastSeen)}
                </Text>
              )}
              
            </VStack>
          </Box>
          
          {/* 2. CHAT DETAILS */}
          <Box
            style={{ height: height-270-inputHeight }}
          >
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={{ paddingBottom: 15 }}
              onContentSizeChange={handleMessagesListLengthChange}
              renderItem={renderMessageWithTimestamp}
            />
          </Box>

          {/* 3. TEXT INPUT */}
          <Box 
            justifyContent='flex-end'
            flexDirection="column"
            mt="$4"
            bg="$background"
            borderRadius="$md"
          >
            {showEmojiPicker && (
              <View 
                style={{
                  position: 'absolute',
                  bottom: 60 + inputHeight,
                  left: 0,
                  right: 0,
                  backgroundColor: '#ffffff',
                  height: 200,
                  borderRadius: 20,
                }}
              >
                <ScrollView 
                  contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}
                >
                  <EmojiSelector
                    columns={10}
                    onEmojiSelected={handleEmojiSelect}
                  />
                </ScrollView>
              </View>
            )}
            <HStack space="md" pr="$1">
              <Textarea
                size="md"
                isReadOnly={false}
                isInvalid={false}
                isDisabled={false}
                isFocused={true}
                flex={1}
                flexDirection='row'
                borderRadius="$2xl"
                style={{ height: inputHeight }}
                p="$1"
              >
                <TextareaInput
                  placeholder="Type your message ..."
                  onChangeText={handleInputChange}
                  onKeyPress={(e) => {
                    if (e.nativeEvent.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                  onContentSizeChange={(e) => {
                    const newHeight = e.nativeEvent.contentSize.height + 10;
                    if (newHeight <= 90){
                      setInputHeight(newHeight);
                    }
                  }}
                  value={message}
                />
              </Textarea>
              <Box alignSelf="center" justifyContent="center" alignItems="center" pl="$1">
                  <Pressable onPress={() => setShowEmojiPicker(!showEmojiPicker)}>
                    <Text size="2xl">😊</Text>
                  </Pressable>
              </Box>
              <Box alignSelf="center" justifyContent="center" alignItems="center">
                <Pressable onPress={() => handleSendMessage()}>
                  <Text size="xl" color="$primary600" style={{ fontWeight: 'bold' }} >Send</Text>
                  </Pressable>
              </Box>

            </HStack>
          </Box>
        </VStack>  
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
