import axios from "axios";
const userPath = "http://localhost:3001/users";
const itemPath = "http://localhost:3001/items";
const comparePath = "http://localhost:3001/compares";

//axios.defaults.withCredentials = true;

//url取得
export const getUrl = (type) => {
  switch (type) {
    case "user":
      return userPath;
    case "item":
      return itemPath;
    case "compare":
      return comparePath;
    default:
      return "";
  }
};

//ローカルサーバーからid指定で値を取得する
export const getData = async (type, id = "") => {
  const url = getUrl(type);
  //const path = id === "" ? url : `${url}/${id}`;
  const { data } = await axios.get(`${url}/${id}`);
  return data;
};

//ローカルサーバーから条件指定で値を取得する
export const selectDatas = async (type = "", param ="" ) => {
  const url = getUrl(type);
  //`${url}?_page=${page}&_limit=10`;
  //?title=json-server&author=typicode
  const path = `${url}${param}`;
  const { data } = await axios.get(path);
  return data;
};

//ローカルサーバーに値を登録する
export const postData = async (type = "", data = {}) => {
  const path = getUrl(type);
  data.recordDate = getCurrentDate();
  await axios.post(path, data);
};

//ローカルサーバーの値を更新する
export const putData = async (type = "", id = "", data = {}) => {
  const path = getUrl(type);
  data.recordDate = getCurrentDate();
  await axios.put(`${path}/${id}`, data);
};

//ローカルサーバーの値を削除する
export const deleteData = async (type = "", id = "") => {
  const path = getUrl(type);
  await axios.delete(`${path}/${id}`);
};

//整合性チェック
export const currentVersionCheck = async (type, recordDate) => {
  let result;
  await getData(type).then((res) => {
    result = res;
  });
  if (!result) return "";
  // if (result.length === 0 && length === 0) {
  //   return "ok";
  // } else if (result.length !== length) {
  //   return "changed";
  // }
  const maxRecordDate = result.reduce((acc, value) =>
    acc.recordDate > value.recordDate ? acc.recordDate : value.recordDate
  );
  if (maxRecordDate > recordDate) return "changed";
  return "ok";
};

//差分
export const findDiff = (olds, nexts) => ({
  adds: nexts.filter((e) => !olds.includes(e)),
  subs: olds.filter((e) => !nexts.includes(e)),
});

//現在日時取得
let now = new Date();
export const getCurrentDate = () => {
  const Year = now.getFullYear();
  const Month = now.getMonth() + 1;
  const Date = now.getDate();
  const Hour = now.getHours();
  const Min = now.getMinutes();
  const Sec = now.getSeconds();
  return Year + "-" + Month + "-" + Date + " " + Hour + ":" + Min + ":" + Sec;
};
