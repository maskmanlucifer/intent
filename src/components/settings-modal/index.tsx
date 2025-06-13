"use client";
import { useState } from "react";
import {
  Modal,
  Menu,
  Typography,
  TimePicker,
  Select,
  Input,
  Button,
  Popconfirm,
  message,
  Switch,
  Radio,
  Alert,
} from "antd";
import { SettingOutlined } from "@ant-design/icons";
import "./index.scss";
import dayjs from "dayjs";
import { ReactComponent as GeneralSettingsIcon } from "../../assets/icons/general-settings.svg";
import { ReactComponent as MusicIcon } from "../../assets/icons/music.svg";
import { ReactComponent as CalendarIcon } from "../../assets/icons/calendar.svg";
import {
  handleRemoveCalendar,
  handleImportCalendar,
} from "../../helpers/events.helper";
import { handleBreakSchedule } from "../../helpers/break.helper";
import { useSelector } from "react-redux";
import {
  selectSettings,
  selectMusicMode,
  selectShowMusicWidget,
  syncSettings,
} from "../../redux/sessionSlice";
import TimeZonePicker from "../time-zone-picker";

const format = "HH:mm";

const { Text } = Typography;

interface SettingsModalProps {
  visible?: boolean;
  onClose?: () => void;
  tab?: string;
}

const SettingsModal = ({
  visible = true,
  onClose,
  tab = "general",
}: SettingsModalProps) => {
  const [selectedMenu, setSelectedMenu] = useState(tab);
  const settings = useSelector(selectSettings);
  const [messageApi, contextHolder] = message.useMessage();
  const musicMode = useSelector(selectMusicMode);
  const showMusicWidget = useSelector(selectShowMusicWidget);

  const handleWorkingHoursChange = (value: string, index: number) => {
    const newWorkingHours = [...(settings.workingHours || [])];
    newWorkingHours[index] = value;
    syncSettings({
      workingHours: newWorkingHours,
    });
    handleBreakSchedule(true);
  };

  const handleShowMusicWidgetChange = (value: boolean) => {
    const { isMusicPlaying } = settings;

    syncSettings({
      showCustomAudioPlayer: value,
    });

    if (value) {
      messageApi.success(
        "Music widget enabled. You can now listen to music in the app.",
      );
    } else {
      messageApi.success(
        "Music widget disabled. You will no longer hear music in the app.",
      );
      if (isMusicPlaying && chrome.runtime)
        chrome.runtime.sendMessage({ action: "PAUSE_MUSIC" });
    }
  };

  const handleBreakIntervalChange = (value: string) => {
    syncSettings({
      breakInterval: parseInt(value),
    });
    handleBreakSchedule(true);
  };

  const handleEventReminderChange = (value: boolean) => {
    syncSettings({
      sendEventReminder: value,
    });
  };

  const handleTimeZoneChange = (value: string) => {
    syncSettings({
      timezone: value,
    });
    if (settings.icalUrl) {
      handleImportCalendar(!!settings.icalUrl);
    }
  };

  const handleBreakReminderChange = (value: boolean) => {
    syncSettings({
      sendBreakReminder: value,
    });
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
      key: "music",
      label: "Music",
      icon: <MusicIcon className="music-icon" />,
    },
  ];

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
                  <Text
                    strong
                    className="setting-title"
                    style={{ fontSize: "16px" }}
                  >
                    Set working hours
                  </Text>
                  <Text
                    type="secondary"
                    className="setting-description"
                    style={{ fontSize: "14px" }}
                  >
                    Set your working hours (Reminders will be scheduled within
                    these hours).
                  </Text>
                  <div className="time-picker-container">
                    <TimePicker
                      defaultValue={dayjs(
                        settings.workingHours?.[0] || "09:00",
                        format,
                      )}
                      format={format}
                      className="time-picker"
                      placeholder="Start Time"
                      size="small"
                      minuteStep={15}
                      onChange={(value) => {
                        const formattedValue = value?.format("HH:mm");
                        handleWorkingHoursChange(formattedValue, 0);
                      }}
                      showNow={false}
                    />
                    <TimePicker
                      defaultValue={dayjs(
                        settings.workingHours?.[1] || "17:00",
                        format,
                      )}
                      format={format}
                      className="time-picker"
                      placeholder="End Time"
                      size="small"
                      showNow={false}
                      minuteStep={15}
                      onChange={(value) => {
                        const formattedValue = value?.format("HH:mm");
                        handleWorkingHoursChange(formattedValue, 1);
                      }}
                    />
                  </div>
                </div>
                <div className="setting-item">
                  <div className="toggle-container">
                    <Text style={{ fontSize: "16px" }} strong>
                      {" "}
                      Get break reminders
                    </Text>{" "}
                    <Switch
                      size="small"
                      checked={settings.sendBreakReminder}
                      onChange={handleBreakReminderChange}
                    />
                  </div>
                  <Text
                    type="secondary"
                    className="setting-description"
                    style={{ fontSize: "14px" }}
                  >
                    Enable this to receive break reminder notifications <br />
                    <b>Note:</b> Your page will be greyed out during break reminders.
                  </Text>
                </div>
                {settings.sendBreakReminder && <div className="setting-item">
                  <Text
                    strong
                    className="setting-title"
                    style={{ fontSize: "16px" }}
                  >
                    Set break interval
                  </Text>
                  <Text
                    type="secondary"
                    className="setting-description"
                    style={{ fontSize: "14px" }}
                  >
                    Specify the duration between breaks to help manage your work
                    schedule and ensure adequate recharge time.
                  </Text>
                  <Select
                    defaultValue={settings.breakInterval?.toString() || "90"}
                    options={[
                      { value: "60", label: "60 minutes" },
                      { value: "90", label: "90 minutes" },
                      { value: "120", label: "120 minutes" },
                    ]}
                    size="small"
                    style={{ width: "200px", marginTop: "12px" }}
                    onChange={(value) => {
                      handleBreakIntervalChange(value);
                    }}
                  />
                </div>}
              </div>
            </div>
          )}
          {selectedMenu === "subscription" && (
            <div className="settings-panel">
              <div className="panel-title">Subscription</div>
              <div className="setting-items">
                <div className="setting-item">
                  <Text
                    strong
                    className="setting-title"
                    style={{ fontSize: "16px" }}
                  >
                    Premium plan
                  </Text>
                  <Text
                    type="secondary"
                    className="setting-description"
                    style={{ fontSize: "14px" }}
                  >
                    You have access to all features of the app.
                  </Text>
                </div>
              </div>
            </div>
          )}
          {selectedMenu === "calendar" && (
            <div className="settings-panel">
              <div className="panel-title">Calendar (Beta)</div>
              <div className="setting-items">
                <div className="setting-item">
                  <div className="toggle-container">
                    <Text style={{ fontSize: "16px" }} strong>
                      {" "}
                      Set time zone
                    </Text>{" "}
                  </div>
                  <Text
                    type="secondary"
                    className="setting-description"
                    style={{ fontSize: "14px" }}
                  >
                    Set your time zone to get accurate event timings.
                  </Text>

                  <div className="time-zone-picker-container">
                    <TimeZonePicker
                      value={settings.timezone}
                      onChange={handleTimeZoneChange}
                    />
                  </div>
                </div>
                <div className="setting-item">
                  <Text
                    strong
                    className="setting-title"
                    style={{ fontSize: "16px" }}
                  >
                    Import your calendar
                  </Text>
                  <Text
                    type="secondary"
                    className="setting-description"
                    style={{ fontSize: "14px" }}
                  >
                    Use your iCal URL or ICS file URL to import your calendar.
                  </Text>
                  <div className="ical-url-container">
                    <Input
                      placeholder="Enter your iCal URL"
                      size="small"
                      style={{ width: "240px", marginTop: "12px" }}
                      value={settings.icalUrl}
                      onChange={(e) =>
                        syncSettings({
                          icalUrl: e.target.value,
                        })
                      }
                    />
                    <Button
                      type="primary"
                      size="small"
                      style={{ marginTop: "12px" }}
                      disabled={!settings.icalUrl}
                      onClick={() => {
                        syncSettings({
                          icalUrl: settings.icalUrl || "",
                        });
                        handleImportCalendar(!!settings.icalUrl);
                        messageApi.success(
                          "Settings saved. Your calendar events will be imported in the background.",
                        );
                      }}
                    >
                      Import calendar
                    </Button>
                    <Popconfirm
                      title="Are you sure you want to remove this calendar?"
                      onConfirm={() => {
                        syncSettings({
                          icalUrl: "",
                        });
                        handleRemoveCalendar();
                      }}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        type="default"
                        danger
                        size="small"
                        style={{ marginTop: "12px" }}
                        disabled={!settings.icalUrl}
                      >
                        Remove
                      </Button>
                    </Popconfirm>
                  </div>
                  <Alert
                    className="ical-alert"
                    description="The app currently allows calendar imports only via iCal and ICS file URLs."
                    type="info"
                  />
                </div>
                <div className="setting-item">
                  <div className="toggle-container">
                    <Text style={{ fontSize: "16px" }} strong>
                      {" "}
                      Get event reminders
                    </Text>{" "}
                    <Switch
                      size="small"
                      checked={settings.sendEventReminder}
                      onChange={handleEventReminderChange}
                    />
                  </div>
                  <Text
                    type="secondary"
                    className="setting-description"
                    style={{ fontSize: "14px" }}
                  >
                    Enable this to receive reminders for upcoming calendar
                    events while browsing your current page.
                  </Text>
                </div>
              </div>
            </div>
          )}
          {selectedMenu === "music" && (
            <div className="settings-panel">
              <div className="panel-title">Music</div>
              <div className="setting-items">
                <div className="setting-item">
                  <div className="toggle-container">
                    <Text style={{ fontSize: "16px" }}>
                      Enable music widget in app
                    </Text>{" "}
                    <Switch
                      size="small"
                      checked={showMusicWidget}
                      onChange={handleShowMusicWidgetChange}
                    />
                  </div>
                  <Text
                    type="secondary"
                    className="setting-description"
                    style={{ fontSize: "14px" }}
                  >
                    Music player will be added to the bottom right corner of the
                    page.
                  </Text>
                </div>
                {showMusicWidget && <div className="setting-item">
                  <Text
                    strong
                    className="setting-title"
                    style={{ fontSize: "16px" }}
                  >
                    Set music mode
                  </Text>
                  <Text
                    type="secondary"
                    className="setting-description"
                    style={{ fontSize: "14px" }}
                  >
                    Pick the music that gets you in the zone.
                  </Text>
                  <div className="music-choice">
                    <Radio.Group
                      style={{
                        display: "flex",
                        gap: "6px",
                        flexDirection: "column",
                      }}
                      value={musicMode}
                      onChange={(e) => {
                        const musicMode = e.target.value;
                        syncSettings({ musicMode });
                        if (settings.isMusicPlaying) {
                          chrome.runtime.sendMessage({
                            action: "PLAY_MUSIC",
                            mode: musicMode,
                          });
                        }
                      }}
                      options={[
                        { label: "Jazz", value: "JAZZ" },
                        { label: "Nature", value: "NATURE" },
                        { label: "Lo-fi", value: "LO_FI" },
                      ]}
                    />
                  </div>
                </div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
