import { AddMeetingComponent } from '@/components/meeting/AddMeetingComponent';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function CalendarAddMeetingScreen() {
  const navigation = useNavigation();

  return (
    <View style={s.container}>
      <AddMeetingComponent
        onSuccess={() => navigation.goBack()}
        onCancel={() => navigation.goBack()}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
