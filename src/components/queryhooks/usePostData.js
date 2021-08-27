import { useState, useEffect } from "react";
import { postData, getCurrentDate } from "../modules/myapi";
import { useAuthUser } from "./AuthUserContext";

export const usePostData = () => {
  const authUser = useAuthUser();
  const [condition, setCondition] = useState({ type: "", data: {} });
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const post = async () => {
      setIsError(false);
      setIsLoading(true);
      const { type, data } = condition;
      if (type !== "compare") {
        data.record.createDate = getCurrentDate;
        data.record.recordDate = getCurrentDate;
      }
      if (type !== "user") data.userId = authUser;
      await postData(type, data).catch((err) =>
        setIsError(err.response.status)
      );
      setIsLoading(false);
    };
    post();
  }, [condition, authUser]);

  return [{ isLoading, isError }, setCondition];
};

export default usePostData;
