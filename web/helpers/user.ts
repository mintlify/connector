import axios from "axios";
import { API_ENDPOINT } from "./api";

export const getUserFromUserId = async (userId: string) => {
  const { data: { user } }: { data: { user: any } } = await axios.get(`${API_ENDPOINT}/routes/user?userId=${userId}`);

  return user;
}