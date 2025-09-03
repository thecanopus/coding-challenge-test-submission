import React, { FunctionComponent } from "react";

interface ErrorMessageProps {
  error?: string;
}

const ErrorMessage: FunctionComponent<ErrorMessageProps> = ({
  error
}) => {
  if (!error) return <></>;
  return (
    <div className="error">{error}</div>
  );
};

export default ErrorMessage;