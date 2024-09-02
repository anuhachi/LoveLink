import React, { useState } from 'react';
import {
  Button,
  Checkbox,
  Image,
  HStack,
  VStack,
  Text,
  Link,
  Divider,
  Icon,
  Center,
  FormControl,
  Box,
  LinkText,
  Input,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  InputIcon,
  FormControlHelper,
  Toast,
  ToastTitle,
  useToast,
  ButtonIcon,
  CheckboxIndicator,
  CheckboxIcon,
  CheckboxLabel,
  CheckIcon,
  ButtonText,
  Heading,
  ArrowLeftIcon,
  InputField,
  InputSlot,
} from '@gluestack-ui/themed';

import { Controller, useForm } from 'react-hook-form';
import { AlertTriangle, EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Keyboard } from 'react-native';

import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'; // Import Firebase functions
import { FIREBASE_AUTH, FIREBASE_DB } from './firebaseConfig'; // Import Firebase Auth
import { ref, set } from 'firebase/database'; // Import Realtime Database functions

import { FacebookIcon, GoogleIcon } from './assets/Icons/Social';

import GuestLayout from '../../layouts/GuestLayout';

import StyledExpoRouterLink from '../../components/StyledExpoRouterLink';
import { router } from 'expo-router';

import { styled } from '@gluestack-style/react';

const StyledImage = styled(Image, {
  props: {
    style: {
      height: 90,
      width: 320,
    },
  },
});

const signUpSchema = z.object({
  email: z.string().min(1, 'Email is required').email(),
  password: z
    .string()
    .min(6, 'Must be at least 8 characters in length')
    .regex(new RegExp('.*[A-Z].*'), 'One uppercase character')
    .regex(new RegExp('.*[a-z].*'), 'One lowercase character')
    .regex(new RegExp('.*\\d.*'), 'One number')
    .regex(
      new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'),
      'One special character'
    ),
  confirmpassword: z
    .string()
    .min(6, 'Must be at least 8 characters in length')
    .regex(new RegExp('.*[A-Z].*'), 'One uppercase character')
    .regex(new RegExp('.*[a-z].*'), 'One lowercase character')
    .regex(new RegExp('.*\\d.*'), 'One number')
    .regex(
      new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'),
      'One special character'
    ),
  rememberme: z.boolean().optional(),
});

type SignUpSchemaType = z.infer<typeof signUpSchema>;

function SideContainerWeb() {
  return (
    <Center
      bg="$primary500"
      flex={1}
      sx={{
        _dark: {
          bg: '$primary500',
        },
      }}
    >
      <StyledImage
        h="$40"
        w="$320"
        alt="gluestack-ui Pro"
        resizeMode="contain"
        source={require('./assets/images/logo_loveLink_light-cropped.svg')}
      />
    </Center>
  );
}

function MobileHeader() {
  return (
    <VStack px="$3" mt="$4.5" mb="$5" space="md">
      <HStack space="md" alignItems="center">
        <StyledExpoRouterLink href="..">
          <Icon
            as={ArrowLeftIcon}
            color="$textLight50"
            sx={{ _dark: { color: '$textDark50' } }}
          />
        </StyledExpoRouterLink>

        <Text
          color="$textLight50"
          sx={{ _dark: { color: '$textDark50' } }}
          fontSize="$lg"
        >
          Sign Up
        </Text>
      </HStack>
      <VStack space="xs" ml="$1" my="$4">
        <Heading color="$textLight50" sx={{ _dark: { color: '$textDark50' } }}>
          Welcome
        </Heading>
        <Text
          color="$primary300"
          fontSize="$md"
          sx={{
            _dark: {
              color: '$textDark400',
            },
          }}
        >
          Sign up to continue
        </Text>
      </VStack>
    </VStack>
  );
}

const SignUpForm = () => {
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema),
  });
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [pwMatched, setPwMatched] = useState(false);
  const toast = useToast();

  const onSubmit = async (data: SignUpSchemaType) => {
    if (data.password === data.confirmpassword) {
      try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(
          FIREBASE_AUTH,
          data.email,
          data.password
        );

        // Get the user UID
        const uid = userCredential.user.uid;

        // Initialize Realtime Database reference
        const userRef = ref(FIREBASE_DB, 'users/' + uid);

        // Define user data according to the specified structure
        const userData = {
          address: {
            city: '', // Add default or user-provided values
            street: '',
            zip: '',
          },
          age: '', // Default or user-provided value
          bio: '',
          id: uid, // Add user_auth_data UID
          description: '',
          gender: '',
          genderPreference: '',
          hobby: '',
          interests: [],
          location: '',
          matches: {
            whoILiked: [0],
            whoLikedMe: [0],
          },
          messages: [],
          name: '', // Add default or user-provided values
          profilecomplete: false, // Default value
          DOB: false, // Default value
          profileImage: `https://robohash.org/${uid}`, // Default RoboHash URL with user_auth_data UID
          profileImages: [
            `https://robohash.org/${uid}`, // Example of additional RoboHash images
          ],
        };

        // Set user data in Realtime Database
        await set(userRef, userData);

        toast.show({
          placement: 'bottom right',
          render: ({ id }) => {
            return (
              <Toast id={id} variant="accent" action="success">
                <ToastTitle>
                  Signed up and user profile created successfully
                </ToastTitle>
              </Toast>
            );
          },
        });

        reset();
        router.push('/Settings'); // Redirect to login page
      } catch (error: any) {
        toast.show({
          placement: 'bottom right',
          render: ({ id }) => {
            return (
              <Toast id={id} action="error">
                <ToastTitle>{error.message}</ToastTitle>
              </Toast>
            );
          },
        });
      }
    } else {
      toast.show({
        placement: 'bottom right',
        render: ({ id }) => {
          return (
            <Toast id={id} action="error">
              <ToastTitle>Passwords do not match</ToastTitle>
            </Toast>
          );
        },
      });
    }
  };

  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleState = () => {
    setShowPassword((showState) => {
      return !showState;
    });
  };
  const handleConfirmPwState = () => {
    setShowConfirmPassword((showState) => {
      return !showState;
    });
  };

  return (
    <>
      <VStack justifyContent="space-between">
        <FormControl
          isInvalid={(!!errors.email || isEmailFocused) && !!errors.email}
          isRequired={true}
        >
          <Controller
            name="email"
            defaultValue=""
            control={control}
            rules={{
              validate: async (value) => {
                try {
                  await signUpSchema.parseAsync({ email: value });
                  return true;
                } catch (error: any) {
                  return error.message;
                }
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input>
                <InputField
                  placeholder="Email"
                  fontSize="$sm"
                  type="text"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleKeyPress}
                  returnKeyType="done"
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon size="md" as={AlertTriangle} />
            <FormControlErrorText>
              {errors?.email?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl isInvalid={!!errors.password} isRequired={true} my="$6">
          <Controller
            defaultValue=""
            name="password"
            control={control}
            rules={{
              validate: async (value) => {
                try {
                  await signUpSchema.parseAsync({
                    password: value,
                  });
                  return true;
                } catch (error: any) {
                  return error.message;
                }
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input>
                <InputField
                  fontSize="$sm"
                  placeholder="Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleKeyPress}
                  returnKeyType="done"
                  type={showPassword ? 'text' : 'password'}
                />
                <InputSlot onPress={handleState} pr="$3">
                  <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                </InputSlot>
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon size="sm" as={AlertTriangle} />
            <FormControlErrorText>
              {errors?.password?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl isInvalid={!!errors.confirmpassword} isRequired={true}>
          <Controller
            defaultValue=""
            name="confirmpassword"
            control={control}
            rules={{
              validate: async (value) => {
                try {
                  await signUpSchema.parseAsync({
                    password: value,
                  });

                  return true;
                } catch (error: any) {
                  return error.message;
                }
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input>
                <InputField
                  placeholder="Confirm Password"
                  fontSize="$sm"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleKeyPress}
                  returnKeyType="done"
                  type={showConfirmPassword ? 'text' : 'password'}
                />
                <InputSlot onPress={handleConfirmPwState} pr="$3">
                  <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                </InputSlot>
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon size="sm" as={AlertTriangle} />
            <FormControlErrorText>
              {errors?.confirmpassword?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
      </VStack>
      <Controller
        name="rememberme"
        defaultValue={false}
        control={control}
        render={({ field: { onChange, value } }) => (
          <Checkbox
            size="sm"
            value="Remember me"
            isChecked={value}
            onChange={onChange}
            alignSelf="flex-start"
            mt="$5"
          >
            <CheckboxIndicator mr="$2">
              <CheckboxIcon as={CheckIcon} />
            </CheckboxIndicator>
            <CheckboxLabel
              sx={{
                _text: {
                  fontSize: '$sm',
                },
              }}
            >
              I accept the{' '}
              <Link>
                <LinkText
                  sx={{
                    _ios: {
                      marginTop: '$0.5',
                    },
                    _android: {
                      marginTop: '$0.5',
                    },
                  }}
                >
                  Terms of Use
                </LinkText>
              </Link>{' '}
              &{' '}
              <Link>
                <LinkText
                  sx={{
                    _ios: {
                      marginTop: '$0.5',
                    },
                    _android: {
                      marginTop: '$0.5',
                    },
                  }}
                >
                  Privacy Policy
                </LinkText>
              </Link>
            </CheckboxLabel>
          </Checkbox>
        )}
      />
      <Button
        mt="$5"
        variant="solid"
        size="lg"
        onPress={handleSubmit(onSubmit)}
      >
        <ButtonText fontSize="$sm">SIGN UP</ButtonText>
      </Button>
    </>
  );
};

function SignUpFormComponent() {
  const toast = useToast();
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(FIREBASE_AUTH, provider);

      // Google access token can be used for further integration if needed
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      const user = result.user;

      // Initialize Realtime Database reference

      const userRef = ref(FIREBASE_DB, 'users/' + user.uid);

      // Define user data according to the specified structure
      const userData = {
        address: {
          city: '',
          street: '',
          zip: '',
        },
        age: '',
        bio: '',
        description: '',
        gender: '',
        genderPreference: '',
        hobby: '',
        interests: [],
        location: '',
        id: user.uid,
        matches: {
          whoILiked: [0],
          whoLikedMe: [0],
        },
        messages: [],
        name: user.displayName || '', // Use the name from Google profile
        profilecomplete: false,
        DOB: false,
        profileImage: `https://robohash.org/${user.uid}`, // Use the Google profile image or fallback
        profileImages: [
          `https://robohash.org/${user.uid}`, // Example of additional images
        ],
      };

      // Set user data in Realtime Database
      await set(userRef, userData);

      // Handle success - show a success message
      toast.show({
        placement: 'bottom right',
        render: ({ id }) => (
          <Toast id={id} variant="accent" action="success">
            <ToastTitle>Signed in with Google successfully</ToastTitle>
          </Toast>
        ),
      });

      // Redirect to /setting
      router.replace('/Settings');
    } catch (error) {
      // Handle errors and show error message
      toast.show({
        placement: 'bottom right',
        render: ({ id }) => (
          <Toast id={id} variant="accent" action="error">
            <ToastTitle>
              {error.message || 'An error occurred during Google sign-in'}
            </ToastTitle>
          </Toast>
        ),
      });

      // Redirect to /setting even in case of an error
      router.replace('/Settings');
    }
  };
  return (
    <>
      <Box
        sx={{
          '@md': {
            display: 'none',
          },
        }}
      >
        <MobileHeader />
      </Box>

      <Box
        flex={1}
        bg="$backgroundLight0"
        sx={{
          '@md': {
            px: '$8',
            borderTopLeftRadius: '$none',
            borderTopRightRadius: '$none',
            borderBottomRightRadius: '$none',
          },
          '_dark': {
            bg: '$backgroundDark800',
          },
        }}
        px="$4"
        py="$8"
        justifyContent="space-between"
        borderTopLeftRadius="$2xl"
        borderTopRightRadius="$2xl"
        borderBottomRightRadius="$none"
      >
        <Heading
          display="none"
          mb="$8"
          sx={{
            '@md': { display: 'flex', fontSize: '$2xl' },
          }}
        >
          Sign up to continue
        </Heading>

        <SignUpForm />

        <HStack my="$4" space="md" alignItems="center" justifyContent="center">
          <Divider
            w="$2/6"
            bg="$backgroundLight200"
            sx={{ _dark: { bg: '$backgroundDark700' } }}
          />
          <Text
            fontWeight="$medium"
            color="$textLight400"
            sx={{ _dark: { color: '$textDark300' } }}
          >
            or
          </Text>
          <Divider
            w="$2/6"
            bg="$backgroundLight200"
            sx={{ _dark: { bg: '$backgroundDark700' } }}
          />
        </HStack>
        <HStack
          sx={{
            '@md': {
              mt: '$4',
            },
          }}
          mt="$6"
          mb="$9"
          alignItems="center"
          justifyContent="center"
          space="lg"
        >
          <Link href="">
            <Button action="secondary" variant="link" onPress={() => {}}>
              <ButtonIcon as={FacebookIcon} />
            </Button>
          </Link>

          <Button
            action="secondary"
            variant="link"
            onPress={handleGoogleSignIn}
          >
            <ButtonIcon as={GoogleIcon} size="md" />
          </Button>
        </HStack>

        <HStack
          space="xs"
          alignItems="center"
          justifyContent="center"
          mt="auto"
        >
          <Text
            color="$textLight500"
            sx={{
              _dark: {
                color: '$textDark400',
              },
            }}
            fontSize="$sm"
          >
            Already have an account?
          </Text>

          <StyledExpoRouterLink href="/login">
            <LinkText fontSize="$sm">Sign In</LinkText>
          </StyledExpoRouterLink>
        </HStack>
      </Box>
    </>
  );
}

export default function SignUp() {
  return (
    <GuestLayout>
      <Box
        sx={{
          '@md': {
            display: 'flex',
          },
        }}
        flex={1}
        display="none"
      >
        <SideContainerWeb />
      </Box>
      <Box flex={1}>
        <SignUpFormComponent />
      </Box>
    </GuestLayout>
  );
}
