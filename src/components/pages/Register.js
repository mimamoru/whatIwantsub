import { React, useState, useEffect, useCallback, useContext } from "react";

import { useForm, Controller } from "react-hook-form";

import ReactSelect from "react-select";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Slider from "@material-ui/core/Slider";
import { UserItemsContext } from "../../context/UserItemsContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { BaseYup } from "../modules/localeJP";
import CustomizedSnackbars from "../atoms/CustomizedSnackbars";

import CircularIndeterminate from "../atoms/CircularIndeterminate";
import GenericTemplate from "../modules/GenericTemplate";

import { useSelectDatas, usePostData, getCurrentDate } from "../queryhooks";
import { err, register } from "../modules/messages";

//バリデーションの指定
const schema = BaseYup.object().shape({
  itemName: BaseYup.string().required().max(50).label("商品名"),
  budget: BaseYup.number()
    .required()
    .integer()
    .min(0)
    .max(99999999)
    .nullable()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? null : value
    )
    .label("予算"),
  limitDate: BaseYup.date()
    .nullable()
    .min(getCurrentDate().split(" ")[0])
    .nullable()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? null : value
    )
    .label("購入希望日"),
  url: BaseYup.string().url().label("リンク"),
  remark: BaseYup.string().max(100).label("メモ"),
});

//FORMデフォルト値の指定
const defaultValues = {
  itemName: "",
  budget: "",
  limitDate: "",
  level: 50,
  url: "",
  remark: "",
  compares: "",
};

//スライダー用値の指定
const valuetext = (value) => {
  return `${value}%`;
};

//登録データ
const postData = (data) => {
  const postItemData = {
    id: null,
    name: data.itemName,
    budget: data.budget,
    limit: data.limitDate,
    level: data.level,
    url: data.url,
    remark: data.remark,
    delete: false,
    record: {
      qty: null,
      cost: null,
      decideDate: null,
      createDate: null,
      recordDate: null,
    },
  };
  let postCompareData = [];
  data.compares &&
    data.compares.forEach((e) => {
      e && postCompareData.push(e.value);
    });
  postCompareData = postCompareData.sort();
  return {
    postItemData: postItemData,
    postCompareData: postCompareData,
  };
};

const Register = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues,
    resolver: yupResolver(schema),
  });
  //商品登録hook
  const [{ isLoading: itPLoaging, isError: itPErr }, setItData] = usePostData();
  //比較情報登録hook
  const [{ isLoading: cpPLoaging, isError: cPErr }, setCpData] = usePostData();
  const { items, itsLoaging, itsErr, setReroadItems } =
    useContext(UserItemsContext);
  // //商品情報取得hook(複数)
  // const [
  //   { data: items, isLoading: itsLoaging, isError: itsErr },
  //   setItCondition,
  // ] = useSelectDatas();

  // //商品情報取得(複数)
  // useEffect(() => {
  //   const fetch = () => {
  //     setItCondition({
  //       type: "item",
  //       param: "&delete=false&record.decideDate=null",
  //     });
  //   };
  //   fetch();
  // }, [setItCondition]);
  //スナックバーの状態管理
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "",
    message: "",
  });

  //スナックバーを閉じる処理
  const handleClose = useCallback(
    (event, reason) => {
      if (reason === "clickaway") {
        return;
      }
      setSnackbar({ ...snackbar, open: false });
    },
    [snackbar]
  );

  //セレクトボックスのプルダウンメニュー管理
  const [options, setOptions] = useState([]);
  //セレクトボックスのプルダウンメニューを設定
  useEffect(() => {
    if (itsLoaging) return;
    if (itsErr) {
      setReroadItems(true);
      setSnackbar({ open: true, severity: "error", message: err });
      return;
    }
    const option = items
      .filter((e) => e.record?.decideDate === null)
      .map((e) => ({
        value: e.id,
        label: `${e.id}:${e.name}`,
      }));
    setOptions(...option);
  }, [itsLoaging, itsErr, setReroadItems, items]);

  //登録処理
  async function handleRegister(data) {
    const { postItemData, postCompareData } = postData(data);
    setItData(...{ type: "item", data: postItemData });
    if (itsErr) {
      setSnackbar({ open: true, severity: "error", message: err });
      return;
    }
    setCpData(...{ type: "compare", data: postCompareData });
    if (cPErr) {
      setSnackbar({ open: true, severity: "error", message: err });
      return;
    }
    setSnackbar({ open: true, severity: "success", message: register });
  }

  return (
    <GenericTemplate title="登録">
      <CustomizedSnackbars
        open={snackbar.open}
        handleClose={handleClose}
        severity={snackbar.severity}
        message={snackbar.message}
      />
      <form
        style={{ width: 650 }}
        onSubmit={handleSubmit((data) => handleRegister(data))}
        className="form"
      >
        {itPLoaging && <CircularIndeterminate component="div" />}
        <hr />
        <div className="container">
          <section>
            <Controller
              control={control}
              name="itemName"
              render={({ field }) => (
                <TextField
                  style={{ width: 600 }}
                  {...field}
                  label="商品名*"
                  variant="outlined"
                />
              )}
            />
            <p className="error">{errors.itemName?.message}</p>
          </section>
          <section>
            <Controller
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="予算(単価)*"
                  variant="outlined"
                  style={{ verticalAlign: "middle" }}
                />
              )}
              thousandSeparator
              name="budget"
              className="input"
              control={control}
            />
            <span> 円</span>
            <p className="error">{errors.budget?.message}</p>
          </section>
          <section>
            <Controller
              control={control}
              name="limitDate"
              render={({ field }) => (
                <TextField
                  type="date"
                  label="購入希望日"
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  {...field}
                />
              )}
            />
            <p className="error">{errors.limitDate?.message}</p>
          </section>
          <section style={{ width: 600 }}>
            <label>必要性</label>
            <Controller
              control={control}
              name="level"
              render={({ field }) => (
                <Slider
                  getAriaValueText={valuetext}
                  aria-labelledby="discrete-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={0}
                  max={100}
                  {...field}
                  onChange={(_, value) => {
                    field.onChange(value);
                  }}
                />
              )}
            />
          </section>
          <section>
            <Controller
              placeholder="URL"
              control={control}
              name="url"
              render={({ field }) => (
                <TextField
                  style={{ width: 600 }}
                  {...field}
                  label="リンク"
                  variant="outlined"
                />
              )}
            />
            <p className="error">{errors.url?.message}</p>
          </section>
          <section style={{ width: 600 }}>
            <Controller
              control={control}
              name="compares"
              render={({ field }) => (
                <ReactSelect
                  placeholder="比較商品"
                  variant="outlined"
                  isMulti
                  {...field}
                  options={options}
                />
              )}
            />
          </section>
          <br />
          <section>
            <Controller
              placeholder=""
              control={control}
              name="remark"
              render={({ field }) => (
                <TextField
                  multiline
                  rows={5}
                  style={{ width: 600 }}
                  {...field}
                  label="メモ"
                  variant="outlined"
                />
              )}
            />
            <p className="error">{errors.remark?.message}</p>
          </section>
          <br />
          <section style={{ textAlign: "center" }}>
            <Button
              type="submit"
              size="large"
              variant="outlined"
              color="primary"
            >
              登録
            </Button>
          </section>
        </div>

        <hr />
      </form>
    </GenericTemplate>
  );
};

export default Register;
