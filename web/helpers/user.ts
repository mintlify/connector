import axios from "axios";
import { Org } from "../pages";
import { API_ENDPOINT } from "./api";

export const getUserFromUserId = async (userId: string) => {
  const {
    data: { user },
  }: { data: { user: any } } = await axios.get(`${API_ENDPOINT}/routes/user/${userId}`);

  return user;
};

export const getSubdomain = (host: string) => {
  return host.split('.')[0];
}

export const getOrgFromSubdomainForAuth = async (subdomain: string) => {
  const {
    data: { org },
  }: { data: { org: Org } } = await axios.get(`${API_ENDPOINT}/routes/org/subdomain/${subdomain}/auth`);

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