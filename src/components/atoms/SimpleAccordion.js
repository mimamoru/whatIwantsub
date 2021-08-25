import { React, memo, useEffect, useContext } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreRoundedIcon from "@material-ui/icons/ExpandMoreRounded";
import IconButton from "@material-ui/core/IconButton";
import QueueRoundedIcon from "@material-ui/icons/QueueRounded";

import { ChipContext } from "../pages/Configuration";

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

//MyTag設定画面のタグ情報表示用パネル
const SimpleAccordion = memo(({ tagName, explain }) => {
  const classes = useStyles();

  //コンテキストからチップの情報を取チップの情報を取得
  const { chipData, setChipData } = useContext(ChipContext);

  //すでにMyTagに登録済みのTagの色を変更
  useEffect(() => {
    const color = chipData?.includes(tagName) ? "rgb(176, 224, 230)" : "white";
    document.getElementById(`${tagName}_btn`).style.backgroundColor = color;
  }, [chipData, tagName]);

  //お気に入り追加・削除の画面制御
  const handleSwitch = (event) => {
    if (chipData?.includes(tagName)) {
      setChipData((chips) => [...chips.filter((chip) => chip !== tagName)]);
    } else {
      setChipData((chips) => [...chips, tagName]);
    }
    event.stopPropagation();
  };

  return (
    <div className={classes.root}>
      <Accordion className={classes.accordion}>
        <AccordionSummary
          expandIcon={<ExpandMoreRoundedIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography className={classes.heading}>{tagName}</Typography>
          <IconButton
            id={`${tagName}_btn`}
            className={classes.button}
            onClick={(event) => handleSwitch(event)}
            type="submit"
            color="primary"
            component="span"
          >
            <QueueRoundedIcon />
          </IconButton>
        </AccordionSummary>
        <AccordionDetails className={classes.details}>
          <Typography>{explain}</Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  );
});

export default SimpleAccordion;
