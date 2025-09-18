import React from "react";
import "./index.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  removeLink,
  removeLinks,
  selectLinks,
} from "../../redux/linkboardSlice";
import {
  Button,
  Checkbox,
  Empty,
  message,
  Popconfirm,
  Select,
  Space,
  Tooltip,
} from "antd";
import { ReactComponent as TrashIcon } from "../../assets/icons/remove.svg";
import { InfoCircleOutlined } from "@ant-design/icons";
import { AppDispatch } from "../../redux/store";
import { LINKBOARD_FILTER_OPTIONS } from "../../constant";
import classNames from "classnames";
import { TLink } from "../../types";

const Linkboard = () => {
  const links = useSelector(selectLinks);
  const dispatch = useDispatch<AppDispatch>();
  const [messageApi, contextHolder] = message.useMessage();
  const [linkTypeFilter, setLinkTypeFilter] = React.useState(
    LINKBOARD_FILTER_OPTIONS[0].value
  );

  const [selectedLinks, setSelectedLinks] = React.useState<string[]>([]);

  const filteredLinks = [...links].filter((link) => {
    if (linkTypeFilter === "all") {
      return true;
    }
    return link.type === linkTypeFilter;
  });

  const filteredLinksMap = React.useMemo(() => {
    return filteredLinks.reduce(
      (acc, link) => {
        acc[link.id] = link as TLink;
        return acc;
      },
      {} as Record<string, TLink>
    );
  }, [filteredLinks]);

  return (
    <div className="linkboard">
      {contextHolder}
      <div className="link-list">
        {links.length > 0 && (
          <Space.Compact className="linkboard-filter" block>
            <Select
              defaultValue={linkTypeFilter}
              options={LINKBOARD_FILTER_OPTIONS}
              style={{ width: "45%" }}
              onChange={(item) => {
                setLinkTypeFilter(item);
              }}
            />
          </Space.Compact>
        )}
        {links.length === 0 && linkTypeFilter === "all" && (
          <Empty
            className="empty-link-list"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No links added"
          />
        )}
        {filteredLinks.length === 0 && linkTypeFilter !== "all" && (
          <Empty
            className="empty-link-list"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No links found"
          />
        )}
        {filteredLinks.length > 0 &&
          filteredLinks.map((link) => (
            <Tooltip title={link.url} arrow={false} placement="top">
              <div
                key={link.id}
                className="link-item"
                onClick={() => window.open(link.url, "_blank")}
              >
                {link.imageUrl && <img src={link.imageUrl} alt="link" />}
                <div className="link-details">
                  {link.url && (
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}`}
                      alt="favicon"
                      className="favicon"
                    />
                  )}
                  {link.title && <h2 className="link-title">{link.title}</h2>}
                  {link.url && (
                    <span className="link-url">
                      {new URL(link.url).hostname}
                    </span>
                  )}
                  <Popconfirm
                    icon={<InfoCircleOutlined style={{ color: "#155dfc" }} />}
                    title="Remove url from linkboard"
                    okText="Remove"
                    placement="left"
                    style={{ width: "40px" }}
                    onCancel={(
                      e?: React.MouseEvent<HTMLElement, MouseEvent>
                    ) => {
                      e?.stopPropagation();
                    }}
                    onConfirm={(
                      e?: React.MouseEvent<HTMLElement, MouseEvent>
                    ) => {
                      e?.stopPropagation();
                      dispatch(removeLink(link.id));
                      messageApi.open({
                        type: "success",
                        content: "Link removed from linkboard",
                        duration: 3,
                      });
                    }}
                    cancelText="Cancel"
                    description={"Are you sure you want to remove this link?"}
                  >
                    <button
                      className="delete-card-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TrashIcon className="remove-icon" />
                    </button>
                  </Popconfirm>
                </div>
                <Checkbox
                  onClick={(e) => e.stopPropagation()}
                  className={classNames("link-item-select", {
                    selected: selectedLinks.includes(link.id),
                  })}
                  onChange={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setTimeout(() => {
                      if (selectedLinks.includes(link.id)) {
                        setSelectedLinks(
                          selectedLinks.filter((id) => id !== link.id)
                        );
                      } else {
                        setSelectedLinks([...selectedLinks, link.id]);
                      }
                    }, 50);
                  }}
                  checked={selectedLinks.includes(link.id)}
                />
              </div>
            </Tooltip>
          ))}
      </div>
      {selectedLinks.length > 0 && (
        <div className="selected-links">
          <div className="selected-links-header">
            <h1>
              <span className="selected-links-count">
                {selectedLinks.length}
              </span>{" "}
              link{selectedLinks.length > 1 ? "s" : ""} selected
            </h1>
          </div>
          <div className="selected-links-body">
            <Button size="small" danger onClick={() => setSelectedLinks([])}>
              Deselect all
            </Button>
            <Popconfirm
              title="Remove links from linkboard"
              okText="Remove"
              placement="top"
              style={{ width: "40px" }}
              arrow={false}
              onConfirm={() => {
                dispatch(removeLinks(selectedLinks));
                setSelectedLinks([]);
                messageApi.open({
                  type: "success",
                  content: "Links removed from linkboard",
                  duration: 3,
                });
              }}
            >
              <Button type="primary" size="small" danger>
                Delete {selectedLinks.length} link
                {selectedLinks.length > 1 ? "s" : ""}
              </Button>
            </Popconfirm>
          </div>
          <div className="selected-links-footer">
            {selectedLinks.map((link) => {
              const linkData = filteredLinksMap[link];
              return (
                <div key={link} className="selected-link">
                  {linkData.url && (
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${new URL(linkData.url).hostname}`}
                      alt="favicon"
                      className="favicon"
                    />
                  )}
                  {linkData.url && (
                    <span className="link-host">
                      {new URL(linkData.url).hostname}
                    </span>
                  )}
                  {linkData.url && (
                    <span className="link-url">{linkData.url}</span>
                  )}
                  <TrashIcon
                    className="remove-icon-bucket"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLinks(
                        selectedLinks.filter((id) => id !== link)
                      );
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Linkboard;
