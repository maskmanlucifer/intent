/* eslint-disable no-useless-concat */
import "./index.scss";
import { ReactComponent as CollapseIcon } from "../../assets/icons/collapse.svg";
import classNames from "classnames";
import { Button, Modal, Popover, Tooltip } from "antd";
import { ReactComponent as ScheduleIcon } from "../../assets/icons/schedule.svg";
import { useEffect, useState } from "react";
import SettingsModal from "../settings-modal";
import { ReactComponent as SmilyIcon } from "../../assets/icons/smily.svg";
import { ReactComponent as QuestionIcon } from "../../assets/icons/question.svg";
import { ReactComponent as DatabaseIcon } from "../../assets/icons/database.svg";
import { ReactComponent as SettingOutlined } from "../../assets/icons/setting.svg";
import { ReactComponent as KeyboardOutlined } from "../../assets/icons/keyboard.svg";
import Mousetrap from "mousetrap";
import HelpUsImprove from "../help-us-improve";
import KeyboardShortcuts from "../shortcuts";
import { KEYBOARD_SHORTCUTS } from "../../constant";

interface TopbarProps {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setIsDrawerOpen: (open: boolean) => void;
  isDrawerOpen: boolean;
  showCollapsedIcon: boolean;
  setIsLinkBoardOpen: (open: boolean) => void;
  isLinkBoardOpen: boolean;
}

const Topbar = ({
  isSidebarCollapsed,
  setSidebarCollapsed,
  setIsDrawerOpen,
  isDrawerOpen,
  showCollapsedIcon,
  setIsLinkBoardOpen,
  isLinkBoardOpen,
}: TopbarProps) => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDataStorageModalOpen, setIsDataStorageModalOpen] = useState(false);
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);

  useEffect(() => {
    const handler1 = (e: KeyboardEvent) => {
      e.preventDefault();
      setIsSettingsModalOpen(!isSettingsModalOpen);
    };

    const handler2 = (e: KeyboardEvent) => {
      e.preventDefault();
      setIsDrawerOpen(!isDrawerOpen);
    };

    const handler3 = (e: KeyboardEvent) => {
      e.preventDefault();
      setIsLinkBoardOpen(!isLinkBoardOpen);
    };

    const handler4 = (e: KeyboardEvent) => {
      e.preventDefault();
      setIsShortcutModalOpen(!isShortcutModalOpen);
    };

    Mousetrap.bind(KEYBOARD_SHORTCUTS.settings.binding, handler1);
    Mousetrap.bind(KEYBOARD_SHORTCUTS.calendar.binding, handler2);
    Mousetrap.bind(KEYBOARD_SHORTCUTS.linkboard.binding, handler3);
    Mousetrap.bind(KEYBOARD_SHORTCUTS.help.binding, handler4);

    return () => {
      Mousetrap.unbind(KEYBOARD_SHORTCUTS.settings.binding);
      Mousetrap.unbind(KEYBOARD_SHORTCUTS.calendar.binding);
      Mousetrap.unbind(KEYBOARD_SHORTCUTS.linkboard.binding);
      Mousetrap.unbind(KEYBOARD_SHORTCUTS.help.binding);
    };
  }, [isDrawerOpen, isSettingsModalOpen, isLinkBoardOpen, isShortcutModalOpen]);

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
          )}{" "}
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
          title={"How We Store Your Data"}
          mouseEnterDelay={0}
          mouseLeaveDelay={0}
          className="data-storage-tooltip"
        >
          <Button
            type="link"
            className="data-storage-button"
            size="small"
            onClick={() => setIsDataStorageModalOpen(true)}
            icon={<DatabaseIcon />}
          >
            {""}
          </Button>
        </Tooltip>
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
            <Tooltip
              arrow={false}
              autoAdjustOverflow={true}
              placement="bottom"
              title="Help us improve"
              mouseEnterDelay={0}
              mouseLeaveDelay={0}
            >
              <QuestionIcon />
            </Tooltip>
          </div>
        </Popover>
        <div
          className="settings-btn"
          onClick={() => setIsShortcutModalOpen(!isShortcutModalOpen)}
        >
          <Tooltip
            arrow={false}
            autoAdjustOverflow={true}
            placement="bottom"
            title={
              "Keyboard Shortcuts" + " (" + KEYBOARD_SHORTCUTS.help.key + ")"
            }
            mouseEnterDelay={0}
            mouseLeaveDelay={0}
          >
            <KeyboardOutlined />
          </Tooltip>
        </div>
        <div
          className="settings-btn"
          onClick={() => setIsSettingsModalOpen(!isSettingsModalOpen)}
        >
          <Tooltip
            arrow={false}
            autoAdjustOverflow={true}
            placement="bottom"
            title={"Settings" + " (" + KEYBOARD_SHORTCUTS.settings.key + ")"}
            mouseEnterDelay={0}
            mouseLeaveDelay={0}
          >
            <SettingOutlined />
          </Tooltip>
        </div>
        <Tooltip
          arrow={false}
          autoAdjustOverflow={true}
          placement="bottom"
          title={"Calendar" + " (" + KEYBOARD_SHORTCUTS.calendar.key + ")"}
          mouseEnterDelay={0}
          mouseLeaveDelay={0}
        >
          <Button
            type="primary"
            className="check-schedule-button"
            size="small"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            icon={<ScheduleIcon />}
          >
            Calendar
          </Button>
        </Tooltip>
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
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={() => setIsDataStorageModalOpen(false)}
          >
            Got it
          </Button>,
        ]}
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
      <Modal
        open={isShortcutModalOpen}
        title="Keyboard Shortcuts"
        onOk={() => setIsShortcutModalOpen(false)}
        onCancel={() => setIsShortcutModalOpen(false)}
        footer={null}
        centered={true}
      >
        <KeyboardShortcuts />
      </Modal>
    </div>
  );
};

export default Topbar;
