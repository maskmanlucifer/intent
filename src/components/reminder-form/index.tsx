import React, { useState } from "react";
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

  const handleFinish = (values: any) => {
    const formattedValues: TReminderEvent = {
      title: values.title,
      description: values.description,
      date: values.date && dayjs(values.date).isValid() ? dayjs(values.date).format("YYYY-MM-DD") : "",
      time: values.time && dayjs(values.time).isValid() ? dayjs(values.time).format("HH:mm") : "",
      repeatRule: isRecurring ? values.repeatRule : undefined,
      updatedAt: Date.now(),
      isRecurring: isRecurring,
      id: initialData?.id || crypto.randomUUID(),
      timeZone: timeZone || dayjs.tz.guess(),
      repeatOn: isRecurring ? values.repeatOn : undefined
    };

    if (chrome.runtime) {
      chrome.runtime.sendMessage({ action: "ADD_REMINDER", reminder: formattedValues });
    }

    onSave();
  };

  // Helper function to safely parse initial values
  const getInitialDateValue = () => {
    if (!initialData?.date) return null;
    const parsed = dayjs(initialData.date, "YYYY-MM-DD");
    return parsed.isValid() ? parsed : null;
  };

  const getInitialTimeValue = () => {
    if (!initialData?.time) return null;
    const parsed = dayjs(initialData.time, "HH:mm");
    return parsed.isValid() ? parsed : null;
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        ...initialData,
        date: getInitialDateValue(),
        time: getInitialTimeValue(),
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
          <Switch onChange={setIsRecurring} size="small" />
        </Form.Item>
        <span style={{ marginLeft: '8px' }}>Recurring</span>
      </Form.Item>
      {isRecurring && (
        <Form.Item
          name="repeatRule"
          label="Repeat Every"
          rules={[{ required: true, message: "Please specify repeat interval" }]}
          initialValue="daily"
        >
          <Select placeholder="Select interval" value={repeatEvery} onChange={(value) => {
            setRepeatEvery(value);
          }}>
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
          initialValue={[0, 1, 2, 3, 4, 5, 6]}
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