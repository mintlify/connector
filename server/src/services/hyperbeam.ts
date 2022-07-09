import axios from "axios";
import { ISDEV } from "../helpers/environment";

const HYPERBEAM_ENDPOINT = ISDEV ? 'https://enginetest.hyperbeam.com/v0/vm' : 'https://engine.hyperbeam.com/v0/vm'

export const getHyperbeamIframeUrl = async (url?: string) => {
  const { data: hyperbeamResponse } = await axios.post(HYPERBEAM_ENDPOINT, {
    start_url: url,
    kiosk: true,
    hide_cursor: true,
    width: 840,
    height: 1080,
    offline_timeout: 60,
  }, {
    headers: {
      Authorization: `Bearer ${process.env.HYPERBEAM_API_KEY}`
    }
  });
  return hyperbeamResponse.embed_url;
}