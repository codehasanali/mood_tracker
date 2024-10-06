import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../context/authContext';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import Alert from '../components/Alert';

type RootStackParamList = {
  Main: undefined;
  Login: undefined;
};

type VerifyAppPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const VerifyAppPasswordScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const { verifyAppPassword, logout } = useAuthStore();
  const navigation = useNavigation<VerifyAppPasswordScreenNavigationProp>();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
  });

  const handleVerifyPassword = useCallback(async () => {
    try {
      const isValid = await verifyAppPassword(password);
      if (isValid) {
        navigation.navigate('Main');
      } else {
        setAlertMessage('Geçersiz şifre. Lütfen tekrar deneyin.');
        setAlertType('error');
      }
    } catch (error) {
      console.error('Şifre doğrulama hatası:', error);
      setAlertMessage('Şifre doğrulanırken bir hata oluştu. Lütfen tekrar deneyin.');
      setAlertType('error');
    }
  }, [password, verifyAppPassword, navigation]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Çıkış yapma hatası:', error);
      setAlertMessage('Çıkış yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
      setAlertType('error');
    }
  }, [logout, navigation]);

  const isButtonDisabled = useMemo(() => password.length < 4, [password]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {alertMessage && <Alert type={alertType} message={alertMessage} />}
      <Text style={styles.title}>Uygulama Şifresini Doğrula</Text>
      <Text style={styles.subtitle}>Lütfen uygulama şifrenizi girin</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor="#808080"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <TouchableOpacity 
        style={[styles.button, isButtonDisabled && styles.disabledButton]} 
        onPress={handleVerifyPassword}
        disabled={isButtonDisabled}
      >
        <Text style={styles.buttonText}>Doğrula</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.logoutButton]} 
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Geri dön.</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#121212',
  },
  title: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    color: '#B3B3B3',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: '#FFFFFF',
    fontFamily: 'Roboto_400Regular',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#4A4A4A',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Roboto_700Bold',
  },
});

export default React.memo(VerifyAppPasswordScreen);