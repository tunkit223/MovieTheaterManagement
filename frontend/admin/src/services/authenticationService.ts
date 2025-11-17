import {
  getToken,
  removeToken,
  setToken
} from "./localStorageService";
import httpClient from "../configurations/httpClient";
import {
  API
} from "../configurations/configuration";
import { useAuthStore } from "@/stores";
import { getMyInfo } from "./staffService";

export const login = async (loginIdentifier: string, password: string) => {
  const response = await httpClient.post(API.LOGIN, {
    loginIdentifier: loginIdentifier,
    password: password,
  });

  const token = response.data?.result?.token;

  if (token) {
    setToken(token);
    
    // Fetch user info with permissions after successful login
    try {
      const userInfoResponse = await getMyInfo();
      const userInfo = userInfoResponse.data?.result;
      
      if (userInfo) {
        // Update Zustand store with full user info including roles and permissions
        useAuthStore.getState().setAuth(token, {
          id: userInfo.accountId || '',
          email: userInfo.email || loginIdentifier,
          username: userInfo.username || loginIdentifier,
          accountId: userInfo.accountId,
          accountType: userInfo.accountType,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          staffId: userInfo.staffId,
          cinemaId: userInfo.cinemaId,
          jobTitle: userInfo.jobTitle,
          avatarUrl: userInfo.avatarUrl,
          roles: userInfo.roles || [],
        });
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      // If fetching user info fails, still set basic auth
      useAuthStore.getState().setAuth(token, {
        id: response.data?.result?.userId || '',
        email: loginIdentifier,
        username: loginIdentifier,
      });
    }
  }

  return response;
};

export const logOut = () => {
  removeToken();
  // Clear Zustand store
  useAuthStore.getState().clearAuth();
};

export const isAuthenticated = () => {
  return getToken();
};