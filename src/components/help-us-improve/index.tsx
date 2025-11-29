import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Input, message } from "antd";
import "./index.scss";
import config from "../../config";

const { TextArea } = Input;

const HelpUsImprove = ({
  setPopoverState,
}: {
  setPopoverState: (value: boolean) => void;
}) => {
  const { t } = useTranslation();
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
      `${config.API_URL}/addUserFeedback`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: feedback.trim() }),
      },
    )
      .then(() => {
        messageApi.success(t('helpUsImprove.feedbackSent'));
        setFeedback("");
        setPopoverState(false);
      })
      .catch(() => {
        messageApi.error(t('helpUsImprove.feedbackFailed'));
      })
      .finally(() => setSendingFeedback(false));
  };

  return (
    <div className="help-us-improve">
      {contextHolder}
      <TextArea
        placeholder={t('helpUsImprove.placeholder')}
        autoSize={{ minRows: 3, maxRows: 6 }}
        value={feedback}
        onChange={(e) => {
          setFeedback(e.target.value);
          setIsError(e.target.value.length > 1000);
        }}
      />
      {isError && (
        <div className="error-message">
          {t('helpUsImprove.errorTooLong')}
        </div>
      )}
      <div className="button-group">
        <Button
          type="default"
          size="small"
          onClick={() => setPopoverState(false)}
        >
          {t('helpUsImprove.cancel')}
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={handleFeedbackSubmitClick}
          disabled={!feedback.trim()}
          loading={sendingFeedback}
        >
          {t('helpUsImprove.sendFeedback')}
        </Button>
      </div>
    </div>
  );
};

export default HelpUsImprove;
