import { request } from '../../../shared/api/httpClient';
import { env } from '../../../shared/config/env';
import { User, userSchema } from '../model/authTypes';

const mockRoleStorageKey = 'airdnd.mockRole';

export async function getCurrentUser() {
  const data = await request<User | null>('/api/auth/me');

  if (data) {
    return userSchema.parse(data);
  }

  const savedRole = getSavedMockRole();
  if (env.enableMocks && savedRole) {
    return mockLogin(savedRole);
  }

  return null;
}

export async function mockLogin(role: 'GUEST' | 'HOST' | 'ADMIN') {
  const data = await request<User>('/api/auth/mock-login', {
    method: 'POST',
    body: { role },
  });
  window.localStorage.setItem(mockRoleStorageKey, role);
  return userSchema.parse(data);
}

export async function logout() {
  await request<void>('/api/auth/logout', {
    method: 'POST',
  });
  window.localStorage.removeItem(mockRoleStorageKey);
}

function getSavedMockRole() {
  if (typeof window === 'undefined') {
    return null;
  }

  const role = window.localStorage.getItem(mockRoleStorageKey);

  if (role === 'GUEST' || role === 'HOST' || role === 'ADMIN') {
    return role;
  }

  return null;
}
