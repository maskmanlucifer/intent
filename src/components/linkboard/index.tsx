import React from "react";
import "./index.scss";
import { useDispatch, useSelector } from "react-redux";
import { removeLink, selectLinks } from "../../redux/linkboardSlice";
import { Empty, message, Popconfirm, Select, Space, Tooltip } from "antd";
import { ReactComponent as RemoveIcon } from "../../assets/icons/remove.svg";
import { InfoCircleOutlined } from "@ant-design/icons";
import { AppDispatch } from "../../redux/store";
import { LINKBOARD_FILTER_OPTIONS } from "../../constant";

const Linkboard = () => {
  const links = useSelector(selectLinks);
  const dispatch = useDispatch<AppDispatch>();
  const [messageApi, contextHolder] = message.useMessage();
  const [linkTypeFilter, setLinkTypeFilter] = React.useState(
    LINKBOARD_FILTER_OPTIONS[0].value,
  );

  const filteredLinks = [...links].filter((link) => {
    if (linkTypeFilter === "all") {
      return true;
    }
    return link.type === linkTypeFilter;
  });

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
            <Tooltip title={link.url} mouseEnterDelay={0} mouseLeaveDelay={0} arrow={false}>
            <div
              key={link.id}
              className="link-item"
              onClick={() => window.open(link.url, "_blank")}
            >
              { link.imageUrl && (
                <img
                  src={
                    link.imageUrl
                  }
                  alt="link"
                />
              )}
              <div className="link-details">
              {link.url && (
                <img
                  src={`https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}`}
                  alt="favicon"
                  className="favicon"
                />
              )}
              {link.title && <h2 className="link-title">{link.title}</h2>}
              {link.url && <span className="link-url">{new URL(link.url).hostname}</span>}
                <Popconfirm
                  icon={<InfoCircleOutlined style={{ color: "#155dfc" }} />}
                  title="Remove url from linkboard"
                  okText="Remove"
                  placement="left"
                  style={{ width: "40px" }}
                  onCancel={(e?: React.MouseEvent<HTMLElement, MouseEvent>) => {
                    e?.stopPropagation();
                  }}
                  onConfirm={(
                    e?: React.MouseEvent<HTMLElement, MouseEvent>,
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
                    <RemoveIcon className="remove-icon" />
                  </button>
                </Popconfirm>
              </div>
            </div>
            </Tooltip>
          ))}
      </div>
    </div>
  );
};

export default Linkboard;
