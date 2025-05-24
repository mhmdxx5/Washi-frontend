// LoginScreen.js – حفظ role صغير وثابت في AsyncStorage
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  ActivityIndicator, StatusBar, SafeAreaView, I18nManager, Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BRAND_YELLOW = '#FFD700';
const BRAND_NAVY   = '#0D1B2A';
const API_BASE     = 'https://carwashbackend-qhon.onrender.com/api';

const LoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  /* تأكيد RTL */
  useEffect(() => {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
    }
  }, []);

  /* تحقّق القيم */
  const schema = Yup.object().shape({
    email:    Yup.string().transform(v=>v?.toLowerCase().trim())
                 .email('بريد إلكتروني غير صالح').required('البريد الإلكتروني مطلوب'),
    password: Yup.string().min(6,'يجب أن تكون كلمة المرور 6 أحرف على الأقل')
                 .required('كلمة المرور مطلوبة'),
  });

  /* تسجيل الدخول */
  const onLogin = async ({ email, password }) => {
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API_BASE}/users/login`, {
        email: email.toLowerCase().trim(),
        password,
      });

      const { token, user } = res.data;
      const role = (user.role || '').toLowerCase();     // ← "admin" أو "user"

      await AsyncStorage.multiSet([
        ['token', token],
        ['userName', user.name],
        ['userId', user._id ?? user.id ?? ''],
        ['role', role],                                  // مفتاح ثابت
      ]);

      navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
    } catch (e) {
      setError(e?.response?.data?.message || 'حدث خطأ في تسجيل الدخول');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_NAVY} />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={BRAND_YELLOW} />
          <Text style={styles.loadingText}>جارٍ تسجيل الدخول...</Text>
        </View>
      )}

      <Image source={require('../assets/yellocar.png')} style={styles.carImage} />
      <Text style={styles.headerText}>جاهز لتلميع سيارتك؟</Text>

      <View style={styles.formContainer}>
        <Formik initialValues={{ email:'', password:'' }}
                validationSchema={schema}
                onSubmit={onLogin}>
          {({ handleChange, handleSubmit, values, errors, touched }) => (
            <>
              {/* البريد */}
              <View style={styles.inputWrapper}>
                <Icon name="envelope" size={20} color="#aaa" style={styles.icon}/>
                <TextInput style={styles.input} placeholder="البريد الإلكتروني"
                  placeholderTextColor="#888" keyboardType="email-address"
                  autoCapitalize="none" onChangeText={handleChange('email')}
                  value={values.email}/>
              </View>
              {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

              {/* كلمة المرور */}
              <View style={styles.inputWrapper}>
                <Icon name="lock" size={20} color="#aaa" style={styles.icon}/>
                <TextInput style={styles.input} placeholder="كلمة المرور"
                  placeholderTextColor="#888" secureTextEntry
                  onChangeText={handleChange('password')} value={values.password}/>
              </View>
              {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}
              {error && <Text style={styles.error}>{error}</Text>}

              <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
                <Text style={styles.loginText}>تسجيل الدخول</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={()=>navigation.navigate('Register')}>
                <Text style={styles.registerLink}>ليس لديك حساب؟ سجّل الآن</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

/* الأنماط */
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:BRAND_NAVY,alignItems:'center',
             justifyContent:'center',paddingHorizontal:20},
  carImage:{width:200,height:270,marginBottom:20},
  headerText:{fontSize:24,fontWeight:'bold',color:'#fff',marginBottom:20},
  formContainer:{width:'100%',backgroundColor:'#ffffff10',borderRadius:20,padding:20},
  inputWrapper:{flexDirection:'row-reverse',alignItems:'center',backgroundColor:'#ffffff20',
                borderRadius:25,paddingHorizontal:15,marginBottom:15},
  icon:{marginLeft:10,color:'#fff'},
  input:{flex:1,height:45,color:'#fff',textAlign:'right'},
  error:{color:'salmon',marginBottom:10,textAlign:'right'},
  loginButton:{backgroundColor:BRAND_YELLOW,paddingVertical:12,
               borderRadius:30,alignItems:'center',marginVertical:15},
  loginText:{color:'#000',fontWeight:'bold',fontSize:16},
  registerLink:{color:'#00BFFF',textAlign:'center',fontSize:16},
  loadingOverlay:{...StyleSheet.absoluteFillObject,backgroundColor:'#00000088',
                  justifyContent:'center',alignItems:'center',zIndex:10},
  loadingText:{marginTop:12,color:BRAND_YELLOW,fontSize:16,fontWeight:'bold'},
});
