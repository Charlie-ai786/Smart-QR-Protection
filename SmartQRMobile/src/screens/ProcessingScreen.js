import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Animated, Easing } from 'react-native';
import { Activity, Shield } from 'lucide-react-native';
import { analyzeThreat } from '../utils/threatDetector';
import { analyzePayment } from '../utils/paymentVerifier';
import { fuseRisk } from '../utils/riskFusionEngine';
import { saveScan } from '../utils/storage';
import axios from 'axios';
import { BASE_URL } from '../config';


export default function ProcessingScreen({ route, navigation }) {
  const { qrData } = route.params;
  const [status, setStatus] = useState("Initializing...");
  const [spinValue] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    const processQR = async () => {
      try {
        setStatus("Scanning...");
        await new Promise(r => setTimeout(r, 200));

        setStatus("Analyzing signatures...");
        const threatRes = await analyzeThreat(qrData);
        
        setStatus("Verifying payment logic...");
        const paymentRes = analyzePayment(qrData);

        setStatus("Running AI model...");
        let mlRes = null;
        try {
          const response = await axios.post(`${BASE_URL}/analyze`, { url: qrData }, { timeout: 3000 });
          mlRes = response.data;
        } catch (e) {
          console.warn("Backend unavailable, using local heuristics only.");
          setStatus("Running local heuristics...");
          await new Promise(r => setTimeout(r, 500));
        }

        setStatus("Finalizing report...");
        await new Promise(r => setTimeout(r, 200));
        // Pass mlRes as 4th arg so fusion engine can merge backend + local scores
        const fused = fuseRisk(threatRes.threat, paymentRes.payment, [], mlRes);
        
        const finalResult = {
          ...(mlRes || {}),   // safe spread even when backend is unreachable
          qr_data: qrData,
          payment: paymentRes.payment.is_payment_qr ? paymentRes.payment : null,
          fusion: fused.final,
          threat: threatRes.threat,
          timestamp: new Date().toISOString()
        };

        await saveScan(finalResult);
        
        navigation.replace('Result', { result: finalResult });
      } catch (error) {
        console.error(error);
        navigation.goBack();
      }
    };

    processQR();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <View style={styles.spinnerWrapper}>
            <Activity size={48} color="#22d3ee" />
          </View>
        </Animated.View>
        
        <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>Deep Analysis in Progress</Text>
            <Text style={styles.statusSubtitle}>{status}</Text>
        </View>

        <View style={styles.stepsContainer}>
            {[
                { label: 'Signature Check', active: status !== "Initializing..." },
                { label: 'AI Risk Engine', active: status === "Running AI model..." || status === "Finalizing report..." },
                { label: 'Tamper Detection', active: status === "Finalizing report..." }
            ].map((step, i) => (
                <View key={i} style={styles.stepRow}>
                    <View style={[styles.stepDot, step.active && styles.stepDotActive]} />
                    <Text style={[styles.stepLabel, step.active && styles.stepLabelActive]}>{step.label}</Text>
                </View>
            ))}
        </View>
      </View>
      
      <View style={styles.footer}>
         <Shield size={16} color="#334155" />
         <Text style={styles.footerText}>Secure Scanning Environment</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 30,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerWrapper: {
    padding: 20,
    borderRadius: 30,
    backgroundColor: 'rgba(34,211,238,0.05)',
  },
  statusContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  statusTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  statusSubtitle: {
    color: '#22d3ee',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stepsContainer: {
    marginTop: 60,
    width: '100%',
    paddingHorizontal: 40,
    gap: 15,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1e293b',
  },
  stepDotActive: {
    backgroundColor: '#22d3ee',
    shadowColor: '#22d3ee',
    shadowRadius: 10,
    shadowOpacity: 0.5,
    elevation: 5,
  },
  stepLabel: {
    color: '#475569',
    fontSize: 13,
    fontWeight: 'bold',
  },
  stepLabelActive: {
    color: '#f1f5f9',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 20,
  },
  footerText: {
    color: '#334155',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});
