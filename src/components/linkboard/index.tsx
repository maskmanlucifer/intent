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
  Modal,
  Popconfirm,
  Select,
} from "antd";
import { DeleteOutlined, MehOutlined } from "@ant-design/icons";
import { ReactComponent as TrashIcon } from "../../assets/icons/remove.svg";
import { ReactComponent as CloseIcon } from "../../assets/icons/close.svg";
import { ReactComponent as RedirectionArrowIcon } from "../../assets/icons/redirection-arrow.svg";
import { InfoCircleOutlined } from "@ant-design/icons";
import { AppDispatch } from "../../redux/store";
import { LINKBOARD_FILTER_OPTIONS } from "../../constant";
import classNames from "classnames";
import { TLink } from "../../types";


// Helper function to check if URL is YouTube
const isYouTubeUrl = (url: string): boolean => {
  return /youtube\.com|youtu\.be/.test(url);
};

// Component for rendering OG image content
const OgImageContent: React.FC<{ link: TLink }> = ({ link }) => {
  const [imageError, setImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [showDotPlaceholder, setShowDotPlaceholder] = React.useState(false);

  // Generate random color for dot based on link ID for consistency
  const getRandomDotColor = (linkId: string) => {
    const colors = [
      '#1E3A8A', '#7C2D12', '#B45309', '#365314', '#1F2937',
      '#7C3AED', '#BE185D', '#0F766E', '#1E40AF', '#991B1B',
      '#451A03', '#312E81', '#374151', '#92400E', '#065F46',
      '#581C87', '#701A75', '#0C4A6E', '#7C2D12', '#78350F'
    ];
    
    const hash = linkId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Generate beautiful aesthetic fallback images
  const getFallbackImage = (link: TLink) => {
    try {
      if (link.type === "video" && isYouTubeUrl(link.url)) {
        // YouTube thumbnail
        const videoId = link.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
        if (videoId) {
          return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
        // Minimal pattern for YouTube fallback
        return `https://images.unsplash.com/photo-1557683316-973673baf926?w=410&h=200&fit=crop&crop=center&auto=format&q=80`;
      }
      
      // Beautiful aesthetic patterns using Pexels sources
      const patterns = [
        `https://images.pexels.com/photos/2567011/pexels-photo-2567011.jpeg?auto=compress&cs=tinysrgb&w=410&h=200&fit=crop`,
      ];
      
      // Use link ID to consistently pick a pattern
      const hash = link.id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      return patterns[Math.abs(hash) % patterns.length];
    } catch {
      // Ultimate fallback - clean minimal pattern
      return `https://images.pexels.com/photos/34076422/pexels-photo-34076422.jpeg?auto=compress&cs=tinysrgb&w=410&h=200&fit=crop`;
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setImageLoaded(true);
    setShowDotPlaceholder(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
    // If there's no original image URL, show dot placeholder
    if (!link.imageUrl) {
      setShowDotPlaceholder(true);
    }
  };

  // Check if we should show dot placeholder (no original image URL)
  const shouldShowDot = !link.imageUrl || showDotPlaceholder;

  // Get the image source - prefer link.imageUrl, fallback to generated image
  const imageSrc = link.imageUrl && !imageError ? link.imageUrl : getFallbackImage(link);

  return (
    <div className="og-image-container">
      {isLoading && !shouldShowDot && (
        <div className="image-loading">
          <div className="loading-spinner"></div>
        </div>
      )}
      
      {shouldShowDot ? (
        <div 
          className="dot-placeholder"
          style={{ 
            backgroundColor: 'white',
            '--dot-color': getRandomDotColor(link.id)
          } as React.CSSProperties & { '--dot-color': string }}
        >
          <div className="random-dot"></div>
        </div>
      ) : (
        <img 
          src={imageSrc}
          alt={link.title || "Content preview"}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ 
            display: isLoading ? "none" : "block",
            width: "100%",
            height: "200px",
            objectFit: "cover"
          }}
        />
      )}
      
      {/* Video play overlay for YouTube videos */}
      {link.type === "video" && isYouTubeUrl(link.url) && imageLoaded && !shouldShowDot && (
        <div className="video-play-overlay">
          <div className="play-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

const Linkboard = () => {
  const links = useSelector(selectLinks);
  const dispatch = useDispatch<AppDispatch>();
  const [messageApi, contextHolder] = message.useMessage();
  const [linkTypeFilter, setLinkTypeFilter] = React.useState(
    LINKBOARD_FILTER_OPTIONS[0].value,
  );

  const [selectedLinks, setSelectedLinks] = React.useState<string[]>([]);
  const [isDemoModalOpen, setIsDemoModalOpen] = React.useState(false);

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
      {} as Record<string, TLink>,
    );
  }, [filteredLinks]);

  return (
    <div className="linkboard">
      {contextHolder}
      
      {/* Linkboard Header with Demo Button */}
      <div className="linkboard-header">
        <div className="linkboard-title">
          <h2>Linkboard</h2>
        </div>
        <Button
          icon={<MehOutlined />}
          type="link"
          className="watch-demo-btn"
          onClick={() => setIsDemoModalOpen(true)}
        >
          Watch demo
        </Button>
      </div>
      
      <div className="link-list">
        {links.length > 0 && (
          <div className="linkboard-filter">
            <Select
              defaultValue={linkTypeFilter}
              options={LINKBOARD_FILTER_OPTIONS}
              size="middle"
              style={{ width: "200px" }}
              onChange={(item) => {
                setLinkTypeFilter(item);
              }}
            />
          </div>
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
        {filteredLinks.length > 0 && (
          <div className="masonry-container">
            {filteredLinks.map((link) => (
              <div
                key={link.id}
                className={classNames("masonry-item", {
                  "youtube-item": link.type === "video" && isYouTubeUrl(link.url),
                  "webpage-item": link.type === "webpage",
                  "image-item": link.type === "image",
                })}
              >
                  <div className="masonry-content">
                    <OgImageContent link={link} />
                  </div>
                  
                  {/* Bottom bar with URL and actions */}
                  <div className="bottom-bar">
                    <div className="url-section">
                      {link.url && (
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}`}
                          alt="favicon"
                          className="favicon"
                        />
                      )}
                      <span className="url-text">
                        {link.url ? new URL(link.url).hostname : "Link"}
                      </span>
                    </div>
                    
                    <div className="separator"></div>
                    
                    <div className="actions-section">
                      <button
                        className="action-btn open-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(link.url, "_blank");
                        }}
                        title="Open in new tab"
                      >
                        <RedirectionArrowIcon />
                      </button>
                      
                      <Popconfirm
                        icon={<InfoCircleOutlined style={{ color: "#155dfc" }} />}
                        title="Remove url from linkboard"
                        okText="Remove"
                        placement="left"
                        onCancel={(e?: React.MouseEvent<HTMLElement, MouseEvent>) => {
                          e?.stopPropagation();
                        }}
                        onConfirm={(e?: React.MouseEvent<HTMLElement, MouseEvent>) => {
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
                          className="action-btn delete-btn"
                          onClick={(e) => e.stopPropagation()}
                          title="Delete link"
                        >
                          <DeleteOutlined />
                        </button>
                      </Popconfirm>
                    </div>
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
                            selectedLinks.filter((id) => id !== link.id),
                          );
                        } else {
                          setSelectedLinks([...selectedLinks, link.id]);
                        }
                      }, 50);
                    }}
                    checked={selectedLinks.includes(link.id)}
                  />
                </div>
            ))}
          </div>
        )}
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
                        selectedLinks.filter((id) => id !== link),
                      );
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Demo Modal */}
      <Modal
        open={isDemoModalOpen}
        onCancel={() => setIsDemoModalOpen(false)}
        footer={null}
        style={{ maxWidth: '1240px' }}
        width={'80vw'}
        closeIcon={null}
        title={
          <div className="iframe-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>LINKBOARD</span>
            <div className="close-icon" style={{ cursor: "pointer" }}>
              <CloseIcon
                onClick={() => setIsDemoModalOpen(false)}
              />
            </div>
          </div>
        }
        centered
        destroyOnClose
      >
        <div className="iframe-container" style={{ display: "flex", justifyContent: "center" }}>
          <video width="100%" height="100%" controls>
            <source src="https://ik.imagekit.io/dnz8iqrsyc/linkboard-intro.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </Modal>
    </div>
  );
};

export default Linkboard;
