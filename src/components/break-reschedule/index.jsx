/* eslint-disable no-undef */
import { Button, Checkbox, message, Popconfirm } from "antd";
import "./index.scss";
import { BREAK_TIME_DURATIONS } from "../../constant";
import { InfoCircleOutlined, SmileTwoTone } from "@ant-design/icons";

const BreakReschedule = () => {
  const handleEndBreak = () => {
    chrome.storage.local.set({ breakActive: false });
    messageApi.success("Break ended successfully");
  };

  const [messageApi, contextHolder] = message.useMessage();


  const handleBreakPostpone = (time) => {
    chrome.storage.local.set({ breakActive: false });
    chrome.alarms.clear("genericAlarm", () => {
      chrome.alarms.create("genericAlarm", {
        delayInMinutes: time,
      });
      
      chrome.storage.local.get(["alarms"], (data) => {
        const alarms = data.alarms || {};
        alarms["genericAlarm"] = Date.now() + time * 60000;
        chrome.storage.local.set({ alarms });
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
            icon={<InfoCircleOutlined style={{ color: "#1677ff" }} />}
            title="Postpone break"
            okText="Postpone"
            onConfirm={() => handleBreakPostpone(time)}
            cancelText="Stay on break"
            description={`Your break will be postponed for ${time}min`}
            key={time}
          >
            <Button size="small">
              {time}min
            </Button>
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
        <Popconfirm
          title="How Did You Spend Your Break?"
          okText="End Break"
          cancelText="Stay on Break"
          onConfirm={handleEndBreak}
          description={
            <div className="end-break-feedbacks">
              <Checkbox>Took a walk</Checkbox>
              <Checkbox>Drank some water</Checkbox>
              <Checkbox>Did nothing just existed</Checkbox>
              <Checkbox>Listen to music</Checkbox>
              <Checkbox>Took a snack break</Checkbox>
              <Checkbox>Did some stretching</Checkbox>
            </div>
          }
          icon={<SmileTwoTone />}
        >
          <Button danger type="link" size="small">
            End Break
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
};

export default BreakReschedule;
