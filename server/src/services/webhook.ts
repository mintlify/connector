import axios, { Method } from "axios";

export async function triggerWebhook(url: string, method: Method = "get"): Promise<any> {
  try {
    await axios({ url, method });
  } catch (error: any) {
    return new Error(error);
  }
}
