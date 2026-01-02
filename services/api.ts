
import { Event, EventCategory, LoginResponse, Ticket, User, UserRole, Report } from '../types';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isLocalhost ? 'http://localhost:5000/api' : '/api';

const getHeaders = () => {
    const token = localStorage.getItem('uniparty_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

export const api = {
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
        return res.json();
    },
    me: async () => {
        const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
        return res.json();
    },
    toggleFavorite: async (userId: string, eventId: string) => {
        const res = await fetch(`${API_URL}/users/favorites/toggle`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ eventId })
        });
        return res.json();
    },
    getFavoriteEvents: async (userId: string) => {
        const res = await fetch(`${API_URL}/users/favorites/list`, { headers: getHeaders() });
        return res.json();
    },
    toggleFollow: async (associationId: string) => {
        const res = await fetch(`${API_URL}/users/follow/toggle`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ associationId })
        });
        return res.json();
    },
    searchAssociations: async (query: string) => {
        const res = await fetch(`${API_URL}/users/search?q=${encodeURIComponent(query)}`, { headers: getHeaders() });
        return res.json();
    },
    getPublicProfile: async (userId: string) => {
        const res = await fetch(`${API_URL}/users/${userId}/public`);
        return res.json();
    },
    // Fix: Added missing methods for account deletion and password management
    deleteAccount: async (userId: string) => {
        const res = await fetch(`${API_URL}/users/${userId}`, { method: 'DELETE', headers: getHeaders() });
        return res.json();
    },
    forgotPassword: async (email: string) => {
        const res = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || 'Failed to request password reset');
        return data;
    },
    resetPassword: async (token: string, password: string) => {
        const res = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password })
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || 'Failed to reset password');
        return data;
    }
  },
  events: {
    getAll: async () => {
        const res = await fetch(`${API_URL}/events`);
        return res.json();
    },
    getById: async (id: string) => {
        const res = await fetch(`${API_URL}/events/${id}`);
        return res.json();
    },
    getByOrgId: async (orgId: string) => {
        const res = await fetch(`${API_URL}/events?organization=${orgId}`, { headers: getHeaders() });
        return res.json();
    },
    getPublicEventsByOrg: async (orgId: string) => {
        const res = await fetch(`${API_URL}/events?organization=${orgId}&public=true`);
        return res.json();
    },
    create: async (eventData: any) => {
        const res = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(eventData)
        });
        return res.json();
    },
    update: async (id: string, eventData: any) => {
        const res = await fetch(`${API_URL}/events/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(eventData)
        });
        return res.json();
    },
    delete: async (id: string) => {
        await fetch(`${API_URL}/events/${id}`, { method: 'DELETE', headers: getHeaders() });
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
        return res.json();
    }
  },
  reports: {
      create: async (data: { eventId: string, reason: string }) => {
          const res = await fetch(`${API_URL}/reports`, {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify(data)
          });
          return res.json();
      },
      getAll: async () => {
          const res = await fetch(`${API_URL}/reports`, { headers: getHeaders() });
          return res.json();
      },
      dismiss: async (id: string) => {
          const res = await fetch(`${API_URL}/reports/${id}/dismiss`, { method: 'POST', headers: getHeaders() });
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
    createCheckoutSession: async (eventId: string, quantity: number, userId: string, ticketNames: string[], prListName: string, ticketMatricolas?: string[], ticketCorsoStudi?: string[]) => {
        const res = await fetch(`${API_URL}/stripe/create-checkout-session`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ eventId, quantity, userId, ticketNames, prList: prListName, ticketMatricolas, ticketCorsoStudi })
        });
        const data = await res.json();
        if(data.url) {
            window.location.href = data.url;
            return ""; 
        }
        throw new Error("Failed to create session");
    },
    verifyPayment: async (sessionId: string) => {
        const res = await fetch(`${API_URL}/stripe/verify`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ sessionId })
        });
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
      deleteEventWithReason: async (eventId: string, reason: string) => {
          const res = await fetch(`${API_URL}/admin/events/${eventId}/delete-with-reason`, {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify({ reason })
          });
          return res.json();
      }
  },
  notifications: {
      subscribe: async (subscription: PushSubscription) => {
          await fetch(`${API_URL}/notifications/subscribe`, {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify(subscription)
          });
      },
      getAll: async () => {
          const res = await fetch(`${API_URL}/notifications`, { headers: getHeaders() });
          return res.json();
      },
      markAsRead: async (id: string) => {
          await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PUT', headers: getHeaders() });
      },
      getVapidKey: async () => {
          const res = await fetch(`${API_URL}/notifications/vapid-key`);
          return res.json();
      }
  }
};
