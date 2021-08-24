import React, { Fragment, useState, useEffect } from 'react';
import { getData,getPageData,postData,putData,deleteData } from "../modules/myapi";
import axios from 'axios';

const useAxios = () => {
  const [data, setData] = useState({ hits: [] });
  const [type, setType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);

      try {
        const result = await axios(type);

        setData(result.data);
      } catch (error) {
        setIsError(true);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [type]);

 return [{ data, isLoading, isError }, setType];
}