import React from 'react';
import { router } from 'expo-router';
import { AddLeadComponent } from '@/components/lead/AddLeadComponent';

export default function AddLeadScreen() {
  const handleBack = () => {
    router.replace('/(tabs)');
  };

  return (
    <AddLeadComponent
      onCancel={handleBack}
      onSuccess={handleBack}
    />
  );
}
