
import { Capacitor } from '@capacitor/core';
import { Event, EventCategory, LoginResponse, Ticket, User, UserRole, Report } from '../types';

// ==========================================
// CONFIGURATION
// ==========================================

// CHANGE THIS TO FALSE TO USE THE REAL BACKEND
const USE_MOCK = false; 

// Automatically determine API URL based on the current browser domain
// If we are on localhost, look for port 5000. Otherwise, use relative path '/api'
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = Capacitor.isNativePlatform() ? 'https://www.uniparty.app/api' : (isLocalhost ? 'http://localhost:5000/api' : '/api');

// ==========================================
// MOCK DATA & IMPLEMENTATION (Fallback)
// ==========================================
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockApi = {
  auth: {
    login: async () => ({ token: 'mock', user: {} as any }),
    register: async () => ({ token: 'mock', user: {} as any }),
    updateUser: async () => ({} as any),
    deleteAccount: async () => {},
    toggleFavorite: async () => [],
    getFavoriteEvents: async () => [],
    me: async () => ({}) as any,
    toggleFollow: async () => [],
    toggleBlock: async () => [],
    searchAssociations: async () => [],
    getPublicProfile: async () => ({} as any),
    forgotPassword: async () => ({ message: "Mock: Email sent" }),
    resetPassword: async () => ({ message: "Mock: Password reset" }),
    createStaffAccount: async () => ({}) as any,
    getStaffAccounts: async () => [],
    deleteStaffAccount: async () => ({ success: true }),
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
  reports: {
    create: async () => ({} as any),
    getAll: async () => [],
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
      restoreUser: async () => {},
      deleteUser: async () => {},
      deleteEventWithReason: async () => ({}),
  },
  notifications: {
      subscribe: async () => {},
      getAll: async () => [],
      markAsRead: async () => {},
      getVapidKey: async () => ({ key: 'mock' })
  },
  archive: {
    getMyArchivedLists: async () => [],
    getAllArchivedListsAdmin: async () => []
  }
};

const getHeaders = () => {
    const token = localStorage.getItem('uniparty_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
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
    toggleBlock: async (associationId: string) => {
        const res = await fetch(`${API_URL}/users/block/toggle`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ associationId })
        });
        if(!res.ok) throw new Error('Failed to toggle block');
        return res.json();
    },
    getFavoriteEventsForUser: async () => {
        const res = await fetch(`${API_URL}/users/favorites/list`, {
            headers: getHeaders()
        });
        if(!res.ok) throw new Error('Failed to fetch favorites');
        return res.json();
    },
    toggleFollowAssociation: async (associationId: string) => {
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
        const res = await fetch(`${API_URL}/users/${userId}/public`, {
            headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        });
        if(!res.ok) throw new Error('Failed to fetch public profile');
        return res.json();
    },
    forgotPassword: async (email: string) => {
        const res = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to request password reset');
        return data;
    },
    resetPassword: async (token: string, password: string) => {
        const res = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to reset password');
        return data;
    },
    createStaffAccount: async (staffData: any) => {
        const res = await fetch(`${API_URL}/auth/staff-account`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(staffData)
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || 'Failed to manage staff account');
        return data;
    },
    getStaffAccounts: async () => {
        const res = await fetch(`${API_URL}/auth/staff-accounts`, { headers: getHeaders() });
        if(!res.ok) throw new Error('Failed to fetch staff accounts');
        return res.json();
    },
    deleteStaffAccount: async (id: string) => {
        const res = await fetch(`${API_URL}/auth/staff-accounts/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if(!res.ok) throw new Error('Failed to delete staff account');
        return res.json();
    }
  },
  events: {
    getAll: async () => {
        const res = await fetch(`${API_URL}/events`, {
            headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        });
        return res.json();
    },
    getById: async (id: string) => {
        const res = await fetch(`${API_URL}/events/${id}`, {
            headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        });
        if (!res.ok) return undefined;
        return res.json();
    },
    getByOrgId: async (orgId: string) => {
        const res = await fetch(`${API_URL}/events?organization=${orgId}`, {
            headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        });
        return res.json();
    },
    getPublicEventsByOrg: async (orgId: string) => {
        const res = await fetch(`${API_URL}/events?organization=${orgId}&public=true`, {
            headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        });
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
  reports: {
    create: async (data: { eventId: string, reason: string }) => {
        const res = await fetch(`${API_URL}/reports`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if(!res.ok) throw new Error('Failed to create report');
        return res.json();
    },
    getAll: async () => {
        const res = await fetch(`${API_URL}/admin/reports`, { headers: getHeaders() });
        if(!res.ok) throw new Error('Failed to fetch reports');
        return res.json();
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
    createCheckoutSession: async (
        eventId: string, 
        quantity: number, 
        userId: string, 
        ticketNames: string[], 
        prListName: string, 
        ticketMatricolas?: string[], 
        ticketCorsoStudi?: string[],
        ticketAnnoCorso?: string[],
        ticketTelefono?: string[],
        ticketEmailIstituzionale?: string[]
    ) => {
        const res = await fetch(`${API_URL}/stripe/create-checkout-session`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ 
                eventId, 
                quantity, 
                userId, 
                ticketNames, 
                prList: prListName, 
                ticketMatricolas, 
                ticketCorsoStudi,
                ticketAnnoCorso,
                ticketTelefono,
                ticketEmailIstituzionale
            })
        });
        const data = await res.json();
        if(data.url) {
            return data.url; 
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
      },
      deleteUser: async (userId: string) => {
          const res = await fetch(`${API_URL}/admin/users/${userId}`, { method: 'DELETE', headers: getHeaders() });
          const data = await res.json();
          if(!res.ok) throw new Error(data.error || 'Failed to delete user');
          return data;
      },
      deleteEventWithReason: async (eventId: string, reason: string) => {
        const res = await fetch(`${API_URL}/admin/events/${eventId}/delete-with-reason`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ reason })
        });
        if(!res.ok) throw new Error('Failed to delete event');
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
      saveFcmToken: async (data: { fcmToken: string | null, notificationCity: string | null, enabled: boolean }) => {
          const res = await fetch(`${API_URL}/save-fcm-token`, {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify(data)
          });
          if(!res.ok) throw new Error("Failed to save FCM token");
          return res.json();
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
  },
  archive: {
    getMyArchivedLists: async () => {
        const res = await fetch(`${API_URL}/archive/my-lists`, { headers: getHeaders() });
        if(!res.ok) throw new Error('Failed to fetch archived lists');
        return res.json();
    },
    getAllArchivedListsAdmin: async () => {
        const res = await fetch(`${API_URL}/archive/admin-lists`, { headers: getHeaders() });
        if(!res.ok) throw new Error('Failed to fetch admin archived lists');
        return res.json();
    }
  }
};

export const api = USE_MOCK ? (mockApi as any) : realApi;
