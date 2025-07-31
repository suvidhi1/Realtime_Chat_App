import React from 'react';
import { Avatar as MuiAvatar, AvatarProps } from '@mui/material';

interface CustomAvatarProps extends AvatarProps {
  src?: string;
  alt?: string;
  children?: React.ReactNode;
}

const Avatar: React.FC<CustomAvatarProps> = ({ src, alt, children, ...props }) => {
  return (
    <MuiAvatar src={src} alt={alt} {...props}>
      {children}
    </MuiAvatar>
  );
};

export default Avatar;
