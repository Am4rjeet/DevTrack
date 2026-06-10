import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api, { fetchCsrfToken } from '@/lib/api';
import { authApi } from '@/features/auth/api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    fetchCsrfToken()
      .catch(() => {})
      .finally(() => setBootstrapped(true));
  }, []);

  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await authApi.getMe();
      return data.data.user;
    },
    enabled: bootstrapped,
    retry: false,
  });

  const requiresVerifiedEmail = import.meta.env.PROD;
  const isAuthenticated =
    !!user &&
    !isError &&
    (!requiresVerifiedEmail || user.isEmailVerified === true);

  const login = useCallback(
    async (credentials) => {
      const { data } = await authApi.login(credentials);
      queryClient.setQueryData(['auth', 'me'], data.data.user);
      return data.data.user;
    },
    [queryClient]
  );

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload);
    return data.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
      await fetchCsrfToken();
    }
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user: isError ? null : user,
      isLoading: !bootstrapped || isLoading,
      isAuthenticated,
      login,
      register,
      logout,
      refetchUser: refetch,
    }),
    [user, isError, bootstrapped, isLoading, isAuthenticated, login, register, logout, refetch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
