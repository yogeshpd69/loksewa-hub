import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Organization } from '../data/questions/types';
import { useAuth } from './AuthContext';

interface OrganizationContextType {
  activeOrganization: Organization;
  setActiveOrganization: (org: Organization) => void;
  activeSpecialization: 'BCT' | 'BEI' | 'General';
  setActiveSpecialization: (spec: 'BCT' | 'BEI' | 'General') => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { profile, updateProfile, isGuest } = useAuth();
  
  const [activeOrganization, setActiveOrganizationState] = useState<Organization>(
    (profile?.organization as Organization) || 'PSC'
  );
  const [activeSpecialization, setActiveSpecializationState] = useState<'BCT' | 'BEI' | 'General'>(
    (profile?.specialization as 'BCT' | 'BEI' | 'General') || 'BCT'
  );

  // Sync state if profile loads later
  useEffect(() => {
    if (profile) {
      if (profile.organization) setActiveOrganizationState(profile.organization as Organization);
      if (profile.specialization) setActiveSpecializationState(profile.specialization as 'BCT' | 'BEI' | 'General');
    }
  }, [profile?.organization, profile?.specialization]);

  const setActiveOrganization = (org: Organization) => {
    setActiveOrganizationState(org);
    if (!isGuest) {
      updateProfile({ organization: org });
    }
  };

  const setActiveSpecialization = (spec: 'BCT' | 'BEI' | 'General') => {
    setActiveSpecializationState(spec);
    if (!isGuest) {
      updateProfile({ specialization: spec });
    }
  };

  return (
    <OrganizationContext.Provider value={{
      activeOrganization,
      setActiveOrganization,
      activeSpecialization,
      setActiveSpecialization
    }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

