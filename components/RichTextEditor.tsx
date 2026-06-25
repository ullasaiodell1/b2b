import React, { useRef, useState, useCallback } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Platform,
  TouchableOpacity,
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '@/constants/theme';

interface RichTextEditorProps {
  initialHTML?: string;
  placeholder?: string;
  onChange?: (html: string) => void;
  onSave?: (html: string) => void;
  onCancel?: () => void;
  disabled?: boolean;
  /** When true: hides toolbar & buttons, renders content as read-only styled card */
  viewOnly?: boolean;
  minHeight?: number;
  maxHeight?: number;
}

interface SelectionRange {
  start: number;
  end: number;
}

/** Strips basic HTML tags to plain text for display */
export function htmlToPlain(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/** Converts plain text back to simple HTML for storage */
function plainToHtml(text: string): string {
  if (!text) return '';
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const paragraphs = escaped.split('\n').map((line) => {
    if (!line.trim()) return '<br/>';
    return `<p>${line}</p>`;
  });
  return paragraphs.join('');
}

export default function RichTextEditor({
  initialHTML = '',
  placeholder = 'Start typing...',
  onChange,
  onSave,
  onCancel,
  disabled = false,
  viewOnly = false,
  minHeight = 250,
  maxHeight = 450,
}: RichTextEditorProps) {
  const inputRef = useRef<TextInput>(null);
  const [content, setContent] = useState(() => htmlToPlain(initialHTML));
  const [selection, setSelection] = useState<SelectionRange>({ start: 0, end: 0 });

  // Undo / Redo history stack
  const historyRef = useRef<string[]>([htmlToPlain(initialHTML)]);
  const historyIndexRef = useRef<number>(0);

  // Link panel state
  const [linkPanelVisible, setLinkPanelVisible] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState('');
  const [linkLabel, setLinkLabel] = React.useState('');

  const pushHistory = (text: string) => {
    // Trim forward history when making a new change
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(text);
    historyIndexRef.current = historyRef.current.length - 1;
  };

  const handleChange = useCallback(
    (text: string) => {
      pushHistory(text);
      setContent(text);
      if (onChange) onChange(plainToHtml(text));
    },
    [onChange]
  );

  const applyText = (text: string) => {
    setContent(text);
    if (onChange) onChange(plainToHtml(text));
  };

  const handleUndo = () => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    const prev = historyRef.current[historyIndexRef.current];
    setContent(prev);
    if (onChange) onChange(plainToHtml(prev));
    inputRef.current?.focus();
  };

  const handleRedo = () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    const next = historyRef.current[historyIndexRef.current];
    setContent(next);
    if (onChange) onChange(plainToHtml(next));
    inputRef.current?.focus();
  };

  const handleSelectionChange = (
    e: NativeSyntheticEvent<TextInputSelectionChangeEventData>
  ) => {
    setSelection(e.nativeEvent.selection);
  };

  const wrapSelection = (prefix: string, suffix: string) => {
    const { start, end } = selection;
    const before = content.slice(0, start);
    const selected = content.slice(start, end);
    const after = content.slice(end);
    const newText = before + prefix + (selected || 'text') + suffix + after;
    pushHistory(newText);
    applyText(newText);
    inputRef.current?.focus();
  };

  /** Prefix current line with a tag marker like "# " or "## " */
  const prefixLine = (marker: string) => {
    const { start } = selection;
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = content.indexOf('\n', start);
    const end = lineEnd === -1 ? content.length : lineEnd;
    const currentLine = content.slice(lineStart, end);

    // Remove any existing heading/paragraph prefix before applying new one
    const stripped = currentLine.replace(/^(# |## |### |> |\s{4}|\t)/, '');
    const newLine = marker + stripped;
    const newText = content.slice(0, lineStart) + newLine + content.slice(end);
    pushHistory(newText);
    applyText(newText);
    inputRef.current?.focus();
  };

  const insertBullet = () => {
    const { start } = selection;
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;
    const before = content.slice(0, lineStart);
    const lineAndAfter = content.slice(lineStart);
    const newText = before + '• ' + lineAndAfter;
    pushHistory(newText);
    applyText(newText);
    inputRef.current?.focus();
  };

  const insertNumbered = () => {
    const { start } = selection;
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;
    const before = content.slice(0, lineStart);
    const lineAndAfter = content.slice(lineStart);
    const newText = before + '1. ' + lineAndAfter;
    pushHistory(newText);
    applyText(newText);
    inputRef.current?.focus();
  };

  /** Indent: add 4 spaces at the beginning of the current line */
  const indentLine = (add: boolean) => {
    const { start } = selection;
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = content.indexOf('\n', start);
    const end = lineEnd === -1 ? content.length : lineEnd;
    const currentLine = content.slice(lineStart, end);

    let newLine: string;
    if (add) {
      newLine = '    ' + currentLine;
    } else {
      newLine = currentLine.replace(/^( {1,4}|\t)/, '');
    }
    const newText = content.slice(0, lineStart) + newLine + content.slice(end);
    pushHistory(newText);
    applyText(newText);
    inputRef.current?.focus();
  };

  /** Image picker: pick from gallery and insert markdown image tag */
  const handleInsertImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const tag = `\n![image](${uri})\n`;
        const { start } = selection;
        const before = content.slice(0, start);
        const after = content.slice(start);
        const newText = before + tag + after;
        pushHistory(newText);
        applyText(newText);
        inputRef.current?.focus();
      }
    } catch (err) {
      Alert.alert('Error', 'Could not open image picker.');
    }
  };

  /** Link panel: toggle visibility */
  const handleInsertLink = () => {
    const { start, end } = selection;
    const selected = content.slice(start, end);
    setLinkLabel(selected || '');
    setLinkUrl('');
    setLinkPanelVisible((v) => !v);
  };

  const handleConfirmLink = () => {
    const label = linkLabel.trim() || linkUrl.trim();
    const url = linkUrl.trim();
    if (!url) {
      Alert.alert('URL Required', 'Please enter a URL.');
      return;
    }
    const tag = `[${label}](${url})`;
    const { start, end } = selection;
    const before = content.slice(0, start);
    const after = content.slice(end);
    const newText = before + tag + after;
    pushHistory(newText);
    applyText(newText);
    setLinkPanelVisible(false);
    setLinkUrl('');
    setLinkLabel('');
    inputRef.current?.focus();
  };

  /** Clear formatting: strip markdown-style markers from whole content */
  const clearFormatting = () => {
    const cleaned = content
      .replace(/\*\*(.*?)\*\*/g, '$1')   // bold **text**
      .replace(/__(.*?)__/g, '$1')        // underline __text__
      .replace(/_(.*?)_/g, '$1')          // italic _text_
      .replace(/^#{1,3} /gm, '')          // headings
      .replace(/^• /gm, '')               // bullets
      .replace(/^\d+\. /gm, '')           // numbered
      .replace(/^ {4}/gm, '')             // indents
      .replace(/^\t/gm, '');              // tab indents
    pushHistory(cleaned);
    applyText(cleaned);
    inputRef.current?.focus();
  };

  const handleSave = () => {
    if (onSave) onSave(plainToHtml(content));
  };

  // ── View-only mode: clean read-only card, no toolbar/buttons ─────────────
  if (viewOnly) {
    const plainText = htmlToPlain(initialHTML);
    const lines = plainText.split('\n').filter(Boolean);
    return (
      <View style={styles.viewOnlyContainer}>
        {lines.length === 0 ? (
          <Text style={styles.viewOnlyEmpty}>—</Text>
        ) : (
          lines.map((line, idx) => (
            <View key={idx} style={styles.viewOnlyLine}>
              <Text style={styles.viewOnlyBulletDot}>·</Text>
              <Text style={styles.viewOnlyText}>{line}</Text>
            </View>
          ))
        )}
      </View>
    );
  }

  // ── Editor mode ───────────────────────────────────────────────────────────
  return (
    <View style={styles.outerContainer}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        {/* B */}
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => wrapSelection('**', '**')}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={[styles.toolBtnText, { fontWeight: 'bold' }]}>B</Text>
        </TouchableOpacity>

        {/* I */}
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => wrapSelection('_', '_')}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={[styles.toolBtnText, { fontStyle: 'italic' }]}>I</Text>
        </TouchableOpacity>

        {/* U */}
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => wrapSelection('__', '__')}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={[styles.toolBtnText, { textDecorationLine: 'underline' }]}>U</Text>
        </TouchableOpacity>

        <View style={styles.toolDivider} />

        {/* H1 */}
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => prefixLine('# ')}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={[styles.toolBtnText, { fontSize: 11, fontWeight: '900' }]}>H1</Text>
        </TouchableOpacity>

        {/* H2 */}
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => prefixLine('## ')}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={[styles.toolBtnText, { fontSize: 11, fontWeight: '900' }]}>H2</Text>
        </TouchableOpacity>

        {/* P (paragraph – clears heading prefix) */}
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => prefixLine('')}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={[styles.toolBtnText, { fontSize: 11, fontWeight: '700' }]}>P</Text>
        </TouchableOpacity>

        <View style={styles.toolDivider} />

        {/* Bullet list */}
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={insertBullet}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <MaterialIcons name="format-list-bulleted" size={18} color="#4B5563" />
        </TouchableOpacity>

        {/* Numbered list */}
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={insertNumbered}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <MaterialIcons name="format-list-numbered" size={18} color="#4B5563" />
        </TouchableOpacity>

        <View style={styles.toolDivider} />

        {/* Indent left (decrease) */}
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => indentLine(false)}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <MaterialIcons name="format-indent-decrease" size={18} color="#4B5563" />
        </TouchableOpacity>

        {/* Indent right (increase) */}
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => indentLine(true)}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <MaterialIcons name="format-indent-increase" size={18} color="#4B5563" />
        </TouchableOpacity>

        <View style={styles.toolDivider} />

        {/* Undo */}
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={handleUndo}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <MaterialIcons name="undo" size={18} color="#4B5563" />
        </TouchableOpacity>

        {/* Redo */}
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={handleRedo}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <MaterialIcons name="redo" size={18} color="#4B5563" />
        </TouchableOpacity>

        {/* Clear Formatting (Tx) */}
        <TouchableOpacity
          style={[styles.toolBtn, { backgroundColor: '#FEE2E2' }]}
          onPress={clearFormatting}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={[styles.toolBtnText, { fontSize: 11, fontWeight: '900', color: '#EF4444' }]}>Tx</Text>
        </TouchableOpacity>

        <View style={styles.toolDivider} />

        {/* Insert Image */}
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={handleInsertImage}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <MaterialIcons name="image" size={18} color="#4B5563" />
        </TouchableOpacity>

        {/* Insert Link */}
        <TouchableOpacity
          style={[styles.toolBtn, linkPanelVisible && { backgroundColor: '#DBEAFE' }]}
          onPress={handleInsertLink}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Ionicons name="link-outline" size={18} color={linkPanelVisible ? '#2563EB' : '#4B5563'} />
        </TouchableOpacity>
      </View>

      {/* Link Input Panel */}
      {linkPanelVisible && (
        <View style={styles.linkPanel}>
          <TextInput
            style={styles.linkInput}
            placeholder="Label (optional)"
            placeholderTextColor="#9CA3AF"
            value={linkLabel}
            onChangeText={setLinkLabel}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.linkInput}
            placeholder="https://..."
            placeholderTextColor="#9CA3AF"
            value={linkUrl}
            onChangeText={setLinkUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
          <View style={styles.linkPanelActions}>
            <TouchableOpacity
              style={styles.linkCancelBtn}
              onPress={() => setLinkPanelVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.linkCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkConfirmBtn}
              onPress={handleConfirmLink}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark" size={14} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.linkConfirmText}>Insert</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.separator} />

      {/* Editor Area */}
      <ScrollView
        style={[styles.scrollStyle, { minHeight, maxHeight }]}
        contentContainerStyle={styles.scrollContent}
        keyboardDismissMode="none"
      >
        <TextInput
          ref={inputRef}
          style={[styles.textInput, { minHeight }]}
          value={content}
          onChangeText={handleChange}
          onSelectionChange={handleSelectionChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          multiline
          editable={!disabled}
          textAlignVertical="top"
          scrollEnabled={false}
        />
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        {onCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>CANCEL</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.saveButton, disabled && styles.disabledButton]}
          onPress={handleSave}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <Text style={styles.saveText}>SAVE CHANGES</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── View-only styles ──────────────────────────────────────────────────────
  viewOnlyContainer: {
    width: '100%',
    gap: 6,
    paddingVertical: 2,
  },
  viewOnlyLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  viewOnlyBulletDot: {
    fontSize: 18,
    color: COLORS.primary,
    lineHeight: 20,
    marginTop: 1,
    fontWeight: '900',
  },
  viewOnlyText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    lineHeight: 20,
  },
  viewOnlyEmpty: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },

  // ── Editor styles ─────────────────────────────────────────────────────────
  outerContainer: {
    width: '100%',
    marginVertical: 10,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: '#E5E7EB',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
    flexWrap: 'wrap',
  },
  toolBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  toolBtnText: {
    fontSize: 14,
    color: '#374151',
  },
  toolDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    width: '100%',
  },
  scrollStyle: {
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderBottomWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  scrollContent: {
    flexGrow: 1,
  },
  textInput: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: '#1F2937',
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    width: '100%',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1.2,
    borderColor: '#D1D5DB',
    backgroundColor: COLORS.white,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    minWidth: 130,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  saveText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  disabledButton: {
    backgroundColor: '#A5D6D6',
  },
  // ── Link panel styles ─────────────────────────────────────────────────────
  linkPanel: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 8,
  },
  linkInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '500',
  },
  linkPanelActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 2,
  },
  linkCancelBtn: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  linkCancelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  linkConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#2563EB',
  },
  linkConfirmText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
