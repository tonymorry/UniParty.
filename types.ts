
export enum UserRole {
  STUDENTE = 'studente',
  ASSOCIAZIONE = 'associazione',
  ADMIN = 'admin',
  STAFF = 'staff',
  PR = 'pr',
}

export enum EventCategory {
  PARTY = 'Party',
  SEMINAR = 'Seminar',
  CULTURE = 'Culture',
  SPORT = 'Sport',
  OTHER = 'Other'
}

export const UNIVERSITY_LOCATIONS: Record<string, string[]> = {
  "Abruzzo": ["L'Aquila", "Chieti", "Pescara", "Teramo"],
  "Basilicata": ["Potenza", "Matera"],
  "Calabria": ["Catanzaro", "Cosenza (Rende)", "Reggio Calabria"],
  "Campania": ["Napoli", "Salerno", "Benevento", "Caserta", "Avellino"],
  "Emilia-Romagna": ["Bologna", "Modena", "Reggio Emilia", "Parma", "Ferrara", "Ravenna", "Rimini", "Cesena", "Forlì", "Piacenza"],
  "Friuli-Venezia Giulia": ["Trieste", "Udine", "Pordenone", "Gorizia"],
  "Lazio": ["Roma", "Viterbo", "Cassino", "Rieti", "Latina"],
  "Liguria": ["Genova", "Savona", "Imperia", "La Spezia"],
  "Lombardia": ["Milano", "Bergamo", "Brescia", "Pavia", "Varese", "Como", "Cremona", "Mantova", "Lecco"],
  "Marche": ["Ancona", "Urbino", "Macerata", "Camerino", "Ascoli Piceno", "Fermo"],
  "Molise": ["Campobasso", "Isernia"],
  "Piemonte": ["Torino", "Novara", "Vercelli", "Alessandria", "Cuneo", "Asti"],
  "Puglia": ["Bari", "Lecce", "Foggia", "Taranto"],
  "Sardegna": ["Cagliari", "Sassari", "Nuoro", "Oristano"],
  "Sicilia": ["Palermo", "Catania", "Messina", "Enna", "Agrigento", "Trapani", "Ragusa", "Siracusa", "Caltanissetta"],
  "Toscana": ["Firenze", "Pisa", "Siena", "Arezzo", "Lucca"],
  "Trentino-Alto Adige": ["Trento", "Bolzano"],
  "Umbria": ["Perugia", "Terni"],
  "Valle d'Aosta": ["Aosta"],
  "Veneto": ["Venezia", "Verona", "Padova", "Vicenza", "Treviso", "Rovigo"],
  "Online": ["Evento Online"]
};

export const ALL_CITIES = Object.values(UNIVERSITY_LOCATIONS).flat();

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
  parentOrganization?: string; // Only for staff or PR
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
  city: string; 
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
