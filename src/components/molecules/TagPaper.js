import { React, useState, useEffect, memo, useCallback } from "react";
import { useHistory } from "react-router-dom";

import { err, accessErr, warningNodata } from "../modules/messages";
import { useGetTag } from "../queryhooks/index";

import CircularIndeterminate from "../atoms/CircularIndeterminate";
import SimpleAccordion from "../atoms/SimpleAccordion";
import CustomizedSnackbars from "../atoms/CustomizedSnackbars";

const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//MyTag設定画面のタグ(タグ検索時)
const TagPaper = memo(({ tagName }) => {
  const history = useHistory();

  //Tag情報取得
  const { isLoading, isError, error, data } = useGetTag(tagName);

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

  //エラー発生時、ホーム画面に遷移する処理
  const handleBack = useCallback(async () => {
    await _sleep(2000);
    history.push("/");
  }, [history]);

  //検索に合致するタグが存在しない場合は警告を表示する
  useEffect(() => {
    if (!isError) return;
    const status = error?.response.status;
    const message =
      status === 404 ? warningNodata : status === 403 ? accessErr : err;
    setSnackbar({
      open: true,
      severity: message === warningNodata ? "warning" : "error",
      message: message,
    });
    if (message !== warningNodata) handleBack();
  }, [isError, error?.response.status, handleBack]);

  return (
    <div>
      <CustomizedSnackbars
        open={snackbar.open}
        handleClose={handleClose}
        severity={snackbar.severity}
        message={snackbar.message}
      />
      <div id="result">
        {isLoading && <CircularIndeterminate component="div" />}
        {data && (
          <SimpleAccordion
            id={data?.tag.tag_name}
            key={data?.tag.tag_name}
            tagName={data?.tag.tag_name}
            explain={data?.tag.explain}
          />
        )}
      </div>
    </div>
  );
});

export default TagPaper;
