import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, Alert, Dimensions, Keyboard, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import {
  ChevronLeft, QrCode, Share2, Download, Trash2,
  Link, MessageSquare, Mail, Phone, Wifi, CheckCircle
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const QR_SIZE = width * 0.62;

const TEMPLATES = [
  { icon: Link,          label: 'URL',   color: '#22d3ee', placeholder: 'https://example.com' },
  { icon: MessageSquare, label: 'Text',  color: '#a78bfa', placeholder: 'Enter any text...' },
  { icon: Mail,          label: 'Email', color: '#34d399', placeholder: 'mailto:you@example.com' },
  { icon: Phone,         label: 'Phone', color: '#f59e0b', placeholder: 'tel:+911234567890' },
  { icon: Wifi,          label: 'WiFi',  color: '#f472b6', placeholder: 'WIFI:S:MyNetwork;T:WPA;P:password;;' },
];

const ERROR_LEVELS = [
  { key: 'L', pct: '7%',  label: 'Low' },
  { key: 'M', pct: '15%', label: 'Medium' },
  { key: 'Q', pct: '25%', label: 'Quartile' },
  { key: 'H', pct: '30%', label: 'High' },
];

export default function QRGeneratorScreen({ navigation }) {
  const [inputText, setInputText]       = useState('');
  const [qrValue, setQrValue]           = useState('');
  const [activeTemplate, setActiveTemplate] = useState(0);
  const [errorLevel, setErrorLevel]     = useState('M');
  const [downloading, setDownloading]   = useState(false);
  const [sharing, setSharing]           = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);

  const viewShotRef = useRef(null);
  const activeColor = TEMPLATES[activeTemplate].color;

  // ── Generate ──────────────────────────────────────────────────────────────
  const handleGenerate = () => {
    const text = inputText.trim();
    if (!text) {
      Alert.alert('Empty Input', 'Please enter some text or URL to generate a QR code.');
      return;
    }
    Keyboard.dismiss();
    setDownloadDone(false);
    setQrValue(text);
  };

  // ── Download to Gallery ───────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!qrValue || !viewShotRef.current) return;

    try {
      setDownloading(true);

      // 1. Request media library permission (write-only to avoid Audio/Video permission issues)
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Please allow photo library access to save QR codes.',
          [{ text: 'OK' }]
        );
        return;
      }

      // 2. Capture the QR view
      const uri = await viewShotRef.current.capture();
      
      // Ensure the URI is valid for MediaLibrary (sometimes needs file:// prefix)
      const assetUri = uri.startsWith('file://') ? uri : `file://${uri}`;

      // 3. Save to device gallery
      const asset = await MediaLibrary.createAssetAsync(assetUri);
      
      // Try to save to a specific album, or just leave in Camera Roll
      try {
        const album = await MediaLibrary.getAlbumAsync('QRShield');
        if (album === null) {
          await MediaLibrary.createAlbumAsync('QRShield', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
      } catch (e) {
        // Fallback: Just save to general gallery if album fails
        console.warn("Album creation failed, saved to camera roll instead.");
      }

      setDownloadDone(true);
      setTimeout(() => setDownloadDone(false), 3000);

      Alert.alert(
        '✅ Saved to Gallery',
        'Your QR code image has been successfully saved to your photos.',
        [{ text: 'Great!' }]
      );
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Failed', 'Could not save the QR code image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // ── Share Image ───────────────────────────────────────────────────────────
  const handleShare = async () => {
    if (!qrValue || !viewShotRef.current) return;
    
    try {
      setSharing(true);
      
      // Check if sharing is available on the device
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing Unavailable', 'Sharing is not available on this device.');
        return;
      }

      // 1. Capture the QR view
      const uri = await viewShotRef.current.capture();
      
      // 2. Share the captured file
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your QR Code',
        UTI: 'public.png', // for iOS
      });

    } catch (error) {
      console.error('Sharing error:', error);
      Alert.alert('Error', 'Could not share the QR code image.');
    } finally {
      setSharing(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setQrValue('');
    setDownloadDone(false);
  };

  const handleTemplateSelect = (idx) => {
    setActiveTemplate(idx);
    setQrValue('');
    setInputText('');
    setDownloadDone(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
          <ChevronLeft size={24} color="#94a3b8" />
        </TouchableOpacity>
        <View style={styles.navTitleRow}>
          <QrCode size={16} color="#22d3ee" />
          <Text style={styles.navTitle}>QR Generator</Text>
        </View>
        <TouchableOpacity onPress={handleClear} style={styles.navBtn}>
          <Trash2 size={18} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── QR Display ── */}
        <View style={styles.qrSection}>
          {qrValue ? (
            <>
              {/* ViewShot wraps only the QR — captures clean white-background image */}
              <ViewShot
                ref={viewShotRef}
                options={{ format: 'png', quality: 1.0, result: 'tmpfile' }}
                style={[styles.viewShotWrapper, { borderColor: activeColor + '44' }]}
              >
                <View style={styles.qrInner}>
                  <QRCode
                    value={qrValue}
                    size={QR_SIZE - 48}
                    color="#0f172a"
                    backgroundColor="#f8fafc"
                    ecl={errorLevel}
                  />
                  {/* Watermark inside the captured image */}
                  <View style={styles.watermarkRow}>
                    <QrCode size={10} color="#94a3b8" />
                    <Text style={styles.watermarkText}>QRShield · {TEMPLATES[activeTemplate].label}</Text>
                  </View>
                </View>
              </ViewShot>

              {/* Badges below the box (not captured) */}
              <View style={[styles.qrBadge, { backgroundColor: activeColor + '18', borderColor: activeColor + '44' }]}>
                <Text style={[styles.qrBadgeText, { color: activeColor }]}>
                  {TEMPLATES[activeTemplate].label.toUpperCase()} · ECC {errorLevel}
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.qrPlaceholder}>
              <QrCode size={72} color="#1e293b" />
              <Text style={styles.placeholderText}>Your QR code will appear here</Text>
              <Text style={styles.placeholderSub}>Fill in the content below and tap Generate</Text>
            </View>
          )}
        </View>

        {/* ── Action Buttons (Download + Share) ── */}
        {qrValue && (
          <View style={styles.actionRow}>
            {/* Download */}
            <TouchableOpacity
              style={[
                styles.downloadBtn,
                downloadDone && styles.downloadBtnDone,
                { borderColor: downloadDone ? '#10b981' : activeColor }
              ]}
              onPress={handleDownload}
              disabled={downloading}
              activeOpacity={0.8}
            >
              {downloading ? (
                <ActivityIndicator size="small" color={activeColor} />
              ) : downloadDone ? (
                <CheckCircle size={20} color="#10b981" />
              ) : (
                <Download size={20} color={activeColor} />
              )}
              <Text style={[
                styles.downloadBtnText,
                { color: downloadDone ? '#10b981' : activeColor }
              ]}>
                {downloading ? 'Saving...' : downloadDone ? 'Saved!' : 'Save to Gallery'}
              </Text>
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity 
                style={styles.shareBtn} 
                onPress={handleShare}
                disabled={sharing}
            >
                {sharing ? (
                    <ActivityIndicator size="small" color="#94a3b8" />
                ) : (
                    <>
                        <Share2 size={20} color="#94a3b8" />
                        <Text style={styles.shareBtnText}>Share QR</Text>
                    </>
                )}
            </TouchableOpacity>
          </View>
        )}

        {/* ── Type Templates ── */}
        <Text style={styles.sectionLabel}>TYPE</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.templateScroll}
          contentContainerStyle={styles.templateRow}
        >
          {TEMPLATES.map((tpl, idx) => {
            const Icon = tpl.icon;
            const isActive = activeTemplate === idx;
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.templateBtn,
                  isActive && { borderColor: tpl.color, backgroundColor: tpl.color + '18' }
                ]}
                onPress={() => handleTemplateSelect(idx)}
              >
                <Icon size={16} color={isActive ? tpl.color : '#475569'} />
                <Text style={[styles.templateLabel, isActive && { color: tpl.color }]}>
                  {tpl.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Content Input ── */}
        <Text style={styles.sectionLabel}>CONTENT</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={TEMPLATES[activeTemplate].placeholder}
            placeholderTextColor="#334155"
            multiline
            numberOfLines={3}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {inputText.length > 0 && (
            <Text style={styles.charCount}>{inputText.length} chars</Text>
          )}
        </View>

        {/* ── Error Correction ── */}
        <Text style={styles.sectionLabel}>ERROR CORRECTION</Text>
        <View style={styles.eccRow}>
          {ERROR_LEVELS.map(({ key, pct, label }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.eccBtn,
                errorLevel === key && { borderColor: activeColor, backgroundColor: activeColor + '18' }
              ]}
              onPress={() => setErrorLevel(key)}
            >
              <Text style={[styles.eccKey, errorLevel === key && { color: activeColor }]}>{key}</Text>
              <Text style={styles.eccPct}>{pct}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Generate Button ── */}
        <TouchableOpacity
          style={[styles.generateBtn, { backgroundColor: activeColor }]}
          onPress={handleGenerate}
          activeOpacity={0.85}
        >
          <QrCode size={20} color="#020617" />
          <Text style={styles.generateBtnText}>Generate QR Code</Text>
        </TouchableOpacity>

        {/* ── Info Card ── */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Error Correction Guide</Text>
          <Text style={styles.infoText}>
            <Text style={{ color: '#94a3b8', fontWeight: 'bold' }}>L (7%)</Text>  Small, clean prints{'\n'}
            <Text style={{ color: '#94a3b8', fontWeight: 'bold' }}>M (15%)</Text> General use ✓{'\n'}
            <Text style={{ color: '#94a3b8', fontWeight: 'bold' }}>Q (25%)</Text> Noisy environments{'\n'}
            <Text style={{ color: '#94a3b8', fontWeight: 'bold' }}>H (30%)</Text> With logo overlays
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },

  // ── Navbar ──
  navbar: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  navBtn: { padding: 5 },
  navTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navTitle: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ── Scroll Content ──
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },

  // ── QR Section ──
  qrSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  viewShotWrapper: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  qrInner: {
    backgroundColor: '#f8fafc',
    padding: 24,
    alignItems: 'center',
    gap: 14,
  },
  watermarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  watermarkText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  qrBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  qrBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  qrPlaceholder: {
    width: QR_SIZE,
    height: QR_SIZE * 0.9,
    borderRadius: 24,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  placeholderText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  placeholderSub: {
    color: '#1e293b',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // ── Action Row (Download + Share) ──
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  downloadBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    borderWidth: 1.5,
  },
  downloadBtnDone: {
    backgroundColor: 'rgba(16,185,129,0.08)',
  },
  downloadBtnText: {
    fontSize: 14,
    fontWeight: '900',
  },
  shareBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  shareBtnText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '900',
  },

  // ── Templates ──
  sectionLabel: {
    color: '#334155',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  templateScroll: { marginBottom: 20 },
  templateRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 20,
  },
  templateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#0f172a',
  },
  templateLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#475569',
  },

  // ── Input ──
  inputWrapper: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 20,
  },
  textInput: {
    color: '#f1f5f9',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    color: '#334155',
    fontSize: 11,
    marginTop: 8,
    textAlign: 'right',
    fontWeight: 'bold',
  },

  // ── Error Correction ──
  eccRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  eccBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#0f172a',
    alignItems: 'center',
    gap: 3,
  },
  eccKey: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '900',
  },
  eccPct: {
    color: '#334155',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // ── Generate Button ──
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 18,
    marginBottom: 20,
  },
  generateBtnText: {
    color: '#020617',
    fontSize: 16,
    fontWeight: '900',
  },

  // ── Info Card ──
  infoCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  infoTitle: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  infoText: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 24,
  },
});
