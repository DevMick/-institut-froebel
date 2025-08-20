// Types et interfaces principales

export interface Club {
  id: string;
  name: string;
  dateCreation?: string;
  numeroClub?: number;
  numeroTelephone?: string;
  email?: string;
  lieuReunion?: string;
  parrainePar?: string;
  jourReunion?: string;
  heureReunion?: string; // TimeSpan sera converti en string par l'API
  frequence?: string;
  adresse?: string;
  city?: string;
  country?: string;
  district?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  clubId?: string;
  clubName?: string;
}

export interface Member {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  isActive: boolean;
  roles: string[];
  clubId: string;
  clubName?: string;
  clubJoinedDate: string;
  clubJoinedDateFormatted: string;
  nom?: string;
  prenom?: string;
  departement?: string;
  poste?: string;
  dateAdhesion?: string;
  dateAnniversaire?: string;
  fonctions?: {
    comiteId: string;
    comiteNom: string;
    estResponsable: boolean;
    estActif: boolean;
    dateNomination: string;
    mandatAnnee: number;
  }[];
  commissions?: {
    commissionId: string;
    commissionNom: string;
    estResponsable: boolean;
    estActif: boolean;
    dateNomination: string;
    mandatAnnee: number;
  }[];
}

export interface Reunion {
  id: string;
  clubId: string;
  date: string;
  heure: string;
  typeReunionId: string;
  typeReunionLibelle: string;
  ordresDuJour: string[];
  presences: PresenceReunion[];
  invites: InviteReunion[];
  lieu?: string;
  description?: string;
  statut?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PresenceReunion {
  id: string;
  reunionId: string;
  membreId: string;
  nomMembre: string;
  present: boolean;
  excuse: boolean;
  commentaire?: string;
}

export interface InviteReunion {
  id: string;
  reunionId: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  fonction?: string;
  organisation?: string;
  confirme?: boolean;
  commentaire?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  member?: T;
  members?: T[];
}

export interface LoginData {
  email: string;
  password: string;
  clubId: string;
}

export interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  selectedClub: Club | null;
  clubs: Club[];
  members: Member[];
  reunions: Reunion[];
  loading: boolean;
  error: string | null;
}

export type NavigationScreen =
  | 'login'
  | 'register'
  | 'dashboard'
  | 'members'
  | 'reunions'
  | 'cotisations'
  | 'situation-cotisation'
  | 'calendrier'
  | 'clubs'
  | 'profile'
  | 'settings'
  | 'email'
  | 'whatsapp';

export interface NavigationState {
  currentScreen: NavigationScreen;
  previousScreen?: NavigationScreen;
}
