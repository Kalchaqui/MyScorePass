/**
 * Authentication utilities for exchanges
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'myscorepass-exchange-token';

export interface Exchange {
  id: number;
  email: string;
  name: string;
  walletAddress: string | null;
  credits: number;
  totalPurchased: number;
  totalConsumed: number;
  createdAt: string;
}

export interface LoginResponse {
  success: boolean;
  exchange: Exchange;
  token: string;
}

/**
 * Guardar token en localStorage
 */
export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Obtener token de localStorage
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * Eliminar token
 */
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Verificar si está autenticado
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

/**
 * Obtener headers con autenticación
 */
export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Login de exchange
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const body = await response.json();
  const data = body.data; // Backend devuelve { success: true, data: { exchange, token } }

  if (!data || !data.token) {
    throw new Error('Invalid response from server');
  }

  saveToken(data.token);
  return data;
}

/**
 * Registro de exchange
 */
export async function register(
  email: string,
  password: string,
  name: string,
  walletAddress?: string
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name, walletAddress }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  const body = await response.json();
  const data = body.data; // Backend devuelve { success: true, data: { exchange, token } }

  if (!data || !data.token) {
    throw new Error('Invalid response from server');
  }

  saveToken(data.token);
  return data;
}

/**
 * Logout
 */
export function logout(): void {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/**
 * Obtener información del exchange autenticado
 */
export async function getCurrentExchange(): Promise<Exchange> {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      throw new Error('Session expired');
    }
    const error = await response.json();
    throw new Error(error.error || 'Failed to get exchange info');
  }

  const data = await response.json();
  return data.exchange;
}
