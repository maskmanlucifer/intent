import React, { useState, useEffect } from "react";
import { Button, Input, DatePicker, TimePicker, Switch, Form, Select } from "antd";
import { TReminderEvent } from "../../types";
import { useSelector } from "react-redux";
import { selectTimezone } from "../../redux/sessionSlice";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

// Extend dayjs with timezone plugin
dayjs.extend(utc);
dayjs.extend(timezone);

interface ReminderFormProps {
  onCancel: () => void;
  isEditing: boolean;
  initialData: TReminderEvent | undefined;
  onSave: () => void;
}

const ReminderForm = ({ onCancel, isEditing, initialData, onSave }: ReminderFormProps) => {
  const [form] = Form.useForm();
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false);
  const [repeatEvery, setRepeatEvery] = useState(initialData?.repeatRule || "daily");
  const timeZone = useSelector(selectTimezone);

  // Update form when initial data changes
  useEffect(() => {
    if (initialData) {
      setIsRecurring(initialData.isRecurring || false);
      setRepeatEvery(initialData.repeatRule || "daily");
      
      form.setFieldsValue({
        ...initialData,
        date: getInitialDateValue(),
        time: getInitialTimeValue(),
        isRecurring: initialData.isRecurring || false,
        repeatRule: initialData.repeatRule || "daily",
        repeatOn: initialData.repeatOn || (initialData.repeatRule === "daily" ? [0, 1, 2, 3, 4, 5, 6] : undefined)
      });
    }
  }, [initialData, form]);

  const handleFinish = (values: any) => {
    const timezone = timeZone || dayjs.tz.guess();
  
    // Combine date and time FIRST, then convert to UTC
    let utcDate = "";
    let utcTime = "";
  
    if (values.date && values.time && dayjs(values.date).isValid() && dayjs(values.time).isValid()) {
      // Extract date components from date picker
      const selectedDate = dayjs(values.date);
      const dateStr = selectedDate.format("YYYY-MM-DD");
      
      // Extract time components from time picker  
      const selectedTime = dayjs(values.time);
      const timeStr = selectedTime.format("HH:mm");
      
      // Combine date and time in user's timezone
      const localDateTime = dayjs.tz(`${dateStr} ${timeStr}`, timezone);
      
      // Convert the combined datetime to UTC and split
      const utcDateTime = localDateTime.utc();
      utcDate = utcDateTime.format("YYYY-MM-DD");
      utcTime = utcDateTime.format("HH:mm");
    }
  
    const formattedValues: TReminderEvent = {
      title: values.title,
      description: values.description,
      date: utcDate,
      time: utcTime,
      repeatRule: isRecurring ? values.repeatRule : undefined,
      updatedAt: Date.now(),
      isRecurring: isRecurring,
      id: initialData?.id || crypto.randomUUID(),
      timeZone: timezone,
      repeatOn: isRecurring && values.repeatRule === "daily" ? values.repeatOn : undefined
    };
  
    if (chrome.runtime) {
      chrome.runtime.sendMessage({ action: "ADD_REMINDER", reminder: formattedValues });
    }
  
    onSave();
  };

  // Helper function to safely parse initial values
  const getInitialDateValue = () => {
    if (!initialData?.date) return null;
    const timezone = timeZone || dayjs.tz.guess();
    
    // If we have stored UTC date and time, combine them and convert to user's timezone
    if (initialData.time) {
      const utcDateTime = dayjs.utc(`${initialData.date} ${initialData.time}`);
      const localDateTime = utcDateTime.tz(timezone);
      return localDateTime.isValid() ? localDateTime : null;
    } else {
      // If no time, just parse the date in the user's timezone to avoid date shifting
      const localDate = dayjs.tz(initialData.date, timezone);
      return localDate.isValid() ? localDate : null;
    }
  };

  const getInitialTimeValue = () => {
    if (!initialData?.time) return null;
    const timezone = timeZone || dayjs.tz.guess();
    
    // If we have stored UTC time, convert it to user's timezone for display
    // Combine with a dummy date to handle time conversion properly
    const utcDateTime = dayjs.utc(`${initialData.date || '2023-01-01'} ${initialData.time}`);
    const localDateTime = utcDateTime.tz(timezone);
    
    return localDateTime.isValid() ? localDateTime : null;
  };

  const handleRecurringChange = (checked: boolean) => {
    setIsRecurring(checked);
    if (!checked) {
      // Clear recurring-related fields when disabled
      form.setFieldsValue({
        repeatRule: undefined,
        repeatOn: undefined
      });
    } else {
      // Set default values when enabled
      form.setFieldsValue({
        repeatRule: "daily",
        repeatOn: [0, 1, 2, 3, 4, 5, 6]
      });
      setRepeatEvery("daily");
    }
  };

  const handleRepeatRuleChange = (value: string) => {
    setRepeatEvery(value);
    // Clear repeatOn when not daily
    if (value !== "daily") {
      form.setFieldsValue({ repeatOn: undefined });
    } else {
      form.setFieldsValue({ repeatOn: [0, 1, 2, 3, 4, 5, 6] });
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        ...initialData,
        date: getInitialDateValue(),
        time: getInitialTimeValue(),
        isRecurring: initialData?.isRecurring || false,
        repeatRule: initialData?.repeatRule || "daily",
        repeatOn: initialData?.repeatOn || [0, 1, 2, 3, 4, 5, 6]
      }}
      onFinish={handleFinish}
    >
      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true, message: "Please enter a title" }]}
      >
        <Input placeholder="Enter title" />
      </Form.Item>
      <Form.Item
        name="description"
        label="Description"
        rules={[{ message: "Please enter a description" }]}
      >
        <Input.TextArea placeholder="Enter description" />
      </Form.Item>
      <Form.Item
        name="date"
        label="Date"
        rules={[{ required: true, message: "Please select a date" }]}
      >
        <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
      </Form.Item>
      <Form.Item
        name="time"
        label="Time"
        rules={[{ required: true, message: "Please select a time" }]}
      >
        <TimePicker style={{ width: "100%" }} format="HH:mm" />
      </Form.Item>
      <Form.Item label="Recurring" style={{ display: 'flex', alignItems: 'center' }}>
        <Form.Item name="isRecurring" valuePropName="checked" noStyle>
          <Switch onChange={handleRecurringChange} size="small" />
        </Form.Item>
        <span style={{ marginLeft: '8px' }}>Recurring</span>
      </Form.Item>
      {isRecurring && (
        <Form.Item
          name="repeatRule"
          label="Repeat Every"
          rules={[{ required: true, message: "Please specify repeat interval" }]}
        >
          <Select 
            placeholder="Select interval" 
            value={repeatEvery} 
            onChange={handleRepeatRuleChange}
          >
            <Select.Option value="daily">Daily</Select.Option>
            <Select.Option value="weekly">Weekly</Select.Option>
            <Select.Option value="monthly">Monthly</Select.Option>
          </Select>
        </Form.Item>
      )}
      {isRecurring && repeatEvery === "daily" && (
        <Form.Item
          name="repeatOn"
          label="Repeat On"
          rules={[{ required: true, message: "Please specify repeat days" }]}
        >
          <Select
            placeholder="Select days"
            mode="multiple"
            style={{ width: "100%" }}
            options={[
              { value: 0, label: "Sun" },
              { value: 1, label: "Mon" },
              { value: 2, label: "Tue" },
              { value: 3, label: "Wed" },
              { value: 4, label: "Thu" },
              { value: 5, label: "Fri" },
              { value: 6, label: "Sat" }
            ]}
          />
        </Form.Item>
      )}
      <Form.Item>
        <Button type="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="primary" htmlType="submit" style={{ marginLeft: "8px" }}>
          {isEditing ? "Update Reminder" : "Create Reminder"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ReminderForm;