import { React, memo, useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";

//確認ダイアログ
const ConfirmDialog = memo(({ msg, isOpen, doYes, doNo }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  return (
    <div>
      <Dialog
        open={open}
        keepMounted
        onClose={() => doNo()}
        aria-labelledby="common-dialog-title"
        aria-describedby="common-dialog-description"
      >
        {msg?.split("/n").map((e, idx) => (
          <DialogContent key={idx}>{e}</DialogContent>
        ))}
        <DialogActions>
          <Button onClick={() => doNo()} color="primary">
            いいえ
          </Button>
          <Button onClick={() => doYes()} color="primary">
            はい
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
});

export default ConfirmDialog;
