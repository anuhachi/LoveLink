import React from 'react';

import { VStack, ScrollView } from '@gluestack-ui/themed';
import FiltersAppliedSection from './SideBar/FiltersAppliedSection';
import AgeFilter from './SideBar/AgeFilter';

const Sidebar = () => {
  return (
    <ScrollView style={{ flex: 1 }}>
      <VStack space="xl" py="$6" px="$4">
        {/*<FiltersAppliedSection />*/}
        <VStack space="xl" px="$2">
          <AgeFilter />
        </VStack>
      </VStack>
    </ScrollView>
  );
};
export default Sidebar;
