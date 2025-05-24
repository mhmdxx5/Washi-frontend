import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import DropDownPicker from 'react-native-dropdown-picker';
import LinearGradient from 'react-native-linear-gradient';

/* Brand Palette */
const BRAND_YELLOW = '#FFD700';
const BRAND_ORANGE = '#FFA500';
const DARK_NAVY    = '#0D1B2A';
const CARD_BG      = '#152536';

const AdminProductScreen = ({ navigation }) => {
  /* ──────────────── state ──────────────── */
  const [products, setProducts] = useState([]);
  const [form, setForm]        = useState({ name: '', description: '', price: '', duration: '', type: '' });
  const [editingId, setEditingId] = useState(null);

  /* dropdown */
  const [open, setOpen]           = useState(false);
  const [typeValue, setTypeValue] = useState('');
  const [items, setItems] = useState([
    { label: '🚘 חיצוני', value: 'external' },
    { label: '🫤 פנימי',  value: 'internal' },
    { label: '✨ פוליש',  value: 'polish'  },
    { label: '🔧 אחר',    value: 'other'   },
  ]);

  /* ──────────────── fetch ──────────────── */
  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('https://carwashbackend-qhon.onrender.com/api/products');
      setProducts(data);
    } catch {
      Alert.alert('שגיאה', 'נכשל לטעון את השירותים');
    }
  };

  /* ──────────────── CRUD ──────────────── */
  const saveProduct = async () => {
    const { name, description, price, type } = form;
    if (!name || !description || !price || !type)
      return Alert.alert('שגיאה', 'מלא את כל השדות');

    try {
      const token = await AsyncStorage.getItem('token');
      if (editingId)
        await axios.put(`https://carwashbackend-qhon.onrender.com/api/products/${editingId}`, form,
          { headers: { Authorization: `Bearer ${token}` } });
      else
        await axios.post('https://carwashbackend-qhon.onrender.com/api/products', form,
          { headers: { Authorization: `Bearer ${token}` } });

      setForm({ name: '', description: '', price: '', duration: '', type: '' });
      setTypeValue('');
      setEditingId(null);
      fetchProducts();
    } catch {
      Alert.alert('שגיאה', 'פעולה נכשלה');
    }
  };

  const deleteProduct = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`https://carwashbackend-qhon.onrender.com/api/products/${id}`,
        { headers: { Authorization: `Bearer ${token}` } });
      fetchProducts();
    } catch {
      Alert.alert('שגיאה', 'לא ניתן למחוק');
    }
  };

  const editProduct = (p) => {
    setForm(p);
    setTypeValue(p.type);
    setEditingId(p._id);
  };

  /* ──────────────── auth ──────────────── */
  const logout = async () => {
    await AsyncStorage.clear();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  /* ──────────────── render ──────────────── */
  return (
    <SafeAreaView style={styles.container}>
      {/* Top-bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.logoutBtn} onPress={logout}
                   android_ripple={{ color: '#ffffff22' }}>
          <Icon name="logout" size={20} color="#fff" />
        </Pressable>

        <Text style={styles.pageTitle}>ניהול שירותים</Text>

        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}
                   android_ripple={{ color: '#00000022' }}>
          <Icon name="arrow-back" size={22} color={DARK_NAVY} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}
                  showsVerticalScrollIndicator={false}>

        {/* Form card */}
        <View style={styles.cardForm}>
          {['name', 'description', 'price', 'duration'].map((field) => (
            <TextInput
              key={field}
              style={styles.input}
              placeholder={{
                name: 'שם השירות',
                description: 'תיאור',
                price: 'מחיר',
                duration: "משך (לדוגמה 30 דק')",
              }[field]}
              placeholderTextColor="#999"
              keyboardType={field === 'price' ? 'numeric' : 'default'}
              value={form[field]?.toString()}
              onChangeText={(v) => setForm({ ...form, [field]: v })}
            />
          ))}

          <View style={{ zIndex: 1000, marginBottom: open ? 160 : 16 }}>
            <DropDownPicker
              open={open}
              value={typeValue}
              items={items}
              setOpen={setOpen}
              setValue={(cb) => {
                const v = cb();
                setTypeValue(v);
                setForm({ ...form, type: v });
              }}
              setItems={setItems}
              placeholder="בחר סוג שירות"
              style={{ backgroundColor: CARD_BG, borderColor: '#555' }}
              dropDownContainerStyle={{ backgroundColor: CARD_BG, borderColor: '#555' }}
              textStyle={{ color: '#fff', textAlign: 'right' }}
              placeholderStyle={{ color: '#999', textAlign: 'right' }}
              listItemLabelStyle={{ color: '#fff', textAlign: 'right' }}
            />
          </View>

          <Pressable style={styles.saveBtn}
                     onPress={saveProduct}
                     android_ripple={{ color: '#00000022' }}>
            <LinearGradient colors={[BRAND_YELLOW, BRAND_ORANGE]} style={styles.gradientBtn}>
              <Text style={styles.saveTxt}>
                {editingId ? '✏️ עדכון' : '➕ הוספה'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* List */}
        <Text style={styles.sectionTitle}>שירותים קיימים</Text>

        {products.map((p) => (
          <View key={p._id} style={styles.cardItem}>
            <Text style={styles.cardName}>🧽 {p.name}</Text>
            <Text style={styles.cardDet}>
              ₪{p.price} • {p.type}
            </Text>

            <View style={styles.rowBtns}>
              <Pressable style={styles.btnEdit}
                         onPress={() => editProduct(p)}
                         android_ripple={{ color: '#ffffff22' }}>
                <Icon name="edit" size={18} color="#fff" />
                <Text style={styles.btnTxt}>ערוך</Text>
              </Pressable>

              <Pressable style={styles.btnDel}
                         onPress={() => deleteProduct(p._id)}
                         android_ripple={{ color: '#ffffff22' }}>
                <Icon name="delete" size={18} color="#fff" />
                <Text style={styles.btnTxt}>מחק</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

/* ──────────────── styles ──────────────── */
const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: DARK_NAVY },

  /* top-bar */
  topBar:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                paddingHorizontal: 20, marginTop: 8 },
  backBtn:    { backgroundColor: BRAND_YELLOW, padding: 10, borderRadius: 24, elevation: 4 },
  logoutBtn:  { backgroundColor: '#EF5350',    padding: 10, borderRadius: 24, elevation: 4 },
  pageTitle:  { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: 'bold', color: BRAND_YELLOW },

  /* content */
  content:   { padding: 20, paddingBottom: 120 },

  /* form card */
  cardForm:  { backgroundColor: CARD_BG, borderRadius: 20, padding: 18, marginBottom: 24 },
  input:     { borderBottomWidth: 1, borderColor: '#555', color: '#fff',
               marginBottom: 12, paddingVertical: 8, fontSize: 16, textAlign: 'right' },
  saveBtn:   { overflow: 'hidden', borderRadius: 32, marginTop: 10 },
  gradientBtn:{ justifyContent: 'center', alignItems: 'center', height: 54 },
  saveTxt:   { fontWeight: 'bold', fontSize: 16, color: DARK_NAVY },

  /* list */
  sectionTitle: { fontSize: 18, fontWeight: '600', color: BRAND_YELLOW, textAlign: 'right', marginBottom: 12 },
  cardItem:     { backgroundColor: CARD_BG, borderRadius: 18, padding: 16, marginBottom: 14,
                  borderWidth: 1, borderColor: '#1f2f40' },
  cardName:     { fontSize: 17, fontWeight: 'bold', color: '#fff', textAlign: 'right' },
  cardDet:      { fontSize: 14, color: '#bbb', textAlign: 'right', marginVertical: 4 },

  rowBtns:   { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  btnEdit:   { backgroundColor: '#FFA726', flexDirection: 'row', alignItems: 'center',
               paddingVertical: 6, paddingHorizontal: 16, borderRadius: 24, gap: 6 },
  btnDel:    { backgroundColor: '#EF5350', flexDirection: 'row', alignItems: 'center',
               paddingVertical: 6, paddingHorizontal: 16, borderRadius: 24, gap: 6 },
  btnTxt:    { color: '#fff', fontWeight: 'bold' },
});

export default AdminProductScreen;
