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
import { FIREBASE_DB, FIREBASE_AUTH } from '../../screens/Login/firebaseConfig'; // Adjust the import path as necessary
import { ref, onValue, set } from 'firebase/database'; // Firebase Database imports
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const AgeFilter = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(60);
  const [genderValues, setGenderValues] = useState<string[]>(['men', 'women']);
  const [ageRange, setAgeRange] = useState<string>('18-25');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      const filtersRef = ref(FIREBASE_DB, `users/${userId}/filterApplied`);
      onValue(filtersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setMinAge(data.ageFilter.minAge || 18);
          setMaxAge(data.ageFilter.maxAge || 60);
          setGenderValues(data.genderValues || ['men', 'women']);
          setAgeRange(data.ageRange || '18-25');
        }
      });
    }
  }, [userId]);

  const handleSliderChange = (min: number, max: number) => {
    setMinAge(min);
    setMaxAge(max);
    if (userId) {
      updateFirebaseFilters(min, max, genderValues, ageRange);
    }
  };

  const handleAgeRangeChange = (value: string) => {
    setAgeRange(value);
    const selectedRange = ageRangeOptions.find(
      (option) => option.label === value
    );
    if (selectedRange) {
      handleSliderChange(selectedRange.range[0], selectedRange.range[1]);
    }
  };

  const updateFirebaseFilters = (minAge: number, maxAge: number, genderValues: string[], ageRange: string) => {
    if (userId) {
      const filtersRef = ref(FIREBASE_DB, `users/${userId}/filterApplied`);
      set(filtersRef, {
        ageFilter: {
          minAge: minAge,
          maxAge: maxAge,
        },
        applied: true,
        genderValues: genderValues,
        ageRange: ageRange,
      });
    }
  };

  const genderOptions = [
    { label: 'Men', value: 'men' },
    { label: 'Women', value: 'women' },
    { label: 'Non-binary', value: 'nonBinary' },
  ];

  const ageRangeOptions = [
    { label: '18-25', range: [18, 25] },
    { label: '26-35', range: [26, 35] },
    { label: '36-45', range: [36, 45] },
    { label: '46-60', range: [46, 60] },
  ];

  if (!userId) {
    return <Text>Please log in to view this content.</Text>;
  }

  return (
    <VStack space="md">
      <Heading size="sm">Filter by Age Range</Heading>
      <Text>
        Age Range: {minAge} - {maxAge} years
      </Text>

      <VStack space="md" w="100%">
        <Text>Min Age: {minAge}</Text>
        <Slider
          minValue={0}
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
          {ageRangeOptions.map(({ label, range }) => (
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
        value={genderValues}
        onChange={(values) => {
          setGenderValues(values);
          if (userId) {
            updateFirebaseFilters(minAge, maxAge, values, ageRange);
          }
        }}
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
