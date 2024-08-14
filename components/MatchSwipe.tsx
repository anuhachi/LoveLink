import React from 'react';
import {
  Box,
  Button,
  Card,
  HStack,
  Icon,
  Image,
  Pressable,
  Text,
  Tooltip,
  ButtonText,
  VStack,
  Heading,
} from '@gluestack-ui/themed';
import { ChevronRight, Heart, Star } from 'lucide-react-native';
import { AnimatePresence, Motion } from '@legendapp/motion';
import { ScrollView, StyleSheet } from 'react-native';
import TinderCard from 'react-tinder-card';
import Swiper from 'react-native-deck-swiper';
import AntDesign from '@expo/vector-icons/AntDesign';

const onSwipe = (direction: any) => {
  console.log('You swiped: ' + direction);
};

const onCardLeftScreen = (myIdentifier: any) => {
  console.log(myIdentifier + ' left the screen');
};

const MatchSwipe = () => {
  return (
    <Box pb="$8" px="$4" sx={{ '@md': { px: 0 } }}>
      <TabPanelData />
    </Box>
  );
};

const TabPanelData = () => {
  const [likes, setLikes]: any = React.useState([]);
  return (
    <Box>
      <Box
        sx={{
          'my': '$2',
          '@lg': {
            my: 0,
          },
        }}
      >
        {/* Like and Dislike Buttons */}
        <HStack mt="$2" mb="$5" width="100%">
          <Button
            onPress={() => console.log('Dislike')}
            variant="outline"
            colorScheme="red"
            flex={1}
            ml="$2"
            mr="$2"
          >
            <Text>Dislike</Text>
          </Button>
          <Button
            onPress={() => console.log('Like')}
            colorScheme="green"
            flex={1}
            ml="$2"
            mr="$2"
          >
            <AntDesign name="hearto" size={28} color="white" />
          </Button>
        </HStack>
        <TinderCard
          onSwipe={onSwipe}
          onCardLeftScreen={() => onCardLeftScreen('fooBar')}
          preventSwipe={['up', 'down']}
        >
          <Image
            mb="$50"
            h={400}
            width="$full"
            borderRadius="$md"
            source={{
              uri: 'https://images.unsplash.com/photo-1595231712325-9fedecef7575?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDJ8fHxlbnwwfHx8fHw%3D',
            }}
          />
        </TinderCard>
      </Box>
    </Box>
  );
};

export default MatchSwipe;
