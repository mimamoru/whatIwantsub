import React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import ReactSelect from "react-select";
import { useLocation, useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";

import { blue } from "@material-ui/core/colors";

import { yupResolver } from "@hookform/resolvers/yup";
import { BaseYup } from "../modules/localeJP";

import CircularIndeterminate from "../atoms/CircularIndeterminate";
import SimpleAccordion from "../atoms/SimpleAccordion";
import CustomizedSnackbars from "../atoms/CustomizedSnackbars";
import GenericTemplate from "../molecules/GenericTemplate";

import { useSelectDatas } from "../queryhooks";
import { nodata, err, reverse } from "../modules/messages";

//バリデーションの指定
const schema = BaseYup.object().shape({
  itemId: BaseYup.string().max(50).alphanumeric().label("管理番号"),
  itemName: BaseYup.string().max(50).label("商品名"),
  minBudget: BaseYup.number()
    .integer()
    .min(0)
    .max(99999999)
    .nullable()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? null : value
    )
    .label("金額(最小)"),
  maxBudget: BaseYup.number()
    .integer()
    .min(0)
    .max(99999999)
    .nullable()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? null : value
    )
    .label("金額(最大)"),
  keyword: BaseYup.string().max(100).label("キーワード"),
});

const SelectItems = (
  items,
  { itemId, itemName, minBudget, maxBudget, keyword, condition, sortIndex }
) => {
  const keywords = keyword ? keyword.split(/\s+/) : "";
  let result = items
    .filter((e) => (itemId === "" ? true : e.id === itemId))
    .filter((e) => (itemName === "" ? true : e.name.indexOf(itemName) !== -1))
    .filter((e) => (minBudget === "" ? true : e.budget >= +minBudget))
    .filter((e) => (maxBudget === "" ? true : e.budget <= +maxBudget))
    .filter((e) => {
      if (keywords === "") return true;
      const str = `${e.name},${e.remark}`;
      if (condition === false) {
        return keywords.some((key) => str.indexOf(key) !== -1);
      } else {
        return keywords.every((key) => str.indexOf(key) !== -1);
      }
    });
  switch (sortIndex.value) {
    case "budget":
      result = result.sort((a, b) => (a.budget < b.budget ? -1 : 1));
      break;
    case "level":
      result = result.sort((a, b) => (a.level > b.level ? -1 : 1));
      break;
    case "limit":
      result = result.sort((a, b) => (a.limit < b.limit ? -1 : 1));
      break;
    default:
      result = result.sort((a, b) => (a.id > b.id ? -1 : 1));
  }
  return result;
};

//スタイルの指定
const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(3),
    },
  },

  button: {
    margin: theme.spacing(0.5),
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    display: "inline-block",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },

  avatar: {
    width: "7ch",
    backgroundColor: blue[500],
  },
  resize: {
    fontSize: 5,
  },
}));

//FORMデフォルト値の指定
const defaultValues = {
  itemId: "",
  itemName: "",
  minBudget: "",
  maxBudget: "",
  keyword: "",
  condition: false,
  sortIndex: "id",
};

const Search = () => {
  const classes = useStyles();
  const location = useLocation();
  const [actionErr, setActionErr] = useState(true);

  //商品情報取得hook(複数)
  const [
    { data: items, isLoading: itsLoaging, isError: itsErr },
    setItCondition,
  ] = useSelectDatas();

  //商品情報取得(複数)
  useEffect(() => {
    if (!actionErr) return;
    const fetch = () => {
      setItCondition({
        type: "item",
        param: "&delete=false&record.decideDate=null",
      });
      setActionErr(false);
    };
    fetch();
  }, [setItCondition, actionErr]);

  //遷移パラメータの取得
  const paramCondition = location.state
    ? location.state.condition
    : defaultValues;
  //検索条件の管理
  const [allCondition, setAllCondition] = useState({ ...paramCondition });
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
  const {
    handleSubmit,
    reset,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: paramCondition,
    resolver: yupResolver(schema),
  });

  //検索結果の状態
  const [resultData, setResultData] = useState([]);

  //金額範囲逆転チェック
  const getData = (condition) => {
    if (
      condition.minBudget !== null &&
      condition.maxBudget !== null &&
      condition.minBudget > condition.maxBudget
    ) {
      setSnackbar({ open: true, severity: "error", message: reverse });
    } else {
      //検索条件
      const conditions = {
        itemId: condition.itemId,
        itemName: condition.itemName,
        minBudget: condition.minBudget || "",
        maxBudget: condition.maxBudget || "",
        keyword: condition.keyword,
        condition: condition.condition,
        sortIndex: condition.sortIndex,
      };
      setAllCondition({ ...conditions });
      if (itsErr) {
        setSnackbar({ open: true, severity: "error", message: err });
        return;
      }
      const result = SelectItems(items, conditions);
      const length = result.length;
      if (length === 0) {
        setSnackbar({ open: true, severity: "warning", message: nodata });
      }

      setResultData([...result]);
    }
  };

  //検索条件クリア処理
  const handleClear = () => {
    reset(defaultValues);
  };

  return (
    <GenericTemplate title="検索">
      <CustomizedSnackbars
        open={snackbar.open}
        handleClose={handleClose}
        severity={snackbar.severity}
        message={snackbar.message}
      />

      <form
        style={{ width: 650 }}
        onSubmit={handleSubmit((data) => getData(data))}
        className="form"
      >
        <hr />

        <div className="container">
          <section>
            <Controller
              control={control}
              name="itemId"
              render={({ field }) => (
                <TextField label="管理番号" {...field} variant="outlined" />
              )}
            />
            <p className="error">{errors.itemId?.message}</p>
            <Controller
              control={control}
              name="itemName"
              render={({ field }) => (
                <TextField
                  style={{ width: 600 }}
                  label="商品名"
                  {...field}
                  variant="outlined"
                />
              )}
            />
            <p className="error">{errors.itemName?.message}</p>
          </section>
          <section style={{ verticalAlign: "center" }}>
            <Controller
              control={control}
              name="minBudget"
              render={({ field }) => (
                <TextField
                  label="金額(最小)"
                  placeholder=""
                  {...field}
                  type="number"
                  variant="outlined"
                  component="span"
                  style={{ verticalAlign: "middle" }}
                />
              )}
            />
            <span>～</span>
            <Controller
              placeholder=""
              control={control}
              name="maxBudget"
              render={({ field }) => (
                <TextField
                  label="金額(最大)"
                  placeholder=""
                  {...field}
                  type="number"
                  variant="outlined"
                  component="span"
                  style={{ verticalAlign: "middle" }}
                />
              )}
            />
            <span>円</span>
            <p className="error">{errors.minBudget?.message}</p>
            <p className="error">{errors.maxBudget?.message}</p>
          </section>
          <section>
            <Controller
              control={control}
              name="keyword"
              render={({ field }) => (
                <TextField
                  multiline
                  rows={3}
                  style={{ width: 530, verticalAlign: "middle" }}
                  label="キーワード"
                  {...field}
                  variant="outlined"
                  component="span"
                />
              )}
            />
            <Controller
              control={control}
              name="condition"
              render={({ field: { value, onChange } }) => (
                <Checkbox
                  checked={value}
                  color="primary"
                  onChange={(e) => {
                    onChange(e.target.checked);
                  }}
                />
              )}
            />
            <label>すべて含む</label>
            <p className="error">{errors.keyword?.message}</p>
          </section>
          <section style={{ width: 600 }}>
            <Controller
              name="sortIndex"
              isClearable
              control={control}
              render={({ field }) => (
                <ReactSelect
                  placeholder="並び順"
                  {...field}
                  options={[
                    { value: "id", label: "新着順" },
                    { value: "budget", label: "単価準(安⇒高)" },
                    { value: "level", label: "必要性(高⇒低)" },
                    { value: "limit", label: "緊急性(高⇒低)" },
                  ]}
                />
              )}
            />
          </section>
          <br />
          <section style={{ textAlign: "center" }}>
            <Button
              className={classes.button}
              type="button"
              variant="outlined"
              color="primary"
              size="large"
              onClick={handleClear}
            >
              クリア
            </Button>
            <Button
              className={classes.button}
              type="submit"
              size="large"
              variant="outlined"
              color="primary"
            >
              検索
            </Button>
          </section>
        </div>
        <hr />
      </form>
      <div id="result">
        {itsLoaging && <CircularIndeterminate component="div" />}
        {resultData?.map((elm) => (
          <SimpleAccordion
            key={elm.id}
            elm={elm}
            allCondition={allCondition}
            setActionErr={() => {
              setActionErr(true);
            }}
          />
        ))}
      </div>
    </GenericTemplate>
  );
};

export default Search;
