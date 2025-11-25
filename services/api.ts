import { Event, EventCategory, LoginResponse, Ticket, User, UserRole } from '../types';

// ==========================================
// CONFIGURATION
// ==========================================

// CHANGE THIS TO FALSE TO USE THE REAL BACKEND
const USE_MOCK = false; 

// Safely determine if production environment
const meta = import.meta as any;
const isProd = meta && meta.env && meta.env.PROD;

// Automatically determine API URL:
// In production (when served by the same backend), use relative path '/api'
// In development, use localhost:5000
const API_URL = isProd ? '/api' : 'http://localhost:5000/api';

// ==========================================
// MOCK DATA & IMPLEMENTATION (Keep existing mock logic for fallback)
// ==========================================

// --- STORAGE KEYS ---
const KEYS = {
  USERS: 'uniparty_users',
  EVENTS: 'uniparty_events',
  TICKETS: 'uniparty_tickets'
};

// --- MOCK DATA DEFAULTS ---
const DEFAULT_USERS: User[] = [
  {
    _id: 'user_1',
    email: 'student@uni.edu',
    name: 'Mario',
    surname: 'Rossi',
    role: UserRole.STUDENTE,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mario',
    favorites: []
  },
  {
    _id: 'user_2',
    email: 'assoc@uni.edu',
    name: 'Erasmus Student Network',
    role: UserRole.ASSOCIAZIONE,
    description: 'Organizing the best international parties.',
    socialLinks: 'instagram.com/esn | facebook.com/esn',
    stripeAccountId: 'acct_12345',
    stripeOnboardingComplete: true,
    profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=ESN',
  },
  {
    _id: 'user_3',
    email: 'newassoc@uni.edu',
    name: 'Gaming Club',
    role: UserRole.ASSOCIAZIONE,
    description: 'Video game tournaments and chill nights.',
    stripeAccountId: '',
    stripeOnboardingComplete: false,
  }
];

const DEFAULT_EVENTS: Event[] = [
  {
    _id: 'evt_1',
    title: 'Welcome Party 2024',
    description: 'The biggest party to start the semester!',
    longDescription: 'Join us for an unforgettable night with live DJ, free drinks for the first hour, and amazing vibes. Open to all students.',
    image: 'https://picsum.photos/800/400?random=1',
    date: new Date(Date.now() + 86400000 * 5).toISOString(), 
    time: '22:00',
    location: 'Club Piper, Via Roma 1',
    price: 10.00,
    maxCapacity: 500,
    ticketsSold: 120,
    organization: DEFAULT_USERS[1],
    stripeAccountId: 'acct_12345',
    prLists: ['Lista ESN', 'Lista Marco', 'Lista Giulia'],
    category: EventCategory.PARTY
  },
  {
    _id: 'evt_2',
    title: 'Beer Pong Tournament',
    description: 'Win amazing prizes!',
    longDescription: 'Teams of 2. Entry fee includes beer. First prize is a travel voucher!',
    image: 'https://picsum.photos/800/400?random=2',
    date: new Date(Date.now() + 86400000 * 1).toISOString(),
    time: '20:00',
    location: 'University Bar',
    price: 5.00,
    maxCapacity: 50,
    ticketsSold: 45,
    organization: DEFAULT_USERS[1],
    stripeAccountId: 'acct_12345',
    prLists: [],
    category: EventCategory.SPORT
  },
  {
    _id: 'evt_3',
    title: 'AI in 2025 Seminar',
    description: 'Learn about the future of technology.',
    longDescription: 'A deep dive into Generative AI with guest speakers from Google and OpenAI.',
    image: 'https://picsum.photos/800/400?random=3',
    date: new Date(Date.now() + 86400000 * 3).toISOString(), 
    time: '15:00',
    location: 'Aula Magna, Engineering Building',
    price: 0,
    maxCapacity: 200,
    ticketsSold: 150,
    organization: DEFAULT_USERS[1], 
    stripeAccountId: 'acct_12345',
    prLists: [],
    category: EventCategory.SEMINAR
  }
];

// --- HELPER TO SIMULATE ASYNC NETWORK DELAY ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- STATE HELPERS ---
const getStored = <T>(key: string, defaultVal: T): T => {
    try {
        const item = localStorage.getItem(key);
        if (item) {
            return JSON.parse(item);
        }
        return JSON.parse(JSON.stringify(defaultVal));
    } catch {
        return JSON.parse(JSON.stringify(defaultVal));
    }
};

const setStored = (key: string, val: any) => {
    localStorage.setItem(key, JSON.stringify(val));
};

const isEventActive = (event: Event): boolean => {
    const eventDate = new Date(event.date);
    const expirationDate = new Date(eventDate);
    expirationDate.setDate(expirationDate.getDate() + 1);
    expirationDate.setHours(8, 0, 0, 0);
    const now = new Date();
    return now < expirationDate;
};

// ------------------------------------------------------------------
// 1. MOCK IMPLEMENTATION
// ------------------------------------------------------------------
const mockApi = {
  auth: {
    login: async (email: string, password: string): Promise<LoginResponse> => {
      await delay(500);
      const users = getStored<User[]>(KEYS.USERS, DEFAULT_USERS);
      const user = users.find(u => u.email === email);
      if (user) return { token: 'mock_jwt_' + user._id, user };
      throw new Error('Invalid credentials');
    },
    register: async (userData: Partial<User> & { password?: string }): Promise<LoginResponse> => {
      await delay(500);
      const users = getStored<User[]>(KEYS.USERS, DEFAULT_USERS);
      if (users.find(u => u.email === userData.email)) throw new Error("User already exists");

      const newUser: User = {
        _id: `user_${Date.now()}`,
        email: userData.email!,
        name: userData.name!,
        role: userData.role!,
        surname: userData.surname,
        description: userData.description,
        profileImage: userData.profileImage,
        stripeOnboardingComplete: false,
        socialLinks: userData.socialLinks,
        favorites: []
      };
      
      users.push(newUser);
      setStored(KEYS.USERS, users);
      return { token: 'mock_jwt_' + newUser._id, user: newUser };
    },
    updateUser: async (userId: string, data: Partial<User>): Promise<User> => {
        await delay(400);
        const users = getStored<User[]>(KEYS.USERS, DEFAULT_USERS);
        const index = users.findIndex(u => u._id === userId);
        if (index === -1) throw new Error("User not found");
        
        const updatedUser = { ...users[index], ...data };
        users[index] = updatedUser;
        setStored(KEYS.USERS, users);

        // Sync events
        let events = getStored<Event[]>(KEYS.EVENTS, DEFAULT_EVENTS);
        let eventsChanged = false;
        events = events.map(e => {
            const orgId = typeof e.organization === 'string' ? e.organization : e.organization._id;
            if (orgId === userId) {
                eventsChanged = true;
                return { ...e, organization: updatedUser };
            }
            return e;
        });
        if (eventsChanged) setStored(KEYS.EVENTS, events);
        return updatedUser;
    },
    toggleFavorite: async (userId: string, eventId: string): Promise<string[]> => {
        await delay(200);
        const users = getStored<User[]>(KEYS.USERS, DEFAULT_USERS);
        const userIndex = users.findIndex(u => u._id === userId);
        if (userIndex === -1) throw new Error("User not found");

        const user = users[userIndex];
        const favorites = user.favorites || [];
        const favIndex = favorites.indexOf(eventId);

        if (favIndex === -1) {
            favorites.push(eventId);
        } else {
            favorites.splice(favIndex, 1);
        }

        user.favorites = favorites;
        users[userIndex] = user;
        setStored(KEYS.USERS, users);
        return favorites;
    },
    getFavoriteEvents: async (userId: string): Promise<Event[]> => {
        await delay(400);
        const users = getStored<User[]>(KEYS.USERS, DEFAULT_USERS);
        const user = users.find(u => u._id === userId);
        if (!user || !user.favorites) return [];

        const allEvents = getStored<Event[]>(KEYS.EVENTS, DEFAULT_EVENTS);
        return allEvents.filter(e => user.favorites!.includes(e._id) && isEventActive(e));
    }
  },

  events: {
    getAll: async (): Promise<Event[]> => {
      await delay(300);
      const events = getStored<Event[]>(KEYS.EVENTS, DEFAULT_EVENTS);
      return events.filter(isEventActive);
    },
    getById: async (id: string): Promise<Event | undefined> => {
      await delay(200);
      const events = getStored<Event[]>(KEYS.EVENTS, DEFAULT_EVENTS);
      return events.find(e => e._id === id);
    },
    getByOrgId: async (orgId: string): Promise<Event[]> => {
      await delay(300);
      const events = getStored<Event[]>(KEYS.EVENTS, DEFAULT_EVENTS);
      return events.filter(e => {
          const eOrgId = typeof e.organization === 'string' ? e.organization : e.organization._id;
          return eOrgId === orgId;
      });
    },
    create: async (eventData: Partial<Event>, user: User): Promise<Event> => {
      await delay(800);
      const events = getStored<Event[]>(KEYS.EVENTS, DEFAULT_EVENTS);
      const newEvent: Event = {
        _id: `evt_${Date.now()}`,
        ...eventData as any,
        ticketsSold: 0,
        organization: user, 
        stripeAccountId: user.stripeAccountId || '',
        prLists: eventData.prLists || [],
        category: eventData.category || EventCategory.OTHER
      };
      events.push(newEvent);
      setStored(KEYS.EVENTS, events);
      return newEvent;
    },
    update: async (id: string, eventData: Partial<Event>): Promise<Event> => {
        await delay(600);
        const events = getStored<Event[]>(KEYS.EVENTS, DEFAULT_EVENTS);
        const index = events.findIndex(e => e._id === id);
        if (index === -1) throw new Error("Event not found");
        const updatedEvent = { ...events[index], ...eventData };
        events[index] = updatedEvent;
        setStored(KEYS.EVENTS, events);
        return updatedEvent;
    },
    delete: async (id: string): Promise<void> => {
      await delay(400);
      const events = getStored<Event[]>(KEYS.EVENTS, DEFAULT_EVENTS);
      const index = events.findIndex(e => e._id === id);
      if (index > -1) {
          events.splice(index, 1);
          setStored(KEYS.EVENTS, events);
      } else {
          throw new Error("Event not found");
      }
    },
    getEventStats: async (eventId: string): Promise<{ [key: string]: number }> => {
        await delay(300);
        const tickets = getStored<Ticket[]>(KEYS.TICKETS, []);
        const eventTickets = tickets.filter(t => {
             const tEventId = typeof t.event === 'string' ? t.event : t.event._id;
             return tEventId === eventId;
        });
        const stats: { [key: string]: number } = {};
        eventTickets.forEach(t => {
            const listName = t.prList || "Nessuna lista";
            stats[listName] = (stats[listName] || 0) + 1;
        });
        return stats;
    },
    validateTicket: async (qrCodeId: string): Promise<Ticket> => {
        await delay(400);
        const tickets = getStored<Ticket[]>(KEYS.TICKETS, []);
        const ticketIndex = tickets.findIndex(t => t.qrCodeId === qrCodeId);
        if (ticketIndex === -1) throw new Error("INVALID_TICKET");
        const ticket = tickets[ticketIndex];
        if (ticket.used) throw new Error("ALREADY_USED");
        ticket.used = true;
        ticket.checkInDate = new Date().toISOString();
        tickets[ticketIndex] = ticket;
        setStored(KEYS.TICKETS, tickets);
        return ticket;
    }
  },

  wallet: {
    getMyTickets: async (userId: string): Promise<Ticket[]> => {
      await delay(400);
      const tickets = getStored<Ticket[]>(KEYS.TICKETS, []);
      return tickets.filter(t => t.owner === userId);
    }
  },

  stripe: {
    createConnectAccount: async (userId: string): Promise<string> => {
      await delay(800);
      return "https://connect.stripe.com/setup/s/mock_setup_link";
    },
    finalizeOnboarding: async (userId: string): Promise<void> => {
        const users = getStored<User[]>(KEYS.USERS, DEFAULT_USERS);
        const index = users.findIndex(u => u._id === userId);
        if(index !== -1) {
            users[index].stripeOnboardingComplete = true;
            users[index].stripeAccountId = `acct_mock_${Date.now()}`;
            setStored(KEYS.USERS, users);
        }
    }
  },

  payments: {
    createCheckoutSession: async (eventId: string, quantity: number, userId: string, ticketNames: string[], prListName: string): Promise<string> => {
      await delay(1000);
      const events = getStored<Event[]>(KEYS.EVENTS, DEFAULT_EVENTS);
      const event = events.find(e => e._id === eventId);
      if (!event) throw new Error("Event not found");
      
      const namesParam = encodeURIComponent(JSON.stringify(ticketNames));
      const prParam = encodeURIComponent(prListName);
      return `/payment-success?eventId=${eventId}&quantity=${quantity}&names=${namesParam}&prList=${prParam}`; 
    },
    mockWebhookSuccess: async (eventId: string, quantity: number, userId: string, ticketNames: string[], prListName: string) => {
        const events = getStored<Event[]>(KEYS.EVENTS, DEFAULT_EVENTS);
        const eventIndex = events.findIndex(e => e._id === eventId);
        if (eventIndex === -1) return;
        const event = events[eventIndex];
        event.ticketsSold += quantity;
        events[eventIndex] = event;
        setStored(KEYS.EVENTS, events);
        
        const tickets = getStored<Ticket[]>(KEYS.TICKETS, []);
        for(let i = 0; i < quantity; i++) {
            tickets.push({
                _id: `tkt_${Date.now()}_${i}`,
                event: event, 
                owner: userId,
                ticketHolderName: ticketNames[i] || "Guest", 
                qrCodeId: `QR-${Date.now()}-${i}`,
                purchaseDate: new Date().toISOString(),
                prList: prListName,
                used: false,
            });
        }
        setStored(KEYS.TICKETS, tickets);
    }
  }
};

// ------------------------------------------------------------------
// 2. REAL BACKEND IMPLEMENTATION (FETCH WRAPPERS)
// ------------------------------------------------------------------
const getHeaders = () => {
    const token = localStorage.getItem('uniparty_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

const realApi: typeof mockApi = {
  auth: {
    login: async (email, password) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || 'Login failed');
        return data;
    },
    register: async (userData) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || 'Registration failed');
        return data;
    },
    updateUser: async (userId, data) => {
        const res = await fetch(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if(!res.ok) throw new Error('Update failed');
        return res.json();
    },
    toggleFavorite: async (userId, eventId) => {
        const res = await fetch(`${API_URL}/users/favorites/toggle`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ eventId })
        });
        if(!res.ok) throw new Error('Failed to toggle favorite');
        return res.json();
    },
    getFavoriteEvents: async (userId) => {
        const res = await fetch(`${API_URL}/users/favorites/list`, {
            headers: getHeaders()
        });
        if(!res.ok) throw new Error('Failed to fetch favorites');
        return res.json();
    }
  },
  events: {
    getAll: async () => {
        const res = await fetch(`${API_URL}/events`);
        return res.json();
    },
    getById: async (id) => {
        const res = await fetch(`${API_URL}/events/${id}`);
        if (!res.ok) return undefined;
        return res.json();
    },
    getByOrgId: async (orgId) => {
        const res = await fetch(`${API_URL}/events?organization=${orgId}`);
        return res.json();
    },
    create: async (eventData, user) => {
        const res = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(eventData)
        });
        if(!res.ok) throw new Error('Create event failed');
        return res.json();
    },
    update: async (id, eventData) => {
        const res = await fetch(`${API_URL}/events/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(eventData)
        });
        if(!res.ok) throw new Error('Update event failed');
        return res.json();
    },
    delete: async (id) => {
        const res = await fetch(`${API_URL}/events/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if(!res.ok) throw new Error('Delete event failed');
    },
    getEventStats: async (eventId) => {
        const res = await fetch(`${API_URL}/events/${eventId}/stats`, { headers: getHeaders() });
        return res.json();
    },
    validateTicket: async (qrCodeId) => {
        const res = await fetch(`${API_URL}/tickets/validate`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ qrCodeId })
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || "Validation failed");
        return data;
    }
  },
  wallet: {
    getMyTickets: async (userId) => {
        const res = await fetch(`${API_URL}/tickets?owner=${userId}`, { headers: getHeaders() });
        return res.json();
    }
  },
  stripe: {
    createConnectAccount: async (userId) => {
        const res = await fetch(`${API_URL}/stripe/connect`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ userId })
        });
        const data = await res.json();
        return data.url;
    },
    finalizeOnboarding: async (userId) => {
        // Force a server check to verify Stripe capabilities
        await fetch(`${API_URL}/users/${userId}/refresh-stripe`, { headers: getHeaders() });
    }
  },
  payments: {
    createCheckoutSession: async (eventId, quantity, userId, ticketNames, prListName) => {
        const res = await fetch(`${API_URL}/stripe/create-checkout-session`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ eventId, quantity, userId, ticketNames, prList: prListName })
        });
        const data = await res.json();
        if(data.url) {
            // In real mode, we redirect to Stripe URL
            window.location.href = data.url;
            return ""; 
        }
        throw new Error("Failed to create session");
    },
    mockWebhookSuccess: async () => {
        console.warn("Mock webhook called in real mode - ignoring. Waiting for real Stripe Webhook.");
    }
  }
};

// EXPORT THE API BASED ON CONFIG
export const api = USE_MOCK ? mockApi : realApi;