import { useState, useEffect } from "react";
import { getData } from "../modules/myapi";
import { useAuthUser } from "../../context/AuthUserContext";

export const useGetData = () => {
  const authUser = useAuthUser();
  const [data, setData] = useState({});
  const [condition, setCondition] = useState({ type: "", id: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const get = async () => {
      setIsError(false);
      setIsLoading(true);
      const { type, id } = condition;
      if (authUser.split("U")[1] !== id.split("U")[1]) {
        setIsError(999);
        setIsLoading(false);
        return;
      }
      await getData(type, id)
        .then((res) => {
          setData(res.data);
        })
        .catch((err) => setIsError(err.response.status));
      setIsLoading(false);
    };
    get();
  }, [condition, authUser]);

  return [{ data, isLoading, isError }, setCondition];
};

export default useGetData;
