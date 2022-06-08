import axios from "axios";
import { useEffect, useState } from "react";
import { API_ENDPOINT } from "../../../helpers/api";
import { getSubdomain } from "../../../helpers/user";
import { User } from "../../../pages";

export default function AddNotion({ user }: { user: User }) {
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    axios.post(`${API_ENDPOINT}/routes/integrations/notion/sync`, {}, {
      params: {
        userId: user.userId,
        subdomain: getSubdomain(window.location.host),
      }
    }).then(({ data: { results } }) => {
      console.log(results);
      setIsLoading(false);
    })
  }, [user.userId])
  return null;
}