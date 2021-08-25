import { React, useState, useEffect, useCallback } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import DetailButton from "../atoms/DetailButton";
import ImportContactsRoundedIcon from "@material-ui/icons/ImportContactsRounded";
import QuestionAnswerRoundedIcon from "@material-ui/icons/QuestionAnswerRounded";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Pagination from "@material-ui/lab/Pagination";

import ReactSelect from "react-select";

import {
  useGetAllMyStockT,
  useGetAllMyStockQ,
  useGetMyTags,
} from "../queryhooks/index";
import { warningNodata, warningMyTag } from "../modules/messages";
import CustomizedSnackbars from "../atoms/CustomizedSnackbars";
import CircularIndeterminate from "../atoms/CircularIndeterminate";
import TabPanel from "../atoms/TabPanel";

const useStyles = makeStyles((theme) => ({
  absolute: {
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(3),
  },
  root: {
    flexGrow: 1,
  },
  text: {
    textTransform: "none",
  },
  select: {
    zIndex: 100,
  },
}));

const limit = 10;

//検索結果と、お気に入り一覧を表示するテーブル
const CustomizedTable = ({
  columnsT,
  columnsQ,
  valuesT,
  valuesQ,
  allPagesT,
  allPagesQ,
  pageT,
  pageQ,
  setPageT,
  setPageQ,
  paramTabValue,
  paramSelect,
  isStock,
}) => {
  const classes = useStyles();

  //お気に入り情報を取得する
  const { data: mystockT } = useGetAllMyStockT();
  const { data: mystockQ } = useGetAllMyStockQ();

  //MyTag一覧を取得する
  const { data: myTags } = useGetMyTags();

  //セレクトボックス項目の状態管理
  const [options, setOptions] = useState([]);
  //セレクトボックス選択の状態管理
  const [select, setSelect] = useState(paramSelect ? [...paramSelect] : []);

  //お気に入り記事idの状態管理
  const [favoriteT, setFavoriteT] = useState([]);
  const [favoriteQ, setFavoriteQ] = useState([]);

  //テーブル行の状態管理
  const [rowsT, setRowsT] = useState(valuesT && valuesT[0] ? [...valuesT] : []);
  const [rowsQ, setRowsQ] = useState(valuesQ && valuesQ[0] ? [...valuesQ] : []);

  //タブの状態管理
  const [tabValue, setTabValue] = useState(paramTabValue);

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

  //タブの選択変更処理
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  //セレクトボックスの中身を設定
  useEffect(() => {
    setOptions(
      myTags ? [...myTags.map((e) => ({ value: e.id, label: e.id }))] : []
    );
  }, [myTags]);

  //お気に入り記事idを設定
  useEffect(() => {
    setFavoriteT(mystockT ? [...mystockT.map((e) => e.id)] : []);
  }, [mystockT]);

  useEffect(() => {
    setFavoriteQ(mystockQ ? [...mystockQ.map((e) => e.id)] : []);
  }, [mystockQ]);

  //テーブル行を設定
  useEffect(() => {
    if (!valuesT) return;
    setRowsT([...valuesT]);
  }, [valuesT]);

  useEffect(() => {
    if (!valuesQ) return;
    setRowsQ([...valuesQ]);
  }, [valuesQ]);

  //Tagの絞り込みに応じてテーブル表示を変更する
  //※ページごとの絞り込みしかできない
  useEffect(() => {
    const film = select.map((e) => e.value.toLowerCase());
    if (film.length === 0) {
      setRowsT(valuesT && valuesT[0] ? [...valuesT] : [false]);
      setRowsQ(valuesQ && valuesQ[0] ? [...valuesQ] : [false]);
    } else {
      const newRowsT =
        !valuesT || !valuesT[0]
          ? [false]
          : valuesT.filter((elm) =>
              elm.tags.split(",").some((e) => film.includes(e.toLowerCase()))
            );
      setRowsT([...newRowsT]);
      const newRowsQ =
        !valuesQ || !valuesQ[0]
          ? [false]
          : valuesQ.filter((elm) =>
              elm.tags.split(",").some((e) => film.includes(e.toLowerCase()))
            );
      setRowsQ([...newRowsQ]);
    }
  }, [select, valuesT, valuesQ]);

  //データ取得状況に応じてスナックバーを表示する
  useEffect(() => {
    if (!myTags) return;
    const message =
      !isStock && myTags.length === 0 ? warningMyTag : warningNodata;
    if (
      (tabValue === 0 &&
        valuesT &&
        valuesT[0] !== false &&
        rowsT.length === 0) ||
      (tabValue === 1 && valuesQ && valuesQ[0] !== false && rowsQ.length === 0)
    ) {
      setSnackbar({ open: true, severity: "warning", message: message });
    }
  }, [tabValue, rowsT, rowsQ, myTags, valuesT, valuesQ, isStock]);

  return (
    <div id="wrapper">
      <CustomizedSnackbars
        open={snackbar.open}
        handleClose={handleClose}
        severity={snackbar.severity}
        message={snackbar.message}
      />
      <Paper className={classes.root}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab
            className={classes.text}
            label="teratail"
            icon={<QuestionAnswerRoundedIcon />}
          />
          <Tab
            className={classes.text}
            label="Qiita"
            icon={<ImportContactsRoundedIcon />}
          />
        </Tabs>
      </Paper>
      <section style={{ width: 600 }}>
        <ReactSelect
          className={classes.select}
          name="searchTags"
          placeholder="MyTag"
          variant="outlined"
          isMulti
          onChange={(event, newValue) => setSelect(event)}
          defaultValue={paramSelect ? [...paramSelect] : []}
          options={options}
        />
      </section>
      <br />
      <TabPanel value={tabValue} index={0}>
        <TableContainer
          style={{ height: 400, width: "auto" }}
          component={Paper}
        >
          {valuesT[0] === false && <CircularIndeterminate component="span" />}
          <Table
            className={classes.table}
            aria-label="simple table"
            stickyHeader
          >
            <TableHead>
              <TableRow>
                {columnsT?.map((column) => (
                  <TableCell key={column.headerName}>
                    {column.headerName}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rowsT?.map(
                (row) =>
                  row && (
                    <TableRow
                      key={row.id}
                      style={{
                        backgroundColor:
                          (isStock || favoriteT.includes(row.id)) &&
                          "rgb(176, 224, 230)",
                      }}
                    >
                      <TableCell>
                        <DetailButton
                          id={row.id}
                          favorite={isStock ? true : favoriteT.includes(row.id)}
                          type="t"
                          variant="contained"
                          color="primary"
                          pageT={pageT ?? 1}
                          pageQ={pageQ ?? 1}
                          select={select}
                          isStock={isStock}
                        >
                          詳細
                        </DetailButton>
                      </TableCell>
                      {columnsT?.map((column, idx) => (
                        <TableCell
                          key={column.field}
                          style={{
                            display: idx === 0 && "none",
                          }}
                        >
                          {row[column.field]}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <br />
        <div style={{ textAlign: "center", display: "inline-block" }}>
          <Pagination
            count={isStock ? Math.ceil(mystockT?.length / limit) : allPagesT}
            color="primary"
            onChange={(e, page) => setPageT(page)}
            page={pageT ?? 1}
          />
        </div>
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <TableContainer
          style={{ height: 400, width: "auto" }}
          component={Paper}
        >
          {valuesQ[0] === false && <CircularIndeterminate component="span" />}
          <Table
            className={classes.table}
            aria-label="simple table"
            stickyHeader
          >
            <TableHead>
              <TableRow>
                {columnsQ?.map((column) => (
                  <TableCell key={column.headerName}>
                    {column.headerName}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rowsQ?.map(
                (row) =>
                  row && (
                    <TableRow
                      key={row.id}
                      style={{
                        backgroundColor:
                          (isStock || favoriteQ.includes(row.id)) &&
                          "rgb(176, 224, 230)",
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <DetailButton
                          id={row.id}
                          favorite={isStock ? true : favoriteQ.includes(row.id)}
                          type="q"
                          variant="contained"
                          color="primary"
                          pageT={pageT ?? 1}
                          pageQ={pageQ ?? 1}
                          select={select}
                          isStock={isStock}
                        >
                          詳細
                        </DetailButton>
                      </TableCell>
                      {columnsQ?.map((column, idx) => (
                        <TableCell
                          key={column.field}
                          style={{
                            display: idx === 0 && "none",
                          }}
                        >
                          {row[column.field]}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <br />
        <div style={{ textAlign: "center", display: "inline-block" }}>
          <Pagination
            count={isStock ? Math.ceil(mystockQ?.length / limit) : allPagesQ}
            color="primary"
            onChange={(e, page) => setPageQ(page)}
            page={pageQ ?? 1}
          />
        </div>
      </TabPanel>
    </div>
  );
};
export default CustomizedTable;
