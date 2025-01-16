import React from "react";
import "./index.scss";
import classNames from "classnames";

const UserContextInfo = ({ position }) => {
  return (
    <div
      className={classNames("user-context-info", {
        top: position === "top",
      })}
    >
      All of your data is local only data
    </div>
  );
};

export default UserContextInfo;
