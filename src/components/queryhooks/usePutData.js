import { useState, useEffect } from "react";
import { putData, getCurrentDate } from "../modules/myapi";
import { useAuthUser } from "./AuthUserContext";

export const usePutData = () => {
  const authUser = useAuthUser();
  const [condition, setCondition] = useState({ type: "", data: {} });
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const put = async () => {
      setIsError(false);
      setIsLoading(true);
      const { type, data } = condition;
      if (type !== "compare") {
        data.record.recordDate = getCurrentDate;
      }
      putData(type, data.id,data)
        .catch((err) => setIsError(err.response.status));
      setIsLoading(false);
    };
    put();
  }, [condition, authUser]);

  return [{isLoading, isError }, setCondition];
};

export default usePutData;
