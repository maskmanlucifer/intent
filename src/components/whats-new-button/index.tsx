import React from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "antd";
import classNames from "classnames";
import { ReactComponent as SparklesIcon } from "../../assets/icons/sparkles.svg";
import "./index.scss";

interface WhatsNewButtonProps {
    isSidebarCollapsed: boolean;
    onClick: () => void;
}

const WhatsNewButton: React.FC<WhatsNewButtonProps> = ({
    isSidebarCollapsed,
    onClick,
}) => {
    const { t } = useTranslation();

    const buttonContent = (
        <>
            <SparklesIcon />
            <span className="red-dot-badge" />
            <span title={t("sidebar.whatsNew")}>{t("sidebar.whatsNew")}</span>
        </>
    );

    if (isSidebarCollapsed) {
        return (
            <div
                className={classNames("sidebar-bottom-action-item", "whats-new-button", "has-badge")}
                onClick={onClick}
            >
                <Tooltip
                    title={t("sidebar.whatsNew")}
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
                    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <SparklesIcon />
                        <span className="red-dot-badge" />
                    </div>
                </Tooltip>
                <span title={t("sidebar.whatsNew")}>{t("sidebar.whatsNew")}</span>
            </div>
        );
    }

    return (
        <div
            className={classNames("sidebar-bottom-action-item", "whats-new-button", "has-badge")}
            onClick={onClick}
        >
            {buttonContent}
        </div>
    );
};

export default WhatsNewButton;
