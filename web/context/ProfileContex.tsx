import { createContext, useContext, useEffect, useState } from 'react';
import { getProfile, getUserFromUserId } from '../helpers/user';

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
  }
}

export type Profile = {
  user?: User;
  org?: Org;
}

type ProfileContextType = {
  profile: Profile,
  isLoadingProfile: boolean,
}

const defaultProfile = {
  user: undefined,
  org: undefined,
}

const ProfileContext = createContext<ProfileContextType>({ profile: defaultProfile, isLoadingProfile: true });

export function ProfileContextProvider({ children }: { children: any }) {
  const [profile, setProfile] = useState<Profile>();
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  useEffect(() => {
    setIsLoadingProfile(true);
    getProfile()
      .then((profile) => {
        setProfile(profile);
        setIsLoadingProfile(false);
      });
  }, []);

  const value = {
    profile: profile || defaultProfile,
    isLoadingProfile
  }

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  return useContext(ProfileContext);
}