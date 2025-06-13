import React, { useState } from "react";
import { Modal, Button } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import "./index.scss";

const FeatureIntroModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const [currentPage, setCurrentPage] = useState(0);

  const features = [
    {
      title: "Linkboard",
      description: "Access your favorite links quickly with Linkboard.",
      media: (
        <video controls width="860" height="480" id="linkboard-video">
          <source
            src="https://ik.imagekit.io/dnz8iqrsyc/linkboard-intro.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      ),
    },
    {
      title: "Reminder",
      description: "Keep track of your tasks using our reminders.",
      media: (
        <video controls width="860" height="480" id="reminder-video">
          <source
            src="https://ik.imagekit.io/dnz8iqrsyc/reminder.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      ),
    },
    {
      title: "Drag and Drop",
      description: "Organize your tasks with our drag and drop feature.",
      media: (
        <img
          src="https://ik.imagekit.io/dnz8iqrsyc/drag-and-drop.gif"
          style={{ height: "480px", width: "860px", objectFit: "contain" }}
          alt="Drag and Drop"
        />
      ),
    },
    {
      title: "Shortcuts",
      description: "Access features with keyboard shortcuts.",
      media: (
        <img
          style={{ height: "480px", width: "860px", objectFit: "contain" }}
          src="https://ik.imagekit.io/dnz8iqrsyc/Screenshot%202025-06-09%20at%2011.56.00%E2%80%AFPM.png"
          alt="Shortcuts"
        />
      ),
    },
  ];

  const isLastPage = currentPage === features.length - 1;

  const handleNext = () => {
    if (!isLastPage) {
      setCurrentPage(currentPage + 1);
      const currentMedia = features[currentPage].media;
      if (currentMedia.type === "video") {
        const videoElement = document.getElementById(
          "linkboard-video"
        ) as HTMLVideoElement;
        if (videoElement) {
          videoElement.pause();
        }
      }
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      const currentMedia = features[currentPage]?.media;
      if (currentMedia && currentMedia.type === "video") {
        const videoElement = document.getElementById(
          "linkboard-video"
        ) as HTMLVideoElement;
        if (videoElement) {
          videoElement.pause();
        }
      }
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      onClose={onClose}
      footer={null}
      width={1000}
      className="feature-intro-modal"
      centered={true}
      closeIcon={<CloseOutlined style={{ fontSize: "14px" }} />}
      maskClosable={false}
    >
      <div className="modal-header">
        <span>
          Feature Tour {currentPage + 1} / {features.length}
        </span>
      </div>
      <div className="modal-body">
          <h2>{features[currentPage].title}</h2>
          <p>{features[currentPage].description}</p>
          <div className="media-container" key={currentPage}>
            {features[currentPage].media}
          </div>
      </div>
      <div className="modal-footer">
        <Button
          onClick={handlePrev}
          disabled={currentPage === 0}
          icon={<LeftOutlined />}
        >
          Prev
        </Button>
        {!isLastPage ? (
          <>
            <Button
              type="primary"
              onClick={handleNext}
              className="last-btn"
              icon={<RightOutlined />}
            >
              Next
            </Button>
          </>
        ) : (
          <Button type="primary" onClick={onClose} className="last-btn">
            Finish
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default FeatureIntroModal;
