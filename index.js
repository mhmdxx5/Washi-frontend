// index.js
import 'react-native-gesture-handler';
import { AppRegistry, I18nManager, Platform } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import RNRestart from 'react-native-restart';

if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);

  if (Platform.OS === 'android') {
    RNRestart.Restart(); // ⬅️ הפעלה מחדש כדי להחיל את RTL באנדרואיד
  } else {
    setTimeout(() => RNRestart.Restart(), 100); // ⬅️ iOS דורש עיכוב קטן
  }
} else {
  AppRegistry.registerComponent(appName, () => App);
}
