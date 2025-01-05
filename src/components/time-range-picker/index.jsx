import React, { useState } from "react";
import { DatePicker } from "antd";
import "./index.scss";
const dayjs = require("dayjs");

const { RangePicker } = DatePicker;

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
      <RangePicker
        format="HH:mm"
        onChange={onChange}
        value={range}
        size="small"
        picker="time"
        placeholder={["00:00", "00:00"]}
      />
    </div>
  );
};

export default TimeRangePicker;
