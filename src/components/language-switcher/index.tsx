import React, { useState } from "react";
import { Select, Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import "./index.scss";
import { GlobalOutlined } from "@ant-design/icons";
import { supportedLanguages } from '../../i18n';

const languages = [
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
    { code: "it", label: "Italiano" },
    { code: "pt", label: "Português" },
    { code: "ru", label: "Русский" },
    { code: "zh", label: "中文" },
    { code: "ja", label: "日本語" },
    { code: "ko", label: "한국어" },
].filter((lang) => supportedLanguages.includes(lang.code));

interface LanguageSwitcherProps {
    isSidebarCollapsed: boolean;
    setIsSidebarCollapsed: (collapsed: boolean) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ isSidebarCollapsed, setIsSidebarCollapsed }) => {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    // Ensure current language is valid, fallback to 'en' if not
    const currentLanguage = supportedLanguages.includes(i18n.language) ? i18n.language : 'en';
    
    // If current language is invalid, fix it
    React.useEffect(() => {
        if (!supportedLanguages.includes(i18n.language)) {
            i18n.changeLanguage('en');
        }
    }, [i18n]);

    const handleChange = (value: string) => {
        // Double-check the value is supported (defensive programming)
        if (supportedLanguages.includes(value)) {
            i18n.changeLanguage(value);
        } else {
            i18n.changeLanguage('en');
        }
        setIsOpen(false);
    };

    const handleClick = () => {
        if (isSidebarCollapsed) {
            setIsSidebarCollapsed(false);
            setIsOpen(true);
        } else {
            if (!isOpen) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        }
    };

    const withTooltip = (component: React.ReactNode, tooltip: string) => {
        if (isSidebarCollapsed) {
            return (
                <Tooltip
                    title={tooltip}
                    placement="right"
                    arrow={false}
                    mouseEnterDelay={0}
                    mouseLeaveDelay={0}
                    autoAdjustOverflow={true}
                    overlayInnerStyle={{
                        marginLeft: "10px",
                    }}
                >
                    {component}
                </Tooltip>
            );
        }
        return component;
    };

    return (
        <div className="sidebar-bottom-action-item language-switcher" onClick={handleClick}>
            {withTooltip(
                <GlobalOutlined />,
                t('sidebar.changeLanguage')
            )}
            <Select
                value={currentLanguage} // Use validated current language
                open={isOpen}
                onClick={(e) => e.stopPropagation()}
                dropdownRender={(menu) => (
                    <div onClick={(e) => e.stopPropagation()}>{menu}</div>
                )}
                onDropdownVisibleChange={(open) => setIsOpen(open)}
                style={{
                    width: isSidebarCollapsed ? 0 : 'auto',
                    opacity: isSidebarCollapsed ? 0 : 1,
                    flex: 1
                }}
                onChange={handleChange}
                options={languages.map((lang) => ({
                    value: lang.code,
                    label: lang.label,
                }))}
                variant="borderless"
                size="small"
                popupMatchSelectWidth={false}
                placement="topRight"
            />
        </div>
    );
};

export default LanguageSwitcher;
