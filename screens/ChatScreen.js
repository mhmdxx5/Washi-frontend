// ChatScreen.js – RTL מלא,  נעילת כפתור-שליחה, וזיהוי role באותיות קטנות
import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, Pressable, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
  SafeAreaView, Image, Modal, Animated, Easing, RefreshControl,
  I18nManager,
} from 'react-native';
import AsyncStorage         from '@react-native-async-storage/async-storage';
import axios                from 'axios';
import io                   from 'socket.io-client';
import Icon                 from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import ImageView            from 'react-native-image-viewing';
import moment               from 'moment';

/* Palette + layout */
const BRAND_YELLOW='#FFD700', DARK_NAVY='#0D1B2A', CARD_BG='#152536',
      SIDE_PADDING=14, AVATAR_SIZE=46;

const SOCKET_URL='https://carwashbackend-qhon.onrender.com';
const API_URL   ='https://carwashbackend-qhon.onrender.com/api';
const isRTL     = I18nManager.isRTL;

/* ——— Component ——— */
const ChatScreen = ({ navigation }) => {
  /* state */
  const [role,setRole]               = useState(null);   // ← תמיד קטן ("admin"/"user")
  const [userId,setUserId]           = useState(null);
  const [users,setUsers]             = useState([]);
  const [search,setSearch]           = useState('');
  const [presence,setPresence]       = useState({});
  const [roomId,setRoomId]           = useState(null);
  const [messages,setMessages]       = useState([]);
  const [input,setInput]             = useState('');
  const [sending,setSending]         = useState(false);  // 🔒 נעילה בזמן שליחה
  const [initLoad,setInitLoad]       = useState(true);
  const [roomLoading,setRoomLoading] = useState(false);
  const [uploading,setUploading]     = useState(false);
  const [otherTyping,setOtherTyping] = useState(false);
  const [viewer,setViewer]           = useState({visible:false,uri:''});
  const [refreshing,setRefreshing]   = useState(false);

  /* refs */
  const socket      = useRef(null);
  const typingTO    = useRef(null);
  const flatListRef = useRef(null);

  /* init */
  useEffect(()=>{
    (async()=>{
      const r  = (await AsyncStorage.getItem('role'))?.toLowerCase();
      const id = await AsyncStorage.getItem('userId');
      setRole(r); setUserId(id);

      if (r === 'admin') {
        await fetchUsers(id);
        initPresenceSocket(id);
      } else {
        await openOrCreateRoom();
      }
      setInitLoad(false);
    })();
  },[]);

  /* ניקוי סוקט בסגירה */
  useEffect(()=>()=>{ socket.current?.disconnect(); },[]);

  /* גלילה אוטומטית */
  useEffect(()=>{ if (messages.length) flatListRef.current?.scrollToEnd({animated:true}); },[messages]);

  /* ——— Helpers ——— */
  const logout = async () => {
    await AsyncStorage.clear();
    navigation.reset({ index:0, routes:[{ name:'Login' }]});
  };

  /* הבאת משתמשים (admin) */
  const fetchUsers = async (adminId) => {
    const token = await AsyncStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/users?role=user`,
      { headers:{ Authorization:`Bearer ${token}` }});
    setUsers(data.filter(u => u._id !== adminId));
  };
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers(userId);
    setRefreshing(false);
  };

  /* presence socket (admin) */
  const initPresenceSocket = (uid) => {
    socket.current = io(SOCKET_URL,{ transports:['websocket'], query:{ uid }});
    socket.current.on('presence', p =>
      setPresence(prev=>({ ...prev,[p.uid]:p.online })));
  };

  /* פתיחת חדר (admin או user) */
  const openOrCreateRoom = async (target=null) => {
    setRoomLoading(true);
    const token = await AsyncStorage.getItem('token');
    const { data } = await axios.post(`${API_URL}/chat/start`,
      { targetUser:target }, { headers:{ Authorization:`Bearer ${token}` }});
    await joinRoom(data._id);
    setRoomLoading(false);
  };

  /* כניסה לחדר */
  const joinRoom = async (id) => {
    setRoomId(id); setMessages([]); setOtherTyping(false);

    if (!socket.current || role!=='admin')
      socket.current = io(SOCKET_URL,{ transports:['websocket'] });

    socket.current.off('receiveMessage').off('typing');

    socket.current.emit('joinRoom',id);
    socket.current.on('receiveMessage',m=>setMessages(p=>p.find(x=>x._id===m._id)?p:[...p,m]));
    socket.current.on('typing',({isTyping})=>setOtherTyping(isTyping));

    const token = await AsyncStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/chat/${id}/messages`,
      { headers:{ Authorization:`Bearer ${token}` }});
    setMessages(data);

    await axios.post(`${API_URL}/chat/${id}/seen`,{},
      { headers:{ Authorization:`Bearer ${token}` }});
  };

  /* שליחת טקסט (נעילת כפתור) */
  const sendText = async () => {
    if (!input.trim() || sending) return;
    try{
      setSending(true);
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${API_URL}/chat/${roomId}/messages`,
        { content:input },
        { headers:{ Authorization:`Bearer ${token}` }});
      setInput('');
      socket.current.emit('typing',{ roomId,isTyping:false });
    } finally { setSending(false); }
  };

  /* בחירת תמונה */
  const pickImage = () => {
    launchImageLibrary({ mediaType:'photo',quality:0.8 }, async res=>{
      if (res.didCancel||res.errorCode) return;
      const a = res.assets?.[0]; if (!a) return;
      await uploadImage(a);
    });
  };

  /* העלאת תמונה */
  const uploadImage = async (asset) => {
    try{
      setUploading(true);
      const token = await AsyncStorage.getItem('token');
      const fd   = new FormData();
      fd.append('file',{ uri:asset.uri,type:asset.type,
                         name:asset.fileName||`img_${Date.now()}.jpg`});
      await axios.post(`${API_URL}/chat/${roomId}/upload`,fd,{
        headers:{ Authorization:`Bearer ${token}`,'Content-Type':'multipart/form-data' }
      });
    } finally { setUploading(false); }
  };

  /* הקלדה */
  const onType = txt => {
    setInput(txt);
    socket.current.emit('typing',{ roomId,isTyping:true });
    clearTimeout(typingTO.current);
    typingTO.current = setTimeout(()=>socket.current.emit('typing',{ roomId,isTyping:false }),1200);
  };

  /* ——— Renderers ——— */
  const Bubble = ({ item }) => {
    const mine  = item.sender===userId;
    const style = mine?styles.bUser:styles.bAdmin;
    const time  = moment(item.createdAt).format('HH:mm');

    if (item.msgType==='image')
      return (
        <Pressable style={[styles.imgWrap,style]}
                   onPress={()=>setViewer({visible:true,uri:item.imageUrl})}>
          <Image source={{uri:item.imageUrl}} style={styles.chatImage}/>
          <Text style={styles.timeTxt}>{time}</Text>
        </Pressable>
      );
    return (
      <View style={[styles.bubble,style]}>
        <Text style={styles.txt}>{item.content}</Text>
        <Text style={styles.timeTxt}>{time}</Text>
      </View>
    );
  };

  const Card = ({ item }) => {
    const online = presence[item._id];
    const first  = item.name?.charAt(0)?.toUpperCase()||'?';
    return (
      <Pressable style={styles.card}
        android_ripple={{color:'#00000022',radius:46}}
        onPress={()=>openOrCreateRoom(item._id)}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarTxt}>{first}</Text>
          {online && <View style={styles.dot}/>}
        </View>
        <View style={{flex:1}}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardSub}>{item.lastMessage}</Text>
        </View>
        {item.unread>0 &&
          <View style={styles.badge}><Text style={styles.badgeTxt}>{item.unread}</Text></View>}
        <Icon name={isRTL?'chevron-right':'chevron-left'} size={24} color="#888"/>
      </Pressable>
    );
  };

  const ListHeader = () => (
    <TextInput
      value={search}
      onChangeText={setSearch}
      placeholder="ابحث عن مستخدم…"
      placeholderTextColor="#888"
      style={styles.searchInput}
    />
  );

  const FadeOverlay = ({ message }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    useEffect(()=>{
      Animated.timing(opacity,{toValue:1,duration:250,useNativeDriver:true,
                               easing:Easing.out(Easing.ease)}).start();
    },[]);
    return (
      <Modal transparent>
        <Animated.View style={[styles.overlay,{opacity}]}>
          <ActivityIndicator size="large" color={BRAND_YELLOW}/>
          <Text style={styles.overlayTxt}>{message}</Text>
        </Animated.View>
      </Modal>
    );
  };

  /* ——— Filters ——— */
  const filtered = users.filter(u=>u.name.toLowerCase().includes(search.toLowerCase()));

  /* ——— Render Flow ——— */
  if (initLoad)
    return <ActivityIndicator size="large" color={BRAND_YELLOW}
                              style={{marginTop:120}}/>;

  /* ----- רשימת חדרים (admin) ----- */
  if (role==='admin' && !roomId){
    return(
      <SafeAreaView style={styles.container}>
        <View style={[styles.topBar,{flexDirection:isRTL?'row-reverse':'row'}]}>
          <Pressable style={styles.logoutBtn} onPress={logout}
            android_ripple={{color:'#ffffff22',radius:22}}>
            <Icon name="logout" size={20} color="#fff"/>
          </Pressable>
       

          <Text style={styles.title}>قائمة المحادثات</Text>

             <Pressable style={styles.backBtn} onPress={()=>navigation.goBack()}
            android_ripple={{color:'#00000022',radius:22}}>
            <Icon name={isRTL?'arrow-forward':'arrow-back'}
                  size={20} color={DARK_NAVY}/>
          </Pressable>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={u=>u._id}
          renderItem={Card}
          ListHeaderComponent={ListHeader}
          refreshControl={<RefreshControl refreshing={refreshing}
                           onRefresh={onRefresh} colors={[BRAND_YELLOW]}/>}
          contentContainerStyle={{padding:SIDE_PADDING}}
        />
        {roomLoading && <FadeOverlay message="جارٍ تحميل المحادثة…"/>}
      </SafeAreaView>
    );
  }

  /* ----- חדר צ'אט ----- */
  return(
    <SafeAreaView style={styles.container}>
      <View style={[styles.topBar,{flexDirection:isRTL?'row-reverse':'row'}]}>
        <Pressable style={styles.logoutBtn} onPress={logout}
          android_ripple={{color:'#ffffff22',radius:22}}>
          <Icon name="logout" size={20} color="#fff"/>
        </Pressable>
   

        <Text style={styles.title}>المحادثة</Text>

             <Pressable style={styles.backBtn}
          onPress={()=>role==='admin'?setRoomId(null):navigation.goBack()}
          android_ripple={{color:'#00000022',radius:22}}>
          <Icon name={isRTL?'arrow-forward':'arrow-back'} size={20} color={DARK_NAVY}/>
        </Pressable>
        
      </View>

      <KeyboardAvoidingView style={{flex:1}}
        behavior={Platform.OS==='ios'?'padding':undefined} keyboardVerticalOffset={90}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(it,i)=>it._id||i.toString()}
          renderItem={Bubble}
          ListEmptyComponent={()=> <Text style={styles.emptyTxt}>لا توجد رسائل بعد</Text>}
          contentContainerStyle={{padding:SIDE_PADDING}}
        />

        {/* שורת קלט */}
        <View style={styles.inputRow}>
          {otherTyping &&
            <View style={styles.typingBubble}><Text style={styles.typingTxt}>يكتب…</Text></View>}
          <TouchableOpacity onPress={pickImage} style={styles.mediaBtn}
                            disabled={uploading || sending}>
            <Icon name="photo" size={24} color={BRAND_YELLOW}/>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="اكتب رسالتك..."
            placeholderTextColor="#999"
            value={input}
            onChangeText={onType}
            editable={!uploading && !sending}
          />
          <TouchableOpacity
            style={[styles.sendBtn,(uploading||sending)&&{opacity:0.4}]}
            onPress={sendText}
            disabled={uploading || sending}>
            <Icon name="send" size={20} color={DARK_NAVY}/>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <ImageView images={[{uri:viewer.uri}]} imageIndex={0}
                 visible={viewer.visible}
                 onRequestClose={()=>setViewer({visible:false,uri:''})}/>

      {uploading && <FadeOverlay message="جارٍ رفع الصورة…"/>}
    </SafeAreaView>
  );
};

/* ------------ styles ------------ */
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:DARK_NAVY},

  topBar:{alignItems:'center',justifyContent:'space-between',
          marginTop:8,paddingHorizontal:SIDE_PADDING},
  title :{flex:1,textAlign:'center',color:BRAND_YELLOW,
          fontSize:18,fontWeight:'bold'},
  backBtn:{backgroundColor:BRAND_YELLOW,padding:6,borderRadius:18,marginEnd:8},
  logoutBtn:{backgroundColor:'#C62828',padding:6,borderRadius:18,
             marginStart:8},

  searchInput:{backgroundColor:'#1a2a3c',color:'#fff',borderRadius:20,
               paddingHorizontal:16,paddingVertical:10,marginBottom:14,fontSize:15},

  /* כרטיס משתמש */
  card:{flexDirection:'row',alignItems:'center',backgroundColor:CARD_BG,
        padding:12,borderRadius:14,marginBottom:12,borderWidth:1,borderColor:'#1f2f40'},
  avatarWrap:{width:AVATAR_SIZE,height:AVATAR_SIZE,borderRadius:AVATAR_SIZE/2,
              backgroundColor:'#394b60',justifyContent:'center',alignItems:'center',marginEnd:12},
  avatarTxt:{color:BRAND_YELLOW,fontSize:19,fontWeight:'bold'},
  dot:{position:'absolute',bottom:3,right:3,width:10,height:10,borderRadius:5,
       backgroundColor:'#4caf50'},
  badge:{backgroundColor:'#EF5350',borderRadius:12,minWidth:24,paddingHorizontal:6,
         alignItems:'center',justifyContent:'center',marginEnd:6},
  badgeTxt:{color:'#fff',fontSize:12,fontWeight:'600'},
  cardName:{color:BRAND_YELLOW,fontSize:16,fontWeight:'700'},
  cardSub :{color:'#999',fontSize:13,marginTop:2},

  /* בועות */
  bubble:{padding:14,borderRadius:18,marginBottom:6,maxWidth:'80%'},
  bUser :{backgroundColor:BRAND_YELLOW,alignSelf:'flex-end'},
  bAdmin:{backgroundColor:'#444',alignSelf:'flex-start'},
  txt:{color:'#fff',fontSize:15},
  timeTxt:{fontSize:11,color:'#eee',marginTop:4,textAlign:'right'},
  imgWrap:{borderRadius:18,overflow:'hidden',marginBottom:6,maxWidth:'70%'},
  chatImage:{width:180,height:180},

  /* קלט */
  inputRow:{flexDirection:'row-reverse',alignItems:'center',
            borderTopWidth:1,borderColor:'#1a2a3c',
            backgroundColor:'#152536',padding:10},
  typingBubble:{backgroundColor:'#00000088',paddingHorizontal:12,
                paddingVertical:6,borderRadius:18,marginEnd:8},
  typingTxt:{color:BRAND_YELLOW,fontSize:16,fontWeight:'600'},

  mediaBtn:{marginEnd:8},
  input:{flex:1,backgroundColor:'#1a2a3c',borderRadius:20,
         paddingHorizontal:14,color:'#fff',height:44,fontSize:15},
  sendBtn:{backgroundColor:BRAND_YELLOW,padding:10,borderRadius:18,marginStart:8},

  emptyTxt:{color:'#777',alignSelf:'center',marginTop:30},

  /* overlay */
  overlay:{position:'absolute',top:0,left:0,right:0,bottom:0,
           backgroundColor:'#00000088',justifyContent:'center',alignItems:'center'},
  overlayTxt:{marginTop:12,color:BRAND_YELLOW,fontSize:16,fontWeight:'bold'},
});

export default ChatScreen;
