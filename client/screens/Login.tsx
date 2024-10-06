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
import CustomTextInput from '../components/CustomTextInput';
import Alert from '../components/Alert';


const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const navigation = useNavigation<NavigationProp<any>>();

  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
  });

  const handleLogin = useCallback(async () => {
    if (!username.trim() || !password.trim()) {
      setError('Tüm alanları doldurunuz.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(username.trim(), password.trim());
    } catch (err) {
      setError((err as Error).message || 'Giriş başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }, [username, password, login]);

  const navigateToRegister = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

  const isFormValid = username.trim() && password.trim();

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
          <Text style={styles.title}>Hoş Geldiniz</Text>
          <Text style={styles.subtitle}>Duygularınızı keşfetmeye hazır mısınız?</Text>
        </View>

        <View style={styles.formContainer}>
          <CustomTextInput
            iconName="person-outline"
            placeholder="Kullanıcı Adı"
            value={username}
            onChangeText={setUsername}
            keyboardType="default"
            autoCapitalize="none"
          />

          <CustomTextInput
            iconName="lock-closed-outline"
            placeholder="Şifre"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} style={styles.eyeIcon}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={24}
                  color="#B3B3B3"
                />
              </TouchableOpacity>
            }
          />

          <TouchableOpacity
            style={[styles.loginButton, !isFormValid && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={!isFormValid || loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hesabınız yok mu?</Text>
          <TouchableOpacity onPress={navigateToRegister}>
            <Text style={styles.signUpText}>Kayıt Ol</Text>
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
  loginButton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
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
  signUpText: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 5,
  },
});

export default React.memo(LoginScreen);