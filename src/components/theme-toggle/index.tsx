import React from 'react';
import { Button, Tooltip } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import './index.scss';

interface ThemeToggleProps {
  isSidebarCollapsed: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isSidebarCollapsed }) => {
  const { theme, toggleTheme } = useTheme();

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
    <div className="theme-toggle-container" onClick={toggleTheme}>
      {withTooltip(
        <Button
          type="text"
          icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
          onClick={toggleTheme}
          className="theme-toggle-button"
          size="small"
        />,
        `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`
      )}
      {!isSidebarCollapsed && (
        <span className="theme-toggle-text">
          {theme === 'light' ? 'Dark theme' : 'Light theme'}
        </span>
      )}
    </div>
  );
};

export default ThemeToggle;
