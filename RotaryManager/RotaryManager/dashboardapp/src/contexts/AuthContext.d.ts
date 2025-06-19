import { ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  // Ajoutez d'autres propriétés de l'utilisateur selon vos besoins
}

export interface AuthContextType {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export declare function useAuth(): AuthContextType; 