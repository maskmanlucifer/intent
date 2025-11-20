import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Button, Input, message } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import {
    APP_VERSION,
    getCurrentVersionFeatures,
    setLastSeenVersion,
} from "../../constants/version";
import "./index.scss";

const { TextArea } = Input;

interface WhatsNewModalProps {
    open: boolean;
    onClose: () => void;
    hasUpdates: boolean;
}

const WhatsNewModal: React.FC<WhatsNewModalProps> = ({
    open,
    onClose,
    hasUpdates,
}) => {
    const { t } = useTranslation();
    const features = getCurrentVersionFeatures();
    const [feedback, setFeedback] = useState("");
    const [sendingFeedback, setSendingFeedback] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    // Track when modal is opened
    useEffect(() => {
        if (open && hasUpdates) {
            const trackData: any = {
                event: "whats_new_opened",
                version: APP_VERSION,
                timestamp: new Date().toISOString(),
            };

            // Get extension ID if available
            if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id) {
                trackData.extensionId = chrome.runtime.id;
            }

            // Send tracking data
            fetch(
                "https://intent-server-git-main-lzbs-projects-77777663.vercel.app/addUserFeedback",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(trackData),
                }
            ).catch((error) => {
                console.error("Failed to send tracking data:", error);
            });
        }
    }, [open, hasUpdates]);

    const handleFeedbackSubmit = () => {
        if (!feedback.trim() || sendingFeedback) return;

        setSendingFeedback(true);
        const feedbackData: any = {
            feedback: feedback.trim(),
            source: "whats_new_modal",
            version: APP_VERSION,
        };

        if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id) {
            feedbackData.extensionId = chrome.runtime.id;
        }

        fetch(
            "https://intent-server-git-main-lzbs-projects-77777663.vercel.app/addUserFeedback",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(feedbackData),
            }
        )
            .then(() => {
                messageApi.success(t("whatsNew.feedbackSent"));
                setFeedback("");
            })
            .catch(() => {
                messageApi.error(t("whatsNew.feedbackFailed"));
            })
            .finally(() => setSendingFeedback(false));
    };

    const handleClose = async () => {
        if (hasUpdates) {
            await setLastSeenVersion(APP_VERSION);
        }
        onClose();
    };

    return (
        <Modal
            open={open}
            onCancel={handleClose}
            title={
                <span className="whats-new-modal-header">
                    {t("whatsNew.title")}
                </span>
            }
            centered={true}
            closeIcon={<CloseOutlined style={{ fontSize: "14px" }} />}
            width={600}
            footer={[
                <Button
                    key="ok"
                    type="primary"
                    onClick={handleClose}
                    size="small"
                >
                    {t("whatsNew.gotIt")}
                </Button>,
            ]}
            onOk={handleClose}
            className="whats-new-modal"
        >
            {contextHolder}
            <div className="whats-new-content">
                <div className="whats-new-updates-list">
                    {features.map((feature, index) => (
                        <div key={index} className="whats-new-update-item">
                            <h3 className="update-title">{t(feature.titleKey)}</h3>
                            <p className="update-description">
                                {t(feature.descriptionKey)}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="whats-new-feedback-section">
                    <h4 className="feedback-title">{t("whatsNew.feedbackTitle")}</h4>
                    <TextArea
                        placeholder={t("whatsNew.feedbackPlaceholder")}
                        autoSize={{ minRows: 3, maxRows: 5 }}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        maxLength={1000}
                    />
                    <Button
                        type="link"
                        size="small"
                        onClick={handleFeedbackSubmit}
                        disabled={!feedback.trim()}
                        loading={sendingFeedback}
                        className="feedback-submit-btn"
                    >
                        {t("whatsNew.submitFeedback")}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default WhatsNewModal;
