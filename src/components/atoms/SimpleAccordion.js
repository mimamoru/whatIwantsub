import {
  useState,
  memo,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";

import { makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreRoundedIcon from "@material-ui/icons/ExpandMoreRounded";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Collapse from "@material-ui/core/Collapse";
import Avatar from "@material-ui/core/Avatar";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import DeleteForeverOutlinedIcon from "@material-ui/icons/DeleteForeverOutlined";
import { ChipContext } from "../pages/Configuration";
import ConfirmDialog from "../atoms/ConfirmDialog";
import CustomizedSnackbars from "../atoms/CustomizedSnackbars";
import { BaseYup } from "../modules/localeJP";
import CircularIndeterminate from "../atoms/CircularIndeterminate";
import { UserComparesContext } from "../../context/UserComparesContext";
import { useHistory } from "react-router-dom";
import { useSelectDatas, usePutData, useDeleteData } from "../queryhooks";
import {
  err,
  drop,
  purchase,
  cancel,
  change,
  confirmDelete,
  confirmPurchase,
  confirmCancel,
} from "../modules/messages";
import TouchRipple from "@material-ui/core/ButtonBase/TouchRipple";

const useStyles = makeStyles((theme) => ({
  root: {
    width: 265,
    display: "inline-block",
    verticalAlign: "middle",
    margin: theme.spacing(0.5),
  },
  accordion: {
    display: "inline-block",
    position: "relative",
    verticalAlign: "middle",
    width: 260,
    height: 70,
  },
  details: {
    position: "absolute",
    display: "inline-block",
    width: 260,
    top: 70,
    zIndex: 100,
    backgroundColor: "white",
  },
  heading: {
    width: 150,
    textAlign: "center",
    verticalAlign: "middle",
    position: "relative",
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  button: {
    zIndex: 10,
    pointerEvents: "visible",
    margin: theme.spacing(0.3),
  },
}));

const selectCompares = (compares, itemId) => {
  const arr = [];
  compares
    .filter((e) => itemId === e.compare[0] || itemId === e.compare[1])
    .forEach((e) => arr.push(...e.compare));
  return [...new Set(arr.filter((e) => e !== itemId))].sort();
};
//????????????????????????????????????
const handleChange = (id) => {
  if (id) {
    document.getElementById(id).innerHTML = "";
  } else {
    Array.from(document.getElementsByClassName("error")).forEach(
      (e) => (e.innerHTML = "")
    );
  }
};
//????????????????????????
const SimpleAccordion = memo(({ elm, allCondition, setActionErr }) => {
  const history = useHistory();
  //??????????????????hook(1???)
  const [{ data: item, isLoading: itLoaging, isError: itErr }, setItId] =
    useSelectDatas();
  //????????????hook
  const [{ isLoading: itPLoaging, isError: itPErr }, setItData] = usePutData();
  //??????????????????hook
  const [{ isLoading: itDLoaging, isError: itDErr }, setItDId] =
    useDeleteData();
  //??????????????????hook
  const { compares, cpLoaging, cpErr, setReroadCompares } =
    useContext(UserComparesContext);
  // const [{ data: compares, isError: cpErr }, setCpCondition] = useSelectDatas();
  // //??????????????????
  // useEffect(() => {
  //   const fetch = () => {
  //     setCpCondition({ type: "compare" });
  //   };
  //   fetch();
  // }, [setCpCondition]);
  const classes = useStyles();
  //??????(????????????)?????????
  const inputQtyRef = useRef(null);
  //??????(????????????)?????????
  const inputCostRef = useRef(null);

  //????????????????????????????????????????????????????????????????????????
  const [confDlg, setConfDlg] = useState("");

  //?????????????????????????????????
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "",
    message: "",
  });

  //????????????????????????????????????
  const handleClose = useCallback(
    (event, reason) => {
      if (reason === "clickaway") {
        return;
      }
      setSnackbar({ ...snackbar, open: false });
    },
    [snackbar]
  );
  //????????????????????????
  const handleEdit = (elm) => {
    const id = elm.id;
    //????????????????????????????????????
    setItId({
      type: "item",
      id: id,
    });
    if (itErr) {
      setSnackbar({ open: true, severity: "error", message: err });
      return;
    }
    const paramItem = item;
    //?????????????????????????????????????????????????????????????????????????????????????????????????????????
    if (paramItem.record?.decideDate || paramItem.delete === true) {
      setActionErr();
      setSnackbar({ open: true, severity: "warning", message: change });
      return;
    }

    //??????????????????????????????
    setReroadCompares(true);
    if (cpErr) {
      setSnackbar({ open: true, severity: "error", message: err });
      return;
    }

    const compareArr = selectCompares(compares);
    //?????????????????????????????????????????????(??????????????????????????????????????????
    const option = paramItem
      .filter((e) => compareArr.indexOf(e.id) !== -1)
      .map((e) => ({ value: e.id, label: `${e.id}:${e.name}` }));

    paramItem.compares = option;
    //???????????????????????????????????????????????????????????????????????????????????????
    history.push("/edit", {
      condition: allCondition,
      itemInfo: paramItem,
    });
  };

  //????????????
  const handleDelete = () => {
    const id = elm.id;
    //?????????????????????????????????????????????????????????
    setItDId(id);
    if (itDErr) {
      setActionErr();
      setSnackbar({ open: true, severity: "error", message: err });
      return;
    }
    const dom = document.getElementById(id);
    dom.style.display = "none";
    setSnackbar({ open: true, severity: "success", message: drop });
  };

  const updateItem = () => {
    //??????????????????
    setItData({ ...{ type: "item", data: elm, decide: true } });
    if (itPErr) {
      setActionErr();
      //???????????????????????????????????????????????????????????????????????????????????????
      if (itPErr === "changed") {
        setSnackbar({ open: true, severity: "warning", message: change });
      } else {
        setSnackbar({ open: true, severity: "error", message: err });
      }
      return false;
    }
    //?????????????????????????????????????????????????????????
    const dom = document.getElementById(elm.id);
    dom.style.display = "none";
    return true;
  };

  //????????????
  const handlePurchase = async () => {
    const qty = inputQtyRef.current.value;
    const cost = inputCostRef.current.value;
    const id = elm.id;
    let costValid = true;
    //???????????????????????????????????????
    await BaseYup.number()
      .required()
      .integer()
      .min(0)
      .max(99999999)
      .label("??????")
      .validate(cost)
      .catch((res) => {
        costValid = false;
        const dom = document.getElementById(`${id}_cost`);
        dom.textContent = res.errors;
      });
    let qtyValid = true;
    await BaseYup.number()
      .required()
      .integer()
      .positive()
      .max(999)
      .label("??????")
      .validate(qty)
      .catch((res) => {
        qtyValid = false;
        const dom = document.getElementById(`${id}_qty`);
        dom.textContent = res.errors;
      });
    if (!(qtyValid && costValid)) return;
    elm.record.qty = qty;
    elm.record.cost = cost;
    if (updateItem(elm))
      setSnackbar({ open: true, severity: "success", message: purchase });
  };

  //?????????????????????
  const handleCancel = () => {
    if (updateItem(elm))
      setSnackbar({ open: true, severity: "success", message: cancel });
  };

  return (
    <div className={classes.root}>
      <CustomizedSnackbars
        open={snackbar.open}
        handleClose={handleClose}
        severity={snackbar.severity}
        message={snackbar.message}
      />
      <ConfirmDialog
        msg={confirmDelete}
        isOpen={confDlg === "delete"}
        doYes={handleDelete}
        doNo={() => {
          setConfDlg("");
        }}
      />
      <ConfirmDialog
        msg={confirmPurchase}
        isOpen={confDlg === "purchase"}
        doYes={handlePurchase}
        doNo={() => {
          setConfDlg("");
        }}
      />
      <ConfirmDialog
        msg={confirmCancel}
        isOpen={confDlg === "cancel"}
        doYes={handleCancel}
        doNo={() => {
          setConfDlg("");
        }}
      />
      {itLoaging && <CircularIndeterminate component="div" />}
      <Accordion className={classes.accordion}>
        <AccordionSummary
          expandIcon={<ExpandMoreRoundedIcon />}
          aria-label="??????"
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <CardHeader
            avatar={<Avatar className={classes.avatar}>{elm.id}</Avatar>}
            title={elm.name}
          />
          <CardContent>
            <Typography component="div" variant="body2" color="textSecondary">
              <label> ??????*:</label>
              <TextField
                id={`${elm.id}_costInput`}
                style={{ width: 80 }}
                type="number"
                inputRef={(el) => (inputCostRef.current = el)}
                defaultValue={elm.budget}
                onChange={() => handleChange(`${elm.id}_cost`)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              ???<p id={`${elm.id}_cost`} className="error"></p>
            </Typography>
            <Typography component="div" variant="body2" color="textSecondary">
              <label> ??????*:</label>
              <TextField
                id={`${elm.id}_qtyInput`}
                style={{ width: 80 }}
                type="number"
                inputRef={(el) => (inputQtyRef.current = el)}
                defaultValue={1}
                onChange={() => handleChange(`${elm.id}_qty`)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <p id={`${elm.id}_qty`} className="error"></p>
            </Typography>
            <Typography component="div" variant="body2" color="textSecondary">
              <Button
                className={classes.button}
                onClick={() => setConfDlg("purchase")}
                size="small"
                variant="outlined"
                color="primary"
              >
                ??????
              </Button>
              <Button
                className={classes.button}
                onClick={() => setConfDlg("cancel")}
                size="small"
                variant="outlined"
              >
                ???????????????
              </Button>
            </Typography>
          </CardContent>
          <CardActions disableSpacing>
            <IconButton aria-label="??????" onClick={() => handleEdit(elm)}>
              <EditOutlinedIcon />
            </IconButton>
            <IconButton aria-label="??????" onClick={() => setConfDlg("delete")}>
              <DeleteForeverOutlinedIcon />
            </IconButton>
          </CardActions>
        </AccordionSummary>
        <AccordionDetails className={classes.details}>
          <CardContent>
            <Typography component="div" paragraph>
              ??????????????????{elm.limit?.split("T")[0]}
            </Typography>
            <Typography component="div" paragraph>
              ????????????{elm.level}%
            </Typography>
            <Typography component="div" paragraph>
              ???????????????{selectCompares(compares, elm.id)}
            </Typography>
            <Typography component="div" paragraph>
              ?????????
            </Typography>
            <Typography component="div" paragraph>
              <a href={elm.url}>{elm.url}</a>
            </Typography>
            <Typography component="div" paragraph>
              ??????
            </Typography>
            <Typography
              style={{ border: "solid 0.5px" }}
              component="div"
              paragraph
            >
              {elm.remark}
            </Typography>
          </CardContent>
        </AccordionDetails>
      </Accordion>
    </div>
  );
});

export default SimpleAccordion;
