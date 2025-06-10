import React, { useRef, useState } from "react";
import "./index.scss";
import { ReactComponent as FolderIcon } from "../../assets/icons/folder.svg";
import { ReactComponent as TodayFolderIcon } from "../../assets/icons/today-folder.svg";
import { ReactComponent as CompletedIcon } from "../../assets/icons/completed.svg";
import { ReactComponent as AddSquareIcon } from "../../assets/icons/add-square.svg";

import classNames from "classnames";
import { Button, Drawer, Dropdown, Empty, message, Modal, Popconfirm, Spin, Tooltip } from "antd";
import {
  CalendarOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  LoadingOutlined,
  MehOutlined,
  SyncOutlined,
} from "@ant-design/icons";

import { ReactComponent as ReminderIcon } from "../../assets/icons/reminder.svg";
import { ReactComponent as AddCircleIcon } from "../../assets/icons/add-circle.svg";

import { Category, TReminderEvent } from "../../types";
import {
  addCategory,
  deleteCategory,
  updateCategory,
} from "../../redux/categorySlice";
import { useDispatch, useSelector } from "react-redux";
import { ReactComponent as TickIcon } from "../../assets/icons/tick-icon.svg";
import { ReactComponent as ClearInputIcon } from "../../assets/icons/clean-input-icon.svg";
import { MessageInstance } from "antd/es/message/interface";
import ReminderForm from "../reminder-form";
import { fetchReminders, selectIsLoading, selectReminders } from "../../redux/reminderSlice";
import { AppDispatch } from "../../redux/store";
import { getDateAndTime } from "../../utils";

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

const withTextTooltip = (
  text: string,
  isSidebarCollapsed: boolean,
  icon: React.ReactNode,
  onClick?: () => void
) => {
  if (isSidebarCollapsed) {
    return (
      <Tooltip
        title={text}
        placement="right"
        arrow={false}
        mouseEnterDelay={0}
        mouseLeaveDelay={0}
      >
        <div className="sidebar-footer-text" onClick={onClick}>{icon}</div>
      </Tooltip>
    );
  }
  return (
    <div className="sidebar-footer-text" onClick={onClick}>
      {icon}
      <span className="sidebar-footer-text-text">{text}</span>
    </div>
  );
};

const withTooltip = (
  component: React.ReactNode,
  tooltip: string,
  isSidebarCollapsed: boolean
) => {
  if (isSidebarCollapsed) {
    return (
      <Tooltip
        title={tooltip}
        placement="right"
        arrow={false}
        mouseEnterDelay={0}
        mouseLeaveDelay={0}
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
    folder?.name || ""
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
  setIsWhatsNewModalData,
}: SidebarProps) => {
  const todayFolder = folders.find((folder) => folder.name === "Today");

  const restFolders = folders.filter(
    (folder) => folder.name !== "Today" && folder.name !== "Trash"
  );

  const completedFolder = { id: "completed", name: "Completed" };
  const [isEditing, setIsEditing] = useState<Boolean | string>(false);
  const [isDeleting, setIsDeleting] = useState<Boolean | string>(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [isReminderFormOpen, setIsReminderFormOpen] = useState(false);
  const [isReminderFormDrawerOpen, setIsReminderFormDrawerOpen] = useState(false);
  const [reminderFormData, setReminderFormData] = useState<TReminderEvent | undefined>(undefined);
  const reminders = useSelector(selectReminders);
  const isRemindersLoading = useSelector(selectIsLoading);

  const dispatch = useDispatch<AppDispatch>();

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
        {todayFolder &&
          withTooltip(
            <div
              className={classNames("folder-item", "today-folder", {
                selected: selectedFolder === todayFolder.id,
              })}
              onClick={() => setSelectedFolder(todayFolder.id)}
            >
              <TodayFolderIcon />
              <span>{todayFolder.name}</span>
            </div>,
            "Today",
            isSidebarCollapsed
          )}
        {restFolders.map((folder: Category) =>
          withTooltip(
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
                  <FolderIcon />
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
                          }
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <EllipsisOutlined />
                      </span>
                    </Dropdown>
                  </div>
                </>
              )}
            </div>,
            folder.name,
            isSidebarCollapsed
          )
        )}
        {completedFolder &&
          withTooltip(
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
              <CompletedIcon />
              <span>{completedFolder.name}</span>
            </div>,
            "Completed",
            isSidebarCollapsed
          )}
        {isEditing !== true &&
          withTooltip(
            <div
              className={classNames("folder-item", "add-folder-item")}
              onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                }
                setIsEditing(true);
              }}
            >
              <AddSquareIcon />
              <span>Add Folder</span>
            </div>,
            "Add Folder",
            isSidebarCollapsed
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
      <div className="sidebar-footer">
        {withTextTooltip(
          "Add Reminder",
          isSidebarCollapsed,
          <AddCircleIcon />,
          () => setIsReminderFormOpen(true)
        )}

        {withTextTooltip(
          "Manage Reminders",
          isSidebarCollapsed,
          <ReminderIcon />,
          () => {
            if (isRemindersLoading === null) {
              dispatch(fetchReminders());
            }
            setIsReminderFormDrawerOpen(!isReminderFormDrawerOpen)
          }
        )}
        <Modal
          title={!reminderFormData ? "Add Reminder" : "Edit Reminder"}
          open={isReminderFormOpen}
          onCancel={() => {
            setIsReminderFormOpen(false);
            setReminderFormData(undefined);
          }}
          centered={true}
          maskClosable={false}
          destroyOnClose={true}
          footer={null}
        >
          <ReminderForm
            onCancel={() => {
              setIsReminderFormOpen(false);
              setReminderFormData(undefined);
            }}
            onSave={() => {
              setIsReminderFormOpen(false);
              setReminderFormData(undefined);
              messageApi.open({
                type: "success",
                content: "Reminder saved successfully!",
              });
            }}
            isEditing={!!reminderFormData}
            initialData={reminderFormData}
          />
        </Modal>
        <Drawer
          title={
            <div className="drawer-title-reminder-form">
              <div
                style={{
                  display: "flex",
                  flexDirection: "row-reverse",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  fontFamily: "var(--secondary-font)",
                  fontSize: "20px",
                }}
              >
                {" "}
                <Button
                  icon={<MehOutlined />}
                  type="link"
                  className="watch-demo-btn"
                  onClick={() => {
                    setIsWhatsNewModalData({
                      isOpen: true,
                      feature: 'reminder',
                      title: 'REMINDER',
                      media: 'https://ik.imagekit.io/dnz8iqrsyc/reminder.mp4',
                    });
                    setIsReminderFormDrawerOpen(false);
                  }}
                >
                  Watch demo
                </Button>
                MANAGE REMINDERS{" "}
              </div> 
              <Button
                icon={<CloseOutlined />}
                type="default"
                onClick={() => setIsReminderFormDrawerOpen(false)}
                size="small"
                style={{ marginLeft: "auto" }}
              />
            </div>
          }
          open={isReminderFormDrawerOpen}
          onClose={() => setIsReminderFormDrawerOpen(false)}
          placement="top"
          closable={false}
          height={280}
        >
          <div className="reminder-list">
            {isRemindersLoading && (
              <div className="reminder-loading">
                <Spin indicator={<LoadingOutlined spin />} />
              </div>
            )}
            {!isRemindersLoading && reminders.length !== 0 && [...reminders].map((reminder) => (
              <div key={reminder.id} className="reminder-item">
                <div className="reminder-details">
                  <div className="reminder-title">{reminder.title}</div>
                  <div className="reminder-description">{reminder.description}</div>
                  <div className="reminder-scheduled">
                    Created for <CalendarOutlined style={{ marginLeft: 4 }} /> <span className="reminder-scheduled-date">{getDateAndTime(reminder.date, reminder.time).formattedDate}</span> at <span className="reminder-scheduled-time">{getDateAndTime(reminder.date, reminder.time).formattedTime}</span>
                  </div>
                  {reminder.isRecurring && reminder.repeatRule && <div className="reminder-repeated">
                    Repeats <SyncOutlined  style={{ marginLeft: 4 }}/> <span  style={{ marginLeft: 37, }}className="reminder-repeated-icon">{reminder.repeatRule.charAt(0)?.toUpperCase() + reminder.repeatRule.slice(1)}</span>
                  </div>}
                </div>
                <div className="reminder-actions">
                  <Popconfirm
                    title="Are you sure you want to delete this reminder?"
                    onConfirm={() => {
                      if (chrome.runtime) {
                        chrome.runtime.sendMessage({ action: "REMOVE_REMINDER", reminderId: reminder.id });
                      }
                    }}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="default" danger icon={<DeleteOutlined />} size="small"/>
                  </Popconfirm>
                  <Button
                    type="primary"
                    onClick={() => {
                      setReminderFormData(reminder);
                      setIsReminderFormOpen(true);
                    }}
                    icon={<EditOutlined />}
                    size="small"
                  />
                </div>
                <hr />
              </div>
            ))}
            {!isRemindersLoading && reminders.length === 0 && (
              <div className="reminder-empty">
                <Empty description="No reminders found" />
                <Button
                  type="primary"
                  size="small"
                  onClick={() => {
                    setIsReminderFormOpen(true);
                    setIsReminderFormDrawerOpen(false);
                  }}
                  className="reminder-empty-button"
                >
                  Add Reminder
                </Button>
              </div>
            )}
          </div>
        </Drawer>
      </div>
    </div>
  );
};

export default Sidebar;
