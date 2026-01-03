
export enum UserRole {
  STUDENTE = 'studente',
  ASSOCIAZIONE = 'associazione',
  ADMIN = 'admin',
  STAFF = 'staff',
}

export enum EventCategory {
  PARTY = 'Party',
  SEMINAR = 'Seminar',
  CULTURE = 'Culture',
  SPORT = 'Sport',
  OTHER = 'Other'
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  profileImage?: string; 
  surname?: string; // Only for students
  description?: string; // Only for associations
  socialLinks?: string; // Only for associations
  stripeAccountId?: string; // Only for associations
  stripeOnboardingComplete?: boolean; // Only for associations
  favorites?: string[]; // Array of Event IDs
  followedAssociations?: User[] | string[]; // Array of User IDs or populated Users
  followersCount?: number; // Only for associations
  isVerified?: boolean;
  isDeleted?: boolean; // For Admin view
  createdAt?: string;
  parentOrganization?: string; // Only for staff
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  date: string; // ISO Date string
  time: string;
  location: string;
  price: number;
  maxCapacity: number;
  ticketsSold: number;
  organization: User | string; // ID or populated object
  stripeAccountId: string;
  prLists?: string[]; // Array of PR list names
  category: EventCategory; 
  favoritesCount?: number;
  status?: 'active' | 'draft' | 'archived' | 'deleted';
  // New Academic Fields
  requiresMatricola?: boolean;
  requiresCorsoStudi?: boolean; // New field
  scanType?: 'entry_only' | 'entry_exit';
}

export interface Ticket {
  _id: string;
  event: Event; // Populated in the UI for wallet
  owner: string | User;
  ticketHolderName: string;
  qrCodeId: string;
  purchaseDate: string;
  prList?: string; // The list chosen during purchase
  used: boolean; // Has the ticket been scanned? (Legacy/Simple check)
  checkInDate?: string; // When was it scanned
  // New Fields
  matricola?: string;
  corsoStudi?: string; // New field
  entryTime?: string;
  exitTime?: string;
  status: 'valid' | 'entered' | 'completed' | 'archived' | 'deleted' | 'active'; // 'active' kept for legacy compatibility
}

export interface Report {
  _id: string;
  eventId: Event;
  reporterId: User;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CartItem {
  eventId: string;
  quantity: number;
}

declare global {
  interface Window {
    cloudinary: any;
  }
}
