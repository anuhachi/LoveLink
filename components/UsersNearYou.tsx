import React from 'react';
import {
  Box,
  Button,
  HStack,
  Icon,
  Image,
  Pressable,
  Text,
  Tooltip,
  VStack,
} from '@gluestack-ui/themed';
import { ChevronRight, Heart, Star } from 'lucide-react-native';
import { AnimatePresence, Motion } from '@legendapp/motion';
import { ScrollView } from 'react-native';


const datingAppInfoData = [
  {
    name: 'John Doe',
    src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Z2lybCUyMHByb2ZpbGUlMjBwaWN0dXJlfGVufDB8fDB8fHww',
    location: 'New York, United States',
    age: 29,
    interests: ['Music', 'Sports', 'Traveling'],
  },
  {
    name: 'Jane Smith',
    src: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Z2lybCUyMHByb2ZpbGUlMjBwaWN0dXJlfGVufDB8fDB8fHww',
    location: 'California, United States',
    age: 25,
    interests: ['Cooking', 'Reading', 'Hiking'],
  },
  {
    name: 'Robert Johnson',
    src: 'https://plus.unsplash.com/premium_photo-1663089338262-7ba2fd07481d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Z2lybCUyMHByb2ZpbGUlMjBwaWN0dXJlfGVufDB8fDB8fHww',
    location: 'Florida, United States',
    age: 31,
    interests: ['Photography', 'Fitness', 'Gaming'],
  },
];

// data for the tabs

const tabsData = [
  {
    title: 'New Matches',
  },
  {
    title: 'Messages',
  },
  {
    title: 'Top Picks',
  },
  {
    title: 'Recently Active',
  },
  {
    title: 'Nearby',
  },
  {
    title: 'Favorites',
  },
  {
    title: 'Visitors',
  },
  {
    title: 'Liked You',
  },
  {
    title: 'Preferences',
  }
];

const HomestayInformationFold = () => {
  return (
    <Box pb="$8" px="$4" sx={{ '@md': { px: 0 } }}>
      <HomestayInfoTabs tabsData={tabsData} />
      <TabPanelData />
    </Box>
  );
};

const HomestayInfoTabs = ({ tabsData }: any) => {
  const [activeTab, setActiveTab] = React.useState(tabsData[0]);
  return (
    <Box
      borderBottomWidth={1}
      borderColor="$borderLight50"
      sx={{
        '@md': { borderColor: 'transparent', borderBottomWidth: 0 },
        '_dark': { borderColor: '$borderDark900' },
      }}
    >
      <Box py="$5">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <HStack space="lg" mx="$0.5">
            {tabsData.map((tab: any) => {
              return (
                <Pressable
                  key={tab.title}
                  my="$0.5"
                  py="$1"
                  borderBottomWidth={activeTab === tab ? 3 : 0}
                  borderColor="$borderLight900"
                  sx={{
                    ':hover': {
                      borderBottomWidth: 3,
                      borderColor:
                        activeTab === tab
                          ? '$borderLight900'
                          : '$borderLight200',
                    },
                    '_dark': {
                      'borderColor': '$borderDark100',
                      ':hover': {
                        borderColor:
                          activeTab === tab
                            ? '$borderDark100'
                            : '$borderDark700',
                      },
                    },
                  }}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text
                    size="sm"
                    color={
                      activeTab === tab ? '$textLight900' : '$textLight600'
                    }
                    sx={{
                      _dark: {
                        color:
                          activeTab === tab ? '$textDark50' : '$textDark400',
                      },
                    }}
                    fontWeight="$medium"
                  >
                    {tab.title}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
        </ScrollView>
      </Box>
    </Box>
  );
};

const TabPanelData = () => {
  const [likes, setLikes]: any = React.useState([]);
  return (
    <Box
      sx={{
        'display': 'grid',
        'gap': '$4',
        'gridTemplateColumns': 'repeat(1, 1fr)',
        '@sm': {
          gridTemplateColumns: 'repeat(2, 1fr)',
        },
        '@lg': {
          gridTemplateColumns: 'repeat(3, 1fr)',
        },
      }}
    >
      {datingAppInfoData.map((profile: any, index: any) => {
        return (
          <Box
            key={index}
            sx={{
              'my': '$2',
              '@lg': {
                my: 0,
              },
            }}
          >
            <Pressable w="100%">
              {(props: any) => {
                return (
                  <>
                    <Box overflow="hidden" borderRadius="$md" h="$72">
                      <Image
                        source={profile.src}
                        h="$72"
                        w="100%"
                        transform={[{ scale: props.hovered ? 1.04 : 1 }]}
                        opacity={props.hovered ? 0.9 : 1}
                        alt={profile.name}
                      />
                    </Box>
                    {props.hovered && (
                      <Box
                        position="absolute"
                        bg="$backgroundDark950"
                        opacity={0.3}
                        w="100%"
                        h="100%"
                      />
                    )}
                    <Button
                      action="secondary"
                      variant="outline"
                      position="absolute"
                      top="45%"
                      bg="transparent"
                      borderColor="white"
                      alignSelf="center"
                      zIndex={5}
                      display={props.hovered ? 'flex' : 'none'}
                    >
                      <Button.Text color="white">View Profile</Button.Text>
                      <Button.Icon as={ChevronRight} color="white" />
                    </Button>
                  </>
                );
              }}
            </Pressable>
            <Pressable
              onPress={() => {
                if (likes.includes(profile.name)) {
                  const newLikes = likes.filter(
                    (like: any) => like !== profile.name
                  );
                  setLikes(newLikes);
                  return;
                } else {
                  setLikes([...likes, profile.name]);
                }
              }}
              position="absolute"
              top={12}
              right={16}
              h="$6"
              w="$6"
              justifyContent="center"
              alignItems="center"
            >
              <AnimatePresence>
                <Motion.View
                  key={likes.includes(profile.name) ? 'liked' : 'unliked'}
                  initial={{
                    scale: 1.3,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  exit={{
                    scale: 0.9,
                  }}
                  transition={{
                    type: 'spring',
                    mass: 0.9,
                    damping: 9,
                    stiffness: 300,
                  }}
                  style={{
                    position: 'absolute',
                  }}
                >
                  <Icon
                    as={Heart}
                    size="lg"
                    color={
                      likes.includes(profile.name) === true ? 'red' : 'white'
                    }
                    fill={
                      likes.includes(profile.name) === true ? 'red' : 'gray'
                    }
                  />
                </Motion.View>
              </AnimatePresence>
            </Pressable>
            <HStack
              justifyContent="space-between"
              py="$2"
              alignItems="flex-start"
            >
              <VStack space="$sm" flex={1}>
                <Text
                  fontWeight="$semibold"
                  color="$textLight900"
                  sx={{
                    _dark: { color: '$textDark200' },
                  }}
                >
                  {profile.name}, {profile.age}
                </Text>
                <Text
                  size="sm"
                  color="$textLight500"
                  sx={{
                    _dark: { color: '$textDark500' },
                  }}
                >
                  {profile.location}
                </Text>
                <Text
                  size="sm"
                  fontWeight="$semibold"
                  color="$textLight900"
                  sx={{
                    _dark: { color: '$textDark200' },
                  }}
                >
                  Interests: {profile.interests.join(', ')}
                </Text>
              </VStack>
            </HStack>
          </Box>
        );
      })}
    </Box>
  );
};

export default HomestayInformationFold;
