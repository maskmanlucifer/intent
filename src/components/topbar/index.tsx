import PageSwitcher from "../page-switcher";
import { selectActivePage, setActivePage } from "../../redux/sessionSlice";
import { useDispatch, useSelector } from "react-redux";
import { Pages } from "../../types";
import "./index.scss";
import { SettingOutlined } from "@ant-design/icons";
import { ReactComponent as CollapseIcon } from "../../assets/icons/collapse.svg";
import classNames from "classnames";
import { Button, Popover, Tooltip } from "antd";
import { ReactComponent as ScheduleIcon } from "../../assets/icons/schedule.svg";
import { useState } from "react";
import SettingsModal from "../settings-modal";
import { PAGES } from "../../constant";
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
    const dispatch = useDispatch();
    const page = useSelector(selectActivePage);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const setPage = (page: Pages) => {
        dispatch(setActivePage(page));
    }

    return (
        <div className="topbar">
            <div className={classNames("topbar-left",  { "topbar-left-collapsed": isSidebarCollapsed, 
                "notes": page === PAGES.NOTES
             })}>
               <div className="topbar-left-title" onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}>
                   {!isSidebarCollapsed && "INT3NT"} {showCollapsedIcon && <Tooltip arrow={false} autoAdjustOverflow={true} placement="bottom" title={!isSidebarCollapsed ? "Collapse sidebar" : "Expand sidebar"}><CollapseIcon /></Tooltip>} {!showCollapsedIcon && isSidebarCollapsed && <Tooltip arrow={false} autoAdjustOverflow={true} placement="right" title="Expand sidebar"><SmilyIcon className="smily-icon" /></Tooltip>}
               </div>
            </div>
            <div className="topbar-right">
                <PageSwitcher page={page} setPage={setPage} />
                <div className="contextual-info">Your data is stored locally and not on any server.</div>
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
                    <Tooltip arrow={false} placement="bottom" title="Feedback">
                        <QuestionIcon />
                    </Tooltip>
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