import React from 'react';
import { ScrollView } from 'react-native';
import { VStack } from '@gluestack-ui/themed';
import FiltersAppliedSection from './SideBar/FiltersAppliedSection';

const Sidebar = () => {
  return (
    <ScrollView
      style={{ flex: 1}}
      contentContainerStyle={{ flex: 1 }}
    >
      <VStack space="xl" py="$6" px="$4">
        <FiltersAppliedSection />
        <VStack space="xl" px="$2"></VStack>
      </VStack>
    </ScrollView>
  );
};
export default Sidebar;
