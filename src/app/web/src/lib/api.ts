import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.megatest.et/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  get instance() {
    return this.client;
  }

  async login(username: string, password: string) {
    const response = await this.client.post('/auth/login', { username, password });
    if (response.data.data?.token) {
      localStorage.setItem('auth_token', response.data.data.token);
    }
    return response.data;
  }

  async register(data: { username: string; password: string; phone: string; role?: string }) {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async getUser() {
    const response = await this.client.get('/user/me');
    return response.data;
  }

  async getMCQData() {
    const response = await this.client.get('/mcq/data');
    return response.data;
  }

  async getFlashcards(gradeId: string, subjectId?: string) {
    const params = new URLSearchParams();
    params.append('grade', gradeId);
    if (subjectId) params.append('subject', subjectId);
    const response = await this.client.get(`/flashcards?${params}`);
    return response.data;
  }
}

export const api = new ApiClient();
