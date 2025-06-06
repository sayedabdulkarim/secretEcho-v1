export interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
}

export interface AuthState {
  userInfo: User | null;
  userDetails: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface RootState {
  authReducer: AuthState;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}
