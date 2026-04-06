import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Trash2, Clock, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react-native';
import { getHistory, clearHistory, formatTimestamp } from '../utils/storage';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getHistory();
    setHistory(data);
  };

  const handleClear = async () => {
    await clearHistory();
    setHistory([]);
  };

  const getIcon = (status) => {
    if (status === 'HIGH_RISK') return <ShieldAlert size={18} color="#ef4444" />;
    if (status === 'MEDIUM_RISK') return <AlertTriangle size={18} color="#f59e0b" />;
    return <ShieldCheck size={18} color="#10b981" />;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
        style={styles.historyItem}
        onPress={() => navigation.navigate('Result', { result: item })}
    >
        <View style={styles.itemHeader}>
            <View style={styles.statusRow}>
                {getIcon(item.fusion ? item.fusion.status : 'LOW_RISK')}
                <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.fusion ? item.fusion.summary : 'Scan Result'}
                </Text>
            </View>
            <Text style={styles.timeText}>{formatTimestamp(item.timestamp)}</Text>
        </View>
        <Text style={styles.urlText} numberOfLines={1}>{item.qr_data}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color="#94a3b8" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Scan History</Text>
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Trash2 size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {history.length > 0 ? (
        <FlatList
            data={history}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
            <Clock size={48} color="#1e293b" />
            <Text style={styles.emptyText}>No scan history yet</Text>
            <TouchableOpacity 
                style={styles.scanNowButton}
                onPress={() => navigation.navigate('Scanner')}
            >
                <Text style={styles.scanNowText}>Start Scanning</Text>
            </TouchableOpacity>
        </View>
      )}
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
  clearButton: {
    padding: 5,
  },
  listContent: {
    padding: 20,
  },
  historyItem: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  itemTitle: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  timeText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: 'bold',
  },
  urlText: {
    color: '#475569',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 30,
  },
  scanNowButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(34,211,238,0.1)',
    borderWidth: 1,
    borderColor: '#0891b2',
  },
  scanNowText: {
    color: '#22d3ee',
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  }
});
