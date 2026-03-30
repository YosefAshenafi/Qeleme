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
        const isAuthRequest = error.config?.url?.includes('/auth/login') ||
          error.config?.url?.includes('/auth/register');

        if (error.response?.status === 401 && !isAuthRequest) {
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            if (currentPath !== '/login') {
              localStorage.removeItem('auth_token');
              window.location.href = '/login';
            }
          }
        }
        if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
          console.warn('Network error - server may be unavailable');
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
    const response = await this.client.get('/api/auth/student/profile');
    return response.data;
  }

  async getUserStats() {
    const response = await this.client.get('/api/auth/student/stats');
    return response.data;
  }

  async getMCQData() {
    const response = await this.client.get('/api/mcq/data');
    return response.data;
  }

  async getGrades() {
    const response = await this.client.get('/api/grades');
    return response.data;
  }

  async getSubjects(gradeId: string) {
    const response = await this.client.get(`/api/grades/${gradeId}/subjects`);
    return response.data;
  }

  async getFlashcards(gradeId: string, subjectId?: string) {
    const params = new URLSearchParams();
    params.append('grade', gradeId);
    if (subjectId) params.append('subject', subjectId);
    const response = await this.client.get(`/api/flashcards?${params}`);
    return response.data;
  }

  async getNationalExamAvailable(gradeNumber: number) {
    const response = await this.client.get(`/api/national-exams/${gradeNumber}`);
    return response.data;
  }

  async getNationalExamQuestions(gradeLevelId: string, yearId: number, subject?: string) {
    const params = new URLSearchParams();
    if (subject) params.append('subject', subject);
    const response = await this.client.get(`/api/national-exams/grouped?grade=${gradeLevelId}&year=${yearId}&${params}`);
    return response.data;
  }

  async getRegularMCQQuestions(gradeLevelId: string, subjectId?: string, chapterId?: string) {
    const params = new URLSearchParams();
    params.append('grade', gradeLevelId);
    if (subjectId) params.append('subject', subjectId);
    if (chapterId) params.append('chapter', chapterId);
    const response = await this.client.get(`/api/questions/grouped?${params}`);
    return response.data;
  }
}

export const api = new ApiClient();
