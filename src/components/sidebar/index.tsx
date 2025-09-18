import React, { useEffect, useRef, useState } from "react";
import Mousetrap from "mousetrap";
import "./index.scss";
import { ReactComponent as FolderIcon } from "../../assets/icons/folder.svg";
import { ReactComponent as TodayFolderIcon } from "../../assets/icons/today-folder.svg";
import { ReactComponent as CompletedIcon } from "../../assets/icons/completed.svg";
import { ReactComponent as AddSquareIcon } from "../../assets/icons/add-square.svg";
import HelpUsImprove from "../help-us-improve";
import classNames from "classnames";
import { Button, Dropdown, message, Modal, Popover, Tooltip } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";

import { Category } from "../../types";
import {
  addCategory,
  deleteCategory,
  updateCategory,
} from "../../redux/categorySlice";
import { useDispatch } from "react-redux";
import { ReactComponent as TickIcon } from "../../assets/icons/tick-icon.svg";
import { ReactComponent as ClearInputIcon } from "../../assets/icons/clean-input-icon.svg";
import { MessageInstance } from "antd/es/message/interface";
import { AppDispatch } from "../../redux/store";
import { KEYBOARD_SHORTCUTS } from "../../constant";
import { ReactComponent as QuestionIcon } from "../../assets/icons/question.svg";
import { ReactComponent as KeyboardOutlined } from "../../assets/icons/keyboard.svg";
import { ReactComponent as DatabaseIcon } from "../../assets/icons/database.svg";
import KeyboardShortcuts from "../shortcuts";

interface SidebarProps {
  folders: Category[];
  selectedFolder: string;
  setSelectedFolder: (id: string) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (isSidebarCollapsed: boolean) => void;
  setIsWhatsNewModalData: (isWhatsNewModalData: {
    isOpen: boolean;
    feature: string;
    title: string;
    media: string;
  }) => void;
}

const withTooltip = (
  component: React.ReactNode,
  tooltip: string,
  isSidebarCollapsed: boolean,
) => {
  if (isSidebarCollapsed) {
    return (
      <Tooltip
        title={tooltip}
        placement="right"
        arrow={false}
        mouseEnterDelay={0}
        mouseLeaveDelay={0}
        autoAdjustOverflow={true}
        overlayInnerStyle={{
          marginLeft: "10px",
        }}
      >
        {component}
      </Tooltip>
    );
  }
  return component;
};

const EditCategoryBtn = ({
  folder,
  setSelectedFolder,
  setIsEditing,
  messageApi,
}: {
  folder: Category | null;
  setSelectedFolder: (id: string) => void;
  setIsEditing: (isEditing: boolean) => void;
  messageApi: MessageInstance;
}) => {
  const dispatch = useDispatch();

  const [updatedFolderName, setUpdatedFolderName] = useState(
    folder?.name || "",
  );

  const editInputRef = useRef<HTMLInputElement>(null);

  const onNameEdited = () => {
    if (!folder) {
      const folderId = Date.now().toString();
      dispatch(addCategory({ id: folderId, name: updatedFolderName }));
      setSelectedFolder(folderId);
      messageApi.open({
        type: "success",
        content: `Folder ${updatedFolderName} added successfully!`,
      });
    } else {
      dispatch(updateCategory({ id: folder.id, name: updatedFolderName }));
      messageApi.open({
        type: "success",
        content: `Folder ${updatedFolderName} updated successfully!`,
      });
    }
    setUpdatedFolderName("");
    setIsEditing(false);
  };

  return (
    <span className="category-edit-input">
      <input
        translate="no"
        ref={editInputRef}
        autoFocus
        type="text"
        className="item-input"
        placeholder={"Enter new name"}
        value={updatedFolderName}
        onChange={(e) => setUpdatedFolderName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onNameEdited();
          }
        }}
      />
      <span className="tick-button" onClick={onNameEdited}>
        <TickIcon />
      </span>
      <span
        onClick={() => {
          setUpdatedFolderName("");
          setIsEditing(false);
        }}
        className="close-button"
      >
        <ClearInputIcon />
      </span>
    </span>
  );
};

const Sidebar = ({
  folders,
  selectedFolder,
  setSelectedFolder,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
}: SidebarProps) => {
  const todayFolder = folders.find((folder) => folder.name === "Today");

  const restFolders = folders.filter(
    (folder) => folder.name !== "Today" && folder.name !== "Trash",
  );

  const completedFolder = { id: "completed", name: "Completed" };
  const [isEditing, setIsEditing] = useState<Boolean | string>(false);
  const [isDeleting, setIsDeleting] = useState<Boolean | string>(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDataStorageModalOpen, setIsDataStorageModalOpen] = useState(false);
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handler4 = (e: KeyboardEvent) => {
      e.preventDefault();
      setIsShortcutModalOpen(!isShortcutModalOpen);
    };

    Mousetrap.bind(KEYBOARD_SHORTCUTS.help.binding, handler4);

    return () => {
      Mousetrap.unbind(KEYBOARD_SHORTCUTS.linkboard.binding);
      Mousetrap.unbind(KEYBOARD_SHORTCUTS.help.binding);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShortcutModalOpen]);

  const onDelete = () => {
    if (!isDeleting || typeof isDeleting === "boolean") {
      return;
    }

    dispatch(deleteCategory(isDeleting as string));
    setSelectedFolder("1");
    setIsDeleting(false);

    const folder = folders.find((folder) => folder.id === isDeleting);

    if (!folder) {
      return;
    }
    messageApi.open({
      type: "success",
      content: `Folder ${folder.name} deleted successfully!`,
    });
  };

  const menuItems = (folder: Category) => {
    return [
      {
        key: "edit",
        label: "Edit Category",
        onClick: () => {
          setIsEditing(folder.id);
        },
        icon: <EditOutlined />,
      },
      {
        key: "delete",
        label: "Delete Category",
        onClick: () => {
          setIsDeleting(folder.id);
        },
        icon: <DeleteOutlined />,
      },
    ];
  };

  return (
    <div className="sidebar">
      <div
        className={classNames("folder-items-group", {
          collapsed: isSidebarCollapsed,
        })}
      >
        {contextHolder}
        {todayFolder && (
          <div
            className={classNames("folder-item", "today-folder", {
              selected: selectedFolder === todayFolder.id,
            })}
            onClick={() => setSelectedFolder(todayFolder.id)}
          >
            {withTooltip(
              <TodayFolderIcon />,
              todayFolder.name,
              isSidebarCollapsed,
            )}
            <span>{todayFolder.name}</span>
          </div>
        )}
        {restFolders.map((folder: Category) => (
          <div
            className={classNames("folder-item", {
              selected: selectedFolder === folder.id,
            })}
            key={folder.id}
            onClick={() => {
              if (!isEditing) {
                setSelectedFolder(folder.id);
                setIsEditing(false);
                setIsDeleting(false);
              }
            }}
          >
            {isEditing === folder.id && (
              <EditCategoryBtn
                folder={folder}
                setSelectedFolder={setSelectedFolder}
                setIsEditing={setIsEditing}
                messageApi={messageApi}
              />
            )}
            {isEditing !== folder.id && (
              <>
                {withTooltip(<FolderIcon />, folder.name, isSidebarCollapsed)}
                <span className="folder-item-name">{folder.name}</span>
                <div
                  className="folder-item-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Dropdown
                    trigger={["click"]}
                    menu={{ items: menuItems(folder) }}
                    overlayClassName="folder-edit-actions-item-dropdown"
                  >
                    <span
                      className={classNames(
                        "folder-item-action ellipsis-icon",
                        {
                          expanded: !isSidebarCollapsed,
                        },
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <EllipsisOutlined />
                    </span>
                  </Dropdown>
                </div>
              </>
            )}
          </div>
        ))}
        {completedFolder && (
          <div
            className={classNames("folder-item", "completed-folder", {
              selected: selectedFolder === completedFolder.id,
            })}
            onClick={() => {
              setSelectedFolder(completedFolder.id);
              setIsEditing(false);
              setIsDeleting(false);
            }}
          >
            {withTooltip(
              <CompletedIcon />,
              completedFolder.name,
              isSidebarCollapsed,
            )}
            <span>{completedFolder.name}</span>
          </div>
        )}
        {isEditing !== true && (
          <div
            className={classNames("folder-item", "add-folder-item")}
            onClick={() => {
              if (isSidebarCollapsed) {
                setIsSidebarCollapsed(false);
              }
              setTimeout(() => {
                setIsEditing(true);
              }, 300);
            }}
          >
            {withTooltip(<AddSquareIcon />, "Add Folder", isSidebarCollapsed)}
            <span>Add Folder</span>
          </div>
        )}
        {isEditing === true && (
          <div className="folder-item">
            <EditCategoryBtn
              folder={null}
              setSelectedFolder={setSelectedFolder}
              setIsEditing={setIsEditing}
              messageApi={messageApi}
            />
          </div>
        )}
        <Modal
          title="Confirm Deletion"
          open={isDeleting !== false}
          centered={true}
          onCancel={() => setIsDeleting(false)}
          footer={
            <div className="modal-footer">
              <Button
                type="default"
                onClick={() => setIsDeleting(false)}
                size="small"
                className="modal-cancel-button"
              >
                Cancel
              </Button>
              <Button type="primary" danger onClick={onDelete} size="small">
                Delete
              </Button>
            </div>
          }
        >
          <p style={{ margin: 0, padding: 0 }}>
            Are you sure you want to delete this note?
          </p>
        </Modal>
      </div>
      <div className="sidebar-bottom-actions">
        <div
          className="sidebar-bottom-action-item"
          onClick={() => setIsDataStorageModalOpen(true)}
        >
          {withTooltip(
            <DatabaseIcon />,
            "How We Store Your Data",
            isSidebarCollapsed,
          )}
          <span>How we store your data</span>
        </div>

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
          <div className="sidebar-bottom-action-item">
            {withTooltip(
              <QuestionIcon />,
              "Help us improve",
              isSidebarCollapsed,
            )}
            <span>Help us improve</span>
          </div>
        </Popover>

        <div
          className="sidebar-bottom-action-item"
          onClick={() => setIsShortcutModalOpen(!isShortcutModalOpen)}
        >
          {withTooltip(
            <KeyboardOutlined />,
            "Keyboard Shortcuts (" + KEYBOARD_SHORTCUTS.help.key + ")",
            isSidebarCollapsed,
          )}
          <span>Keyboard shortcuts</span>
        </div>
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
              to a server. The only exception is when you choose to import
              events from an ICS calendar URL, where we need to parse and fetch
              event details.
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
              In the future, we may offer an optional way to sync your data
              across devices. If this interests you, we’d love your feedback!
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
    </div>
  );
};

export default Sidebar;
