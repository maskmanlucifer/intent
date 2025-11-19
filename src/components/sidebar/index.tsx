import React, { useEffect, useRef, useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import Mousetrap from "mousetrap";
import "./index.scss";
import { ReactComponent as FolderIcon } from "../../assets/icons/folder.svg";
import { ReactComponent as TodayFolderIcon } from "../../assets/icons/today-folder.svg";
import { ReactComponent as CompletedIcon } from "../../assets/icons/completed.svg";
import { ReactComponent as AddSquareIcon } from "../../assets/icons/add-square.svg";
import HelpUsImprove from "../help-us-improve";
import classNames from "classnames";
import { Button, Dropdown, Input, InputRef, message, Modal, Popover, Tooltip } from "antd";
import {
  CloseOutlined,
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
import { APP_VERSION, hasNewUpdates, setLastSeenVersion } from "../../constants/version";
import { ReactComponent as QuestionIcon } from "../../assets/icons/question.svg";
import { ReactComponent as KeyboardOutlined } from "../../assets/icons/keyboard.svg";
import { ReactComponent as DatabaseIcon } from "../../assets/icons/database.svg";
import KeyboardShortcuts from "../shortcuts";
import ThemeToggle from "../theme-toggle";
import LanguageSwitcher from "../language-switcher";
import WhatsNewButton from "../whats-new-button";
import WhatsNewModal from "../whats-new-modal";

interface SidebarProps {
  folders: Category[];
  selectedFolder: string;
  setSelectedFolder: (id: string) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (isSidebarCollapsed: boolean) => void;
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
        styles={{
          body: {
            marginLeft: "10px",
          },
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
  const { t } = useTranslation();
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
        content: t('sidebar.folderCreated', { name: updatedFolderName }),
      });
    } else {
      dispatch(updateCategory({ id: folder.id, name: updatedFolderName }));
      messageApi.open({
        type: "success",
        content: t('sidebar.folderUpdated', { name: updatedFolderName }),
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
        placeholder={t('sidebar.enterNewName')}
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
  const { t } = useTranslation();
  const todayFolder = folders.find((folder) => folder.name === "Today");

  const restFolders = folders.filter(
    (folder) => folder.name !== "Today" && folder.name !== "Trash",
  );

  const completedFolder = { id: "completed", name: t('todo.completed') };
  const [isEditing, setIsEditing] = useState<Boolean | string>(false);
  const [isDeleting, setIsDeleting] = useState<Boolean | string>(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDataStorageModalOpen, setIsDataStorageModalOpen] = useState(false);
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const [isUpsertCategoryModalOpen, setIsUpsertCategoryModalOpen] = useState(false);
  const [isWhatsNewModalOpen, setIsWhatsNewModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (isUpsertCategoryModalOpen) {
      setTimeout(() => {
        inputRef.current?.focus({
          cursor: "end",
        });
      }, 100);
    }
  }, [isUpsertCategoryModalOpen]);

  useEffect(() => {
    const checkUpdates = async () => {
      const hasUpdates = await hasNewUpdates();
      setShowWhatsNew(hasUpdates);
    };
    checkUpdates();
  }, []);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handler4 = (e: KeyboardEvent) => {
      e.preventDefault();
      setIsShortcutModalOpen(!isShortcutModalOpen);
    };

    Mousetrap.bind(KEYBOARD_SHORTCUTS.help.binding, handler4);

    return () => {
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
      content: t('sidebar.folderDeleted', { name: folder.name }),
    });
  };

  const handleWhatsNewClick = () => {
    setIsWhatsNewModalOpen(true);
  };

  const handleWhatsNewClose = async () => {
    setIsWhatsNewModalOpen(false);
    await setLastSeenVersion(APP_VERSION);
    setShowWhatsNew(false);
  };

  const menuItems = (folder: Category) => {
    return [
      {
        key: "edit",
        label: t('sidebar.editFolder'),
        onClick: () => {
          setIsEditing(folder.id);
          setCategoryName(folder.name);
          setIsUpsertCategoryModalOpen(true);
        },
        icon: <EditOutlined />,
      },
      {
        key: "delete",
        label: t('sidebar.deleteFolder'),
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
            <span title={t('todo.today')}>{t('todo.today')}</span>
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
            {(
              <>
                {withTooltip(<FolderIcon />, folder.name, isSidebarCollapsed)}
                <span className="folder-item-name" title={folder.name}>{folder.name}</span>
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
              setIsUpsertCategoryModalOpen(true);
            }}
          >
            {withTooltip(<AddSquareIcon />, t('sidebar.addFolder'), isSidebarCollapsed)}
            <span>{t('sidebar.addFolder')}</span>
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
          title={t('sidebar.confirmDeletionTitle')}
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
                {t('sidebar.cancel')}
              </Button>
              <Button type="primary" danger onClick={onDelete} size="small">
                {t('sidebar.delete')}
              </Button>
            </div>
          }
        >
          <p style={{ margin: 0, padding: 0 }}>
            {t('sidebar.confirmDeletionMessage')}
          </p>
        </Modal>
      </div>
      <div className="sidebar-bottom-actions">
        {showWhatsNew && (
          <WhatsNewButton
            isSidebarCollapsed={isSidebarCollapsed}
            onClick={handleWhatsNewClick}
          />
        )}
        <div
          className="sidebar-bottom-action-item"
          onClick={() => setIsDataStorageModalOpen(true)}
        >
          {withTooltip(
            <DatabaseIcon />,
            t('sidebar.howWeStoreData'),
            isSidebarCollapsed,
          )}
          <span title={t('sidebar.howWeStoreData')}>{t('sidebar.howWeStoreData')}</span>
        </div>

        <Popover
          content={<HelpUsImprove setPopoverState={setIsPopoverOpen} />}
          title={null}
          trigger="click"
          open={isPopoverOpen}
          destroyOnHidden={true}
          onOpenChange={(open) => setIsPopoverOpen(open)}
          placement="bottomRight"
          arrow={false}
        >
          <div className="sidebar-bottom-action-item">
            {withTooltip(
              <QuestionIcon />,
              t('sidebar.helpUsImprove'),
              isSidebarCollapsed,
            )}
            <span title={t('sidebar.helpUsImprove')}>{t('sidebar.helpUsImprove')}</span>
          </div>
        </Popover>

        <div
          className="sidebar-bottom-action-item"
          onClick={() => setIsShortcutModalOpen(!isShortcutModalOpen)}
        >
          {withTooltip(
            <KeyboardOutlined />,
            t('sidebar.keyboardShortcuts') + " (" + KEYBOARD_SHORTCUTS.help.key + ")",
            isSidebarCollapsed,
          )}
          <span title={t('sidebar.keyboardShortcuts') + " (" + KEYBOARD_SHORTCUTS.help.key + ")"}>{t('sidebar.keyboardShortcuts')}</span>
        </div>

        <LanguageSwitcher
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />

        <ThemeToggle isSidebarCollapsed={isSidebarCollapsed} />
        <Modal
          open={isDataStorageModalOpen}
          onCancel={() => setIsDataStorageModalOpen(false)}
          title={
            <span className="info-modal-header">
              {t('sidebar.dataStorageTitle')}
            </span>
          }
          centered={true}
          closeIcon={<CloseOutlined style={{ fontSize: "14px" }} />}
          width={800}
          footer={[
            <Button
              key="ok"
              type="primary"
              onClick={() => setIsDataStorageModalOpen(false)}
              size="small"
            >
              {t('sidebar.gotIt')}
            </Button>,
          ]}
          onOk={() => setIsDataStorageModalOpen(false)}
        >
          <div className="info-modal-content">
            <p>
              {t('sidebar.dataStorageContent')}
            </p>

            <span className="subheading">{t('sidebar.whenDataLost')}</span>
            <div className="data-lost-list">
              <span>
                1. <Trans i18nKey="sidebar.dataLost1" />
              </span>
              <span>
                2. <Trans i18nKey="sidebar.dataLost2" />
              </span>
              <span>
                3. <Trans i18nKey="sidebar.dataLost3" />
              </span>
              <span>
                4. {t('sidebar.dataLost4')}
              </span>
            </div>

            <p>
              {t('sidebar.futureSync')}
            </p>
          </div>
        </Modal>
        <Modal
          open={isShortcutModalOpen}
          title={t('sidebar.keyboardShortcuts')}
          onOk={() => setIsShortcutModalOpen(false)}
          onCancel={() => setIsShortcutModalOpen(false)}
          footer={null}
          centered={true}
        >
          <KeyboardShortcuts />
        </Modal>
        <Modal
          open={isUpsertCategoryModalOpen}
          title={isEditing ? t('sidebar.editFolder') : t('sidebar.addFolder')}
          onOk={() => {
            if (isEditing) {
              dispatch(updateCategory({ id: isEditing as string, name: categoryName }));
              messageApi.open({
                type: "success",
                content: t('sidebar.folderUpdated', { name: categoryName }),
              });
            } else {
              dispatch(addCategory({ id: Date.now().toString(), name: categoryName }));
              messageApi.open({
                type: "success",
                content: t('sidebar.folderCreated', { name: categoryName }),
              });
            }
            setIsUpsertCategoryModalOpen(false);
            setCategoryName("");
            setIsEditing(false);
          }}
          onCancel={() => {
            setIsUpsertCategoryModalOpen(false);
            setCategoryName("");
            setIsEditing(false);
          }}
          centered={true}
          okText={isEditing ? t('sidebar.update') : t('sidebar.add')}
          width={460}
          okButtonProps={{ size: "small" }}
          cancelButtonProps={{ size: "small" }}
          cancelText={t('sidebar.cancel')}
          closeIcon={<CloseOutlined style={{ fontSize: "14px" }} />}
        >
          <Input size="small" ref={inputRef} value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder={isEditing ? t('sidebar.enterNewName') : t('sidebar.enterNewName')} />
        </Modal>
        <WhatsNewModal
          open={isWhatsNewModalOpen}
          onClose={handleWhatsNewClose}
          onVersionSeen={() => { }}
        />
      </div>
    </div>
  );
};

export default Sidebar;
