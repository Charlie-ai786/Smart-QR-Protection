import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { ShieldCheck, History, Zap, Image as ImageIcon, ZapOff, AlertCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const scannerSize = width * 0.7;

export default function ScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!permission || !permission.granted) {
      requestPermission();
    }
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    setScanned(true);
    navigation.navigate('Processing', { qrData: data });
  };

  // Reset scanned state when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setScanned(false);
      setLoading(false);
    });
    return unsubscribe;
  }, [navigation]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        setLoading(true);
        const { uri } = result.assets[0];
        
        // Use BarCodeScanner to scan from the image URI
        const results = await BarCodeScanner.scanFromURLAsync(uri);
        
        if (results.length > 0) {
          const { data } = results[0];
          navigation.navigate('Processing', { qrData: data });
        } else {
          alert("No QR code found in this image. Please try another one.");
        }
      }
    } catch (error) {
        console.error("Image picking error:", error);
        alert("Failed to scan image. Please ensure it's a valid QR code.");
    } finally {
        setLoading(false);
    }
  };

  if (!permission) {
    return <View style={styles.container}><Text style={styles.text}>Requesting camera permission...</Text></View>;
  }
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
                <ShieldCheck size={20} color="#fff" />
            </View>
            <Text style={styles.logoText}>QR<Text style={{color: '#22d3ee'}}>Shield</Text></Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <History size={24} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <View style={styles.scannerContainer}>
        <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Security Scanner</Text>
            <View style={styles.activeBadge}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>Active</Text>
            </View>
        </View>

        <View style={styles.cameraWrapper}>
            <CameraView
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39", "upc_a", "upc_e"],
                }}
                enableTorch={torch}
                style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.overlay}>
                <View style={styles.unfocusedContainer}></View>
                <View style={styles.middleContainer}>
                    <View style={styles.unfocusedContainer}></View>
                    <View style={styles.focusedContainer}>
                        {/* Corner markers */}
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>
                    <View style={styles.unfocusedContainer}></View>
                </View>
                <View style={styles.unfocusedContainer}></View>
            </View>
        </View>
        
        <Text style={styles.hint}>Align QR code within the frame to scan</Text>

        <View style={styles.actionButtonsRow}>
            <TouchableOpacity 
                style={[styles.actionButton, torch && styles.actionButtonActive]} 
                onPress={() => setTorch(!torch)}
            >
                {torch ? <Zap size={24} color="#020617" /> : <ZapOff size={24} color="#94a3b8" />}
                <Text style={[styles.actionButtonText, torch && styles.actionButtonTextActive]}>Flash</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.actionButton} 
                onPress={pickImage}
                disabled={loading}
            >
                <ImageIcon size={24} color="#94a3b8" />
                <Text style={styles.actionButtonText}>{loading ? "Reading..." : "Upload"}</Text>
            </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.statLine}>
             <Zap size={14} color="#22d3ee" />
             <Text style={styles.footerText}>Neural Protection Engine v2.5.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  navbar: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    backgroundColor: '#0891b2',
    padding: 6,
    borderRadius: 8,
    marginRight: 10,
  },
  logoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -1,
  },
  scannerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerTextContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  activeText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cameraWrapper: {
    width: scannerSize + 40,
    height: scannerSize + 40,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  overlay: {
    flex: 1,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.7)',
  },
  middleContainer: {
    flexDirection: 'row',
    height: scannerSize,
  },
  focusedContainer: {
    width: scannerSize,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#22d3ee',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  hint: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 30,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  statLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    color: '#334155',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#0891b2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'center',
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minWidth: 120,
    justifyContent: 'center',
  },
  actionButtonActive: {
    backgroundColor: '#22d3ee',
    borderColor: '#22d3ee',
  },
  actionButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtonTextActive: {
    color: '#020617',
  },
});
