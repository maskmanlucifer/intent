/* eslint-disable no-undef */
import { Button, message, Popconfirm } from "antd";
import "./index.scss";
import { BREAK_TIME_DURATIONS, PAGES } from "../../constant";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { selectSettings, syncSettings } from "../../redux/sessionSlice";

const BreakReschedule = () => {
  const settings = useSelector(selectSettings);
  const { breakInterval = 90, workingHours = ["09:00", "17:00"] } = settings;

  const handleEndBreak = () => {
    syncSettings({
      activePage: PAGES.TODO,
    });

    chrome.alarms.clear("resetBreakAlarm");
    chrome.alarms.clear("genericAlarm", () => {
      const now = new Date();
      const currentEpoch = now.getTime();
      const breakDuration = breakInterval * 60 * 1000;
      const endHour = workingHours[1];
      const endTime = new Date();

      endTime.setHours(
        Number(endHour.split(":")[0]),
        Number(endHour.split(":")[1]),
        0,
        0,
      );

      const workingHourEnd = endTime.getTime();
      if (currentEpoch + breakDuration <= workingHourEnd) {
        chrome.alarms.create("genericAlarm", {
          when: currentEpoch + breakDuration,
        });
      }

      chrome.alarms.create("genericAlarm", {
        delayInMinutes: breakInterval,
      });
    });
    messageApi.success("Break ended successfully");
  };

  const [messageApi, contextHolder] = message.useMessage();

  const handleBreakPostpone = (time: number) => {
    syncSettings({
      activePage: PAGES.TODO,
    });

    chrome.alarms.clear("resetBreakAlarm");
    chrome.alarms.clear("genericAlarm", () => {
      chrome.alarms.create("genericAlarm", {
        delayInMinutes: time,
      });
    });

    messageApi.success(`Break postponed for ${time} minutes`);
  };

  return (
    <div className="break-reschedule">
      {contextHolder}
      <div className="break-postpone">
        Postpone break for
        {BREAK_TIME_DURATIONS.map((time) => (
          <Popconfirm
            icon={<InfoCircleOutlined style={{ color: "#155dfc" }} />}
            title="Postpone break"
            okText="Postpone"
            onConfirm={() => handleBreakPostpone(time)}
            cancelText="Stay on break"
            description={`Your break will be postponed for ${time}min`}
            key={time}
          >
            <Button size="small">{time}min</Button>
          </Popconfirm>
        ))}
      </div>
      <svg
        width="2"
        height="33"
        viewBox="0 0 2 33"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="0.710205"
          y1="32.0156"
          x2="0.710205"
          y2="3.8147e-06"
          stroke="#E4E7EC"
        />
      </svg>
      <div className="end-break">
        <Button danger type="link" size="small" onClick={handleEndBreak}>
          End Break
        </Button>
      </div>
    </div>
  );
};

export default BreakReschedule;
