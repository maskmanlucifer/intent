import React, { useRef, useState } from "react";
import "./index.scss";
import { ReactComponent as FolderIcon } from "../../assets/icons/folder.svg";
import { ReactComponent as TodayFolderIcon } from "../../assets/icons/today-folder.svg";
import { ReactComponent as CompletedIcon } from "../../assets/icons/completed.svg";
import { ReactComponent as AddSquareIcon } from "../../assets/icons/add-square.svg";

import classNames from "classnames";
import { Button, Dropdown, message, Modal, Tooltip } from "antd";
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

interface SidebarProps {
  folders: Category[];
  selectedFolder: string;
  setSelectedFolder: (id: string) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (isSidebarCollapsed: boolean) => void;
}

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
}: SidebarProps) => {
  const todayFolder = folders.find((folder) => folder.name === "Today");

  const restFolders = folders.filter(
    (folder) => folder.name !== "Today" && folder.name !== "Trash"
  );

  const completedFolder = { id: "completed", name: "Completed" };
  const [isEditing, setIsEditing] = useState<Boolean | string>(false);
  const [isDeleting, setIsDeleting] = useState<Boolean | string>(false);
  const [messageApi, contextHolder] = message.useMessage();
  const dispatch = useDispatch();


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
            <TodayFolderIcon />
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
                      className="folder-item-action ellipsis-icon"
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
            <CompletedIcon />
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
              setIsEditing(true);
            }}
          >
            <AddSquareIcon />
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
     
    </div>
  );
};

export default Sidebar;
