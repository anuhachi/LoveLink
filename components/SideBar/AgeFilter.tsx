import React, { useEffect, useState } from 'react';
import {
  Radio,
  RadioGroup,
  RadioIndicator,
  RadioLabel,
  RadioIcon,
  CircleIcon,
  Slider,
  Text,
  VStack,
  Heading,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@gluestack-ui/themed';

import useFilterStore from './../FilterStore'

const AgeFilter = () => {
  // Accessing Zustand store values and actions
  const {
    minAge,
    maxAge,
    gender,
    ageRange,
    setMinAge,
    setMaxAge,
    setGender,
    setAgeRange,
  } = useFilterStore();

  const handleSliderChange = (min, max) => {
    setMinAge(min);
    setMaxAge(max);
  };

  const handleAgeRangeChange = (value) => {
    setAgeRange(value);
    const selectedRange = ageRangeOptions.find((option) => option.label === value);
    if (selectedRange) {
      const [min, max] = selectedRange.range;
      handleSliderChange(min, max); // Update minAge and maxAge in the store
    }
  };

  const handleGenderChange = (value) => {
    setGender(value);
  };

  const genderOptions = [
    { label: 'Men', value: 'male' },
    { label: 'Women', value: 'female' },
    { label: 'other', value: 'other' },
  ];

  const ageRangeOptions = [
    { label: '18-25', range: [18, 25] },
    { label: '26-35', range: [26, 35] },
    { label: '36-45', range: [36, 45] },
    { label: '46-60', range: [46, 60] },
  ];

  return (
    <VStack space="md">
      <Heading size="sm">Filter by Age Range</Heading>
      <Text>
        Age Range: {minAge} - {maxAge} years
      </Text>

      <VStack space="md" w="100%">
        <Text>Min Age: {minAge}</Text>
        <Slider
          minValue={18}
          maxValue={60}
          w="100%"
          value={minAge}
          onChange={(value) => handleSliderChange(Math.floor(value), maxAge)}
          aria-label="Minimum age slider"
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb aria-label={`Slider thumb at ${minAge} years`} />
        </Slider>

        <Text>Max Age: {maxAge}</Text>
        <Slider
          minValue={18}
          maxValue={60}
          w="100%"
          value={maxAge}
          onChange={(value) => handleSliderChange(minAge, Math.floor(value))}
          aria-label="Maximum age slider"
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb aria-label={`Slider thumb at ${maxAge} years`} />
        </Slider>
      </VStack>

      <RadioGroup
        value={ageRange}
        onChange={handleAgeRangeChange}
        aria-label="age range filter group"
        mt="$3"
      >
        <Heading size="sm" mb="$3">
          Filter by Age Range
        </Heading>
        <VStack space="sm">
          {ageRangeOptions.map(({ label }) => (
            <Radio value={label} size="sm" key={label} aria-label={label}>
              <RadioIndicator mr="$2">
                <RadioIcon as={CircleIcon} />
              </RadioIndicator>
              <RadioLabel>{label}</RadioLabel>
            </Radio>
          ))}
        </VStack>
      </RadioGroup>

      <RadioGroup
        value={gender}
        onChange={handleGenderChange}
        aria-label="gender filter group"
        mt="$3"
      >
        <Heading size="sm" mb="$2">
          Filter by Gender
        </Heading>
        <VStack space="sm">
          {genderOptions.map(({ label, value }) => (
            <Radio value={value} size="sm" key={value} aria-label={label}>
              <RadioIndicator mr="$2">
                <RadioIcon as={CircleIcon} />
              </RadioIndicator>
              <RadioLabel>{label}</RadioLabel>
            </Radio>
          ))}
        </VStack>
      </RadioGroup>
    </VStack>
  );
};

export default AgeFilter;
