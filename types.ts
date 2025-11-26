export enum UserRole {
  STUDENTE = 'studente',
  ASSOCIAZIONE = 'associazione',
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
  isVerified?: boolean;
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
}

export interface Ticket {
  _id: string;
  event: Event; // Populated in the UI for wallet
  owner: string;
  ticketHolderName: string;
  qrCodeId: string;
  purchaseDate: string;
  prList?: string; // The list chosen during purchase
  used: boolean; // Has the ticket been scanned?
  checkInDate?: string; // When was it scanned
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CartItem {
  eventId: string;
  quantity: number;
}