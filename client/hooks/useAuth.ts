import { useAuthStore } from '../context/authContext';

const useAuth = () => {
  return useAuthStore();
};

export default useAuth;