import { useState, useEffect } from "react";
import { getData } from "../modules/myapi";

export const useGetData = () => {
  const [data, setData] = useState([]);
  const [condition, setCondition] = useState({ type: "", id: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const selectDatas = async () => {
      setIsError(false);
      setIsLoading(true);
      getData(condition)
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

export default useGetData;
