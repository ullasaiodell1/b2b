import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { View } from 'react-native';

export default function AddCallScreen() {
  const navigation = useNavigation<any>();
  useEffect(() => {
    navigation.goBack();
  }, []);
  return <View />;
}
