import { Backdrop, CircularProgress } from '@mui/material';
import React from 'react';

function Spinner({ isLoading}) {
  return (
    <Backdrop open={isLoading}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}

export default Spinner;
