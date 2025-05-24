import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import moment from 'moment';

/* Brand Palette */
const BRAND_YELLOW = '#FFD700';
const BRAND_ORANGE = '#FFA500';
const DARK_NAVY    = '#0D1B2A';
const CARD_BG      = '#152536';

const AdminSupportScreen = ({ navigation }) => {
  /* State */
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  /* Fetch tickets */
  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const { data } = await axios.get('https://carwashbackend-qhon.onrender.com/api/support',
        { headers: { Authorization: `Bearer ${token}` } });
      setTickets(data);
    } catch {
      Alert.alert('שגיאה', 'נכשל לטעון פניות');
    } finally { setLoading(false); }
  };

  const resolveTicket = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`https://carwashbackend-qhon.onrender.com/api/support/${id}/resolve`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      fetchTickets();
    } catch {
      Alert.alert('שגיאה', 'נכשל לעדכן סטטוס פנייה');
    }
  };

  /* Helpers */
  const statusColor = (s) => (s==='open'? '#FFA726' : '#66BB6A');

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    return [t.user?.name, t.message, t.status].some(v => (v||'').toLowerCase().includes(q));
  });

  /* Logout */
  const logout = async () => { await AsyncStorage.clear(); navigation.reset({ index:0, routes:[{ name:'Login' }] }); };

  /* Render */
  if (loading) return <ActivityIndicator size="large" color={BRAND_YELLOW} style={{ marginTop:60 }} />;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.logoutBtn} onPress={logout} android_ripple={{ color:'#ffffff22' }}>
          <Icon name="logout" size={20} color="#fff" />
        </Pressable>
        <Text style={styles.pageTitle}>פניות תמיכה</Text>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} android_ripple={{ color:'#00000022' }}>
          <Icon name="arrow-back" size={22} color={DARK_NAVY} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TextInput
          style={styles.searchInput}
          placeholder="חיפוש לפי משתמש, תוכן או סטטוס"
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />

        {filtered.map((t) => (
          <View key={t._id} style={styles.card}>
            <Text style={styles.cardTitle}>{t.user?.name || '—'}</Text>
            <Text style={styles.cardText}>תאריך: {moment(t.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
            <View style={[styles.badge, { backgroundColor: statusColor(t.status) }]}>
              <Text style={styles.badgeTxt}>{t.status === 'open' ? 'פתוחה' : 'טופלה'}</Text>
            </View>
            <Text style={[styles.cardText, { marginTop:6 }]}>{t.message}</Text>

            {t.status === 'open' && (
              <Pressable style={styles.resolveBtn} onPress={() => resolveTicket(t._id)} android_ripple={{ color:'#00000022' }}>
                <LinearGradient colors={[BRAND_YELLOW, BRAND_ORANGE]} style={styles.gradientBtn}>
                  <Text style={styles.resolveTxt}>סמן כטופל</Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        ))}
        <View style={{ height:100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

/* Styles */
const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:DARK_NAVY },
  topBar:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:20, marginTop:8 },
  backBtn:{ backgroundColor:BRAND_YELLOW, padding:10, borderRadius:24, elevation:4 },
  logoutBtn:{ backgroundColor:'#EF5350', padding:10, borderRadius:24, elevation:4 },
  pageTitle:{ flex:1, textAlign:'center', fontSize:22, fontWeight:'bold', color:BRAND_YELLOW },

  content:{ padding:20, paddingBottom:120 },
  searchInput:{ backgroundColor:CARD_BG, color:'#fff', borderRadius:14, padding:12, fontSize:16, textAlign:'right', marginBottom:18, borderWidth:1, borderColor:'#333' },

  card:{ backgroundColor:CARD_BG, borderRadius:18, padding:18, marginBottom:18, borderWidth:1, borderColor:'#1f2f40' },
  cardTitle:{ fontWeight:'bold', color:BRAND_YELLOW, marginBottom:4, textAlign:'right' },
  cardText:{ color:'#bbb', textAlign:'right' },
  badge:{ alignSelf:'flex-start', paddingHorizontal:10, paddingVertical:4, borderRadius:10, marginTop:6 },
  badgeTxt:{ color:'#fff', fontWeight:'bold', fontSize:12 },

  resolveBtn:{ marginTop:14, overflow:'hidden', borderRadius:28 },
  gradientBtn:{ justifyContent:'center', alignItems:'center', paddingVertical:12 },
  resolveTxt:{ color:DARK_NAVY, fontWeight:'bold' },
});

export default AdminSupportScreen;
