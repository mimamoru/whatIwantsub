import { useState, useEffect } from "react";
import { selectDatas } from "../modules/myapi";
import { useAuthUser } from "../../context/AuthUserContext";

export const useSelectDatas = () => {
  const authUser = useAuthUser();
  const [data, setData] = useState([]);
  const [condition, setCondition] = useState({ type: "", param: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const select = async () => {
      setIsError(false);
      setIsLoading(true);
      const { type, param } = condition;

      await selectDatas(type, `userId=${authUser}${param}`)
        .then((res) => {
          setData(res.data);
        })
        .catch((err) => setIsError(err.response.status));
      setIsLoading(false);
    };
    select();
  }, [condition, authUser]);

  return [{ data, isLoading, isError }, setCondition];
};

export default useSelectDatas;
