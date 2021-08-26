import { useState, useEffect } from "react";
import { deleteData } from "../modules/myapi";
import { useAuthUser } from "./AuthUserContext";

export const useDeleteData = () => {
  const authUser = useAuthUser();
  const [condition, setCondition] = useState({ type: "", id: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const del = async () => {
      setIsError(false);
      setIsLoading(true);
      const { type, id } = condition;
      if (authUser.split("U")[1] !== id.split("U")[1]) {
        setIsError(999);
        setIsLoading(false);
        return;
      }
      deleteData(type, id).catch((err) => setIsError(err.response.status));
      setIsLoading(false);
    };
    del();
  }, [condition, authUser]);

  return [{ isLoading, isError }, setCondition];
};

export default useDeleteData;
