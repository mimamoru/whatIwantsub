import { React, memo } from "react";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

//タブ
const TabPanel = memo(({ children, value, index, ...other }) => {
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
});

export default TabPanel;
