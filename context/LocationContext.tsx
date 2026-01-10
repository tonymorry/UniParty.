
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export const CITIES = ['Palermo', 'Catania', 'Messina', 'Enna', 'Roma', 'Milano', 'Online'] as const;
export type City = typeof CITIES[number] | 'Tutte';

interface LocationContextType {
  selectedCity: City;
  setSelectedCity: (city: City) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCityState] = useState<City>(() => {
    const saved = localStorage.getItem('uniparty_selected_city');
    return (saved as City) || 'Tutte';
  });

  const setSelectedCity = (city: City) => {
    setSelectedCityState(city);
    localStorage.setItem('uniparty_selected_city', city);
  };

  return (
    <LocationContext.Provider value={{ selectedCity, setSelectedCity }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};
