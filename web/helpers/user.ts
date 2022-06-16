import axios from "axios";
import { Profile, User, Org, Session } from "../context/ProfileContex";
import { API_ENDPOINT } from "./api";

export type OrgForAuth = {
  id: string,
  name: string,
  favicon: string,
  logo: string,
}

export const getSession = async () => {
  const { data: session }: { data: Session } = await axios.get('/api/session');
  return session;
}

export const getProfile = async () => {
  const { data: profile }: { data: Profile } = await axios.get('/api/profile');
  return profile;
}

export const getUserFromUserId = async (userId: string): Promise<User> => {
  const {
    data: { user },
  }: { data: { user: User } } = await axios.get(`${API_ENDPOINT}/routes/user/${userId}`);

  return user;
};

export const getSubdomain = (host: string) => {
  return host.split('.')[0];
}

export const getOrgFromSubdomainForAuth = async (subdomain: string) => {
  const {
    data: { org },
  }: { data: { org: OrgForAuth } } = await axios.get(`${API_ENDPOINT}/routes/org/subdomain/${subdomain}/auth`);

  return org;
}

export const getOrgFromSubdomain = async (subdomain: string, userId: string) => {
  const {
    data: { org },
  }: { data: { org: Org } } = await axios.get(`${API_ENDPOINT}/routes/org/subdomain/${subdomain}/details`, {
    params: {
      userId,
      subdomain
    }
  });

  return org;
}

export const getOrgFromSubdomainAndPotentiallyJoin = async (subdomain: string, userId: string) => {
  const {
    data,
  }: { data: { user: User, org: Org } } = await axios.post(`${API_ENDPOINT}/routes/user/${userId}/join/existing/${subdomain}`);

  return data;
}