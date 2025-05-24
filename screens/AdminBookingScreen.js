import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Alert,
  ActivityIndicator, SafeAreaView, TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import moment from 'moment';

/* —— Brand —— */
const BRAND_YELLOW='#FFD700', BRAND_ORANGE='#FFA500',
      BRAND_RED='#EF5350', DARK_NAVY='#0D1B2A', CARD_BG='#152536';

const AdminBookingScreen = ({ navigation })=>{
  const [bookings,setBookings]=useState([]);
  const [loading ,setLoading ]=useState(true);
  const [search ,setSearch ]=useState('');

  /* fetch */
  useEffect(()=>{ fetchBookings(); },[]);
  const fetchBookings=async()=>{
    try{
      const token=await AsyncStorage.getItem('token');
      const {data}=await axios.get('https://carwashbackend-qhon.onrender.com/api/bookings',
        {headers:{Authorization:`Bearer ${token}` }});
      setBookings(data);
    }catch{ Alert.alert('שגיאה','נכשל לטעון את ההזמנות'); }
    finally{ setLoading(false); }
  };

  /* update status */
  const updateStatus=async(id,status)=>{
    try{
      setLoading(true);
      const token=await AsyncStorage.getItem('token');
      await axios.put(`https://carwashbackend-qhon.onrender.com/api/bookings/${id}/status`,
        {status},{headers:{Authorization:`Bearer ${token}`}});
      await fetchBookings();
    }catch{ Alert.alert('שגיאה','נכשל לעדכן סטטוס'); }
    finally{ setLoading(false); }
  };

  const statusColor=s=>({pending:'#FFA726',completed:'#66BB6A',canceled:'#EF5350'}[s]||'#BDBDBD');

  /* filter incl. electricity/water */
  const q=search.toLowerCase();
  const filtered=bookings.filter(b=>
    [b.user?.name,b.carNumber,b.status,
     b.electricity?'electricity':'', b.water?'water':'']
    .some(v=>(v||'').toLowerCase().includes(q)));

  const logout=async()=>{
    await AsyncStorage.clear();
    navigation.reset({index:0,routes:[{name:'Login'}]});
  };

  /* —— UI —— */
  return(
  <SafeAreaView style={st.container}>
    {loading&&<View style={st.overlay}>
      <ActivityIndicator size="large" color={BRAND_YELLOW}/>
      <Text style={st.ovTxt}>טוען הזמנות…</Text>
    </View>}

    {/* Top */}
    <View style={st.top}>
      <Pressable style={st.logout} onPress={logout}
                 android_ripple={{color:'#ffffff22'}}>
        <Icon name="logout" size={20} color="#fff"/>
      </Pressable>
      <Text style={st.title}>ניהול הזמנות</Text>
      <Pressable style={st.back} onPress={()=>navigation.goBack()}
                 android_ripple={{color:'#00000022'}}>
        <Icon name="arrow-back" size={22} color={DARK_NAVY}/>
      </Pressable>
    </View>

    <ScrollView contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>
      <TextInput
        style={st.search}
        placeholder="חיפוש (שם, רכב, סטטוס, חשמל, מים…)"
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
      />

      {filtered.map(bk=>(
        <View key={bk._id} style={st.card}>
          <Text style={st.cardTitle}>מאת: {bk.user?.name||'—'}</Text>
          <Text style={st.cardTxt}>תאריך: {moment(bk.date).format('DD/MM/YYYY HH:mm')}</Text>

          <View style={[st.badge,{backgroundColor:statusColor(bk.status)}]}>
            <Text style={st.badgeTxt}>{bk.status}</Text>
          </View>

          <Text style={st.cardTxt}>מיקום: {bk.location}</Text>
          <Text style={st.cardTxt}>רכב: {bk.carNumber}</Text>
          <Text style={st.cardTxt}>טלפון: {bk.phone}</Text>

          {/* ✨ שורות חשמל/מים */}
          {bk.electricity && <Text style={st.cardTxt}>🔌 נקודת חשמל זמינה</Text>}
          {bk.water       && <Text style={st.cardTxt}>🚿 נקודת מים זמינה</Text>}

          {bk.notes?.length>0 && <Text style={st.cardTxt}>הערות: {bk.notes}</Text>}

          <Text style={st.subTitle}>שירותים:</Text>
          {bk.services.map((s,i)=>(
            <Text key={i} style={st.cardTxt}>- {s.name} (₪{s.price})</Text>
          ))}

          <Text style={st.cardTxt}>סה"כ: ₪{bk.totalPrice}</Text>

          <Text style={st.subTitle}>סטטוס:</Text>
          <View style={st.row}>
            {['pending','completed','canceled'].map(stt=>(
              <Pressable key={stt}
                style={[st.stBtn,bk.status===stt&&st.stBtnAct]}
                onPress={()=>updateStatus(bk._id,stt)}
                android_ripple={{color:'#00000022'}}>
                <Text style={st.stTxt}>
                  {stt==='pending'?'ממתין':stt==='completed'?'הושלם':'בוטל'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
      <View style={{height:100}}/>
    </ScrollView>
  </SafeAreaView>);
};

/* —— Styles —— */
const st=StyleSheet.create({
  container:{flex:1,backgroundColor:DARK_NAVY},
  overlay:{position:'absolute',top:0,left:0,right:0,bottom:0,
           backgroundColor:'#00000088',justifyContent:'center',alignItems:'center',zIndex:10},
  ovTxt:{marginTop:12,color:BRAND_YELLOW,fontSize:16,fontWeight:'bold'},

  top:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',
       paddingHorizontal:20,marginTop:8},
  logout:{backgroundColor:BRAND_RED,padding:10,borderRadius:24},
  back:{backgroundColor:BRAND_YELLOW,padding:10,borderRadius:24,marginStart:8},
  title:{flex:1,textAlign:'center',fontSize:22,fontWeight:'bold',color:BRAND_YELLOW},

  content:{padding:20,paddingBottom:120},
  search:{backgroundColor:CARD_BG,color:'#fff',borderRadius:14,
          padding:12,marginBottom:18,fontSize:16,textAlign:'right',borderWidth:1,borderColor:'#333'},

  card:{backgroundColor:CARD_BG,borderRadius:18,padding:18,marginBottom:18,
        borderWidth:1,borderColor:'#1f2f40'},
  cardTitle:{fontWeight:'bold',color:BRAND_YELLOW,marginBottom:4,textAlign:'right'},
  cardTxt:{color:'#bbb',textAlign:'right',marginBottom:3},
  subTitle:{fontWeight:'bold',color:'#fff',marginTop:10,marginBottom:4,textAlign:'right'},

  badge:{alignSelf:'flex-start',paddingHorizontal:10,paddingVertical:4,
         borderRadius:10,marginBottom:6},
  badgeTxt:{color:'#fff',fontWeight:'bold',fontSize:12},

  row:{flexDirection:'row-reverse',justifyContent:'space-between',marginTop:10},
  stBtn:{flex:1,backgroundColor:'#555',marginHorizontal:4,paddingVertical:8,
         borderRadius:10,alignItems:'center'},
  stBtnAct:{backgroundColor:BRAND_YELLOW},
  stTxt:{color:'#000',fontWeight:'bold'},
});

export default AdminBookingScreen;
