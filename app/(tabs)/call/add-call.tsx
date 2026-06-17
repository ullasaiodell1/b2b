import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';

export default function AddCallScreen() {
  const router = useRouter();
  useEffect(() => {
    router.back();
  }, []);
  return <View />;
}
