import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  getCurrentUser,
  loginUser,
  registerGuest,
  updateCurrentUser,
} from '../api/authApi.js';
import { accessTokenStorageKey } from '../api/httpClient.js';
import { AuthContext } from './authContext.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const saveSession = useCallback(({ user: nextUser, accessToken }) => {
    localStorage.setItem(accessTokenStorageKey, accessToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(accessTokenStorageKey);
    setUser(null);
  }, []);

  useEffect(() => {
    async function restoreSession() {
      const accessToken = localStorage.getItem(accessTokenStorageKey);

      if (!accessToken) {
        setIsInitializing(false);
        return;
      }

      try {
        setUser(await getCurrentUser());
      } catch {
        localStorage.removeItem(accessTokenStorageKey);
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    }

    restoreSession();
  }, []);

  const login = useCallback(
    async (credentials) => {
      const session = await loginUser(credentials);
      saveSession(session);
      return session.user;
    },
    [saveSession],
  );

  const register = useCallback(
    async (details) => {
      const session = await registerGuest(details);
      return session.user;
    },
    [],
  );

  const updateProfile = useCallback(async (details) => {
    const updatedUser = await updateCurrentUser(details);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      login,
      register,
      logout,
      updateProfile,
    }),
    [isInitializing, login, logout, register, updateProfile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
