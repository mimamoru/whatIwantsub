import { React } from "react";
import { useHistory } from "react-router-dom";

import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import mainimg from "../../images/mainimg.jpg";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    backgroundImage: `url(${mainimg})`,
    height: "1200px",
    backgroundSize: "100% auto",
  },
  button: {
    position: "absolute",
    textTransform: "none",
    top: "calc(50% - 50px)",
    left: "calc(50% - 50px)",
    margin: "100",
  },
}));

const Home = () => {
  const history = useHistory();
  const classes = useStyles();

  const handleStart = () => {
    history.push("/search");
  };

  return (
    <div className={classes.root}>
      <Button
        className={classes.button}
        type="button"
        onClick={handleStart}
        variant="contained"
        size="large"
        color="primary"
      >
        Teach Me !
      </Button>
    </div>
  );
};

export default Home;
