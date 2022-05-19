import axios from "axios";
import { API_ENDPOINT } from "./api";

export const getUserFromUserId = async (userId: string) => {
  const {
    data: { user },
  }: { data: { user: any } } = await axios.get(`${API_ENDPOINT}/routes/user/${userId}`);

  return user;
};

export const getUserFromUserEmail = async (userEmail: string) => {
  const {
    data: { user },
  }: { data: { user: any } } = await axios.get(`${API_ENDPOINT}/routes/user/by-email?email=${userEmail}`);

  return user;
};
