import { Button } from '@mui/material';

export const MyButton = ({ text, onClick, disabled, style }) => {
  return (
    <Button variant={'contained'} onClick={onClick} disabled={disabled} style={style}>
      {text}
    </Button>
  );
};
