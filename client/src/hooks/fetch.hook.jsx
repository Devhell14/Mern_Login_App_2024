import axios from "axios";
import { useEffect, useState } from "react";
import { getUsername } from "../helper/helper";

export default function useFetch(query) {
  const [getData, setData] = useState({
    isLoading: false,
    apiData: undefined,
    status: null,
    serverError: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData((prev) => ({ ...prev, isLoading: true }));

        // Destructure the result directly instead of creating a separate variable
        const { username } = !query ? await getUsername() : { username: "" };

        const { data, status } = !query
          ? await axios.get(
            import.meta.env.VITE_VERCEL_URL + `api/user/${username}`
            )
          : await axios.get(import.meta.env.VITE_VERCEL_URL + `api/${query}`);

        if (status === 200) {
          setData((prev) => ({ ...prev, apiData: data, status: status }));
        } else {
          // Handle other status codes if needed
        }
      } catch (error) {
        setData((prev) => ({ ...prev, serverError: error }));
      } finally {
        // Move this outside the if conditions to set isLoading to false in all cases
        setData((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchData();
  }, [query]);

  return [getData, setData];
}
