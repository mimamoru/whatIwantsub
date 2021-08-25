import { React, memo } from "react";
import { useHistory } from "react-router-dom";
import Button from "@material-ui/core/Button";

//詳細ボタン
const DetailButton = memo(
  ({ id, favorite, type, pageT, pageQ, select, isStock }) => {
    const history = useHistory();

    //遷移先を判断し、パラメータを渡す
    const handleTrigger = () => {
      const path = type === "t" ? "/detailt" : type === "q" ? "/detailq" : "";
      if (path === "") {
        history.goBack();
        return;
      }
      history.push(path, {
        id: id,
        favorite: favorite,
        pageT: pageT,
        pageQ: pageQ,
        select: select,
        backPath: isStock ? "/stock" : "/search",
      });
    };

    return (
      <>
        <Button variant="contained" color="primary" onClick={handleTrigger}>
          詳細
        </Button>
      </>
    );
  }
);

export default DetailButton;
