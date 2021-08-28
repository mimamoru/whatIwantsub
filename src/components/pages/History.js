import { React, useState, useEffect, useCallback } from "react";
import GenericTemplate from "../modules/GenericTemplate";
import { makeStyles } from "@material-ui/core/styles";
import { DataGrid } from "@material-ui/data-grid";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import CustomizedSnackbars from "../atoms/CustomizedSnackbars";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import BlockOutlinedIcon from "@material-ui/icons/BlockOutlined";
import ReactSelect from "react-select";
import { err } from "../modules/messages";
import { useSelectDatas, getCurrentDate } from "../queryhooks";
const useStyles = makeStyles((theme) => ({
  absolute: {
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(3),
  },
  root: {
    flexGrow: 1,
  },
}));

const options = [
  { value: "1", label: "過去1か月" },
  { value: "3", label: "過去3か月" },
  { value: "6", label: "過去6か月" },
  { value: "all", label: "全て" },
];
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography component="span">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const buyHistoryColumns = [
  { field: "id", headerName: "管理番号", width: 140 },
  { field: "name", headerName: "商品名", width: 240 },
  { field: "registerDate", headerName: "登録日", width: 120 },
  { field: "cost", headerName: "単価", width: 120 },
  { field: "qty", headerName: "個数", width: 110 },
  {
    field: "totalCost",
    headerName: "合計金額",
    width: 140,
  },
];

const cancelHistoryColumns = [
  { field: "id", headerName: "管理番号", width: 140 },
  { field: "name", headerName: "商品名", width: 240 },
  { field: "registerDate", headerName: "登録日", width: 120 },
];

const History = () => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState(0);
  const [selectValue, setSelectValue] = useState("");
  const [buyHistory, setBuyHistory] = useState([]);
  const [cancelHistory, setCancelHistory] = useState([]);
  const [buyHistoryRows, setBuyHistoryRows] = useState([]);
  const [cancelHistoryRows, setCancelHistoryRows] = useState([]);

  //商品情報取得hook(複数)
  const [
    { data: items, isLoading: itsLoaging, isError: itsErr },
    setItCondition,
  ] = useSelectDatas();

  //商品情報取得(複数)
  useEffect(() => {
    const fetch = () => {
      setItCondition({
        type: "item",
        param: "&delete=false&record.decideDate=null",
      });
    };
    fetch();
  }, [setItCondition]);

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

  useEffect(() => {
    const fetchData = () => {
      if (itsLoaging) return;
      if (itsErr) {
        setItCondition({
          type: "item",
          param: "&delete=false&record.decideDate=null",
        });
        setSnackbar({ open: true, severity: "error", message: err });
        return;
      }
      if (tabValue === 0) {
        const buyHistoryInfo = items
          ? items.filter((e) => e.record.qty !== null)
          : [];
        const rows = buyHistoryInfo.map((e) => ({
          id: e.id,
          name: e.name,
          registerDate: e.record.decideDate.split(" ")[0],
          cost: e.record.cost,
          qty: e.record.qty,
          totalCost: e.record.cost * e.record.qty,
        }));
        setBuyHistory([...rows]);
        setBuyHistoryRows([...rows]);
      } else {
        const cancelHistoryInfo = items
          ? items.filter(
              (e) => e.record.decideDate !== null && e.record.qty == null
            )
          : [];
        const rows = cancelHistoryInfo.map((e) => ({
          id: e.id,
          name: e.name,
          registerDate: e.record.decideDate,
        }));
        setCancelHistory([...rows]);
        setCancelHistoryRows([...rows]);
      }
    };
    fetchData();
  }, [tabValue, items, itsErr, itsLoaging, setItCondition]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSelectChange = (event, newValue) => {
    setSelectValue(event);
    const value = event.value;
    if (value === "all") {
      setCancelHistoryRows([...cancelHistory]);
      setBuyHistoryRows([...buyHistory]);
      return;
    }
    const date = getCurrentDate().split(" ")[0];
    let dt = new Date(date);
    dt.setMonth(dt.getMonth() - +value);

    const newCancelHistoryRows = cancelHistory.filter(
      (e) => new Date(e.registerDate) >= dt
    );
    setCancelHistoryRows([...newCancelHistoryRows]);

    const newBuyHistoryRows = buyHistory.filter(
      (e) => new Date(e.registerDate) >= dt
    );
    setBuyHistoryRows([...newBuyHistoryRows]);
  };

  return (
    <GenericTemplate title="履歴">
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
            <Tab label="購入履歴" icon={<ShoppingCartIcon />} />
            <Tab label="キャンセル履歴" icon={<BlockOutlinedIcon />} />
          </Tabs>
        </Paper>
        <section style={{ width: 200 }}>
          <ReactSelect
            placeholder="絞り込み(期間)"
            value={selectValue}
            onChange={handleSelectChange}
            options={options}
          />
        </section>
        <br />
        <TabPanel value={tabValue} index={0}>
          <div style={{ height: 400, width: 890 }}>
            <DataGrid
              rows={buyHistoryRows}
              columns={buyHistoryColumns}
              pageSize={5}
            />
          </div>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <div style={{ height: 400, width: 500 }}>
            <DataGrid
              rows={cancelHistoryRows}
              columns={cancelHistoryColumns}
              pageSize={5}
            />
          </div>
        </TabPanel>
      </div>
    </GenericTemplate>
  );
};

export default History;
