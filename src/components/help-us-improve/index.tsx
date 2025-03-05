import React, { useState } from 'react';
import { Button, Input, message } from 'antd';
import './index.scss';

const { TextArea } = Input;

const HelpUsImprove = ({setPopoverState}: {setPopoverState: (value: boolean) => void}) => {
    const [feedback, setFeedback] = useState("");
    const [isError, setIsError] = useState(false);

    const [messageApi, contextHolder] = message.useMessage();

    const handleFeedbackSubmitClick = () => {
        fetch(
            "https://intent-server-git-main-lzbs-projects-77777663.vercel.app/addUserFeedback",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ feedback: feedback.trim() }),
            }
          ).then(() => {
            messageApi.success("Feedback send, Thank you for your feedback 😇.");
            setFeedback("");
            setPopoverState(false);
          }).catch(() => {
            messageApi.error("❗️Failed to send feedback. Please try again later.");
          })
    }

    return (
        <div className="help-us-improve">
            {contextHolder}
            <TextArea
                placeholder="Help us improve intent app"
                autoSize={{ minRows: 3, maxRows: 6 }}
                value={feedback}
                onChange={(e) => {
                    setFeedback(e.target.value);
                    if(e.target.value.length > 1000) {
                        setIsError(true);
                    } else {
                        setIsError(false);
                    }
                }}  
            />
            {isError && <div className='error-message'>
                Feedback length should be lesser than 1000 characters
            </div>}
            <div className='button-group'>
                <Button type="default" size='small' onClick={()=> {
                    setPopoverState(false);
                }}>
                    Cancel
                </Button>
                <Button type="primary" size='small' onClick={handleFeedbackSubmitClick} disabled={feedback.trim().length === 0}>
                    Send Feedback
                </Button>
            </div>
        </div>
    );
};

export default HelpUsImprove;