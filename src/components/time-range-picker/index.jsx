import React, { useState } from "react";
import { DatePicker } from "antd";
import "./index.scss";
const dayjs = require("dayjs");

const { RangePicker } = DatePicker;

const isCurrentRangeEligible = (startTime, endTime) => {
  const currentTime = dayjs();
  const start = dayjs(startTime).set("date", currentTime.date());
  const end = dayjs(endTime).set("date", currentTime.date());

  if (end.isBefore(start)) {
    end.add(1, "day");
  }

  return currentTime.isAfter(start) && currentTime.isBefore(end);
};

const TimeRangePicker = ({ startTime, endTime, onRangeChange }) => {
  const [range, setRange] = useState([
    startTime ? dayjs(startTime) : startTime,
    endTime ? dayjs(endTime) : endTime,
  ]);

  const onChange = (dates) => {
    const startEpoch = dates[0].valueOf();
    const endEpoch = dates[1].valueOf();
    setRange(dates);
    onRangeChange(startEpoch, endEpoch);
  };

  return (
    <div className="date-picker">
      {isCurrentRangeEligible(startTime, endTime) && (
        <div className="date-picker-indicator">
          <div className="circle"></div>
        </div>
      )}
      <RangePicker
        format="hh:mm A"
        onChange={onChange}
        showTime={{ format: "hh:mm A", minuteStep: 5 }}
        value={range}
        size="small"
        picker="time"
        placeholder={["12:00 AM", "12:00 AM"]}
        height={"60px"}
      />
    </div>
  );
};

export default TimeRangePicker;
