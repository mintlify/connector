import axios, { Method } from "axios";

export async function triggerWebhook(
  url: string,
  method: Method = "get"
): Promise<boolean | Error> {
  try {
    await axios({ url, method }).catch((error: Error) => {
      // log error out to server, so we can see it.
      console.log(error);
      throw new Error(error.message);
    });
  } catch (error: any) {
    return new Error(error);
  }

  return true;
}
