import { useState, useEffect } from "react";
import { postData } from "../modules/myapi";

export const usePostData = () => {
  const [data, setData] = useState([]);
  const [condition, setCondition] = useState({ type: "", data: {} });
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const selectDatas = async () => {
      setIsError(false);
      setIsLoading(true);
      postData(condition)
        .then((res) => {
          setData(res.data);
        })
        .catch(setIsError(true));
      setIsLoading(false);
    };
    selectDatas();
  }, [condition]);

  return [{ data, isLoading, isError }, setCondition];
};

export default usePostData;
