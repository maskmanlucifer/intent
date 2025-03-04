"use client"

import type React from "react"
import { useState } from "react"
import { Modal, Menu, Typography, TimePicker, Select, Image, Input, Button, Popconfirm, message } from "antd"
import {
  SettingOutlined,
} from "@ant-design/icons"
import "./index.scss"
import dayjs from "dayjs"
import { ReactComponent as GeneralSettingsIcon } from "../../assets/icons/general-settings.svg"
import { ReactComponent as SubscriptionIcon } from "../../assets/icons/subscription.svg"
import BreakBeforeImg from "../../assets/images/break-before-demo.png"
import BreakAfterImg from "../../assets/images/break-demo.png"
import { ReactComponent as CalendarIcon } from "../../assets/icons/calendar.svg"
import { getItem, setItem } from "../../db/localStorage"
import { TSettings } from "../../types"
import { handleRemoveCalendar, handleImportCalendar } from "../../helpers/events.helper"
import { handleBreakSchedule } from "../../helpers/break.helper"

const format = 'HH:mm';

const { Text } = Typography

interface SettingsModalProps {
  visible?: boolean
  onClose?: () => void
}

const SettingsModal = ({ visible = true, onClose }: SettingsModalProps) => {
  const [selectedMenu, setSelectedMenu] = useState("general")
  const settings = getItem('settings') as TSettings || {};;
  const [icalUrl, setIcalUrl] = useState(settings?.icalUrl || '')
  const [workingHours, setWorkingHours] = useState(settings?.workingHours || ['09:00', '17:00']);
  const [breakInterval, setBreakInterval] = useState(settings?.breakInterval || 90);
  const [messageApi, contextHolder] = message.useMessage();


  const handleWorkingHoursChange = (value: string, index: number) => {
    const newWorkingHours = [...workingHours];
    newWorkingHours[index] = value;
    setWorkingHours(newWorkingHours);
    setItem('settings', {
      ...settings,
      workingHours: newWorkingHours,
    });
    handleBreakSchedule(true);
  };

  const handleBreakIntervalChange = (value: string) => {
    setBreakInterval(parseInt(value));
    setItem('settings', {
      ...settings,
      breakInterval: parseInt(value),
    });
    handleBreakSchedule(true);
  };

  const menuItems = [
    {
      key: "general",
      icon: <GeneralSettingsIcon />,
      label: "General",
    },
    {
      key: "calendar",
      icon: <CalendarIcon />,
      label: "Calendar",
    },
    {
      key: "subscription",
      icon: <SubscriptionIcon />,
      label: "Subscription",
    },
  ]

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={800}
      height={600}
      className="settings-modal"
    >
      <div className="settings-container">
        {contextHolder}
        <div className="settings-sidebar">
          <div className="settings-header">
            <SettingOutlined />
            <span>Settings</span>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selectedMenu]}
            onClick={({ key }) => setSelectedMenu(key)}
            className="settings-menu"
            items={menuItems}
          />
        </div>
        <div className="settings-content">
          {selectedMenu === "general" && (
            <div className="settings-panel">
              <div className="panel-title">General Settings</div>
              <div className="setting-items">
              <div className="setting-item">
                  <Text strong className="setting-title" style={{ fontSize: '16px' }}>
                    Working Hours
                  </Text>
                  <Text type="secondary" className="setting-description" style={{ fontSize: '14px' }}>
                    Set your working hours
                  </Text>
                <div className="time-picker-container">
                  <TimePicker 
                    defaultValue={dayjs(workingHours[0], format)} 
                    format={format} 
                    className="time-picker" 
                    placeholder="Start Time" 
                    size="small"
                    minuteStep={15}
                    onChange={(value) => {
                      const formattedValue = value?.format('HH:mm');
                      handleWorkingHoursChange(formattedValue, 0);
                    }}
                    showNow={false}
                  />
                  <TimePicker 
                    defaultValue={dayjs(workingHours[1], format)} 
                    format={format} 
                    className="time-picker" 
                    placeholder="End Time" 
                    size="small"
                    showNow={false}
                    minuteStep={15}
                    onChange={(value) => {
                      const formattedValue = value?.format('HH:mm');
                      handleWorkingHoursChange(formattedValue, 1);
                    }}
                  />
                </div>
              </div>
              <div className="setting-item">
                  <Text strong className="setting-title" style={{ fontSize: '16px' }}>
                    Break Interval
                  </Text>
                  <Text type="secondary" className="setting-description" style={{ fontSize: '14px' }}>
                  Specify the duration between breaks to help manage your work schedule and ensure adequate recharge time.
                  </Text>
                <Select
                  defaultValue={breakInterval.toString()}
                  options={[
                    { value: '60', label: '60 minutes' },
                    { value: '90', label: '90 minutes' },
                    { value: '120', label: '120 minutes' },
                  ]}
                  size="small"
                  style={{ width: '200px', marginTop: '12px' }}
                  onChange={(value) => {
                    handleBreakIntervalChange(value);
                  }}
                />
              </div>
              <div className="setting-item">
                  <Text strong className="setting-title" style={{ fontSize: '16px' }}>
                    How break is communicated
                  </Text>
                  <Text type="secondary" className="setting-description" style={{ fontSize: '14px' }}>
                    Your screen will turn gray during break time.
                  </Text>
                <div className="break-communication-container">
                  <Image src={BreakBeforeImg} alt="Break Communication" className="break-communication-image"/>
                  <Image src={BreakAfterImg} alt="Break Communication" className="break-communication-image"/>
                </div>
              </div>
              </div>
            </div>
          )}
          {selectedMenu === "subscription" && (
            <div className="settings-panel">
              <div className="panel-title">Subscription</div>
              <div className="setting-items">
                <div className="setting-item">
                  <Text strong className="setting-title" style={{ fontSize: '16px' }}>
                    Premium Plan
                  </Text>
                  <Text type="secondary" className="setting-description" style={{ fontSize: '14px' }}>
                    You have access to all features of the app.
                  </Text>
                </div>
              </div>
            </div>
          )}
          {selectedMenu === "calendar" && (
            <div className="settings-panel">
              <div className="panel-title">Calendar</div>
              <div className="setting-items">
                <div className="setting-item">
                  <Text strong className="setting-title" style={{ fontSize: '16px' }}>
                    Import your iCal calendar
                  </Text>
                  <Text type="secondary" className="setting-description" style={{ fontSize: '14px' }}>
                    Use your ical url to import your calendar.
                  </Text>
                  <div className="ical-url-container">
                    <Input
                      placeholder="Enter your iCal URL"
                      size="small"
                      style={{ width: '332px', marginTop: '12px' }}
                      value={icalUrl}
                      onChange={(e) => setIcalUrl(e.target.value)}
                    />
                    <Button 
                      type="primary" 
                      size="small" 
                      style={{ marginTop: '12px' }} 
                      disabled={!icalUrl}
                      onClick={() => {
                        setItem('settings', {
                          ...settings,
                          icalUrl: icalUrl || ''
                        })
                        handleImportCalendar(!!(icalUrl));
                        messageApi.success("Settings saved. Your calendar events will be imported in the background.");
                      }}
                    >
                      Import Calendar
                    </Button>
                  <Popconfirm
                    title="Are you sure you want to remove this calendar?"
                    onConfirm={() => {
                      setItem('settings', {
                        ...settings,
                        icalUrl: ''
                      })
                      setIcalUrl('');
                      handleRemoveCalendar();
                    }}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="default" danger size="small" style={{ marginTop: '12px' }} disabled={!icalUrl}>
                      Remove
                    </Button>
                  </Popconfirm>
                  </div>
                </div>  
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default SettingsModal

