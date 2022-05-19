import axios from "axios";

export const updateSession = () => {
  return axios.get('/api/updateSession');
}