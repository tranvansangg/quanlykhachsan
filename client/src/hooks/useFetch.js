import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const useFetch = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      console.log("useFetch called with URL:", url);
      setLoading(true);
      try {
        console.log("Fetching from:", url);
        const res = await axiosInstance.get(url);
        console.log("useFetch success:", res.data);
        if (isMounted) {
          setData(res.data);
        }
      } catch (err) {
        console.error("useFetch error:", err);
        if (isMounted) {
          setError(err);
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    };
    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url]);

  const reFetch = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(url);
      setData(res.data);
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  };

  return { data, loading, error, reFetch };
};

export default useFetch;
