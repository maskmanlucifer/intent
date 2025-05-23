import { useState } from "react";
import { Button, Input, message } from "antd";
import "./index.scss";

const { TextArea } = Input;

const HelpUsImprove = ({
  setPopoverState,
}: {
  setPopoverState: (value: boolean) => void;
}) => {
  const [feedback, setFeedback] = useState("");
  const [isError, setIsError] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const handleFeedbackSubmitClick = () => {
    if (sendingFeedback) {
      return;
    }
    setSendingFeedback(true);
    fetch(
      "https://intent-server-git-main-lzbs-projects-77777663.vercel.app/addUserFeedback",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: feedback.trim() }),
      },
    )
      .then(() => {
        messageApi.success("Feedback sent, thank you!");
        setFeedback("");
        setPopoverState(false);
      })
      .catch(() => {
        messageApi.error("Failed to send feedback. Please try again.");
      })
      .finally(() => setSendingFeedback(false));
  };

  return (
    <div className="help-us-improve">
      {contextHolder}
      <TextArea
        placeholder="Help us improve intent app + Include your email for a response"
        autoSize={{ minRows: 3, maxRows: 6 }}
        value={feedback}
        onChange={(e) => {
          setFeedback(e.target.value);
          setIsError(e.target.value.length > 1000);
        }}
      />
      {isError && (
        <div className="error-message">
          Feedback should be less than 1000 characters
        </div>
      )}
      <div className="button-group">
        <Button
          type="default"
          size="small"
          onClick={() => setPopoverState(false)}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={handleFeedbackSubmitClick}
          disabled={!feedback.trim()}
          loading={sendingFeedback}
        >
          Send Feedback
        </Button>
      </div>
    </div>
  );
};

export default HelpUsImprove;
