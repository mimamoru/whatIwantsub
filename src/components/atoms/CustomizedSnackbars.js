import { React, memo } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}));

//スナックバー
const CustomizedSnackbars = memo(({ open, handleClose, severity, message }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={2000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity={severity}>
          {message?.split("/n").map((e, idx) => (
            <div key={idx}>{e}</div>
          ))}
        </Alert>
      </Snackbar>
    </div>
  );
});

export default CustomizedSnackbars;
