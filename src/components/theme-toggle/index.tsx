import React from 'react';
import { Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import './index.scss';

interface ThemeToggleProps {
  isSidebarCollapsed: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isSidebarCollapsed }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

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
    <div className="sidebar-bottom-action-item" onClick={toggleTheme}>
      {withTooltip(
        theme === 'light' ? <MoonOutlined /> : <SunOutlined />,
        theme === 'light' ? t('sidebar.theme.switchToDark') : t('sidebar.theme.switchToLight')
      )}
      <span>
        {theme === 'light' ? t('sidebar.theme.darkTheme') : t('sidebar.theme.lightTheme')}
      </span>
    </div>
  );
};

export default ThemeToggle;
