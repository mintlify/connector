import { createContext, useContext, useEffect, useState } from 'react';
import { getProfile, getSession } from '../helpers/user';

export type User = {
  userId: string,
  email: string,
  firstName: string,
  lastName: string,
  profilePicture?: string,
  pending?: boolean;
  onboarding?: {
    isCompleted: boolean;
    role: string;
    usingVSCode: boolean;
  }
}

export type AccessMode = 'private' | 'public'

export type Org = {
  _id: string
  name: string
  logo: string
  favicon: string
  subdomain: string
  notifications: {
    monthlyDigest: boolean
    newsletter: boolean
  }
  access?: {
    mode: AccessMode
  },
  onboarding?: {
    teamSize: string;
    usingGitHub: boolean;
    usingSlack: boolean;
    usingNone: boolean;
  },
  plan?: {
    name: 'free' | 'pro',
  }
}

export type Session = {
  userId: string
  tempAuthData?: {
    email: string
    firstName?: string
    lastName?: string
    orgId?: string
    orgName?: string
  }
}

export type Profile = {
  user?: User;
  org?: Org;
  session?: Session;
}

type ProfileContextType = {
  profile: Profile,
  isLoadingProfile: boolean,
  session?: Session
}

const defaultProfile = {
  user: undefined,
  org: undefined,
}

const ProfileContext = createContext<ProfileContextType>({ profile: defaultProfile, isLoadingProfile: true });

export function ProfileContextProvider({ children }: { children: any }) {
  const [profile, setProfile] = useState<Profile>();
  const [session, setSession] = useState<Session>();
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  useEffect(() => {
    setIsLoadingProfile(true);
    getProfile()
      .then((profile) => {
        setProfile(profile);
      }).finally(() => {
        setIsLoadingProfile(false);
      });
    getSession()
      .then((session) => {
        setSession(session);
      })
  }, []);

  const value = {
    profile: profile || defaultProfile,
    isLoadingProfile,
    session,
  }

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  return useContext(ProfileContext);
}