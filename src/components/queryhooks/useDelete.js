import { useState, useEffect } from "react";
import { deleteData, selectDatas } from "../modules/myapi";
import { useAuthUser } from "../../context/AuthUserContext";

export const useDeleteData = () => {
  const authUser = useAuthUser();
  const [condition, setCondition] = useState({ type: "", param: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const del = async () => {
      setIsError(false);
      setIsLoading(true);
      const { type, id, param } = condition;
      let paramId = id;
      if (!paramId) {
        await selectDatas(type, param)
          .then((res) => {
            paramId = res.id;
          })
          .catch((err) => setIsError(err.response.status));
      }
      if (authUser.split("U")[1] !== paramId.split("U")[1]) {
        setIsError(999);
        setIsLoading(false);
        return;
      }
      await deleteData(type, paramId).catch((err) =>
        setIsError(err.response.status)
      );
      setIsLoading(false);
    };
    del();
  }, [condition, authUser]);

  return [{ isLoading, isError }, setCondition];
};

export default useDeleteData;
