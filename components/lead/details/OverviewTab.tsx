import { COLORS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLeadActivity } from '@/hooks/useActivity';
import { useLeadAttachments } from '@/hooks/useAttachments';
import { useCalls } from '@/hooks/useCalls';
import { useLeadContacts } from '@/hooks/useContacts';
import { useLeadInterestedProducts } from '@/hooks/useInterestedProducts';
import { useVisits } from '@/hooks/useVisits';
import { useMeetings } from '@/hooks/useMeetings';
import { useTasks, useUpdateTask } from '@/hooks/useTasks';
import { useReminders } from '@/hooks/useReminders';
import { MeetingCard } from '@/components/meeting/MeetingCard';
import { TaskCard } from '@/components/task/TaskCard';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useMemo, useRef } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface DetailRowProps {
  label: string;
  value: string;
  required?: boolean;
  onPress?: () => void;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, required, onPress }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  const cleanLabel = label.trim().toLowerCase();
  const cleanValue = value ? value.trim() : '';
  const isLinkable =
    cleanValue &&
    cleanValue !== '----' &&
    cleanValue !== '—' &&
    (!!onPress ||
      cleanLabel.includes('email') ||
      cleanLabel.includes('phone') ||
      cleanLabel.includes('mobile'));

  const handlePress = () => {
    if (!isLinkable) return;
    if (onPress) {
      onPress();
    } else if (cleanLabel.includes('email')) {
      Linking.openURL(`mailto:${cleanValue}`).catch((err) =>
        console.error('Failed to open email:', err)
      );
    } else if (cleanLabel.includes('phone') || cleanLabel.includes('mobile')) {
      Linking.openURL(`tel:${cleanValue}`).catch((err) =>
        console.error('Failed to open phone:', err)
      );
    }
  };

  return (
    <View style={styles.detailRow}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.detailLabel}>{label}</Text>
        {required && <Text style={{ color: '#EF4444', marginLeft: 2, fontWeight: 'bold' }}>*</Text>}
      </View>
      {isLinkable ? (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
          <Text
            style={[
              styles.detailValue,
              {
                color: cleanLabel.includes('phone') || cleanLabel.includes('mobile') ? '#16A34A' : '#2563EB',
                textDecorationLine: 'underline',
              },
            ]}
            numberOfLines={1}
          >
            {value}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.detailValue} numberOfLines={1}>
          {value}
        </Text>
      )}
    </View>
  );
};

function formatAmount(amount?: number | null) {
  if (amount == null) return '₹ 0.00';
  return '₹ ' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

interface OverviewTabProps {
  leadId: string;
  dbLead: any;
  rawLead: any;
}

export default function OverviewTab({ leadId, dbLead, rawLead }: OverviewTabProps) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();

  // Fetch lists
  const { data: attachments = [] } = useLeadAttachments(leadId);
  const { data: interestedProducts = [] } = useLeadInterestedProducts(leadId);
  const { data: contacts = [] } = useLeadContacts(leadId);
  const visitsQuery = useVisits({ lead_id: leadId });
  const meetingsQuery = useMeetings({ lead_id: leadId });
  const tasksQuery = useTasks({ lead_id: leadId });
  const remindersQuery = useReminders({ leadId });
  const { data: dbCallsRaw } = useCalls();
  const { data: dbActivity = [] } = useLeadActivity(leadId);
  const updateTaskMutation = useUpdateTask();

  const dbVisits = useMemo(() => {
    const raw = visitsQuery.data as any;
    if (!raw) return [];
    const list = Array.isArray(raw) ? raw : (Array.isArray(raw.data) ? raw.data : (Array.isArray(raw.data?.data) ? raw.data.data : []));
    return list.filter((v: any) => String(v.lead_id) === String(leadId));
  }, [visitsQuery.data, leadId]);

  const dbMeetings = useMemo(() => {
    const raw = meetingsQuery.data as any;
    if (!raw) return [];
    const list = Array.isArray(raw) ? raw : (Array.isArray(raw.data) ? raw.data : (Array.isArray(raw.data?.data) ? raw.data.data : (Array.isArray(raw.followups) ? raw.followups : (Array.isArray(raw.results) ? raw.results : []))));
    return list.filter((m: any) => String(m.lead_id) === String(leadId));
  }, [meetingsQuery.data, leadId]);

  const dbTasks = useMemo(() => {
    const raw = tasksQuery.data as any;
    if (!raw) return [];
    const list = Array.isArray(raw) ? raw : (Array.isArray(raw.data) ? raw.data : (Array.isArray(raw.data?.data) ? raw.data.data : []));
    return list.filter((t: any) => String(t.lead_id) === String(leadId));
  }, [tasksQuery.data, leadId]);

  const dbReminders = useMemo(() => {
    const raw = remindersQuery.data as any;
    if (!raw) return [];
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray(raw.data)
        ? raw.data
        : Array.isArray(raw.results)
          ? raw.results
          : [];
    return list.filter((r: any) => String(r.lead_id) === String(leadId));
  }, [remindersQuery.data, leadId]);

  const dbCalls = useMemo(() => {
    const rawLogs = dbCallsRaw?.allLogs;
    if (!rawLogs) return [];
    return rawLogs.filter((log: any) => String(log.lead_id) === String(leadId));
  }, [dbCallsRaw, leadId]);

  // Accordion expansion states
  const [leadInfoExpanded, setLeadInfoExpanded] = useState(true);
  const [addressExpanded, setAddressExpanded] = useState(true);
  const [interestedProductsExpanded, setInterestedProductsExpanded] = useState(false);
  const [attachmentsExpanded, setAttachmentsExpanded] = useState(false);
  const [contactsExpanded, setContactsExpanded] = useState(false);
  const [visitExpanded, setVisitExpanded] = useState(false);
  const [meetingExpanded, setMeetingExpanded] = useState(false);
  const [taskExpanded, setTaskExpanded] = useState(false);
  const [callExpanded, setCallExpanded] = useState(false);
  const [reminderExpanded, setReminderExpanded] = useState(false);
  const [activityExpanded, setActivityExpanded] = useState(false);

  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const isNavigatingRef = useRef(false);

  const leadName = dbLead?.name || '----';
  const leadCompany = dbLead?.company || '----';
  const leadEmail = dbLead?.email || '----';
  const leadPhone = dbLead?.phone || '----';
  const leadTag = dbLead?.tag || '----';
  const leadOwner = dbLead?.owner || '----';

  const handleOpenMap = () => {
    const parts = [
      dbLead?.address_line1,
      dbLead?.address_line2,
      dbLead?.city_name || dbLead?.city,
      dbLead?.state_name || dbLead?.state,
      dbLead?.country_name || dbLead?.country,
      dbLead?.pincode
    ];
    const query = parts
      .map(part => part ? String(part).trim() : '')
      .filter(part => part && part !== '----' && part !== '—')
      .join(', ');
    if (query) {
      Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(query)}`).catch((err) =>
        console.error('Failed to open maps:', err)
      );
    }
  };

  const handleViewList = (type: 'Call' | 'Meeting' | 'Task' | 'Visit') => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    if (type === 'Call') {
      navigation.navigate('call' as never, {
        screen: 'index',
        params: {
          leadId,
          leadName,
          company: leadCompany !== '----' ? leadCompany : '',
          phone: leadPhone !== '----' ? leadPhone : '',
          email: leadEmail !== '----' ? leadEmail : '',
          referrer: 'lead-details',
        }
      } as never);
    } else {
      const localScreenMap: Record<string, string> = {
        Meeting: 'lead-meeting',
        Task: 'lead-task',
        Visit: 'lead-visit',
      };
      navigation.navigate(localScreenMap[type] as never, {
        leadId,
        leadName,
        phone: leadPhone !== '----' ? leadPhone : '',
        email: leadEmail !== '----' ? leadEmail : '',
        referrer: 'lead-details',
      } as never);
    }
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000);
  };

  const handleAddAction = (type: 'Call' | 'Meeting' | 'Task' | 'Visit' | 'Reminder') => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    if (type === 'Call') {
      navigation.navigate('call' as never, {
        screen: 'add-call',
        params: {
          leadId,
          leadName,
          phone: leadPhone !== '----' ? leadPhone : '',
        }
      } as never);
    } else if (type === 'Meeting') {
      navigation.navigate('lead-add-meeting' as never, {
        leadId,
        leadName,
        company: leadCompany !== '----' ? leadCompany : '',
      } as never);
    } else if (type === 'Task') {
      navigation.navigate('lead-add-task' as never, {
        leadId,
        leadName,
      } as never);
    } else if (type === 'Visit') {
      navigation.navigate('lead-add-visit' as never, {
        leadId,
        leadName,
        company: leadCompany !== '----' ? leadCompany : '',
      } as never);
    } else if (type === 'Reminder') {
      navigation.navigate('Reminder' as never, {
        screen: 'add-reminder',
        params: {
          leadId,
          leadName,
          leadCompany: leadCompany !== '----' ? leadCompany : '',
          referrer: 'lead-details',
        }
      } as never);
    }
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000);
  };

  return (
    <View style={{ gap: 5 }}>
      {/* ACCORDION 1: LEAD INFORMATION */}
      <View style={styles.accordionCard}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setLeadInfoExpanded(!leadInfoExpanded)}
          activeOpacity={0.85}
        >
          <View style={styles.accordionTitleLeft}>
            <View style={styles.indicatorBar} />
            <Text style={styles.accordionTitleText}>LEAD INFORMATION</Text>
          </View>
          <View style={styles.chevronBg}>
            <Ionicons
              name={leadInfoExpanded ? "chevron-up" : "chevron-down"}
              size={16}
              color={COLORS.textDark}
            />
          </View>
        </TouchableOpacity>

        {leadInfoExpanded && (
          <View style={styles.accordionContent}>
            <DetailRow label="lead owner" value={leadOwner} />
            <DetailRow label="Company" value={leadCompany} required />
            <DetailRow label="Lead Name" value={leadName} />
            <DetailRow label="Title" value={dbLead?.designation || "----"} />
            <DetailRow label="Email" value={leadEmail} />
            <DetailRow label="Phone" value={leadPhone} />
            <DetailRow label="Mobile" value={dbLead?.alternate_phone || "----"} />
            <DetailRow label="Website" value={dbLead?.website || "----"} />
            <DetailRow label="Lead Source" value={leadTag} />
            <DetailRow label="Lead Status" value={dbLead?.status_name || dbLead?.status || "----"} />
            <DetailRow label="Created By" value={dbLead?.created_by_name || leadOwner} />
            <DetailRow label="Modified By" value={leadOwner} />
            <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={[styles.detailValue, { textAlign: 'left', marginTop: 6 }]} numberOfLines={0}>
                {dbLead?.remarks || '----'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* ACCORDION 2: ADDRESS */}
      <View style={styles.accordionCard}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setAddressExpanded(!addressExpanded)}
          activeOpacity={0.85}
        >
          <View style={styles.accordionTitleLeft}>
            <View style={styles.indicatorBar} />
            <Text style={styles.accordionTitleText}>ADDRESS</Text>
          </View>
          <View style={styles.chevronBg}>
            <Ionicons
              name={addressExpanded ? "chevron-up" : "chevron-down"}
              size={16}
              color={COLORS.textDark}
            />
          </View>
        </TouchableOpacity>

        {addressExpanded && (
          <View style={styles.accordionContent}>
            <DetailRow
              label="Address Line 1"
              value={dbLead?.address_line1 || "----"}
              onPress={dbLead?.address_line1 && dbLead?.address_line1 !== '----' && dbLead?.address_line1 !== '—' ? handleOpenMap : undefined}
            />
            <DetailRow
              label="Address Line 2"
              value={dbLead?.address_line2 || "----"}
              onPress={dbLead?.address_line2 && dbLead?.address_line2 !== '----' && dbLead?.address_line2 !== '—' ? handleOpenMap : undefined}
            />
            <DetailRow
              label="Country"
              value={dbLead?.country_name || dbLead?.country || "----"}
              onPress={(dbLead?.country_name || dbLead?.country) && (dbLead?.country_name || dbLead?.country) !== '----' && (dbLead?.country_name || dbLead?.country) !== '—' ? handleOpenMap : undefined}
            />
            <DetailRow
              label="State"
              value={dbLead?.state_name || dbLead?.state || "----"}
              onPress={(dbLead?.state_name || dbLead?.state) && (dbLead?.state_name || dbLead?.state) !== '----' && (dbLead?.state_name || dbLead?.state) !== '—' ? handleOpenMap : undefined}
            />
            <DetailRow
              label="City"
              value={dbLead?.city_name || dbLead?.city || "----"}
              onPress={(dbLead?.city_name || dbLead?.city) && (dbLead?.city_name || dbLead?.city) !== '----' && (dbLead?.city_name || dbLead?.city) !== '—' ? handleOpenMap : undefined}
            />
            <DetailRow
              label="Pincode"
              value={dbLead?.pincode || "----"}
              onPress={dbLead?.pincode && dbLead?.pincode !== '----' && dbLead?.pincode !== '—' ? handleOpenMap : undefined}
            />
          </View>
        )}
      </View>

      {/* Accordion 3: INTERESTED PRODUCTS */}
      <View style={styles.accordionCard}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setInterestedProductsExpanded(!interestedProductsExpanded)}
          activeOpacity={0.85}
        >
          <View style={styles.accordionTitleLeft}>
            <View style={styles.indicatorBar} />
            <Text style={styles.accordionTitleText}>INTERESTED PRODUCTS</Text>
            <View style={styles.badgeCountChip}>
              <Text style={styles.badgeCountText}>{interestedProducts.length}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              style={styles.addBtnCircle}
              onPress={(e) => {
                e.stopPropagation();
                if (isNavigatingRef.current) return;
                isNavigatingRef.current = true;
                navigation.navigate('interested-products' as never, {
                  leadId,
                  leadName,
                } as never);
                setTimeout(() => { isNavigatingRef.current = false; }, 1000);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="list" size={12} color={theme.primaryColor} />
            </TouchableOpacity>
            <View style={styles.chevronBg}>
              <Ionicons
                name={interestedProductsExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={COLORS.textDark}
              />
            </View>
          </View>
        </TouchableOpacity>

        {interestedProductsExpanded && (
          <View style={styles.accordionContent}>
            {interestedProducts.length === 0 ? (
              <Text style={styles.noDataText}>No interested products found.</Text>
            ) : (
              interestedProducts.map((prod: any, index: number) => {
                const pName = prod.product_name || prod.name || 'Product';
                const pCode = prod.code || prod.sku;
                const pPrice = prod.selling_price || prod.price;

                return (
                  <View
                    key={prod.id || index}
                    style={[
                      styles.miniItemRow,
                      {
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        paddingLeft: 17,
                        paddingRight: 6,
                      },
                      index === interestedProducts.length - 1 && { borderBottomWidth: 0 }
                    ]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[styles.miniItemTitle, { flexShrink: 1, marginRight: 8 }]} numberOfLines={1}>
                        {pName}
                      </Text>
                      <Text style={[styles.miniItemStatus, { color: '#059669', fontSize: 12.5, fontWeight: '800', flexShrink: 0 }]}>
                        {formatAmount(pPrice)}
                      </Text>
                    </View>
                    {pCode ? (
                      <Text style={[styles.miniItemSub, { marginTop: 2 }]}>#{pCode}</Text>
                    ) : null}
                  </View>
                );
              })
            )}
          </View>
        )}
      </View>

      {/* Accordion 4: ATTACHMENTS */}
      <View style={styles.accordionCard}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setAttachmentsExpanded(!attachmentsExpanded)}
          activeOpacity={0.85}
        >
          <View style={styles.accordionTitleLeft}>
            <View style={styles.indicatorBar} />
            <Text style={styles.accordionTitleText}>ATTACHMENTS</Text>
            <View style={styles.badgeCountChip}>
              <Text style={styles.badgeCountText}>{attachments.length}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              style={styles.addBtnCircle}
              onPress={(e) => {
                e.stopPropagation();
                if (isNavigatingRef.current) return;
                isNavigatingRef.current = true;
                navigation.navigate('lead-attachments' as never, {
                  leadId,
                  leadName,
                  openUpload: 'true',
                } as never);
                setTimeout(() => { isNavigatingRef.current = false; }, 1000);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={14} color={theme.primaryColor} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addBtnCircle}
              onPress={(e) => {
                e.stopPropagation();
                if (isNavigatingRef.current) return;
                isNavigatingRef.current = true;
                navigation.navigate('lead-attachments' as never, {
                  leadId,
                  leadName,
                } as never);
                setTimeout(() => { isNavigatingRef.current = false; }, 1000);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="list" size={12} color={theme.primaryColor} />
            </TouchableOpacity>
            <View style={styles.chevronBg}>
              <Ionicons
                name={attachmentsExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={COLORS.textDark}
              />
            </View>
          </View>
        </TouchableOpacity>

        {attachmentsExpanded && (
          <View style={[styles.accordionContent, { paddingHorizontal: 12 }]}>
            {attachments.length === 0 ? (
              <Text style={styles.noDataText}>No attachments found.</Text>
            ) : (
              <View style={styles.attachmentsGrid}>
                {attachments.map((item: any, index: number) => {
                  const isPdf = item.type.toUpperCase() === 'PDF';
                  const isImage = ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF'].includes(
                    item.type.toUpperCase()
                  );
                  const iconName = isPdf
                    ? 'document-text'
                    : isImage
                      ? 'image'
                      : 'document';
                  const iconColor = isPdf ? '#EF4444' : isImage ? '#10B981' : '#6B7280';

                  return (
                    <TouchableOpacity
                      key={item.id || index}
                      style={styles.gridAttachmentCard}
                      onPress={() => {
                        const isImg = ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF'].includes(
                          item.type.toUpperCase()
                        );
                        if (isImg) {
                          setPreviewImageUrl(item.url);
                        } else {
                          Linking.openURL(item.url).catch(() => {
                            Alert.alert('Cannot Open', 'No handler found for this attachment link.');
                          });
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      {isImage ? (
                        <Image
                          source={{ uri: item.url }}
                          style={styles.gridCardImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.gridCardIconBg, { backgroundColor: iconColor + '10' }]}>
                          <Ionicons name={iconName} size={28} color={iconColor} />
                          <Text style={[styles.gridCardExtensionText, { color: iconColor, marginTop: 4, fontWeight: '800' }]}>{item.type.toUpperCase()}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </View>

      {/* Accordion 5: CONTACTS */}
      <View style={styles.accordionCard}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setContactsExpanded(!contactsExpanded)}
          activeOpacity={0.85}
        >
          <View style={styles.accordionTitleLeft}>
            <View style={styles.indicatorBar} />
            <Text style={styles.accordionTitleText}>CONTACTS</Text>
            <View style={styles.badgeCountChip}>
              <Text style={styles.badgeCountText}>{contacts.length}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              style={styles.addBtnCircle}
              onPress={(e) => {
                e.stopPropagation();
                if (isNavigatingRef.current) return;
                isNavigatingRef.current = true;
                navigation.navigate('lead-contacts' as never, {
                  leadId,
                  leadName,
                  openAdd: 'true',
                } as never);
                setTimeout(() => { isNavigatingRef.current = false; }, 1000);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={14} color={theme.primaryColor} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addBtnCircle}
              onPress={(e) => {
                e.stopPropagation();
                if (isNavigatingRef.current) return;
                isNavigatingRef.current = true;
                navigation.navigate('lead-contacts' as never, {
                  leadId,
                  leadName,
                } as never);
                setTimeout(() => { isNavigatingRef.current = false; }, 1000);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="list" size={12} color={theme.primaryColor} />
            </TouchableOpacity>
            <View style={styles.chevronBg}>
              <Ionicons
                name={contactsExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={COLORS.textDark}
              />
            </View>
          </View>
        </TouchableOpacity>

        {contactsExpanded && (
          <View style={styles.accordionContent}>
            {contacts.length === 0 ? (
              <Text style={styles.noDataText}>No contacts found.</Text>
            ) : (
              contacts.map((item: any, index: number) => {
                return (
                  <View
                    key={item.id || index}
                    style={{
                      paddingVertical: 6,
                      paddingLeft: 17,
                      paddingRight: 6,
                      borderBottomWidth: index === contacts.length - 1 ? 0 : 1,
                      borderBottomColor: '#F3F4F6',
                    }}
                  >
                    <View style={styles.contactMiniHeader}>
                      <Text style={styles.contactMiniName}>{item.fullName}</Text>
                      {item.isPrimary && (
                        <View style={styles.contactMiniPrimaryBadge}>
                          <Text style={styles.contactMiniPrimaryText}>PRIMARY</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.contactMiniDetailsRow}>
                      {item.email ? (
                        <TouchableOpacity onPress={() => Linking.openURL(`mailto:${item.email}`)} activeOpacity={0.7} style={{ flexShrink: 1 }}>
                          <Text style={[styles.contactMiniText, { color: '#2563EB', textDecorationLine: 'underline', fontWeight: '700' }]} numberOfLines={1}>
                            {item.email}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                      {item.email && item.phone ? (
                        <View style={styles.contactMiniDivider} />
                      ) : null}
                      {item.phone ? (
                        <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phone}`)} activeOpacity={0.7} style={{ flexShrink: 0 }}>
                          <Text style={[styles.contactMiniText, { color: '#16A34A', textDecorationLine: 'underline', fontWeight: '700' }]} numberOfLines={1}>
                            {item.phone}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                      {!item.email && !item.phone ? (
                        <Text style={styles.contactMiniText}>—</Text>
                      ) : null}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </View>

      {/* Accordion 6: VISIT */}
      <View style={styles.accordionCard}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setVisitExpanded(!visitExpanded)}
          activeOpacity={0.85}
        >
          <View style={styles.accordionTitleLeft}>
            <View style={styles.indicatorBar} />
            <Text style={styles.accordionTitleText}>VISIT</Text>
            <View style={styles.badgeCountChip}>
              <Text style={styles.badgeCountText}>{dbVisits.length}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              style={styles.addBtnCircle}
              onPress={(e) => {
                e.stopPropagation();
                handleAddAction('Visit');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={14} color={theme.primaryColor} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addBtnCircle}
              onPress={(e) => {
                e.stopPropagation();
                handleViewList('Visit');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="list" size={12} color={theme.primaryColor} />
            </TouchableOpacity>
            <View style={styles.chevronBg}>
              <Ionicons
                name={visitExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={COLORS.textDark}
              />
            </View>
          </View>
        </TouchableOpacity>

        {visitExpanded && (
          <View style={styles.accordionContent}>
            {dbVisits.length === 0 ? (
              <Text style={styles.noDataText}>No visits found.</Text>
            ) : (
              dbVisits.map((visit: any, index: number) => {
                const dateStr = formatDate(visit.visit_date || visit.scheduled_time || visit.date);
                return (
                  <TouchableOpacity
                    key={visit.id || index}
                    style={styles.miniItemRow}
                    onPress={() => {
                      if (isNavigatingRef.current) return;
                      isNavigatingRef.current = true;
                      navigation.navigate('lead-visit-details' as never, {
                        id: visit.id, referrer: 'lead-details', leadId
                      } as never);
                      setTimeout(() => { isNavigatingRef.current = false; }, 1000);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.miniItemTitle}>{visit.title || visit.purpose || 'Visit'}</Text>
                      <Text style={styles.miniItemSub}>
                        {visit.company || visit.lead_company_name || '—'} · {dateStr}
                      </Text>
                      {visit.location_address ? (
                        <Text style={styles.miniItemSub} numberOfLines={1}>{visit.location_address}</Text>
                      ) : null}
                    </View>
                    <Text style={[styles.miniItemStatus, { color: COLORS.green }]}>
                      {visit.status || 'Complete'}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}
      </View>

      {/* Accordion 7: MEETING */}
      <View style={styles.accordionCard}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setMeetingExpanded(!meetingExpanded)}
          activeOpacity={0.85}
        >
          <View style={styles.accordionTitleLeft}>
            <View style={styles.indicatorBar} />
            <Text style={styles.accordionTitleText}>MEETING</Text>
            <View style={styles.badgeCountChip}>
              <Text style={styles.badgeCountText}>{dbMeetings.length}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              style={styles.addBtnCircle}
              onPress={(e) => {
                e.stopPropagation();
                handleAddAction('Meeting');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={14} color={theme.primaryColor} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addBtnCircle}
              onPress={(e) => {
                e.stopPropagation();
                handleViewList('Meeting');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="list" size={12} color={theme.primaryColor} />
            </TouchableOpacity>
            <View style={styles.chevronBg}>
              <Ionicons
                name={meetingExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={COLORS.textDark}
              />
            </View>
          </View>
        </TouchableOpacity>

        {meetingExpanded && (
          <View style={styles.accordionContent}>
            {dbMeetings.length === 0 ? (
              <Text style={styles.noDataText}>No meetings found.</Text>
            ) : (
              dbMeetings.map((meeting: any, index: number) => (
                <MeetingCard
                  key={meeting.id || index}
                  meeting={meeting}
                  isCompact={true}
                  onPress={() => {
                    if (isNavigatingRef.current) return;
                    isNavigatingRef.current = true;
                    navigation.navigate('lead-meeting-details' as never, {
                      id: String(meeting.id)
                    } as never);
                    setTimeout(() => { isNavigatingRef.current = false; }, 1000);
                  }}
                />
              ))
            )}
          </View>
        )}
      </View>

      {/* Accordion 8: TASK */}
      <View style={styles.accordionCard}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setTaskExpanded(!taskExpanded)}
          activeOpacity={0.85}
        >
          <View style={styles.accordionTitleLeft}>
            <View style={styles.indicatorBar} />
            <Text style={styles.accordionTitleText}>TASK</Text>
            <View style={styles.badgeCountChip}>
              <Text style={styles.badgeCountText}>{dbTasks.length}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              style={styles.addBtnCircle}
              onPress={(e) => {
                e.stopPropagation();
                handleAddAction('Task');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={14} color={theme.primaryColor} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addBtnCircle}
              onPress={(e) => {
                e.stopPropagation();
                handleViewList('Task');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="list" size={12} color={theme.primaryColor} />
            </TouchableOpacity>
            <View style={styles.chevronBg}>
              <Ionicons
                name={taskExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={COLORS.textDark}
              />
            </View>
          </View>
        </TouchableOpacity>

        {taskExpanded && (
          <View style={styles.accordionContent}>
            {dbTasks.length === 0 ? (
              <Text style={styles.noDataText}>No tasks found.</Text>
            ) : (
              dbTasks.map((task: any, index: number) => (
                <TaskCard
                  key={task.id || index}
                  task={task}
                  onToggleCompletion={async () => {
                    try {
                      const currentStatus = String(task.status || '').toUpperCase();
                      const nextStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED';
                      await updateTaskMutation.mutateAsync({ id: task.id, data: { status: nextStatus } });
                    } catch (err) {
                      console.error('Failed to toggle task completion from lead details:', err);
                    }
                  }}
                  onPress={() => {
                    if (isNavigatingRef.current) return;
                    isNavigatingRef.current = true;
                    navigation.navigate('lead-task-details' as never, {
                      id: task.id,
                      title: task.title,
                      due: task.due_date ? new Date(task.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
                      due_date: task.due_date,
                      priority: task.priority,
                      status: task.status,
                      description: task.description || '',
                      assigned_to: task.assigned_to || '',
                      assigned_to_name: task.assigned_to_fullname || task.assigned_to_name || '',
                      lead_id: task.lead_id || '',
                    } as never);
                    setTimeout(() => { isNavigatingRef.current = false; }, 1000);
                  }}
                />
              ))
            )}
          </View>
        )}
      </View>

      {/* Accordion 9: CALL */}
      <View style={styles.accordionCard}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setCallExpanded(!callExpanded)}
          activeOpacity={0.85}
        >
          <View style={styles.accordionTitleLeft}>
            <View style={styles.indicatorBar} />
            <Text style={styles.accordionTitleText}>CALL</Text>
            <View style={styles.badgeCountChip}>
              <Text style={styles.badgeCountText}>{dbCalls.length}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              style={styles.addBtnCircle}
              onPress={(e) => {
                e.stopPropagation();
                handleViewList('Call');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="list" size={12} color={theme.primaryColor} />
            </TouchableOpacity>
            <View style={styles.chevronBg}>
              <Ionicons
                name={callExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={COLORS.textDark}
              />
            </View>
          </View>
        </TouchableOpacity>

        {callExpanded && (
          <View style={styles.accordionContent}>
            {dbCalls.length === 0 ? (
              <Text style={styles.noDataText}>No calls found.</Text>
            ) : (
              dbCalls.map((log: any, index: number) => {
                let callTypeLabel = 'Incoming';
                let callTypeColor = COLORS.incoming;
                if (log.call_type === 'OUTBOUND') {
                  callTypeLabel = 'Outgoing';
                  callTypeColor = COLORS.outgoing;
                } else if (log.call_type === 'MISSED') {
                  callTypeLabel = 'Missed';
                  callTypeColor = COLORS.missed;
                }

                let durationStr = '00:00';
                if (log.duration_seconds) {
                  const mins = Math.floor(log.duration_seconds / 60);
                  const secs = log.duration_seconds % 60;
                  durationStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                }

                const dateObj = log.call_start_time ? new Date(log.call_start_time) : null;
                const dateStr = dateObj
                  ? dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
                  ' ' +
                  dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                  : '—';

                return (
                  <View key={log.id || index} style={styles.miniItemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.miniItemTitle}>Call {callTypeLabel}</Text>
                      <Text style={styles.miniItemSub}>
                        Duration: {durationStr} min · {dateStr}
                      </Text>
                      {log.remarks ? (
                        <Text style={styles.miniItemSub}>{log.remarks}</Text>
                      ) : null}
                    </View>
                    <Text style={[styles.miniItemStatus, { color: callTypeColor }]}>
                      {callTypeLabel}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        )}
      </View>

      {/* Accordion 10: REMINDER */}
      <View style={styles.accordionCard}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setReminderExpanded(!reminderExpanded)}
          activeOpacity={0.85}
        >
          <View style={styles.accordionTitleLeft}>
            <View style={styles.indicatorBar} />
            <Text style={styles.accordionTitleText}>REMINDER</Text>
            <View style={styles.badgeCountChip}>
              <Text style={styles.badgeCountText}>{dbReminders.length}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              style={styles.addBtnCircle}
              onPress={(e) => { e.stopPropagation(); handleAddAction('Reminder'); }}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={14} color={theme.primaryColor} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addBtnCircle}
              onPress={(e) => {
                e.stopPropagation();
                if (isNavigatingRef.current) return;
                isNavigatingRef.current = true;
                navigation.navigate('Reminder' as never, {
                  screen: 'index',
                  params: { leadId, leadName, referrer: 'lead-details' }
                } as never);
                setTimeout(() => { isNavigatingRef.current = false; }, 1000);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="list" size={12} color={theme.primaryColor} />
            </TouchableOpacity>
            <View style={styles.chevronBg}>
              <Ionicons name={reminderExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textDark} />
            </View>
          </View>
        </TouchableOpacity>

        {reminderExpanded && (
          <View style={styles.accordionContent}>
            {dbReminders.length === 0 ? (
              <Text style={styles.noDataText}>No reminders found.</Text>
            ) : (
              dbReminders.map((reminder: any, index: number) => {
                const dateStr = (() => {
                  const src = reminder.remind_at || reminder.reminder_date || '';
                  if (!src) return '—';
                  try {
                    const d = new Date(src);
                    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                  } catch { return src; }
                })();
                const rawTime = reminder.remind_time || reminder.reminder_time || '';
                const timeStr = (() => {
                  if (!rawTime) return '';
                  try {
                    const [h, m] = rawTime.split(':').map(Number);
                    const period = h >= 12 ? 'PM' : 'AM';
                    const h12 = h % 12 === 0 ? 12 : h % 12;
                    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
                  } catch { return rawTime.substring(0, 5); }
                })();
                return (
                  <View key={reminder.id || index} style={styles.miniItemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.miniItemTitle}>{reminder.title || 'Reminder'}</Text>
                      <Text style={styles.miniItemSub}>
                        {dateStr}{timeStr ? ' at ' + timeStr : ''}
                      </Text>
                      {reminder.description ? (
                        <Text style={styles.miniItemSub}>{reminder.description}</Text>
                      ) : null}
                    </View>
                    <View style={[styles.activityCountChip, { alignSelf: 'flex-start', marginTop: 2 }]}>
                      <Ionicons name="alarm-outline" size={11} color="#1D4ED8" />
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </View>

      {/* Accordion 11: ACTIVITY */}
      <View style={styles.accordionCard}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setActivityExpanded(!activityExpanded)}
          activeOpacity={0.85}
        >
          <View style={styles.accordionTitleLeft}>
            <View style={styles.indicatorBar} />
            <Text style={styles.accordionTitleText}>ACTIVITY</Text>
            <View style={styles.badgeCountChip}>
              <Text style={styles.badgeCountText}>{dbActivity.length}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              style={styles.addBtnCircle}
              onPress={(e) => {
                e.stopPropagation();
                if (isNavigatingRef.current) return;
                isNavigatingRef.current = true;
                navigation.navigate('lead-activity' as never, {
                  leadId, leadName,
                } as never);
                setTimeout(() => { isNavigatingRef.current = false; }, 1000);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="list" size={12} color={theme.primaryColor} />
            </TouchableOpacity>
            <View style={styles.chevronBg}>
              <Ionicons name={activityExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textDark} />
            </View>
          </View>
        </TouchableOpacity>

        {activityExpanded && (
          <View style={styles.accordionContent}>
            {dbActivity.length === 0 ? (
              <Text style={styles.noDataText}>No activity found.</Text>
            ) : (
              dbActivity.slice(0, 5).map((act: any, index: number) => {
                const actionKey = (act.action_type || '').toUpperCase();
                const actionColors: Record<string, string> = {
                  'TASK CREATED': '#7C3AED', TASK_CREATED: '#7C3AED',
                  ACTION: '#0284C7', ATTACHED: '#059669', UPDATED: '#D97706',
                  'FOLLOW-UP': '#E11D48', FOLLOW_UP: '#E11D48', FOLLOWUP: '#E11D48',
                  CREATED: '#16A34A', DELETED: '#DC2626', STATUS: '#0EA5E9',
                  NOTE: '#6B7280', REMINDER: '#8B5CF6',
                };
                const dotColor = actionColors[actionKey] || '#6B7280';
                const timeStr = act.created_at
                  ? (() => {
                    try {
                      const d = new Date(act.created_at);
                      const h = d.getHours(), m = String(d.getMinutes()).padStart(2, '0');
                      return `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
                    } catch { return ''; }
                  })()
                  : '';
                return (
                  <View key={act.id || index} style={styles.miniItemRow}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dotColor, marginTop: 4 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.miniItemTitle}>{act.actor || 'System'}</Text>
                        <Text style={styles.miniItemSub}>{act.description || act.action_type}</Text>
                      </View>
                    </View>
                    <Text style={[styles.miniItemStatus, { color: dotColor }]}>{timeStr}</Text>
                  </View>
                );
              })
            )}
            {dbActivity.length > 5 && (
              <TouchableOpacity
                onPress={() => {
                  if (isNavigatingRef.current) return;
                  isNavigatingRef.current = true;
                  navigation.navigate('lead-activity' as never, {
                    leadId, leadName,
                  } as never);
                  setTimeout(() => { isNavigatingRef.current = false; }, 1000);
                }}
                activeOpacity={0.7}
                style={{ paddingVertical: 10, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.primaryColor }}>
                  View all {dbActivity.length} events →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* FULL SCREEN IMAGE PREVIEW MODAL */}
      <Modal
        visible={!!previewImageUrl}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImageUrl(null)}
      >
        <View style={styles.previewModalOverlay}>
          <TouchableOpacity
            style={styles.previewCloseBtn}
            onPress={() => setPreviewImageUrl(null)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {previewImageUrl && (
            <Image
              source={{ uri: previewImageUrl }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  accordionCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  accordionTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorBar: {
    width: 3,
    height: 14,
    backgroundColor: theme.primaryColor,
    borderRadius: 1.5,
    marginRight: 8,
  },
  accordionTitleText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  chevronBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accordionContent: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  detailValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textMuted,
    textAlign: 'right',
  },
  badgeCountChip: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    marginLeft: 8,
  },
  badgeCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  addBtnCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 12,
    fontWeight: '600',
  },
  miniItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  miniItemTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  miniItemSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  miniItemStatus: {
    fontSize: 11,
    fontWeight: '800',
  },
  attachmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingVertical: 8,
  },
  gridAttachmentCard: {
    width: '31.3%',
    aspectRatio: 1,
    marginHorizontal: '1%',
    marginBottom: 12,
    backgroundColor: COLORS.bgWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  gridCardImage: {
    width: '100%',
    height: '100%',
  },
  gridCardIconBg: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCardExtensionText: {
    fontSize: 8,
    fontWeight: '800',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  previewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
  activityCountChip: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  contactMiniHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  contactMiniName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  contactMiniPrimaryBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  contactMiniPrimaryText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#137333',
  },
  contactMiniDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  contactMiniDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    height: 12,
    marginHorizontal: 8,
  },
  contactMiniText: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
