import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://www.trustechit.com';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
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
    const response = await this.client.post('/api/auth/login', { username: username.toLowerCase(), password });
    if (response.data.data?.token) {
      localStorage.setItem('auth_token', response.data.data.token);
    }
    return response.data;
  }

  async checkUsername(username: string) {
    const response = await this.client.get('/api/auth/check-username', { params: { username } });
    return response.data;
  }

  async getPaymentPlans() {
    const response = await this.client.get('/api/payment-plans');
    return response.data;
  }

  async sendOTP(phoneNumber: string) {
    const response = await this.client.post('/api/auth/send-otp', { phoneNumber });
    return response.data;
  }

  async verifyOTP(phoneNumber: string, otp: string) {
    const response = await this.client.post('/api/auth/verify-otp', { phoneNumber, otp });
    return response.data;
  }

  async registerStudent(data: { 
    name: string; 
    username: string; 
    password: string; 
    phoneNumber: string; 
    grade: string; 
    region: string;
    plan?: string;
  }) {
    const response = await this.client.post('/api/auth/register/student', data);
    if (response.data.data?.token) {
      localStorage.setItem('auth_token', response.data.data.token);
    }
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
