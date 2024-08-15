import React from 'react';
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

export default function Settings() {
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

          {/* Account Information Section */}
          <VStack mb="$4">
            <Heading size="sm" mb="$3">
              Account Information
            </Heading>
            <FormControl mb="$3">
              <FormControl.Label>Email</FormControl.Label>
              <Input placeholder="janedoe@sample.com" />
            </FormControl>
            <FormControl mb="$3">
              <FormControl.Label>Password</FormControl.Label>
              <Input placeholder="••••••••" secureTextEntry />
            </FormControl>
          </VStack>

          {/* Personal Information Section */}
          <VStack mb="$4">
            <Heading size="sm" mb="$3">
              Personal Information
            </Heading>
            <FormControl mb="$3">
              <FormControl.Label>Address</FormControl.Label>
              <Input placeholder="1234 Main St" />
            </FormControl>
            <FormControl mb="$3">
              <FormControl.Label>Gender</FormControl.Label>
              <Select placeholder="Select Gender">
                <Select.Item label="Male" value="male" />
                <Select.Item label="Female" value="female" />
                <Select.Item label="Non-binary" value="non-binary" />
                <Select.Item label="Other" value="other" />
              </Select>
            </FormControl>
            <FormControl mb="$3">
              <FormControl.Label>Date of Birth</FormControl.Label>
              <Input placeholder="MM/DD/YYYY" />
            </FormControl>
          </VStack>

          {/* Preferences Section */}
          <VStack mb="$4">
            <Heading size="sm" mb="$3">
              Preferences
            </Heading>
            <FormControl mb="$3">
              <FormControl.Label>Looking For</FormControl.Label>
              <Select placeholder="Select Preference">
                <Select.Item label="Men" value="men" />
                <Select.Item label="Women" value="women" />
                <Select.Item label="Everyone" value="everyone" />
              </Select>
            </FormControl>
            <FormControl mb="$3">
              <FormControl.Label>Max Distance</FormControl.Label>
              <Input placeholder="50 miles" />
            </FormControl>
          </VStack>

          {/* Save Button */}
          <Button
            mt="$5"
            colorScheme="primary"
            onPress={() => console.log('Save Settings')}
          >
            <Text>Save Settings</Text>
          </Button>
        </VStack>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
