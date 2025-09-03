import React, { FunctionComponent } from "react";

import $ from "./Spinner.module.css";

const Spinner: FunctionComponent = () => {
  return (
    <div className={$.spinner}></div>
  )
};

export default Spinner;
