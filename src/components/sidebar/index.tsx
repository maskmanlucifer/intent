import React, { useRef, useState } from "react";
import "./index.scss";
import { ReactComponent as FolderIcon } from "../../assets/icons/folder.svg";
import { ReactComponent as TodayFolderIcon } from "../../assets/icons/today-folder.svg";
import { ReactComponent as CompletedIcon } from "../../assets/icons/completed.svg";
import { ReactComponent as AddSquareIcon } from "../../assets/icons/add-square.svg";
import classNames from "classnames";
import { Dropdown, message } from "antd";
import { DeleteOutlined, EditOutlined, EllipsisOutlined } from "@ant-design/icons";
import { Category } from "../../types";
import { addCategory, deleteCategory, updateCategory } from "../../redux/categorySlice";
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

const EditCategoryBtn = ({ folder, setSelectedFolder, setIsEditing, messageApi }: { folder: Category | null, setSelectedFolder: (id: string) => void, setIsEditing: (isEditing: boolean) => void, messageApi: MessageInstance  }) => {
  const dispatch = useDispatch();

  const [updatedFolderName, setUpdatedFolderName] = useState(folder?.name || "");

  const editInputRef = useRef<HTMLInputElement>(null);

  const onNameEdited = () => {
    if(!folder) {
      const folderId = Date.now().toString();
      dispatch(addCategory({ id: folderId, name: updatedFolderName }));
      setSelectedFolder(folderId);
      messageApi.open({
        type: "success",
        content: "Folder added successfully!",
      });
    } else {
      dispatch(updateCategory({ id: folder.id, name: updatedFolderName }));
      messageApi.open({
        type: "success",
        content: "Folder updated successfully!",
      });
    }
    setUpdatedFolderName("");
    setIsEditing(false);
  }

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
              if(e.key === "Enter") {
                onNameEdited();
              }
            }}
          />
            <span className="tick-button" onClick={onNameEdited}>
              <TickIcon />
            </span>
          <span onClick={() => {
            setUpdatedFolderName("");
            setIsEditing(false);
          }} className="close-button">
            <ClearInputIcon />
          </span>
        </span>
  )
}

const DeleteCategoryBtn = ({ folder, setIsDeleting, messageApi, setSelectedFolder }: { folder: Category | null, setIsDeleting: (isDeleting: boolean) => void, messageApi: MessageInstance, setSelectedFolder: (id: string) => void }) => {
  const dispatch = useDispatch();

  const onDelete = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    dispatch(deleteCategory(folder?.id || ""));
    setSelectedFolder("1");
    messageApi.open({
      type: "success",
      content: "Folder deleted successfully!",
    });
    setIsDeleting(false);
  }

  return (
    <div className="delete-category-input">
      <span className="confirm-text">Are you sure?</span> <span className="tick-button" onClick={onDelete}><TickIcon /></span> <span className="close-button" onClick={() => setIsDeleting(false)}><ClearInputIcon /></span>
    </div>
  )
}

const Sidebar = ({ folders, selectedFolder, setSelectedFolder, isSidebarCollapsed, setIsSidebarCollapsed }: SidebarProps) => {
  const todayFolder = folders.find((folder) => folder.name === "Today");
  const restFolders = folders.filter((folder) => folder.name !== "Today" && folder.name !== "Trash");
  const completedFolder = { id: "completed", name: "Completed" };
  const [isEditing, setIsEditing] = useState<Boolean | string>(false);
  const [isDeleting, setIsDeleting] = useState<Boolean | string>(false);
  const [messageApi, contextHolder] = message.useMessage();

  const menuItems = (folder: Category) => {
    return [
      {
        key: "edit",
        label: "Edit Category",
        onClick: () => {
          setIsEditing(folder.id);
        },
        icon: <EditOutlined />
      },
      {
        key: "delete",
        label: "Delete Category",
        onClick: () => {
          setIsDeleting(folder.id);
        },
        icon: <DeleteOutlined />
      }
    ]
  }
  return (
    <div className="sidebar">
      <div className={classNames("folder-items-group", { collapsed: isSidebarCollapsed })}>
      {contextHolder}
      {todayFolder && (
        <div className={classNames("folder-item", "today-folder", { selected: selectedFolder === todayFolder.id })} onClick={() => setSelectedFolder(todayFolder.id)}>
          <TodayFolderIcon />
          <span>{todayFolder.name}</span>
        </div>
      )}
      {restFolders.map((folder: Category) => (
        <div className={classNames("folder-item", { selected: selectedFolder === folder.id })} key={folder.id} 
        onClick={() => {
          if(!isEditing) {
          setSelectedFolder(folder.id)
          setIsEditing(false);
          setIsDeleting(false);
          }
        }}>
          {isEditing === folder.id && (
            <EditCategoryBtn folder={folder} setSelectedFolder={setSelectedFolder} setIsEditing={setIsEditing} messageApi={messageApi} />
          )}
          {isDeleting === folder.id && (
            <DeleteCategoryBtn folder={folder} setIsDeleting={setIsDeleting} messageApi={messageApi} setSelectedFolder={setSelectedFolder} />
          )}
          {isEditing !== folder.id && isDeleting !== folder.id && (
            <>
              <FolderIcon />
              <span className="folder-item-name">{folder.name}</span>
              <div className="folder-item-actions" onClick={(e) => e.stopPropagation()}>
                <Dropdown trigger={["click"]} menu={{ items: menuItems(folder) }} overlayClassName="folder-edit-actions-item-dropdown">
                  <span className="folder-item-action ellipsis-icon" onClick={(e) => e.stopPropagation()}>
                    <EllipsisOutlined />
                  </span>
                </Dropdown>
              </div>
            </>
          )}
        </div>
      ))}
      {completedFolder && (
        <div className={classNames("folder-item", "completed-folder", { selected: selectedFolder === completedFolder.id })} onClick={() => {
          setSelectedFolder(completedFolder.id)
          setIsEditing(false);
          setIsDeleting(false);
        }}>
          <CompletedIcon />
          <span>{completedFolder.name}</span>
        </div>
      )}
        {isEditing !== true && <div className={classNames("folder-item", "add-folder-item" )} 
        onClick={() => {
          if(isSidebarCollapsed) {
            setIsSidebarCollapsed(false);
          }
          setIsEditing(true);
        }}>
          <AddSquareIcon />
          <span>Add Folder</span>
        </div>}
        {isEditing === true && (
          <div className="folder-item">
            <EditCategoryBtn folder={null} setSelectedFolder={setSelectedFolder} setIsEditing={setIsEditing} messageApi={messageApi} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
