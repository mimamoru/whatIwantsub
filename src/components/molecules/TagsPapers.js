import { React, useState, useEffect, memo, useCallback } from "react";
import { useHistory } from "react-router-dom";

import Pagination from "@material-ui/lab/Pagination";

import { err, accessErr } from "../modules/messages";
import { useGetTags } from "../queryhooks/index";

import CircularIndeterminate from "../atoms/CircularIndeterminate";
import SimpleAccordion from "../atoms/SimpleAccordion";
import CustomizedSnackbars from "../atoms/CustomizedSnackbars";

const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//MyTag設定画面のタグ(一覧表示)
const TagsPapers = memo(() => {
  const history = useHistory();

  //閲覧ページの状態管理
  const [page, setPage] = useState(1);

  //指定ページのタグ情報取得
  const { isLoading, isError, error, data } = useGetTags(page);

  //全ページ数の状態管理
  const [allPages, setAllPages] = useState(1);

  //全ページ数を設定する
  useEffect(() => {
    if (!(data && data.meta?.message === "success")) return;
    const totalPage = data.meta.total_page;
    setAllPages(totalPage);
  }, [data]);

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

  //エラー発生時
  useEffect(() => {
    if (!isError) return;
    const status = error?.response.status;
    const message = status === 403 ? accessErr : err;
    setSnackbar({ open: true, severity: "error", message: message });
    handleBack();
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
        {data?.tags.map((elm) => (
          <SimpleAccordion
            id={elm.tag_name}
            key={elm.tag_name}
            tagName={elm.tag_name}
            explain={elm.explain}
          />
        ))}
      </div>
      <div style={{ textAlign: "center", display: "inline-block" }}>
        <Pagination
          count={allPages}
          color="primary"
          onChange={(e, page) => setPage(page)}
          page={page}
        />
      </div>
    </div>
  );
});

export default TagsPapers;
