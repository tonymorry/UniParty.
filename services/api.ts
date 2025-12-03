



import { Event, EventCategory, LoginResponse, Ticket, User, UserRole } from '../types';

// ==========================================
// CONFIGURATION
// ==========================================

// CHANGE THIS TO FALSE TO USE THE REAL BACKEND
const USE_MOCK = false; 

// Automatically determine API URL based on the current browser domain
// If we are on localhost, look for port 5000. Otherwise, use relative path '/api'
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isLocalhost ? 'http://localhost:5000/api' : '/api';

// ==========================================
// MOCK DATA & IMPLEMENTATION (Fallback)
// ==========================================
// (Using a simplified mock implementation for brevity as real backend is focus)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ------------------------------------------------------------------
// 1. MOCK IMPLEMENTATION
// ------------------------------------------------------------------
const mockApi = {
  // ... (keeping structure compatible)
  auth: {
    login: async () => ({ token: 'mock', user: {} as any }),
    register: async () => ({ token: 'mock', user: {} as any }),
    updateUser: async () => ({} as any),
    deleteAccount: async () => {},
    toggleFavorite: async () => [],
    getFavoriteEvents: async () => [],
    me: async () => ({}) as any,
    toggleFollow: async () => [],
    searchAssociations: async () => [],
    getPublicProfile: async () => ({} as any)
  },
  events: {
    getAll: async () => [],
    getById: async () => undefined,
    getByOrgId: async () => [],
    getPublicEventsByOrg: async () => [],
    create: async () => ({} as any),
    update: async () => ({} as any),
    delete: async () => {},
    getEventStats: async () => ({}),
    getAttendees: async () => [],
    validateTicket: async () => ({} as any)
  },
  wallet: {
    getMyTickets: async () => []
  },
  stripe: {
    createConnectAccount: async () => "",
    finalizeOnboarding: async () => {}
  },
  payments: {
    createCheckoutSession: async () => "",
    mockWebhookSuccess: async () => {},
    verifyPayment: async (sessionId: string) => { console.log("Mock verify", sessionId); }
  },
  admin: {
      getAllUsers: async () => [],
      getAllEvents: async () => [],
      getUserTickets: async () => [],
      verifyUser: async () => {},
      restoreUser: async () => {}
  },
  notifications: {
      subscribe: async () => {},
      getAll: async () => [],
      markAsRead: async () => {},
      getVapidKey: async () => ({ key: 'mock' })
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

const realApi = {
  auth: {
    login: async (email: string, password: string) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || 'Login failed');
        return data;
    },
    register: async (userData: any) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || 'Registration failed');
        return data;
    },
    updateUser: async (userId: string, data: any) => {
        const res = await fetch(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if(!res.ok) throw new Error('Update failed');
        return res.json();
    },
    deleteAccount: async (userId: string) => {
        const res = await fetch(`${API_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if(!res.ok) throw new Error('Failed to delete account');
    },
    toggleFavorite: async (userId: string, eventId: string) => {
        const res = await fetch(`${API_URL}/users/favorites/toggle`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ eventId })
        });
        if(!res.ok) throw new Error('Failed to toggle favorite');
        return res.json();
    },
    getFavoriteEvents: async (userId: string) => {
        const res = await fetch(`${API_URL}/users/favorites/list`, {
            headers: getHeaders()
        });
        if(!res.ok) throw new Error('Failed to fetch favorites');
        return res.json();
    },
    me: async () => {
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: getHeaders()
        });
        if(!res.ok) throw new Error('Failed to fetch user');
        return res.json();
    },
    toggleFollow: async (associationId: string) => {
        const res = await fetch(`${API_URL}/users/follow/toggle`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ associationId })
        });
        if(!res.ok) throw new Error('Failed to toggle follow');
        return res.json();
    },
    searchAssociations: async (query: string) => {
        const res = await fetch(`${API_URL}/users/search?q=${encodeURIComponent(query)}`, {
            headers: getHeaders()
        });
        if(!res.ok) throw new Error('Search failed');
        return res.json();
    },
    getPublicProfile: async (userId: string) => {
        const res = await fetch(`${API_URL}/users/${userId}/public`);
        if(!res.ok) throw new Error('Failed to fetch public profile');
        return res.json();
    }
  },
  events: {
    getAll: async () => {
        const res = await fetch(`${API_URL}/events`);
        return res.json();
    },
    getById: async (id: string) => {
        const res = await fetch(`${API_URL}/events/${id}`);
        if (!res.ok) return undefined;
        return res.json();
    },
    // For Dashboard (Authenticated Owner)
    getByOrgId: async (orgId: string) => {
        const res = await fetch(`${API_URL}/events?organization=${orgId}`);
        return res.json();
    },
    // For Public Profile (Active/Future only)
    getPublicEventsByOrg: async (orgId: string) => {
        const res = await fetch(`${API_URL}/events?organization=${orgId}&public=true`);
        return res.json();
    },
    create: async (eventData: any, user: any) => {
        const res = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(eventData)
        });
        if(!res.ok) throw new Error('Create event failed');
        return res.json();
    },
    update: async (id: string, eventData: any) => {
        const res = await fetch(`${API_URL}/events/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(eventData)
        });
        if(!res.ok) throw new Error('Update event failed');
        return res.json();
    },
    delete: async (id: string) => {
        const res = await fetch(`${API_URL}/events/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if(!res.ok) throw new Error('Delete event failed');
    },
    getEventStats: async (eventId: string) => {
        const res = await fetch(`${API_URL}/events/${eventId}/stats`, { headers: getHeaders() });
        return res.json();
    },
    getAttendees: async (eventId: string) => {
        const res = await fetch(`${API_URL}/events/${eventId}/attendees`, { headers: getHeaders() });
        return res.json();
    },
    validateTicket: async (qrCodeId: string) => {
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
    getMyTickets: async (userId: string) => {
        const res = await fetch(`${API_URL}/tickets?owner=${userId}`, { headers: getHeaders() });
        return res.json();
    }
  },
  stripe: {
    createConnectAccount: async (userId: string) => {
        const res = await fetch(`${API_URL}/stripe/connect`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ userId })
        });
        const data = await res.json();
        return data.url;
    },
    finalizeOnboarding: async (userId: string) => {
        await fetch(`${API_URL}/users/${userId}/refresh-stripe`, { headers: getHeaders() });
    }
  },
  payments: {
    createCheckoutSession: async (eventId: string, quantity: number, userId: string, ticketNames: string[], prListName: string, ticketMatricolas?: string[]) => {
        const res = await fetch(`${API_URL}/stripe/create-checkout-session`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ eventId, quantity, userId, ticketNames, prList: prListName, ticketMatricolas })
        });
        const data = await res.json();
        if(data.url) {
            window.location.href = data.url;
            return ""; 
        }
        throw new Error("Failed to create session");
    },
    mockWebhookSuccess: async () => {
        // No-op in real mode
    },
    verifyPayment: async (sessionId: string) => {
        const res = await fetch(`${API_URL}/stripe/verify`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ sessionId })
        });
        if(!res.ok) throw new Error("Verification failed");
        return res.json();
    }
  },
  admin: {
      getAllUsers: async () => {
          const res = await fetch(`${API_URL}/admin/users`, { headers: getHeaders() });
          return res.json();
      },
      getAllEvents: async () => {
          const res = await fetch(`${API_URL}/admin/events`, { headers: getHeaders() });
          return res.json();
      },
      getUserTickets: async (userId: string) => {
          const res = await fetch(`${API_URL}/admin/users/${userId}/tickets`, { headers: getHeaders() });
          return res.json();
      },
      verifyUser: async (userId: string) => {
          const res = await fetch(`${API_URL}/admin/users/${userId}/verify`, { method: 'PUT', headers: getHeaders() });
          return res.json();
      },
      restoreUser: async (userId: string) => {
          const res = await fetch(`${API_URL}/admin/users/${userId}/restore`, { method: 'PUT', headers: getHeaders() });
          return res.json();
      }
  },
  notifications: {
      subscribe: async (subscription: PushSubscription) => {
          const res = await fetch(`${API_URL}/notifications/subscribe`, {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify(subscription)
          });
          if(!res.ok) throw new Error("Subscription failed");
      },
      getAll: async () => {
          const res = await fetch(`${API_URL}/notifications`, { headers: getHeaders() });
          return res.json();
      },
      markAsRead: async (id: string) => {
          const res = await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PUT', headers: getHeaders() });
          return res.json();
      },
      getVapidKey: async () => {
          const res = await fetch(`${API_URL}/notifications/vapid-key`);
          return res.json();
      }
  }
};

// EXPORT THE API BASED ON CONFIG
// Note: Casting to any to satisfy TS for the simplified mockApi above if strict.
export const api = USE_MOCK ? (mockApi as any) : realApi;