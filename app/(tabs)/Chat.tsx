import { StyleSheet } from 'react-native';
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
  Heading,
  Input,
  Button,
  Select,
  FormControl,
} from '@gluestack-ui/themed';

import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useWindowDimensions, Image } from 'react-native';

export default function Tab() {
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, flexDirection: 'row' }}
      >
        {/* Sidebar: Only visible on screens wider than 768px */}
        {width > 768 && (
          <Box flex={1}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1620403724159-40363e84a155?q=80&w=2646&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </Box>
        )}

        {/* Main content */}
        <VStack flex={2} p="$4">
          {/* Profile Section */}
          <Box
            bg="$primary100"
            p="$5"
            flexDirection="row"
            mb="$4"
            borderRadius="$md"
          >
            <Avatar mr="$4">
              <AvatarFallbackText fontFamily="$heading">JD</AvatarFallbackText>
              <AvatarImage
                source={{
                  uri: 'https://images.unsplash.com/photo-1620403724159-40363e84a155?q=80&w=2646&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                }}
              />
              <AvatarBadge bg="green.500" />
            </Avatar>
            <VStack>
              <Heading size="md" fontFamily="$heading" mb="$1">
                Jane Doe
              </Heading>
              <Text size="sm" fontFamily="$heading">
                janedoe@sample.com
              </Text>
            </VStack>
          </Box>
        </VStack>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
