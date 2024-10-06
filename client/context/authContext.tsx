import { create } from 'zustand';
import { getToken, setToken, removeToken } from '../utils/storage';
import { login as apiLogin, register as apiRegister, apiSetAppPassword, apiVerifyAppPassword, apiCheckAppPasswordStatus } from '../service/authService';

interface AuthState {
  isAuthenticated: boolean;
  error: string | null;
  appPasswordSet: boolean;
  appPasswordVerified: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAppPassword: (password: string) => Promise<void>;
  verifyAppPassword: (password: string) => Promise<boolean>;
  initializeAuth: () => Promise<void>;
  setAppPasswordVerified: (verified: boolean) => void;
  lastActiveTimestamp: number;
  setLastActiveTimestamp: (timestamp: number) => void;
  checkInactivity: () => boolean;
  lockApp: () => void;
  checkAppPasswordStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  error: null,
  appPasswordSet: false,
  appPasswordVerified: false,
  lastActiveTimestamp: Date.now(),
  setAppPasswordVerified: (verified) => set({ appPasswordVerified: verified }),
  setLastActiveTimestamp: (timestamp) => set({ lastActiveTimestamp: timestamp }),
  checkInactivity: () => {
    const currentTime = Date.now();
    const inactiveTime = currentTime - get().lastActiveTimestamp;
    const inactivityThreshold = 2 * 60 * 1000;
    return inactiveTime > inactivityThreshold;
  },
  lockApp: () => {
    set({ appPasswordVerified: false });
  },

  login: async (username: string, password: string) => {
    try {
      const response = await apiLogin({ username, password });
      if (response?.token) {
        await setToken(response.token);
        set({ isAuthenticated: true, error: null, lastActiveTimestamp: Date.now() });
        await get().checkAppPasswordStatus();
      } else {
        throw new Error('Giriş başarısız. Lütfen kullanıcı adı ve şifrenizi kontrol edin.');
      }
    } catch (error) {
      console.error('Giriş hatası:', error);
      set({ error: 'Giriş yapılamadı. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.' });
      throw new Error('Giriş işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  },

  register: async (username: string, password: string) => {
    try {
      const response = await apiRegister({ username, password });
      if (response?.token) {
        await setToken(response.token);
        set({ isAuthenticated: true, error: null, lastActiveTimestamp: Date.now() });
        await get().checkAppPasswordStatus();
      } else {
        throw new Error('Kayıt işlemi başarısız oldu. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      set({ error: 'Kayıt yapılamadı. Lütfen farklı bir kullanıcı adı deneyin veya daha sonra tekrar deneyin.' });
      throw new Error('Kayıt işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  },

  logout: async () => {
    try {
      await removeToken();
      set({ isAuthenticated: false, error: null, appPasswordVerified: false, lastActiveTimestamp: Date.now(), appPasswordSet: false });
    } catch (error) {
      console.error('Çıkış hatası:', error);
      set({ error: 'Çıkış yapılırken bir hata oluştu. Lütfen tekrar deneyin.' });
      throw new Error('Çıkış işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  },

  setAppPassword: async (password: string) => {
    try {
      const response = await apiSetAppPassword(password);
      if (response.message === 'Uygulama şifresi başarıyla güncellendi') {
        set({ appPasswordSet: true, appPasswordVerified: true, error: null, lastActiveTimestamp: Date.now() });
      } else {
        throw new Error('Uygulama şifresi ayarlanamadı.');
      }
    } catch (error) {
      console.error('Uygulama şifresi ayarlama hatası:', error);
      set({ error: 'Uygulama şifresi ayarlanamadı. Lütfen tekrar deneyin.' });
      throw error;
    }
  },

  verifyAppPassword: async (password: string) => {
    try {
      const isValid = await apiVerifyAppPassword(password);
      set({ appPasswordVerified: isValid, error: null, lastActiveTimestamp: Date.now() });
      return isValid;
    } catch (error) {
      console.error('Uygulama şifresi doğrulama hatası:', error);
      set({ error: 'Uygulama şifresi doğrulanamadı. Lütfen tekrar deneyin.' });
      throw error;
    }
  },

  initializeAuth: async () => {
    try {
      const token = await getToken();
      set({ 
        isAuthenticated: !!token, 
        error: null, 
        appPasswordVerified: false, 
        appPasswordSet: false,
        lastActiveTimestamp: Date.now() 
      });
      if (token) {
        await get().checkAppPasswordStatus();
      }
    } catch (error) {
      console.error('Kimlik doğrulama hatası:', error);
      set({ isAuthenticated: false, error: 'Kimlik doğrulama sırasında bir hata oluştu. Lütfen tekrar giriş yapın.' });
    }
  },

  checkAppPasswordStatus: async () => {
    try {
      if (get().isAuthenticated) {
        const status = await apiCheckAppPasswordStatus();
        set({ appPasswordSet: status.isSet, appPasswordVerified: false });
      }
    } catch (error) {
      console.error('Uygulama şifresi durumu kontrol hatası:', error);
      set({ appPasswordSet: false, error: 'Uygulama şifresi durumu kontrol edilemedi. Lütfen tekrar deneyin.' });
    }
  },
}));