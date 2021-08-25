import { useState, useEffect } from "react";
import { postData, getCurrentDate } from "../modules/myapi";
import { useAuthUser } from "./AuthUserContext";

export const usePostData = () => {
  const authUser = useAuthUser();
  const [data, setData] = useState([]);
  const [condition, setCondition] = useState({ type: "", data: {} });
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const postDatas = async () => {
      setIsError(false);
      setIsLoading(true);
      const { type, data } = condition;
      data.userId = getCurrentDate;
      if (type !== "item") {
        data.record.createDate = getCurrentDate;
        data.record.recordDate = getCurrentDate;
      }
      if (type !== "user") data.userId = authUser;
      postData(type, data)
        .then((res) => {
          setData(res.data);
        })
        .catch(setIsError(true));
      setIsLoading(false);
    };
    postDatas();
  }, [condition, authUser]);

  return [{ data, isLoading, isError }, setCondition];
};

export default usePostData;
