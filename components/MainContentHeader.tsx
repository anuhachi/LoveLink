import React from 'react';
import {
  Box,
  Button,
  ButtonIcon,
  ButtonText,
  Heading,
  HStack,
} from '@gluestack-ui/themed';
import { List } from 'lucide-react-native';

const MainContentHeader = () => {
  return (
    <Box pt="$6" pb="$2.5" px="$4" sx={{ '@md': { px: 0 } }}>
      <HStack w="100%" alignItems="center" justifyContent="space-between">
        <Heading size="xl">New Likes this week</Heading>
        {/* Hidden for mobile screens */}
        <Button
          display="none"
          sx={{
            '@md': {
              display: 'flex',
            },
          }}
          ml="auto"
          variant="outline"
          action="secondary"
        >
          <ButtonIcon as={List} />
          <ButtonText
            pl="$2"
            sx={{
              _light: {
                color: '$textLight800',
              },
              _dark: {
                color: '$textDark300',
              },
            }}
          >
            List your place
          </ButtonText>
        </Button>
      </HStack>
    </Box>
  );
};

export default MainContentHeader;
