import React from 'react';
import { SearchIcon } from '@gluestack-ui/themed';
import { HStack, Icon, Pressable, Text } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';

const tabs = [
  { name: 'Home', path: '/Home' },
  { name: 'Match', path: '/Match' },
  { name: 'Messages', path: '/Chat' },
  { name: 'Settings', path: '/Settings' },
];

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
        {tabs.map((tab) => (
          <Pressable
            key={tab.name}
            rounded="$full"
            px="$3"
            py="$1.5"
            bg={
              selectedTab === tab.name ? '$backgroundLight300' : 'transparent'
            }
            sx={{
              _dark: {
                bg:
                  selectedTab === tab.name
                    ? '$backgroundDark700'
                    : 'transparent',
              },
            }}
            onPress={() => {
              setSelectedTab(tab.name);
              if (tab.path) {
                router.push(tab.path);
              }
            }}
          >
            <Text size="sm" fontWeight="$medium">
              {tab.name}
            </Text>
          </Pressable>
        ))}
        <Pressable ml="$3" p="$2" bg="$primary500" rounded="$full">
          <Icon as={SearchIcon} color="white" w="$4" h="$4" />
        </Pressable>
      </HStack>
    </HStack>
  );
};

export default HeaderTabs;
