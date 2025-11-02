/* eslint-disable no-useless-concat */
import "./index.scss";
import { ReactComponent as CollapseIcon } from "../../assets/icons/collapse.svg";
import classNames from "classnames";
import { Button, Tooltip } from "antd";
import { useEffect } from "react";
import { ReactComponent as SmilyIcon } from "../../assets/icons/smily.svg";
import Mousetrap from "mousetrap";
import { KEYBOARD_SHORTCUTS } from "../../constant";

interface TopbarProps {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  showCollapsedIcon: boolean;
  setIsLinkBoardOpen: (open: boolean) => void;
  isLinkBoardOpen: boolean;
}

const Topbar = ({
  isSidebarCollapsed,
  setSidebarCollapsed,
  showCollapsedIcon,
  setIsLinkBoardOpen,
  isLinkBoardOpen,
}: TopbarProps) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      setIsLinkBoardOpen(!isLinkBoardOpen);
    };

    Mousetrap.bind(KEYBOARD_SHORTCUTS.linkboard.binding, handler);

    return () => {
      Mousetrap.unbind(KEYBOARD_SHORTCUTS.linkboard.binding);
    };
  }, [isLinkBoardOpen, setIsLinkBoardOpen]);

  return (
    <div className="topbar">
      <div
        className={classNames("topbar-left", {
          "topbar-left-collapsed": isSidebarCollapsed,
        })}
      >
        <div
          className="topbar-left-title"
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
        >
          {!isSidebarCollapsed && "INT3NT"}
          {showCollapsedIcon && (
            <Tooltip
              arrow={false}
              autoAdjustOverflow={true}
              placement="right"
              title={
                (!isSidebarCollapsed ? "Collapse sidebar" : "Expand sidebar") +
                " (" +
                KEYBOARD_SHORTCUTS.toggleSidebar.key +
                ")"
              }
              mouseEnterDelay={0}
              mouseLeaveDelay={0}
            >
              <CollapseIcon />
            </Tooltip>
          )}
          {!showCollapsedIcon && isSidebarCollapsed && (
            <Tooltip
              arrow={false}
              autoAdjustOverflow={true}
              placement="right"
              title={
                "Expand sidebar" +
                " (" +
                KEYBOARD_SHORTCUTS.toggleSidebar.key +
                ")"
              }
              mouseEnterDelay={0}
              mouseLeaveDelay={0}
            >
              <SmilyIcon className="smily-icon" />
            </Tooltip>
          )}
        </div>
      </div>
      <div className="topbar-right">
        <Tooltip
          arrow={false}
          autoAdjustOverflow={true}
          placement="bottom"
          title={"Linkboard" + " (" + KEYBOARD_SHORTCUTS.linkboard.key + ")"}
          mouseEnterDelay={0}
          mouseLeaveDelay={0}
        >
          <Button
            type="primary"
            className="link-board-button"
            size="small"
            onClick={() => setIsLinkBoardOpen(!isLinkBoardOpen)}
          >
            Linkboard
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default Topbar;
