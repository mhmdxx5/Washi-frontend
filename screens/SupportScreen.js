import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';

/* Brand Palette */
const BRAND_YELLOW = '#FFD700';
const BRAND_ORANGE = '#FFA500';
const DARK_NAVY = '#0D1B2A';
const CARD_BG = '#152536';

const SupportScreen = ({ navigation }) => {
  const [message, setMessage] = useState('');

  /* Handlers */
  const handleSend = async () => {
    if (!message.trim()) return Alert.alert('שגיאה', 'נא להזין תוכן הפנייה');
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post('https://carwashbackend-qhon.onrender.com/api/support', { message }, { headers: { Authorization: `Bearer ${token}` } });
      Alert.alert('נשלח', 'הפנייה נשלחה בהצלחה');
      setMessage('');
    } catch (e) {
      Alert.alert('שגיאה', 'שליחת הפנייה נכשלה');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  /* Render */
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.logoutBtn} onPress={handleLogout} android_ripple={{ color: '#ffffff22', radius: 24 }}>
          <Icon name="logout" size={20} color="#fff" />
        </Pressable>
        <Text style={styles.pageTitle}>תמיכה טכנית</Text>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} android_ripple={{ color: '#00000022', radius: 24 }}>
          <Icon name="arrow-back" size={22} color={DARK_NAVY} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>אם יש לך בעיה או שאלה – כתוב לנו פה ונחזור אליך בהקדם.</Text>

        <TextInput
          style={styles.input}
          placeholder="כתוב כאן את הבעיה או הבקשה שלך..."
          placeholderTextColor="#aaa"
          multiline
          numberOfLines={6}
          value={message}
          onChangeText={setMessage}
        />

        <Pressable style={styles.sendBtn} onPress={handleSend} android_ripple={{ color: '#00000022' }}>
          <LinearGradient colors={[BRAND_YELLOW, BRAND_ORANGE]} style={styles.gradientBtn}>
            <Icon name="send" size={18} color={DARK_NAVY} />
            <Text style={styles.sendTxt}>שלח פנייה</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK_NAVY },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 8 },
  backBtn: { backgroundColor: BRAND_YELLOW, padding: 10, borderRadius: 24, elevation: 4 },
  logoutBtn: { backgroundColor: '#EF5350', padding: 10, borderRadius: 24, elevation: 4 },
  pageTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: 'bold', color: BRAND_YELLOW },

  content: { padding: 20, paddingBottom: 120 },
  subtitle: { color: '#ccc', fontSize: 16, textAlign: 'center', marginBottom: 18 },
  input: { backgroundColor: CARD_BG, color: '#fff', borderRadius: 18, padding: 16, fontSize: 16, minHeight: 140, textAlignVertical: 'top', borderWidth: 1, borderColor: '#1f2f40' },

  sendBtn: { marginTop: 26, borderRadius: 32, overflow: 'hidden', width: '100%', alignSelf: 'center' },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, gap: 8 },
  sendTxt: { color: DARK_NAVY, fontWeight: 'bold', fontSize: 17 },
});

export default SupportScreen;
