import { Text as InkText, type TextProps } from "ink";
import React, { type FC } from "react";

interface CustomTextProps extends TextProps {
  success?: boolean;
  error?: boolean;
  warning?: boolean;
  info?: boolean;
  muted?: boolean;
}

export const Text: FC<CustomTextProps> = ({
  success,
  error,
  warning,
  info,
  muted,
  color,
  ...props
}) => {
  let finalColor = color;

  if (success) finalColor = "green";
  if (error) finalColor = "red";
  if (warning) finalColor = "yellow";
  if (info) finalColor = "blue";
  if (muted) finalColor = "gray";

  return <InkText color={finalColor} {...props} />;
};
