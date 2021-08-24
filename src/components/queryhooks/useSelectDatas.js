import { useState, useEffect } from "react";
import { getConditionData } from "../modules/myapi";

export const useSelectDatas = () => {
  const [data, setData] = useState([]);
  const [condition, setCondition] = useState({ type: "", param: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const selectDatas = async () => {
      setIsError(false);
      setIsLoading(true);
      getConditionData(condition)
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

export default useSelectDatas;
