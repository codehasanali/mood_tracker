import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import useAuth from '../hooks/useAuth';
import { RegisterCredentials } from '../types/Auth';
import CustomTextInput from '../components/CustomTextInput';
import Alert from '../components/Alert';

const RegisterScreen: React.FC = () => {
  const { register } = useAuth();
  const [credentials, setCredentials] = useState<RegisterCredentials>({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigation = useNavigation<NavigationProp<any>>();

  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
  });

  const handleInputChange = useCallback(
    (key: keyof RegisterCredentials) => (value: string) => {
      setCredentials((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleRegister = useCallback(async () => {
    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError('Tüm alanları doldurunuz.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(credentials.username.trim(), credentials.password.trim());

    } catch (err) {

      setError('Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  }, [credentials, register]);

  const handleLoginNavigation = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  const isFormValid = credentials.username.trim() && credentials.password.trim();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        {error && <Alert type="error" message={error} />}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>Duygularınızı keşfetmeye hazır mısınız?</Text>
        </View>

        <View style={styles.formContainer}>
          <CustomTextInput
            iconName="person-outline"
            placeholder="Kullanıcı Adı"
            value={credentials.username}
            onChangeText={handleInputChange('username')}
            keyboardType="default"
            autoCapitalize="none"
          />

          <CustomTextInput
            iconName="lock-closed-outline"
            placeholder="Şifre"
            value={credentials.password}
            onChangeText={handleInputChange('password')}
            secureTextEntry={!showPassword}
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={24}
                  color="#B3B3B3"
                />
              </TouchableOpacity>
            }
          />

          <TouchableOpacity
            style={[styles.registerButton, !isFormValid && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={!isFormValid || loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Zaten hesabınız var mı?</Text>
          <TouchableOpacity onPress={handleLoginNavigation}>
            <Text style={styles.loginText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 18,
    color: '#B3B3B3',
  },
  formContainer: {
    width: '100%',
  },
  eyeIcon: {
    padding: 8,
  },
  registerButton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  registerButtonText: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    color: '#B3B3B3',
  },
  loginText: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 5,
  },
});

export default React.memo(RegisterScreen);