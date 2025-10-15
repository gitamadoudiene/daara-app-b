/**
 * Configuration et utilitaires pour les appels API
 */

// URL de base de l'API
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

/**
 * Construit l'URL complète pour un endpoint d'API
 */
export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}

/**
 * Récupère le token d'authentification depuis le localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('daara_token');
}

/**
 * Créer les headers par défaut avec authentification
 */
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Wrapper pour les appels API avec gestion d'erreur
 */
export async function apiCall(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = getApiUrl(endpoint);
  const defaultHeaders = getAuthHeaders();
  
  const finalOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, finalOptions);
    return response;
  } catch (error) {
    console.error(`Erreur API pour ${endpoint}:`, error);
    throw error;
  }
}