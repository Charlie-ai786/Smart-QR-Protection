import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldAlert, ShieldCheck, AlertTriangle, ExternalLink, ChevronLeft, RefreshCcw, Info } from 'lucide-react-native';

export default function ResultScreen({ route, navigation }) {
  const { result } = route.params;
  const fusion = result.fusion;

  const getStatusColor = () => {
    if (fusion.status === 'HIGH_RISK') return '#ef4444';
    if (fusion.status === 'MEDIUM_RISK') return '#f59e0b';
    return '#10b981';
  };

  const getStatusBg = () => {
    if (fusion.status === 'HIGH_RISK') return 'rgba(239, 68, 68, 0.1)';
    if (fusion.status === 'MEDIUM_RISK') return 'rgba(245, 158, 11, 0.1)';
    return 'rgba(16, 185, 129, 0.1)';
  };

  const color = getStatusColor();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.navigate('Scanner')} style={styles.backButton}>
            <ChevronLeft size={24} color="#94a3b8" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Security Report</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Risk Card */}
        <View style={[styles.riskCard, { borderColor: color + '33', backgroundColor: getStatusBg() }]}>
            <View style={[styles.iconCircle, { backgroundColor: color + '22' }]}>
                {fusion.status === 'HIGH_RISK' ? <ShieldAlert size={40} color={color} /> : 
                 fusion.status === 'MEDIUM_RISK' ? <AlertTriangle size={40} color={color} /> : 
                 <ShieldCheck size={40} color={color} />}
            </View>
            <Text style={[styles.riskStatus, { color }]}>{fusion.status.replace('_', ' ')}</Text>
            <View style={styles.scoreContainer}>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBar, { width: `${fusion.risk_score}%`, backgroundColor: color }]} />
                </View>
                <Text style={styles.scoreText}>Risk Score: {fusion.risk_score}/100</Text>
            </View>
            <Text style={styles.actionText}>{fusion.action}</Text>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Info size={16} color="#94a3b8" />
                <Text style={styles.sectionTitle}>Found Analysis</Text>
            </View>

            <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Summary</Text>
                <Text style={styles.detailValue}>{fusion.summary}</Text>
            </View>
            
            {result.payment && (
                <View style={styles.detailCard}>
                    <Text style={[styles.detailLabel, {color: '#22d3ee'}]}>Payment Detected</Text>
                    <Text style={styles.detailValue}>To: {result.payment.name || result.payment.upi_id}</Text>
                    {result.payment.amount && <Text style={styles.detailValue}>Amount: ₹{result.payment.amount}</Text>}
                </View>
            )}

            <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Context</Text>
                <Text style={styles.detailValue}>{fusion.context.intent}</Text>
                <Text style={styles.hintValue}>{fusion.context.risk_hint}</Text>
            </View>

            <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Threat Indicators</Text>
                {fusion.reasons.length > 0 ? (
                    fusion.reasons.map((reason, i) => (
                        <View key={i} style={styles.reasonRow}>
                            <View style={styles.reasonDot} />
                            <Text style={styles.reasonText}>{reason}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.reasonText}>No malicious indicators found.</Text>
                )}
            </View>
        </View>

        {/* Data View */}
        <View style={styles.section}>
             <Text style={styles.sectionTitle}>Decoded Data</Text>
             <View style={styles.dataCard}>
                <Text style={styles.dataText} numberOfLines={3}>{result.qr_data}</Text>
             </View>
        </View>

        <View style={styles.buttonGroup}>
            <TouchableOpacity 
                style={[styles.primaryButton, { backgroundColor: color }]} 
                onPress={() => Linking.openURL(result.qr_data).catch(() => alert('Cannot open this link'))}
            >
                <ExternalLink size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Proceed to Link</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Scanner')}
            >
                <RefreshCcw size={20} color="#94a3b8" />
                <Text style={styles.secondaryButtonText}>Scan Again</Text>
            </TouchableOpacity>
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
  navbar: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backButton: {
    padding: 5,
  },
  navTitle: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  riskCard: {
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 25,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  riskStatus: {
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 15,
  },
  scoreContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBarBg: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  scoreText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailCard: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  detailLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: 'bold',
  },
  hintValue: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 8,
  },
  reasonDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
    marginTop: 8,
  },
  reasonText: {
    color: '#94a3b8',
    fontSize: 13,
    flex: 1,
  },
  dataCard: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dataText: {
    color: '#475569',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  buttonGroup: {
    marginTop: 10,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  secondaryButtonText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '900',
  }
});
