import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#346556',
  primaryLight: '#EAF4EE',
  bgPage: '#F4F7F5',
  bgWhite: '#FFFFFF',
  textDark: '#0D0F0E',
  textMuted: '#707A76',
  border: '#E8EFEC',
};

// Premium visual asset URLs for Basalt corporate branding
const ASSETS = {
  aboutBg: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=600&q=80',
  aboutInset: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=350&q=80',
  chooseBg: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600&q=80',
  chooseInset: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=350&q=80',
  executives: [
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80', // Jaydip Gadhiya
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80', // Dharm Gami
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', // Executive 3
  ]
};

interface MetricCardProps {
  number: string;
  label: string;
}

function MetricCard({ number, label }: MetricCardProps) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricTextContainer}>
        <Text style={styles.metricNumber}>{number}</Text>
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
      <View style={styles.metricRightLine} />
    </View>
  );
}

interface ValueCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  isFullWidth?: boolean;
}

function ValueCard({ icon, title, isFullWidth = false }: ValueCardProps) {
  return (
    <View style={[styles.valueCard, isFullWidth && styles.valueCardFull]}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
      <Text style={styles.valueTitle}>{title}</Text>
    </View>
  );
}

export default function CompanyInfoScreen() {
  const insets = useSafeAreaInsets();

  const handleContact = () => {
    Alert.alert('Get In Touch', 'Inquiry message form opened. Let\'s build together!');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgWhite} />

      {/* ── HEADER ────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 16), justifyContent: 'center', position: 'relative' }]}>
        <View style={styles.centerLogoSection}>
          <Ionicons name="star" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
          <Text style={styles.logoText}>BASALT</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ── ABOUT US ──────────────────────────────── */}
        <Text style={styles.sectionTitle}>| ABOUT US</Text>
        <Text style={styles.taglineText}>
          Crafting Memorable <Text style={styles.italicGreen}>Hospitality</Text> Since 2016
        </Text>
        <Text style={styles.bodyText}>
          {"At BASALT, We Believe True Luxury Lies In The Details. Since 2016, We've Been Redefining Hotel Experiences With Innovative Amenities, Sustainable Cleaning Solutions, And Ayurveda-Inspired Wellness Essentials. Every Product We Design Blends Modern Functionality With Timeless Elegance, Ensuring Comfort For Guests And Peace Of Mind For Hoteliers."}
        </Text>

        {/* Metrics Row Grid */}
        <View style={styles.metricsContainer}>
          <MetricCard number="10+" label="Years Of Excellence" />
          <MetricCard number="250+" label="Premium Hotel Products" />
          <MetricCard number="250+" label="Projects Completed" />
        </View>

        {/* Overlapping Products Image Block */}
        <View style={styles.overlappingImageContainer}>
          <Image source={{ uri: ASSETS.aboutBg }} style={styles.aboutBgImage} />
          <Image source={{ uri: ASSETS.aboutInset }} style={styles.aboutSubImage} />
        </View>

        {/* ── OUR VISION ────────────────────────────── */}
        <Text style={styles.sectionTitle}>| OUR VISION</Text>
        <Text style={styles.bodyText}>
          To Become A Globally Recognized Leader In Premium Hospitality And Lifestyle Solutions By Delivering Innovative, Sustainable, And Beautifully Crafted Products That Elevate Comfort, Elegance, And Customer Experience While Setting New Standards Of Quality And Excellence In The Industry.
        </Text>

        {/* ── OUR MISSION ───────────────────────────── */}
        <Text style={styles.sectionTitle}>| OUR MISSION</Text>
        <Text style={styles.bodyText}>
          Our Mission Is To Combine Craftsmanship, Innovation, And Sustainability To Create Products And Experiences That Enhance Luxury Hospitality And Everyday Living. We Strive To Build Meaningful Connections With Our Customers, Operate With Integrity And Transparency, And Continuously Deliver Exceptional Value Through Quality, Creativity, And Responsible Growth.
        </Text>

        {/* ── OUR VALUE ─────────────────────────────── */}
        <Text style={styles.sectionTitle}>| OUR VALUE</Text>
        <View style={styles.valuesContainer}>
          <View style={styles.valuesRow}>
            <ValueCard icon="shield-checkmark-outline" title="TRUST" />
            <ValueCard icon="people-outline" title="TEAM WORK" />
          </View>
          <View style={styles.valuesRow}>
            <ValueCard icon="git-pull-request-outline" title="COMMITMENT" />
            <ValueCard icon="heart-outline" title="HONESTY" />
          </View>
          <View style={styles.valuesRow}>
            <ValueCard icon="bulb-outline" title="INNOVATION" />
            <ValueCard icon="document-text-outline" title="TRANSPARENCY" />
          </View>
          <ValueCard icon="ribbon-outline" title="QUALITY & EXCELLENCE" isFullWidth />
        </View>

        {/* ── WHY CHOOSE THE BASALT ──────────────────── */}
        <Text style={styles.sectionTitle}>| WHY CHOOSE THE BASALT</Text>
        <Text style={styles.taglineText}>
          The Basalt Promise <Text style={styles.italicGreen}>Excellence</Text> In Every Detail
        </Text>

        <View style={styles.whyList}>
          {/* Reason 01 */}
          <View style={styles.whyItem}>
            <Text style={styles.whyNumber}>01</Text>
            <View style={styles.whyTextContainer}>
              <Text style={styles.whyTitle}>Innovation</Text>
              <Text style={styles.whyDesc}>We use continuous R&D to lead with the latest in hotel amenities and eco-friendly solutions.</Text>
            </View>
          </View>

          {/* Reason 02 */}
          <View style={styles.whyItem}>
            <Text style={styles.whyNumber}>02</Text>
            <View style={styles.whyTextContainer}>
              <Text style={styles.whyTitle}>Quality & Reliability</Text>
              <Text style={styles.whyDesc}>Our products are carefully crafted from premium materials to ensure lasting excellence.</Text>
            </View>
          </View>

          {/* Reason 03 */}
          <View style={styles.whyItem}>
            <Text style={styles.whyNumber}>03</Text>
            <View style={styles.whyTextContainer}>
              <Text style={styles.whyTitle}>Sustainability</Text>
              <Text style={styles.whyDesc}>{"We're dedicated to a green promise, with eco-friendly packaging and responsible sourcing."}</Text>
            </View>
          </View>
        </View>

        {/* Overlapping Why Image Block */}
        <View style={styles.overlappingImageContainer}>
          <Image source={{ uri: ASSETS.chooseBg }} style={styles.aboutBgImage} />
          <Image source={{ uri: ASSETS.chooseInset }} style={styles.aboutSubImage} />
        </View>

        {/* ── OUR GUIDES ────────────────────────────── */}
        <Text style={styles.sectionTitle}>| OUR GUIDES</Text>
        <Text style={styles.taglineText}>
          Meet Our <Text style={styles.italicGreen}>Committed</Text> Team
        </Text>
        <Text style={styles.bodyText}>
          Our Diverse Team Of Experts Is Passionate About Delivering Innovative Solutions And Building Lasting Partnerships.
        </Text>

        {/* Vertical Team Cards */}
        <View style={styles.teamList}>
          {/* Jaydip Gadhiya */}
          <View style={styles.teamCard}>
            <Image source={{ uri: ASSETS.executives[0] }} style={styles.teamImage} />
            <Text style={styles.teamLabel}>JAYDIP GADHIYA FOUNDER & CEO</Text>
          </View>

          {/* Dharm Gami */}
          <View style={styles.teamCard}>
            <Image source={{ uri: ASSETS.executives[1] }} style={styles.teamImage} />
            <Text style={styles.teamLabel}>DHARM GAMI HEAD OF DESIGN</Text>
          </View>

          {/* Darshan Solanki */}
          <View style={styles.teamCard}>
            <Image source={{ uri: ASSETS.executives[2] }} style={styles.teamImage} />
            <Text style={styles.teamLabel}>PARTH SOLANKI VP OF PRODUCT</Text>
          </View>
        </View>

        {/* ── PARTNER WITH BASALT TODAY ────────────────── */}
        <View style={styles.partnerCard}>
          <Text style={styles.partnerTitle}>| PARTNER WITH BASALT TODAY</Text>
          <Text style={styles.partnerText}>
            {"Let's Work Together To Create Extraordinary Guest Experiences With Solutions That Define Luxury And Sustainability."}
          </Text>
          <TouchableOpacity onPress={handleContact} style={styles.contactBtn} activeOpacity={0.9}>
            <Text style={styles.contactBtnText}>Get In Touch</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: COLORS.bgWhite,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  centerLogoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
    paddingBottom: 50,
  },

  // Titles
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textDark,
    marginTop: 8,
  },
  taglineText: {
    fontSize: 12.5,
    color: COLORS.textDark,
    fontWeight: '600',
    marginTop: -6,
  },
  italicGreen: {
    color: COLORS.primary,
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  bodyText: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
    fontWeight: '600',
  },
  brandBold: {
    fontWeight: '800',
    color: COLORS.primary,
  },

  // Metrics
  metricsContainer: {
    gap: 10,
  },
  metricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  metricTextContainer: {
    flex: 1,
    gap: 2,
  },
  metricNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  metricRightLine: {
    width: 2.5,
    height: 28,
    backgroundColor: COLORS.primary,
    borderRadius: 1.5,
  },

  // Overlapping images
  overlappingImageContainer: {
    height: 240,
    marginVertical: 10,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  aboutBgImage: {
    width: '90%',
    height: 200,
    borderRadius: 16,
    alignSelf: 'flex-end',
    backgroundColor: '#E5E7EB',
  },
  aboutSubImage: {
    width: 140,
    height: 140,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    position: 'absolute',
    top: 10,
    left: 0,
    backgroundColor: '#D1D5DB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  // Values Grid
  valuesContainer: {
    gap: 8,
  },
  valuesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  valueCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgWhite,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 11,
    paddingHorizontal: 12,
    gap: 8,
  },
  valueCardFull: {
    flex: 0,
    width: '100%',
    justifyContent: 'center',
  },
  valueTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: 0.2,
  },

  // Why choose list
  whyList: {
    gap: 12,
  },
  whyItem: {
    flexDirection: 'row',
    gap: 12,
  },
  whyNumber: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 2,
  },
  whyTextContainer: {
    flex: 1,
    gap: 2,
  },
  whyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  whyDesc: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    lineHeight: 14,
    fontWeight: '600',
  },

  // Guides
  teamList: {
    gap: 16,
    marginVertical: 4,
  },
  teamCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    alignItems: 'center',
    gap: 10,
  },
  teamImage: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  teamLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // Partnership CTA
  partnerCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    marginVertical: 10,
  },
  partnerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  partnerText: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
    fontWeight: '600',
  },
  contactBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  contactBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
