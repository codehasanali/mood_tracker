import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, Switch, Modal, TextInput } from 'react-native';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import useUser from '../hooks/useUser';
import { useAuthStore } from '../context/authContext';
import AlertComponent from '../components/Alert';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 320;

const normalize = (size: number): number => {
  const newSize = size * scale;
  return Math.round(Platform.OS === 'ios' ? newSize : newSize - 2);
};

type RootStackParamList = {
  Login: undefined;
};

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const SettingsScreen: React.FC = () => {
  const { user, isLoading, error, fetchUserProfile, updateUserProfile } = useUser();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { logout, setAppPassword, verifyAppPassword, hasAppPassword } = useAuthStore();
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold });
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isAppPasswordModalVisible, setIsAppPasswordModalVisible] = useState(false);
  const [currentAppPassword, setCurrentAppPassword] = useState('');
  const [newAppPassword, setNewAppPassword] = useState('');
  const [confirmNewAppPassword, setConfirmNewAppPassword] = useState('');
  const [appPasswordError, setAppPasswordError] = useState('');
  const [isUsernameModalVisible, setIsUsernameModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [fetchUserProfile])
  );

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Çıkış yapma hatası:', error);
    }
  }, [logout, navigation]);

  const toggleDarkMode = useCallback(() => setIsDarkMode(prev => !prev), []);
  const toggleNotifications = useCallback(() => setIsNotificationsEnabled(prev => !prev), []);
  const toggleAppPasswordModal = useCallback(() => {
    setIsAppPasswordModalVisible(prev => !prev);
    setCurrentAppPassword('');
    setNewAppPassword('');
    setConfirmNewAppPassword('');
    setAppPasswordError('');
  }, []);

  const toggleUsernameModal = useCallback(() => {
    setIsUsernameModalVisible(prev => !prev);
    setNewUsername('');
    setUsernameError('');
  }, []);

  const handleSetAppPassword = useCallback(async () => {
    setAppPasswordError('');

    if (newAppPassword.length < 4) {
      setAppPasswordError('Yeni şifre en az 4 karakter olmalıdır.');
      return;
    }

    if (newAppPassword !== confirmNewAppPassword) {
      setAppPasswordError('Yeni şifreler eşleşmiyor.');
      return;
    }

    try {
      if (hasAppPassword) {
        const isVerified = await verifyAppPassword(currentAppPassword);
        if (!isVerified) {
          setAppPasswordError('Mevcut şifre yanlış.');
          return;
        }
      }

      await setAppPassword(newAppPassword);
      toggleAppPasswordModal();
      alert('Uygulama şifresi başarıyla güncellendi.');
    } catch (error) {
      console.error('Uygulama şifresi ayarlama hatası:', error);
      setAppPasswordError('Uygulama şifresi ayarlanamadı. Lütfen tekrar deneyin.');
    }
  }, [currentAppPassword, newAppPassword, confirmNewAppPassword, setAppPassword, toggleAppPasswordModal, verifyAppPassword, hasAppPassword]);

  const handleChangeUsername = useCallback(async () => {
    setUsernameError('');

    if (newUsername.length < 3) {
      setUsernameError('Kullanıcı adı en az 3 karakter olmalıdır.');
      return;
    }
    try {
      await updateUserProfile({ username: newUsername });
      toggleUsernameModal();
      alert('Kullanıcı adı başarıyla güncellendi.');
      fetchUserProfile();
    } catch (error) {
      console.error('Kullanıcı adı güncelleme hatası:', error);
      setUsernameError('Kullanıcı adı güncellenemedi. Lütfen tekrar deneyin.');
    }
  }, [newUsername, updateUserProfile, toggleUsernameModal, fetchUserProfile]);

  if (!fontsLoaded) return null;

  return (
    <ScrollView style={styles.container}>
      {error && <AlertComponent type="error" message={error} />}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Ayarlar</Text>
        <Text style={styles.subtitle}>Uygulama ayarlarınızı yönetin</Text>
      </View>

      {isLoading ? (
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      ) : (
        <>
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoLabel}>Kullanıcı Adı:</Text>
            <Text style={styles.userInfoValue}>{user?.username}</Text>
          </View>
          <SettingButton
            label="Kullanıcı Adını Değiştir"
            onPress={toggleUsernameModal}
          />
          <SettingItem
            label="Karanlık Mod"
            value={isDarkMode}
            onToggle={toggleDarkMode}
          />
          <SettingItem
            label="Bildirimler"
            value={isNotificationsEnabled}
            onToggle={toggleNotifications}
          />
          <SettingButton
            label="Uygulama Şifresini Ayarla"
            onPress={toggleAppPasswordModal}
          />
          <SettingButton
            label="Gizlilik Politikası"
            onPress={() => {}}
          />
          <SettingButton
            label="Kullanım Koşulları"
            onPress={() => {}}
          />
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isAppPasswordModalVisible}
        onRequestClose={toggleAppPasswordModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Uygulama Şifresi Ayarla</Text>
            {hasAppPassword && (
              <TextInput
                style={styles.input}
                placeholder="Mevcut şifre"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={currentAppPassword}
                onChangeText={setCurrentAppPassword}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Yeni şifre"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
              value={newAppPassword}
              onChangeText={setNewAppPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Yeni şifreyi onayla"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
              value={confirmNewAppPassword}
              onChangeText={setConfirmNewAppPassword}
            />
            {appPasswordError ? <Text style={styles.errorText}>{appPasswordError}</Text> : null}
            <TouchableOpacity style={styles.setPasswordButton} onPress={handleSetAppPassword}>
              <Text style={styles.buttonText}>Şifreyi Ayarla</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={toggleAppPasswordModal}>
              <Text style={styles.buttonText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isUsernameModalVisible}
        onRequestClose={toggleUsernameModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kullanıcı Adını Değiştir</Text>
            <TextInput
              style={styles.input}
              placeholder="Yeni kullanıcı adı"
              placeholderTextColor="#A0A0A0"
              value={newUsername}
              onChangeText={setNewUsername}
            />
            {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
            <TouchableOpacity style={styles.setPasswordButton} onPress={handleChangeUsername}>
              <Text style={styles.buttonText}>Kullanıcı Adını Değiştir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={toggleUsernameModal}>
              <Text style={styles.buttonText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const SettingItem: React.FC<{ label: string; value: boolean; onToggle: () => void }> = ({ label, value, onToggle }) => (
  <View style={styles.settingItem}>
    <Text style={styles.settingText}>{label}</Text>
    <Switch
      trackColor={{ false: "#767577", true: "#81b0ff" }}
      thumbColor={value ? "#f5dd4b" : "#f4f3f4"}
      ios_backgroundColor="#3e3e3e"
      onValueChange={onToggle}
      value={value}
    />
  </View>
);

const SettingButton: React.FC<{ label: string; onPress: () => void }> = ({ label, onPress }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <Text style={styles.settingText}>{label}</Text>
    <Ionicons name="chevron-forward" size={24} color="#E0E0E0" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    paddingHorizontal: normalize(15),
    paddingTop: normalize(30),
  },
  headerContainer: {
    marginBottom: normalize(20),
    marginTop: 10,
  },
  title: {
    fontFamily: 'Roboto_700Bold',
    fontSize: normalize(24),
    fontWeight: 'bold',
    marginBottom: normalize(6),
    color: '#E0E0E0',
  },
  subtitle: {
    fontFamily: 'Roboto_400Regular',
    fontSize: normalize(16),
    color: '#A0A0A0',
  },
  loadingText: {
    fontFamily: 'Roboto_700Bold',
    fontSize: normalize(14),
    color: '#E0E0E0',
    textAlign: 'center',
  },
  userInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(15),
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  userInfoLabel: {
    fontFamily: 'Roboto_400Regular',
    fontSize: normalize(16),
    color: '#A0A0A0',
  },
  userInfoValue: {
    fontFamily: 'Roboto_700Bold',
    fontSize: normalize(16),
    color: '#E0E0E0',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(15),
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  settingText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: normalize(16),
    color: '#E0E0E0',
  },
  logoutButton: {
    backgroundColor: '#C62828',
    paddingVertical: normalize(12),
    borderRadius: normalize(8),
    alignItems: 'center',
    marginTop: normalize(20),
  },
  logoutButtonText: {
    fontFamily: 'Roboto_700Bold',
    color: '#E0E0E0',
    fontSize: normalize(16),
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#2A2A2A',
    borderRadius: normalize(8),
    padding: normalize(20),
    width: '80%',
  },
  modalTitle: {
    fontFamily: 'Roboto_700Bold',
    fontSize: normalize(18),
    color: '#E0E0E0',
    marginBottom: normalize(15),
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#3A3A3A',
    borderRadius: normalize(8),
    padding: normalize(10),
    marginBottom: normalize(15),
    color: '#E0E0E0',
    fontFamily: 'Roboto_400Regular',
  },
  setPasswordButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: normalize(12),
    borderRadius: normalize(8),
    alignItems: 'center',
    marginBottom: normalize(10),
  },
  cancelButton: {
    backgroundColor: '#4A4A4A',
    paddingVertical: normalize(12),
    borderRadius: normalize(8),
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Roboto_700Bold',
    color: '#E0E0E0',
    fontSize: normalize(16),
  },
  errorText: {
    color: '#FF6B6B',
    fontFamily: 'Roboto_400Regular',
    fontSize: normalize(14),
    marginBottom: normalize(10),
    textAlign: 'center',
  },
});

export default SettingsScreen;