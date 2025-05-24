/* MyBookingsScreen.js – عدّادات حسب الحالة + إجمالي */
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  Alert, SafeAreaView, I18nManager, ActivityIndicator,
} from 'react-native';
import Icon           from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage   from '@react-native-async-storage/async-storage';
import axios          from 'axios';
import moment         from 'moment';
import LinearGradient from 'react-native-linear-gradient';

/* — ألوان وهوامش — */
const BRAND_YELLOW='#FFD700', BRAND_ORANGE='#FFA500', BRAND_RED='#EF5350',
      DARK_NAVY='#0D1B2A', CARD_BG='#152536', SIDE=14, RTL=I18nManager.isRTL;

/* حالة → نص ولون */
const STATUS = {
  pending  : { label:'معلّق',  color:'#FFA726' },
  completed: { label:'مكتمل', color:'#66BB6A' },
  canceled : { label:'ملغى',  color:'#EF5350' },
};

const MyBookingsScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading , setLoading ] = useState(true);

  /* جلب الحجوزات */
  useEffect(()=>{
    (async()=>{
      try{
        const token = await AsyncStorage.getItem('token');
        const { data } = await axios.get(
          'https://carwashbackend-qhon.onrender.com/api/bookings/my',
          { headers:{ Authorization:`Bearer ${token}` } }
        );
        setBookings(data);
      }catch(e){
        console.error(e);
        Alert.alert('خطأ','تعذّر تحميل الحجوزات');
      }finally{ setLoading(false); }
    })();
  },[]);

  /* إلغاء */
  const canRequestCancel = d => moment(d).diff(moment(),'hours') >= 2;
  const sendCancel = async id=>{
    try{
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        'https://carwashbackend-qhon.onrender.com/api/bookings/send-cancel-request',
        { bookingId:id },
        { headers:{ Authorization:`Bearer ${token}` } }
      );
      Alert.alert('تم الإرسال','تم إرسال طلب الإلغاء للإدارة');
    }catch(e){
      console.error(e);
      Alert.alert('خطأ','حدث خطأ أثناء إرسال الطلب');
    }
  };
  const logout = async ()=>{
    await AsyncStorage.clear();
    navigation.reset({index:0,routes:[{name:'Login'}]});
  };

  /* عدّادات الحالة */
  const counts = bookings.reduce((acc,b)=>{ acc[b.status]=(acc[b.status]||0)+1; return acc; },{});
  const total  = bookings.length;

  /* تحميل... */
  if (loading)
    return <ActivityIndicator size="large" color={BRAND_YELLOW}
                              style={{flex:1,backgroundColor:DARK_NAVY}}/>;

  /* — واجهة — */
  return (
    <SafeAreaView style={st.container}>
      {/* شريط علوي */}
      <View style={[st.top,{flexDirection:RTL?'row-reverse':'row'}]}>
        <Pressable style={st.logout} onPress={logout}
                   android_ripple={{color:'#ffffff22',radius:20}}>
          <Icon name="logout" size={18} color="#fff"/>
        </Pressable>

        <Text style={st.title}>حجوزاتي</Text>

        <Pressable style={st.back} onPress={()=>navigation.goBack()}
                   android_ripple={{color:'#00000022',radius:20}}>
          <Icon name={RTL?'arrow-forward':'arrow-back'} size={20} color={DARK_NAVY}/>
        </Pressable>
      </View>

      {/* عدّادات */}
      <View style={st.countBox}>
        <Text style={st.countTotal}>إجمالي الحجوزات: {total}</Text>
        <View style={st.countRow}>
          {Object.entries(STATUS).map(([k,v])=>(
            <View key={k} style={[st.countBadge,{backgroundColor:v.color}]}>
              <Text style={st.countTxt}>{v.label}: {counts[k]||0}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* القائمة */}
      <ScrollView contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>
        {bookings.map(bk=>{
          const stt = STATUS[bk.status] || { label: bk.status, color:'#BDBDBD' };
          return (
            <View key={bk._id} style={st.card}>
              <Text style={st.field}>التاريخ: {moment(bk.date).format('DD/MM/YYYY   HH:mm')}</Text>

              <View style={st.statusRow}>
                <Text style={st.field}>الحالة:</Text>
                <View style={[st.statusBadge,{backgroundColor:stt.color}]}>
                  <Text style={st.statusTxt}>{stt.label}</Text>
                </View>
              </View>

              <Text style={st.field}>الموقع: {bk.location}</Text>
              <Text style={st.field}>سيارة: {bk.carNumber}</Text>
              <Text style={st.field}>هاتف: {bk.phone}</Text>

              {bk.electricity && <Text style={st.field}>🔌 يتوفر نقطة كهرباء</Text>}
              {bk.water       && <Text style={st.field}>🚿 يتوفر نقطة مياه</Text>}

              {bk.notes?.length>0 &&
                <Text style={st.field}>ملاحظات: {bk.notes}</Text>}

              <Text style={[st.field,{marginTop:6}]}>الخدمات:</Text>
              {bk.services.map((s,i)=>
                <Text key={i} style={st.serviceItem}>- {s.name} (₪{s.price})</Text>
              )}

              <Text style={st.total}>₪ الإجمالي: {bk.totalPrice}</Text>

              {bk.status==='pending' && canRequestCancel(bk.date) && (
                <Pressable style={st.cancelBtn} onPress={()=>sendCancel(bk._id)}
                           android_ripple={{color:'#00000022'}}>
                  <LinearGradient colors={[BRAND_YELLOW,BRAND_ORANGE]} style={st.gradientBtn}>
                    <Icon name="cancel" size={18} color={DARK_NAVY} style={{marginStart:6}}/>
                    <Text style={st.cancelTxt}>طلب إلغاء</Text>
                  </LinearGradient>
                </Pressable>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

/* — أنماط — */
const st = StyleSheet.create({
  container:{flex:1,backgroundColor:DARK_NAVY},
  top:{alignItems:'center',justifyContent:'space-between',
       marginTop:8,paddingHorizontal:SIDE},
  logout:{backgroundColor:BRAND_RED,padding:6,borderRadius:18},
  back:{backgroundColor:BRAND_YELLOW,padding:6,borderRadius:18,marginStart:8},
  title:{flex:1,textAlign:'center',fontSize:18,fontWeight:'bold',color:BRAND_YELLOW},

  /* عدّادات */
  countBox:{paddingHorizontal:SIDE,marginTop:4},
  countTotal:{color:BRAND_YELLOW,fontWeight:'700',fontSize:16,textAlign:'center',marginBottom:6},
  countRow:{flexDirection:'row-reverse',justifyContent:'center',gap:8,flexWrap:'wrap'},
  countBadge:{borderRadius:16,paddingHorizontal:10,paddingVertical:4,minWidth:90},
  countTxt:{color:'#fff',fontWeight:'700',fontSize:13,textAlign:'center'},

  content:{paddingHorizontal:SIDE,paddingBottom:120,paddingTop:6},
  card:{backgroundColor:CARD_BG,borderRadius:18,padding:16,marginBottom:18,
        borderWidth:1,borderColor:'#1f2f40'},
  field:{color:'#fff',fontWeight:'bold',textAlign:'right',fontSize:14},
  serviceItem:{color:'#bbb',textAlign:'right',fontSize:13},
  total:{color:BRAND_YELLOW,fontWeight:'700',textAlign:'center',marginTop:8},

  statusRow:{flexDirection:'row-reverse',alignItems:'center',marginVertical:6,gap:6},
  statusBadge:{borderRadius:12,paddingHorizontal:10,paddingVertical:4},
  statusTxt:{color:'#fff',fontWeight:'bold',fontSize:12},

  cancelBtn:{marginTop:12,borderRadius:28,overflow:'hidden'},
  gradientBtn:{flexDirection:'row-reverse',alignItems:'center',
               justifyContent:'center',height:40},
  cancelTxt:{color:DARK_NAVY,fontWeight:'bold',fontSize:15},
});

export default MyBookingsScreen;
