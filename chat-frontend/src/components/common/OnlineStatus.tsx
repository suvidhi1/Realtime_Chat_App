import React from 'react';
import { Box, CircularProgress } from '@mui/material';

interface OnlineStatusProps {
  isOnline: boolean;
  size?: number;
}

const OnlineStatus: React.FC<OnlineStatusProps> = ({ isOnline, size = 12 }) => {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: isOnline ? 'success.main' : 'grey.400',
        border: '2px solid white',
        position: 'absolute',
        bottom: 0,
        right: 0,
      }}
    />
  );
};

export default OnlineStatus;
