import { Ionicons } from '@expo/vector-icons';

export interface MetricCardProps {
  number: string;
  label: string;
}

export interface ValueCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  isFullWidth?: boolean;
}

export interface ExecutiveGuide {
  name: string;
  role: string;
  avatarUrl: string;
}
