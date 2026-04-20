import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Trash2, Clock, ShieldCheck, ShieldAlert, AlertTriangle, Search, Filter, Trash, BarChart3, Shield } from 'lucide-react-native';
import { getHistory, clearHistory, deleteScan, formatTimestamp } from '../utils/storage';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, HIGH_RISK, MEDIUM_RISK, LOW_RISK

  useEffect(() => {
    loadHistory();
    const unsubscribe = navigation.addListener('focus', loadHistory);
    return unsubscribe;
  }, [navigation]);

  const loadHistory = async () => {
    const data = await getHistory();
    setHistory(data);
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to delete all scan records? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive", 
          onPress: async () => {
            await clearHistory();
            setHistory([]);
          } 
        }
      ]
    );
  };

  const handleDeleteItem = (id) => {
    Alert.alert(
      "Delete Scan",
      "Remove this item from your history?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            const updated = await deleteScan(id);
            setHistory(updated);
          } 
        }
      ]
    );
  };

  const stats = useMemo(() => {
    const total = history.length;
    const threats = history.filter(h => h.fusion?.status === 'HIGH_RISK').length;
    const suspicious = history.filter(h => h.fusion?.status === 'MEDIUM_RISK').length;
    const safeRate = total > 0 ? Math.round(((total - threats) / total) * 100) : 100;
    
    return { total, threats, suspicious, safeRate };
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchesSearch = (item.qr_data || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.fusion?.summary || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const status = item.fusion?.status || 'LOW_RISK';
      const matchesFilter = filterType === 'ALL' || status === filterType;
      
      return matchesSearch && matchesFilter;
    });
  }, [history, searchQuery, filterType]);

  const getIcon = (status) => {
    if (status === 'HIGH_RISK') return <ShieldAlert size={18} color="#ef4444" />;
    if (status === 'MEDIUM_RISK') return <AlertTriangle size={18} color="#f59e0b" />;
    return <ShieldCheck size={18} color="#10b981" />;
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Stats Dashboard */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>TOTAL SCANS</Text>
          <Text style={styles.statValue}>{stats.total}</Text>
        </View>
        <View style={[styles.statCard, { borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
          <Text style={[styles.statLabel, { color: '#ef4444' }]}>THREATS</Text>
          <Text style={[styles.statValue, { color: '#ef4444' }]}>{stats.threats}</Text>
        </View>
        <View style={[styles.statCard, { borderColor: 'rgba(34, 211, 238, 0.2)' }]}>
          <Text style={[styles.statLabel, { color: '#22d3ee' }]}>SAFETY</Text>
          <Text style={[styles.statValue, { color: '#22d3ee' }]}>{stats.safeRate}%</Text>
        </View>
      </View>

      {/* Search & Filter */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchInner}>
          <Search size={18} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search scans..."
            placeholderTextColor="#475569"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={{color: '#64748b', fontWeight: 'bold'}}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterRow}>
        {['ALL', 'HIGH_RISK', 'MEDIUM_RISK', 'LOW_RISK'].map(type => (
          <TouchableOpacity
            key={type}
            style={[
                styles.filterTag, 
                filterType === type && styles.filterTagActive,
                filterType === type && { borderColor: type === 'HIGH_RISK' ? '#ef444444' : type === 'MEDIUM_RISK' ? '#f59e0b44' : type === 'LOW_RISK' ? '#10b98144' : '#22d3ee44' }
            ]}
            onPress={() => setFilterType(type)}
          >
            <Text style={[
                styles.filterText, 
                filterType === type && styles.filterTextActive,
                filterType === type && { color: type === 'HIGH_RISK' ? '#ef4444' : type === 'MEDIUM_RISK' ? '#f59e0b' : type === 'LOW_RISK' ? '#10b981' : '#22d3ee' }
            ]}>
              {type.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.historyItemWrapper}>
      <TouchableOpacity 
          style={styles.historyItem}
          onPress={() => navigation.navigate('Result', { result: item })}
          activeOpacity={0.7}
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
      <TouchableOpacity 
        style={styles.deleteBtn}
        onPress={() => handleDeleteItem(item.id)}
      >
        <Trash2 size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color="#94a3b8" />
        </TouchableOpacity>
        <View style={styles.navTitleContainer}>
            <BarChart3 size={16} color="#22d3ee" style={{marginRight: 8}} />
            <Text style={styles.navTitle}>Security Dashboard</Text>
        </View>
        <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
            <Trash2 size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <FlatList
          data={filteredHistory}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Shield size={48} color="#1e293b" />
                <Text style={styles.emptyText}>
                    {searchQuery || filterType !== 'ALL' ? "No matches found" : "No scan history yet"}
                </Text>
                <TouchableOpacity 
                    style={styles.scanNowButton}
                    onPress={() => navigation.navigate('Scanner')}
                >
                    <Text style={styles.scanNowText}>Start Scanning</Text>
                </TouchableOpacity>
            </View>
          }
      />
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
  navTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  headerSection: {
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    color: '#f1f5f9',
    fontSize: 20,
    fontWeight: '900',
  },
  searchBarContainer: {
    marginBottom: 12,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchInput: {
    flex: 1,
    color: '#f1f5f9',
    fontSize: 14,
    marginLeft: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterTag: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterTagActive: {
    backgroundColor: 'rgba(34, 211, 238, 0.05)',
    borderColor: 'rgba(34, 211, 238, 0.2)',
  },
  filterText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  filterTextActive: {
    color: '#22d3ee',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  historyItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  historyItem: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: 60,
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
    textAlign: 'center',
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
