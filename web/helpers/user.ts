import axios from "axios";
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

export const getOrgFromSubdomain = async (subdomain: string) => {
  const {
    data: { org },
  }: { data: { org: any } } = await axios.get(`${API_ENDPOINT}/routes/org/subdomain/${subdomain}`);

  return org;
}