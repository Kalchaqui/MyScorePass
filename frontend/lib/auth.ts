/**
 * Authentication utilities for exchanges
 * Integrado con Privy para autenticación y backend JWT para autorización
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
 * Verifica el token JWT del backend
 */
export function isAuthenticated(): boolean {
  // Verificar token JWT del backend
  return getToken() !== null;
}

/**
 * Re-exportar usePrivy para facilitar el acceso
 */
export { usePrivy } from '@privy-io/react-auth';

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
 * Sincronizar usuario de Privy con backend JWT
 * Esta función se llama después de que Privy autentica al usuario
 */
export async function syncPrivyUser(privyUserId: string, email: string, name?: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_URL}/api/auth/privy-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        privyUserId, 
        email,
        name: name || email.split('@')[0] 
      }),
    });

    if (!response.ok) {
      // Si la respuesta no es JSON, el backend puede no estar corriendo
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        throw new Error(error.error || `Backend error: ${response.status}`);
      } else {
        throw new Error(`Backend no disponible (${response.status}). Asegúrate de que el servidor esté corriendo en ${API_URL}`);
      }
    }

    const data: LoginResponse = await response.json();
    saveToken(data.token);
    return data;
  } catch (error: any) {
    // Si es un error de red, el backend no está corriendo
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(`No se pudo conectar con el backend en ${API_URL}. Asegúrate de que el servidor esté corriendo.`);
    }
    throw error;
  }
}

/**
 * Login de exchange (legacy - mantenido para compatibilidad)
 * Ahora usa Privy, pero mantiene esta función por si acaso
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

  const data: LoginResponse = await response.json();
  saveToken(data.token);
  return data;
}

/**
 * Registro de exchange (legacy - mantenido para compatibilidad)
 * Ahora usa Privy, pero mantiene esta función por si acaso
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

  const data: LoginResponse = await response.json();
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
