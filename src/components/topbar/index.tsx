import PageSwitcher from "../page-switcher";
import { selectActivePage, syncSettings } from "../../redux/sessionSlice";
import { useSelector } from "react-redux";
import { Pages } from "../../types";
import "./index.scss";
import { SettingOutlined } from "@ant-design/icons";
import { ReactComponent as CollapseIcon } from "../../assets/icons/collapse.svg";
import classNames from "classnames";
import { Button, Modal, Popover, Tooltip } from "antd";
import { ReactComponent as ScheduleIcon } from "../../assets/icons/schedule.svg";
import { useState } from "react";
import SettingsModal from "../settings-modal";
import { ReactComponent as SmilyIcon } from "../../assets/icons/smily.svg";
import { ReactComponent as QuestionIcon } from "../../assets/icons/question.svg";
import { ReactComponent as DatabaseIcon } from "../../assets/icons/database.svg";

import HelpUsImprove from "../help-us-improve";

interface TopbarProps {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setIsDrawerOpen: (open: boolean) => void;
  isDrawerOpen: boolean;
  showCollapsedIcon: boolean;
}

const Topbar = ({
  isSidebarCollapsed,
  setSidebarCollapsed,
  setIsDrawerOpen,
  isDrawerOpen,
  showCollapsedIcon,
}: TopbarProps) => {
  const page = useSelector(selectActivePage);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDataStorageModalOpen, setIsDataStorageModalOpen] = useState(false);

  const setPage = (page: Pages) => {
    syncSettings({
      activePage: page,
    });
  };

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
          {!isSidebarCollapsed && "INT3NT"}{" "}
          {showCollapsedIcon && (
            <Tooltip
              arrow={false}
              autoAdjustOverflow={true}
              placement="bottom"
              title={
                !isSidebarCollapsed ? "Collapse sidebar" : "Expand sidebar"
              }
              mouseEnterDelay={0}
            >
              <CollapseIcon />
            </Tooltip>
          )}{" "}
          {!showCollapsedIcon && isSidebarCollapsed && (
            <Tooltip
              arrow={false}
              autoAdjustOverflow={true}
              placement="right"
              title="Expand sidebar"
              mouseEnterDelay={0}
            >
              <SmilyIcon className="smily-icon" />
            </Tooltip>
          )}
        </div>
      </div>
      <div className="topbar-right">
        <PageSwitcher page={page} setPage={setPage} />
        <Tooltip
          arrow={false}
          autoAdjustOverflow={true}
          placement="bottom"
          title={"How We Store Your Data"}
          mouseEnterDelay={0}
        >
          <Button
            type="link"
            className="data-storage-button"
            size="small"
            onClick={() => setIsDataStorageModalOpen(true)}
            icon={<DatabaseIcon />}
          ></Button>{" "}
        </Tooltip>
        <Button
          type="primary"
          className="check-schedule-button"
          size="small"
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          icon={<ScheduleIcon />}
        >
          Today's Schedule
        </Button>
        <Popover
          content={<HelpUsImprove setPopoverState={setIsPopoverOpen} />}
          title={null}
          trigger="click"
          open={isPopoverOpen}
          destroyTooltipOnHide={true}
          onOpenChange={(open) => setIsPopoverOpen(open)}
          placement="bottomRight"
          arrow={false}
        >
          <div className="feedback">
            <QuestionIcon />
          </div>
        </Popover>

        <div
          className="settings"
          onClick={() => setIsSettingsModalOpen(!isSettingsModalOpen)}
        >
          <SettingOutlined />
        </div>
      </div>
      <SettingsModal
        visible={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
      <Modal
        open={isDataStorageModalOpen}
        onCancel={() => setIsDataStorageModalOpen(false)}
        title={
          <span className="info-modal-header">
            How Your Data is Stored & Protected
          </span>
        }
        centered={true}
        width={800}
        okText="Got it"
        onOk={() => setIsDataStorageModalOpen(false)}
      >
        <div className="info-modal-content">
          <p>
            All your data, including tasks, notes, and settings, is stored
            locally in your browser. We do not sync or upload any of your data
            to a server. The only exception is when you choose to import events
            from an ICS calendar URL, where we need to parse and fetch event
            details.
          </p>

          <span className="subheading">When Might Data Be Lost?</span>
          <div className="data-lost-list">
            <span>
              1. If you <strong>clear your browser storage</strong> or reset
              your browser
            </span>
            <span>
              2. If you <strong>uninstall the extension</strong>
            </span>
            <span>
              3. If your browser <strong>automatically clears storage</strong>{" "}
              due to low disk space
            </span>
            <span>
              4. If you switch to a different browser or device, as data does
              not sync across devices
            </span>
          </div>

          <p>
            In the future, we may offer an optional way to sync your data across
            devices. If this interests you, we’d love your feedback!
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Topbar;
