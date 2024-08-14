import React from 'react';
import { SearchIcon } from '@gluestack-ui/themed';
import { HStack, Icon, Pressable, Text } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';

const HeaderTabs = ({ selectedTab, setSelectedTab }) => {
  const router = useRouter();
  return (
    <HStack h="$20" alignItems="center" justifyContent="space-between">
      <HStack
        rounded="$full"
        p="$1.5"
        alignItems="center"
        borderWidth={1}
        borderColor="$borderLight200"
        sx={{ _dark: { borderColor: '$borderDark900' } }}
      >
        <Pressable
          rounded="$full"
          bg={selectedTab === 'Explore' ? '$backgroundLight300' : 'transparent'}
          sx={{
            _dark: {
              bg:
                selectedTab === 'Explore'
                  ? '$backgroundDark700'
                  : 'transparent',
            },
          }}
          onPress={() => {
            console.log('Explore tab selected');
            setSelectedTab('Explore');
          }}
          px="$3"
          py="$1.5"
        >
          <Text size="sm" fontWeight="$medium">
            Explore
          </Text>
        </Pressable>
        <Pressable
          rounded="$full"
          px="$3"
          py="$1.5"
          bg={selectedTab === 'Match' ? '$backgroundLight300' : 'transparent'}
          sx={{
            _dark: {
              bg:
                selectedTab === 'Match' ? '$backgroundDark700' : 'transparent',
            },
          }}
          onPress={() => {
            setSelectedTab('Match');
            router.push('/Match');
          }}
        >
          <Text size="sm" fontWeight="$medium">
            Match
          </Text>
        </Pressable>
        <Pressable
          rounded="$full"
          px="$3"
          py="$1.5"
          bg={
            selectedTab === 'Near You' ? '$backgroundLight300' : 'transparent'
          }
          sx={{
            _dark: {
              bg:
                selectedTab === 'Near You'
                  ? '$backgroundDark700'
                  : 'transparent',
            },
          }}
          onPress={() => setSelectedTab('Near You')}
        >
          <Text size="sm" fontWeight="$medium">
            Near You
          </Text>
        </Pressable>
        <Pressable ml="$3" p="$2" bg="$primary500" rounded="$full">
          <Icon as={SearchIcon} color="white" w="$4" h="$4" />
        </Pressable>
      </HStack>
    </HStack>
  );
};

export default HeaderTabs;
