import React, { useState } from "react";
import { Modal, Button, Form, Input, Checkbox, Radio } from "antd";
import { LeftOutlined, RightOutlined, SendOutlined, CloseOutlined } from "@ant-design/icons";
import "./index.scss";

const FeatureIntroModal = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const features = [
    {
      title: "Linkboard",
      description: "Access your favorite links quickly with Linkboard.",
      media: <video controls width="860" height="500" id="linkboard-video">
      <source
        src="https://ik.imagekit.io/dnz8iqrsyc/linkboard-intro.mp4"
        type="video/mp4"
      />
      Your browser does not support the video tag.
    </video>,
    },
    {
      title: "Reminder",
      description: "Stay on top of your tasks with our reminder notifications.",
      media: <video controls width="860" height="500" id="reminder-video">
      <source
        src="https://ik.imagekit.io/dnz8iqrsyc/reminder.mp4"
        type="video/mp4"
      />
      Your browser does not support the video tag.
    </video>,
    },
    {
        title: "Drag and Drop",
        description: "Easily organize your tasks with our drag and drop feature.",
        media: <img src="https://ik.imagekit.io/dnz8iqrsyc/drag-and-drop.gif" alt="Drag and Drop" />,
    },
    {
      title: "Shortcuts",
      description: "Access your favorite features with our keyboard shortcuts.",
      media: <img src="https://ik.imagekit.io/dnz8iqrsyc/Screenshot%202025-06-09%20at%2011.56.00%E2%80%AFPM.png" alt="Shortcuts" />,
    },
  ];

  const isLastPage = currentPage === features.length;

  const handleNext = () => {
    if (!isLastPage) {
      setCurrentPage(currentPage + 1);
      const currentMedia = features[currentPage].media;
      if (currentMedia.type === 'video') {
        const videoElement = document.getElementById('linkboard-video') as HTMLVideoElement;
        if (videoElement) {
          videoElement.pause();
        }
      }
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      const currentMedia = features[currentPage].media;
      if (currentMedia.type === 'video') {
        const videoElement = document.getElementById('linkboard-video') as HTMLVideoElement;
        if (videoElement) {
          videoElement.pause();
        }
      }
    }
  };

  const handleSubmit = (values: any) => {
    setIsLoading(true);
    fetch(
        "https://intent-server-git-main-lzbs-projects-77777663.vercel.app/addUserFeedback",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedback: JSON.stringify(values) }),
        },
      )
        .then(() => {
            onClose();
        })
        .catch(() => {
            console.log("Failed to send feedback. Please try again.");
            onClose();
        })
        .finally(() => {
          setIsLoading(false);
        });
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
      closeIcon={<CloseOutlined style={{ fontSize: '14px' }} />}
      maskClosable={false}
    >
      <div className="modal-header">
        <span>Feature Tour {currentPage + 1} / {features.length + 1}</span>
      </div>
      <div className="modal-body">
        {!isLastPage ? (
          <>
            <h2>{features[currentPage].title}</h2>
            <p>{features[currentPage].description}</p>
            <div className="media-container" key={currentPage}>{features[currentPage].media}</div>
          </>
        ) : (
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
              label={<span style={{ fontSize: '16px' }}>How useful is this feature day to day for you?</span>}
              name="usefulness"
              rules={[]}
            >
              <Radio.Group>
                <Radio value="very">Very Useful</Radio>
                <Radio value="somewhat">Somewhat Useful</Radio>
                <Radio value="not">Not Useful</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label={<span style={{ fontSize: '16px' }}>Any feature requests or suggestions?</span>} name="suggestions">
              <Input.TextArea placeholder="Your suggestions" />
            </Form.Item>
            <Form.Item label={<span style={{ fontSize: '16px' }}>Email (Optional)</span>} name="email">
              <Input placeholder="your@email.com" />
            </Form.Item>
            <Form.Item name="updates" valuePropName="checked">
              <Checkbox>Send me feature updates (I promise no spam!)</Checkbox>
            </Form.Item>
          </Form>
        )}
      </div>
      <div className="modal-footer">
        <Button onClick={handlePrev} disabled={currentPage === 0} icon={<LeftOutlined />}>
          Prev
        </Button>
        {!isLastPage ? (
          <>
            <Button type="primary" onClick={handleNext} className="last-btn" icon={<RightOutlined />}>
              Next
            </Button>
          </>
        ) : (
          <Button type="primary" onClick={() => form.submit()} className="last-btn" icon={<SendOutlined />} loading={isLoading}>
            Submit
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default FeatureIntroModal;
