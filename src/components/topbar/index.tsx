import PageSwitcher from "../page-switcher";
import { selectActivePage, syncSettings } from "../../redux/sessionSlice";
import { useSelector } from "react-redux";
import { Pages } from "../../types";
import "./index.scss";
import { SettingOutlined } from "@ant-design/icons";
import { ReactComponent as CollapseIcon } from "../../assets/icons/collapse.svg";
import classNames from "classnames";
import { Button, Popover, Tooltip } from "antd";
import { ReactComponent as ScheduleIcon } from "../../assets/icons/schedule.svg";
import { useState } from "react";
import SettingsModal from "../settings-modal";
import { ReactComponent as SmilyIcon } from "../../assets/icons/smily.svg";
import {ReactComponent as QuestionIcon} from "../../assets/icons/question.svg";
import HelpUsImprove from "../help-us-improve";

interface TopbarProps {
    isSidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
    setIsDrawerOpen: (open: boolean) => void;
    isDrawerOpen: boolean;
    showCollapsedIcon: boolean;
}

const Topbar = ({ isSidebarCollapsed, setSidebarCollapsed, setIsDrawerOpen, isDrawerOpen, showCollapsedIcon }: TopbarProps) => {
    const page = useSelector(selectActivePage);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const setPage = (page: Pages) => {
        syncSettings({
            activePage: page
        })
    }

    return (
        <div className="topbar">
            <div className={classNames("topbar-left",  { "topbar-left-collapsed": isSidebarCollapsed, 
             })}>
               <div className="topbar-left-title" onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}>
                   {!isSidebarCollapsed && "INT3NT"} {showCollapsedIcon && <Tooltip arrow={false} autoAdjustOverflow={true} placement="bottom" title={!isSidebarCollapsed ? "Collapse sidebar" : "Expand sidebar"} mouseEnterDelay={0}><CollapseIcon /></Tooltip>} {!showCollapsedIcon && isSidebarCollapsed && <Tooltip arrow={false} autoAdjustOverflow={true} placement="right" title="Expand sidebar" mouseEnterDelay={0}><SmilyIcon className="smily-icon" /></Tooltip>}
               </div>
            </div>
            <div className="topbar-right">
                <PageSwitcher page={page} setPage={setPage} />
                <Button type="primary" className="check-schedule-button" size="small" onClick={() => setIsDrawerOpen(!isDrawerOpen)} icon={<ScheduleIcon />}>Today's Schedule</Button>
                <Popover
                    content={<HelpUsImprove setPopoverState={setIsPopoverOpen} />}
                    title={null}
                    trigger="click"
                    open={isPopoverOpen}
                    destroyTooltipOnHide={true}
                    onOpenChange={(open) => setIsPopoverOpen(open)}
                    placement="bottomRight"
                    arrow={false}
                    >
                <div className="feedback">
                        <QuestionIcon />
                </div>
                </Popover>
                
                <div className="settings" onClick={() => setIsSettingsModalOpen(!isSettingsModalOpen)}>
                    <SettingOutlined />
                </div>
            </div>
            <SettingsModal visible={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
        </div>
    )
}

export default Topbar;