export type MessageItem = {
    senderId: string;
    receiverId: string;
    timestamp: string;
    message: string;
    seen: boolean;
  };
  
  export type ParticipantInfoItem = {
    name: string;
    age: string;
    profileImage: string;
  }
    
  export type ChatItem = {
    id: string;
    participants: string[];
    participantsInfo: Record<string, ParticipantInfoItem>;
    messages: MessageItem[];
    lastMessage: string;
    lastMessageTimestamp: string;
  };
  
  export type AddressItem = {
    city: string;
    street: string;
    zip: string;
  };
  
  export type AgeRangeItem = {
    maxAge: number;
    minAge: number;
  };
  
  export type FilterItem = {
    ageFilter: AgeRangeItem;
    applied: boolean;
  };
  
  export type MatchesItem = {
    whoILiked: string[];
    whoLikedMe: string[];
  };
  
  export type UserItem = {
    id: string;
    name: string;
    age: string;
    bio: string;
    description: string;
    profileImage: string;
    profileImages: string[];
    gender: string;
    genderPreference: string;
    hobby: string;
    interests: string[];
    location: string;
    address: AddressItem;
    chats: string[];
    isOnline: string;
    lastSeen: string;
    filterApplied: FilterItem;
    matches: MatchesItem;
  };
    
  export type ChatDetailsParams = {
    id: string;
    participants: string[];
    participantsInfo: ParticipantInfoItem[]; 
    messagesReceived: MessageItem[];
    lastMessage: string;
    lastMessageTimestamp: string;
  };
  
  export type RootStackParamList = {
    'chat-details': ChatDetailsParams;
  }
    