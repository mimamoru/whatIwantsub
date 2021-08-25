import React, { useState, useCallback } from "react";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import { messageAddStock, messageRemoveStock } from "../modules/messages";
import CustomizedSnackbars from "./CustomizedSnackbars";

//ストック用トグルボタン
const SwitchLabel = React.forwardRef(({ favorite }, ref) => {
  //お気に入り情報の状態管理
  const [stock, setStock] = useState(favorite);

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

  //ボタンのON/OFFに応じて画面にフィードバックをする
  const handleChange = () => {
    if (stock) {
      setSnackbar({
        open: true,
        severity: "success",
        message: messageRemoveStock,
      });
    } else {
      setSnackbar({
        open: true,
        severity: "success",
        message: messageAddStock,
      });
    }
    setStock(!stock);
  };

  return (
    <>
      <CustomizedSnackbars
        open={snackbar.open}
        handleClose={handleClose}
        severity={snackbar.severity}
        message={snackbar.message}
      />
      <FormControlLabel
        control={
          <Switch
            checked={stock}
            onChange={handleChange}
            inputRef={ref}
            name="stock"
            color="primary"
          />
        }
        label="Stock"
      />
    </>
  );
});

export default SwitchLabel;
