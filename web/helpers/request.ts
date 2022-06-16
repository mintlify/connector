import axios, { AxiosRequestConfig } from "axios";

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export const request = (method: Method, endpoint: string, config?: AxiosRequestConfig) => {
  return axios({
    method,
    url: `/api/request/${endpoint}`,
    ...config
  })
}