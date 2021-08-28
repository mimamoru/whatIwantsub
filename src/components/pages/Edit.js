import { React, useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { useLocation, useHistory } from "react-router-dom";
import ReactSelect from "react-select";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Slider from "@material-ui/core/Slider";
import CustomizedSnackbars from "../atoms/CustomizedSnackbars";

import CircularIndeterminate from "../atoms/CircularIndeterminate";
import { yupResolver } from "@hookform/resolvers/yup";
import { BaseYup } from "../modules/localeJP";

import GenericTemplate from "../modules/GenericTemplate";

import {
  useSelectDatas,
  useDeleteData,
  usePostData,
  usePutData,
  getCurrentDate,
} from "../queryhooks";
import { err, edit, change } from "../modules/messages";

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

//スライダー用値の指定
const valuetext = (value) => {
  return `${value}%`;
};

//更新データ
const putData = (id, data, compares) => {
  const putItemData = {
    id: id,
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
      createDate: data.record.createDate,
      recordDate: data.record.recordDate,
    },
  };
  let nexts = [];
  data.compares &&
    data.compares.forEach((e) => {
      e && nexts.push(e.value);
    });
  nexts = nexts.sort();

  let olds = [];
  compares &&
    compares.forEach((e) => {
      e && olds.push(e.value);
    });
  olds = olds.sort();

  const postCompareData = nexts
    .filter((e) => !olds.includes(e))
    .map((e) => [e, id].sort());
  const deleteCompareData = olds
    .filter((e) => !nexts.includes(e))
    .map((e) => [e, id].sort());

  return {
    putItemData: putItemData,
    postCompareData: postCompareData,
    deleteCompareData: deleteCompareData,
  };
};
const Edit = () => {
  const history = useHistory();
  const location = useLocation();

  //遷移パラメータの取得
  const condition = location.state.condition;
  const itemInfo = location.state.itemInfo;

  //商品情報取得hook(複数)
  const [
    { data: items, isLoading: itsLoaging, isError: itsErr },
    setItCondition,
  ] = useSelectDatas();
  //商品更新hook
  const [{ isLoading: itPLoaging, isError: itPErr }, setItData] = usePutData();
  //比較情報登録hook
  const [{ isLoading: cpPLoaging, isError: cpPErr }, setCpPData] =
    usePostData();
  //比較情報削除hook
  const [{ isLoading: cpDLoaging, isError: cpDErr }, setCpDData] =
    useDeleteData();

  //FORMデフォルト値の指定
  const defaultValues = {
    itemId: itemInfo.id,
    itemName: itemInfo.name,
    budget: itemInfo.budget,
    limitDate: itemInfo.limit?.split("T")[0] || "",
    level: itemInfo.level,
    url: itemInfo.url || "",
    remark: itemInfo.remark || "",
    compares: itemInfo.compares || "",
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues,
    resolver: yupResolver(schema),
  });

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
      setItCondition({
        type: "item",
        param: "&delete=false&record.decideDate=null",
      });
      setSnackbar({ open: true, severity: "error", message: err });
      return;
    }
    const option = items.map((e) => ({
      value: e.id,
      label: `${e.id}:${e.name}`,
    }));
    setOptions(...option);
  }, [itsLoaging, itsErr, setItCondition, items]);

  const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const handleBack = () => {
    //検索条件をパラメータとして一覧画面に遷移する
    history.push("/", {
      condition: condition,
    });
  };

  //更新処理
  //成功の場合、一覧画面に戻る
  async function handleEdit(data) {
    const { putItemData, postCompareData, deleteCompareData } = putData(
      defaultValues.itemId,
      data,
      defaultValues.compares
    );
    setItData(...{ type: "item", data: putItemData });
    if (itPErr) {
      //商品が更新、削除されていた場合は警告を表示し処理を終了する
      if (itPErr === "changed") {
        setSnackbar({ open: true, severity: "warning", message: change });
      } else {
        setSnackbar({ open: true, severity: "error", message: err });
      }
      return false;
    }
    postCompareData.forEach((e) => {
      setCpPData(...{ type: "compare", data: e });
      if (cpPErr) {
        setSnackbar({ open: true, severity: "error", message: err });
        return;
      }
    });

    deleteCompareData.forEach((e) => {
      setCpDData(...{ type: "compare", param: `&compare=${data}` });
      if (cpDErr) {
        setSnackbar({ open: true, severity: "error", message: err });
        return;
      }
    });
    setSnackbar({ open: true, severity: "success", message: edit });
    await _sleep(2000);
    handleBack();
  }

  return (
    <GenericTemplate title="編集">
      <CustomizedSnackbars
        open={snackbar.open}
        handleClose={handleClose}
        severity={snackbar.severity}
        message={snackbar.message}
      />
      <form
        style={{ width: 650 }}
        onSubmit={handleSubmit((data) => handleEdit(data))}
        className="form"
      >
        {(itsLoaging || cpDLoaging || cpPLoaging || itPLoaging) && (
          <CircularIndeterminate component="div" />
        )}
        <hr />
        <div className="container">
          <section>
            <h2>{defaultValues.itemId}</h2>
          </section>
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
            円<p className="error">{errors.budget?.message}</p>
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
                  {...field}
                  label="メモ"
                  style={{ width: 600 }}
                  multiline
                  rows={5}
                  variant="outlined"
                />
              )}
            />
            <p className="error">{errors.remark?.message}</p>
          </section>
          <br />
          <section style={{ textAlign: "center" }}>
            <Button
              style={{ margin: 5 }}
              size="large"
              onClick={handleBack}
              type="button"
              variant="outlined"
              color="primary"
            >
              戻る
            </Button>
            <Button
              style={{ margin: 5 }}
              size="large"
              type="submit"
              variant="outlined"
              color="primary"
            >
              更新
            </Button>
          </section>
        </div>
        <hr />
      </form>
    </GenericTemplate>
  );
};

export default Edit;
