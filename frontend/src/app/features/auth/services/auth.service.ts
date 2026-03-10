import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { LoginRequest, LoginResponse, AuthUser, UserRole } from '../models/auth.model';

const TOKEN_KEY = 'yps_token';
const USER_KEY = 'yps_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API_URL = environment.apiUrl + '/auth';

  currentUser = signal<AuthUser | null>(this.loadUserFromStorage());
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  isLoggedIn = computed(() => this.currentUser() !== null);
  role = computed(() => this.currentUser()?.role ?? null);
  isAdmin = computed(() => this.role() === UserRole.ADMIN);
  isFaculty = computed(() => this.role() === UserRole.FACULTY);
  isStudent = computed(() => this.role() === UserRole.STUDENT);

  constructor() {
    // Validate token on app startup
    this.validateTokenOnStartup();
  }

  private validateTokenOnStartup(): void {
    const token = this.getToken();
    const user = this.currentUser();

    console.log('[AuthService] Startup validation - Token:', token ? 'Present' : 'Missing');
    console.log('[AuthService] Startup validation - User:', user ? user.userId : 'None');

    if (token && !user) {
      console.warn('[AuthService] Token exists but no user data. Clearing session.');
      this.logout();
    } else if (!token && user) {
      console.warn('[AuthService] User data exists but no token. Clearing session.');
      this.currentUser.set(null);
      localStorage.removeItem(USER_KEY);
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.loading.set(true);
    this.error.set(null);
    return this.http.post<LoginResponse>(this.API_URL + '/login', credentials).pipe(
      tap((res) => {
        if (res.data) {
          this.currentUser.set(res.data);
          localStorage.setItem(TOKEN_KEY, res.data.token);
          localStorage.setItem(USER_KEY, JSON.stringify(res.data));
        }
      }),
      catchError((err) => {
        const message = err.error?.message || 'Login failed. Please check your credentials.';
        this.error.set(message);
        return throwError(() => err);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private loadUserFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
