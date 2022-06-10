import {Typography} from "@mui/material";

export const MyTitle = ({
  text,
}) => {
  return (
    <Typography variant={'h3'} gutterBottom>
      {text}
    </Typography>
  );
}