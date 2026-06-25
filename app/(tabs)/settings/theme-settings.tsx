import CustomHeader from '@/components/custom/CustomHeader';
import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Standard premium theme colors to match the design grid
const GRID_COLORS = [
  '#346556', '#2E7D32', '#1B5E20', '#4CAF50', '#81C784', '#C8E6C9',
  '#FF3D00', '#FF6D00', '#FF9100', '#FFAB00', '#FFE082', '#FFF9C4',
  '#E65100', '#F57C00', '#FFB74D', '#FFE0B2', '#FFF3E0', '#FAF9F6',
  '#D84315', '#F4511E', '#FF8A65', '#FFCCBC', '#FBE9E7', '#FFF5F5',
  '#C62828', '#E53935', '#EF5350', '#EF9A9A', '#FFCDD2', '#FFEBEE',
  '#8E24AA', '#AB47BC', '#BA68C8', '#CE93D8', '#E1BEE7', '#F3E5F5',
  '#1565C0', '#1E88E5', '#42A5F5', '#90CAF9', '#BBDEFB', '#E3F2FD',
  '#006064', '#00838F', '#00ACC1', '#4DD0E1', '#B2EBF2', '#E0F7FA',
  '#004D40', '#00695C', '#00897B', '#4DB6AC', '#B2DFDB', '#E0F2F1',
  '#37474F', '#455A64', '#546E7A', '#78909C', '#90A4AE', '#CFD8DC',
  '#212121', '#424242', '#616161', '#757575', '#9E9E9E', '#BDBDBD',
  '#4F46E5', '#EC4899', '#F59E0B', '#06B6D4',
];

const APPLIED_SCREENS = [
  'Dashboard / Home',
  'Attendance Tracker',
  'Leads Management',
  'Company Directory',
  'Orders & Quotations',
  'Meetings Schedule',
  'Tasks List',
  'Profile Settings',
];

export default function ThemeSettingsScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const navigation = useNavigation<any>();
  const { primaryColor, setPrimaryColor } = useTheme();

  const [selectedColor, setSelectedColor] = useState(primaryColor);
  const [activeTab, setActiveTab] = useState<'solid' | 'gradient' | 'palette'>('solid');

  const handleSave = () => {
    setPrimaryColor(selectedColor);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      <CustomHeader
        showBack={true}
        showSearch={false}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Color Preview Block */}
        <View style={[styles.previewBlock, { backgroundColor: selectedColor }] as any}>
          <Text style={styles.previewText}>SP</Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'gradient' && styles.tabBtnActive] as any}
            onPress={() => setActiveTab('gradient')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'gradient' && styles.tabBtnTextActive] as any}>
              Gradient
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'solid' && styles.tabBtnActive] as any}
            onPress={() => setActiveTab('solid')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'solid' && styles.tabBtnTextActive] as any}>
              Solid Colour
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'palette' && styles.tabBtnActive] as any}
            onPress={() => setActiveTab('palette')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'palette' && styles.tabBtnTextActive] as any}>
              Palette
            </Text>
          </TouchableOpacity>
        </View>

        {/* Choose Label */}
        <Text style={styles.chooseLabel}>
          Choose {activeTab === 'solid' ? 'Solid' : activeTab === 'gradient' ? 'Gradient' : 'Palette'}:
        </Text>

        {/* Colors Grid */}
        <View style={styles.gridContainer}>
          {GRID_COLORS.map((color, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.colorCircle,
                { backgroundColor: color },
                selectedColor === color && styles.colorCircleSelected,
              ] as any}
              onPress={() => {
                setSelectedColor(color);
                // Instantly update global theme — all screens update immediately
                setPrimaryColor(color);
              }}
              activeOpacity={0.8}
            />
          ))}
        </View>

        {/* Applied Screens List */}
        <Text style={styles.chooseLabel}>Theme Applied In:</Text>
        <View style={styles.appliedScreensList}>
          {APPLIED_SCREENS.map((screen, idx) => (
            <Text key={idx} style={styles.screenText}>
              • {screen}
            </Text>
          ))}
        </View>
      </ScrollView>

      {/* Save Button Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: selectedColor }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveBtnText}>Save Theme</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
  },


  scrollContent: {
    padding: 5,
    gap: 5,
    paddingBottom: 150,
  },

  // Preview block
  previewBlock: {
    height: 100,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  previewText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: theme.primaryLight,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  tabBtnTextActive: {
    color: theme.primaryColor,
    fontWeight: '800',
  },

  chooseLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 1,
  },

  // Color selection grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#0D0F0E',
    transform: [{ scale: 1.1 }],
  },
  footer: {
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 88 : 62,
    backgroundColor: COLORS.bgWhite,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveBtn: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  appliedScreensList: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
    marginTop: 8,
  },
  screenText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textMid,
  },
});
