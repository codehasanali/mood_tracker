import api from '../api';
import { getToken, setToken, removeToken } from '../utils/storage';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/Auth';

/**
 * Kullanıcıyı verilen kimlik bilgileri ile giriş yapar.
 * @param credentials - Kullanıcının giriş için gerekli bilgileri.
 * @returns Doğrulanmış kullanıcı verisi.
 * @throws İstek başarısız olursa hata fırlatır.
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    const { token, user } = response.data;
    await setToken(token);
    return { token, user };
  } catch (error) {
    console.error('Giriş yaparken hata oluştu:', error);
    throw error;
  }
};

/**
 * Yeni bir kullanıcı kaydı oluşturur.
 * @param credentials - Kullanıcının kayıt için gerekli bilgileri.
 * @returns Kayıt edilen kullanıcı verisi.
 * @throws İstek başarısız olursa hata fırlatır.
 */
export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    const { token, user } = response.data;
    await setToken(token);
    return { token, user };
  } catch (error) {
    console.error('Kayıt olurken hata oluştu:', error);
    throw error;
  }
};

/**
 * Mevcut kullanıcının oturumunu sonlandırır.
 * @returns Başarı mesajı.
 * @throws İstek başarısız olursa hata fırlatır.
 */
export const logout = async (): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>('/auth/logout');
    await removeToken();
    return response.data;
  } catch (error) {
    console.error('Oturumu kapatırken hata oluştu:', error);
    throw error;
  }
};

/**
 * Doğrulanmış kullanıcının bilgilerini getirir.
 * @returns Doğrulanmış kullanıcı verisi.
 * @throws İstek başarısız olursa hata fırlatır.
 */
export const getCurrentUser = async (): Promise<AuthResponse> => {
  try {
    const response = await api.get<AuthResponse>('/auth/user');
    return response.data;
  } catch (error) {
    console.error('Geçerli kullanıcıyı getirirken hata oluştu:', error);
    throw error;
  }
};

/**
 * Kullanıcının uygulama şifresini ayarlar.
 * @param password - Ayarlanacak uygulama şifresi.
 * @returns Başarı mesajı.
 * @throws İstek başarısız olursa hata fırlatır.
 */
export const apiSetAppPassword = async (password: string): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>('/auth/set-app-password', { appPassword: password });
    return response.data;
  } catch (error) {
    console.error('Uygulama şifresi ayarlanırken hata oluştu:', error);
    throw error;
  }
};

/**
 * Kullanıcının uygulama şifresini doğrular.
 * @param password - Doğrulanacak uygulama şifresi.
 * @returns Doğrulama sonucu.
 * @throws İstek başarısız olursa hata fırlatır.
 */
export const apiVerifyAppPassword = async (password: string): Promise<boolean> => {
  try {
    const response = await api.post<{ message: string }>('/auth/verify-app-password', { appPassword: password });
    return response.data.message === 'Uygulama şifresi doğrulandı';
  } catch (error) {
    if (error instanceof Error && 'response' in error && typeof error.response === 'object' && error.response && 'status' in error.response && error.response.status === 401) {
      console.error('Şifre doğrulama hatası: Geçersiz uygulama şifresi');
      return false;
    } else {
      console.error('Uygulama şifresi doğrulanırken hata oluştu:', error);
      throw error;
    }
  }
};

/**
 * Kullanıcının uygulama şifresinin ayarlanıp ayarlanmadığını kontrol eder.
 * @returns Uygulama şifresinin ayarlanıp ayarlanmadığı bilgisi.
 * @throws İstek başarısız olursa hata fırlatır.
 */
export const checkAppPasswordSet = async (): Promise<boolean> => {
  try {
    const response = await api.get<{ isSet: boolean }>('/auth/check-app-password');
    return response.data.isSet;
  } catch (error) {
    console.error('Uygulama şifresi kontrolü sırasında hata oluştu:', error);
    throw error;
  }
};

/**
 * Kullanıcının uygulama şifresinin durumunu kontrol eder.
 * @returns Uygulama şifresinin durumu.
 * @throws İstek başarısız olursa hata fırlatır.
 */
export const apiCheckAppPasswordStatus = async (): Promise<{ isSet: boolean }> => {
  try {
    const response = await api.get<{ isSet: boolean }>('/auth/check-app-password');
    return response.data;
  } catch (error) {
    console.error('Uygulama şifresi durumu kontrolü sırasında hata oluştu:', error);
    throw error;
  }
};
