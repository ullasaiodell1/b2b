import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CustomHeader from '@/components/CustomHeader';



const COLORS = {
  primary: '#346556',
  primaryLight: '#EAF4EE',
  bgPage: '#F4F7F5',
  bgWhite: '#FFFFFF',
  textDark: '#0D0F0E',
  textMuted: '#707A76',
  border: '#E8EFEC',
  backdrop: 'rgba(13, 15, 14, 0.45)',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
};

export default function AddNewScreen() {
  const router = useRouter();
  const [sheetVisible, setSheetVisible] = useState(false);

  const options = [
    {
      id: 'lead',
      label: 'New Lead',
      icon: 'person-add-outline' as const,
      color: COLORS.primary,
      onPress: () => {
        setSheetVisible(false);
        // Navigate to leads screen
        router.push('/(tabs)/leads' as any);
      },
    },
    {
      id: 'contact',
      label: 'New Contact',
      icon: 'call-outline' as const,
      color: COLORS.primary,
      onPress: () => {
        setSheetVisible(false);
        alert('Create New Contact form will open here.');
      },
    },
    {
      id: 'order',
      label: 'New Order',
      icon: 'cart-outline' as const,
      color: COLORS.primary,
      onPress: () => {
        setSheetVisible(false);
        router.push('/(tabs)/Order' as any);
      },
    },
    {
      id: 'visit',
      label: 'New Visit',
      icon: 'location-outline' as const,
      color: COLORS.primary,
      onPress: () => {
        setSheetVisible(false);
        alert('Register New Visit form will open here.');
      },
    },
    {
      id: 'task',
      label: 'New Task',
      icon: 'checkbox-outline' as const,
      color: COLORS.primary,
      onPress: () => {
        setSheetVisible(false);
        alert('Create New Task form will open here.');
      },
    },
    {
      id: 'quotation',
      label: 'New Quotation',
      icon: 'document-text-outline' as const,
      color: COLORS.primary,
      onPress: () => {
        setSheetVisible(false);
        alert('Create New Quotation form will open here.');
      },
    },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />
      
      <CustomHeader title="New Entry" showSearch={false} />

      {/* Main Empty State Container */}
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => setSheetVisible(true)}
          style={styles.circleBtn}
          activeOpacity={0.8}
        >
          <View style={styles.innerCircle}>
            <Ionicons name="add" size={56} color={COLORS.primary} />
          </View>
        </TouchableOpacity>

        <Text style={styles.title}>Add New</Text>
        <Text style={styles.subtitle}>Create a lead, order, or contact here.</Text>
      </View>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={sheetVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSheetVisible(false)}
      >
        <View style={styles.sheetBackdrop}>
          <Pressable style={styles.flexOne} onPress={() => setSheetVisible(false)} />
          
          <View style={styles.sheetContent}>
            {/* Handle bar */}
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Create New CRM Record</Text>
              <TouchableOpacity
                onPress={() => setSheetVisible(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.gridContainer}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  onPress={opt.onPress}
                  style={styles.gridItem}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconCircle}>
                    <Ionicons name={opt.icon} size={24} color={opt.color} />
                  </View>
                  <Text style={styles.itemLabel}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setSheetVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: -40, // offset header slightly for better centering
  },
  circleBtn: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E6EFEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  innerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D0E5DB',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Bottom Sheet Modal
  flexOne: {
    flex: 1,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: COLORS.backdrop,
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: COLORS.bgWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    maxHeight: '80%',
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E6E3',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F7F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#F7FAF8',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#EFF4F1',
    marginBottom: 4,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  footer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  cancelBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F4F7F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8EFEC',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
});
