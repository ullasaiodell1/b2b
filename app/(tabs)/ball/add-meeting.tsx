import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { AddMeetingComponent } from '@/components/meeting/AddMeetingComponent';

export default function AddMeetingScreen() {
  const params = useLocalSearchParams<{ leadId?: string; leadName?: string; company?: string }>();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <AddMeetingComponent
      initialLeadId={params.leadId}
      initialLeadName={params.leadName}
      initialLeadCompany={params.company}
      onCancel={handleBack}
      onSuccess={handleBack}
    />
  );
}
