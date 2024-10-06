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

type CreateAppPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const CreateAppPasswordScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { setAppPassword, logout } = useAuthStore();
  const navigation = useNavigation<CreateAppPasswordScreenNavigationProp>();
  const [alertProps, setAlertProps] = useState<{ type: 'success' | 'error' | 'warning' | 'info', message: string } | null>(null);

  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
  });

  const isPasswordValid = useMemo(() => password.length >= 4, [password]);
  const doPasswordsMatch = useMemo(() => password === confirmPassword, [password, confirmPassword]);
  const isButtonDisabled = useMemo(() => !isPasswordValid || !doPasswordsMatch, [isPasswordValid, doPasswordsMatch]);

  const handleCreatePassword = useCallback(async () => {
    if (!isPasswordValid) {
      setAlertProps({ type: 'error', message: 'Şifre en az 4 karakter uzunluğunda olmalıdır.' });
      return;
    }

    if (!doPasswordsMatch) {
      setAlertProps({ type: 'error', message: 'Şifreler eşleşmiyor. Lütfen tekrar deneyin.' });
      return;
    }

    try {
      await setAppPassword(password);
      setAlertProps({ type: 'success', message: 'Uygulama şifresi başarıyla oluşturuldu.' });
      setTimeout(() => navigation.navigate('Main'), 2000);
    } catch (error) {
      console.error('Şifre oluşturma hatası:', error);
      setAlertProps({ type: 'error', message: 'Şifre oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.' });
    }
  }, [password, isPasswordValid, doPasswordsMatch, setAppPassword, navigation]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Çıkış yapma hatası:', error);
      setAlertProps({ type: 'error', message: 'Çıkış yapılırken bir hata oluştu. Lütfen tekrar deneyin.' });
    }
  }, [logout, navigation]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {alertProps && <Alert type={alertProps.type} message={alertProps.message} />}
      <Text style={styles.title}>Uygulama Şifresi Oluştur</Text>
      <Text style={styles.subtitle}>Lütfen uygulamanız için bir şifre belirleyin</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor="#808080"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Şifreyi Tekrar Girin"
        placeholderTextColor="#808080"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        autoCapitalize="none"
      />
      
      <TouchableOpacity 
        style={[styles.button, isButtonDisabled && styles.disabledButton]} 
        onPress={handleCreatePassword}
        disabled={isButtonDisabled}
      >
        <Text style={styles.buttonText}>Şifre Oluştur</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.logoutButton]} 
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Çıkış Yap</Text>
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

export default React.memo(CreateAppPasswordScreen);