import { Dropdown, Modal } from "antd";
import "./index.scss";
import { useState } from "react";
import KeyboardShortcuts from "../keyboard-shortcuts";

const InfoDropdown = () => {
  const [modalData, setModalData] = useState({
    visible: false,
    type: "info",
    title: "",
    content: "",
  });

  const openMail = (subject) => {
    window.open(`mailto:brightpixellabs@gmail.com?subject=${subject}`, "_blank");
  };

  // const handleHowItWorks = () => {
  //   setModalData({
  //     visible: true,
  //     type: "video",
  //     title: "How Intent works",
  //   });
  // };

  const items = [
    {
      key: "1",
      label: (
        <button
          target="_blank"
          rel="noopener noreferrer"
          className="info-dropdown-items"
          onClick={() =>
            setModalData({
              visible: true,
              type: "shortcut",
              title: "Keyboard shortcuts",
            })
          }
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.66667 1.33333L2 9.33333H8L7.33333 14.6667L14 6.66666H8L8.66667 1.33333Z"
              stroke="#027A48"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Keyboard shortcuts
        </button>
      ),
    },
    {
      key: "2",
      label: (
        <button
          target="_blank"
          rel="noopener noreferrer"
          className="info-dropdown-items"
          onClick={() => openMail("Feature request for Intent")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_80_237)">
              <path
                d="M8.88316 7.11683L3.62704 12.373M4.19428 8.55836L1.61975 7.95023C1.3365 7.88332 1.23688 7.53167 1.44207 7.32574L3.4895 5.2783C3.62704 5.14077 3.81364 5.06196 4.00917 5.06047L6.31755 5.0404M9.22514 2.39896C10.9432 3.57062 12.4294 5.05676 13.601 6.77485M7.44089 11.8057L8.04902 14.3802C8.11593 14.6635 8.46758 14.7631 8.67351 14.5579L10.7209 12.5105C10.8585 12.373 10.9373 12.1863 10.9388 11.9908L10.9588 9.68244M14.0419 5.56676L14.6426 2.67626C14.8062 1.8897 14.1103 1.19384 13.3237 1.3574L10.4332 1.9581C9.58199 2.13504 8.80138 2.55657 8.1873 3.17139L5.81573 5.54222C4.91096 6.44699 4.32215 7.62014 4.13629 8.88622L4.12812 8.94049C4.01065 9.74861 4.28127 10.5642 4.85818 11.1418C5.43509 11.7187 6.25138 11.9893 7.0595 11.8711L7.11377 11.863C8.37985 11.6778 9.553 11.0883 10.4578 10.1835L12.8286 7.81269C13.4434 7.19861 13.865 6.418 14.0419 5.56676Z"
                stroke="#5925DC"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_80_237">
                <rect width="16" height="16" fill="white" />
              </clipPath>
            </defs>
          </svg>
          Request a feature
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="#000000" fill="none">
    <path d="M16.5 7.5L6 18" stroke="#000000" stroke-width="1.5" stroke-linecap="round" />
    <path d="M8 6.18791C8 6.18791 16.0479 5.50949 17.2692 6.73079C18.4906 7.95209 17.812 16 17.812 16" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
        </button>
      ),
    },
    {
      key: "3",
      label: (
        <button
          target="_blank"
          rel="noopener noreferrer"
          className="info-dropdown-items"
          onClick={() => openMail("Bug report for Intent")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_80_241)">
              <path
                d="M7.99998 5.33334V8.00001M7.99998 10.6667H8.00665M14.6666 8.00001C14.6666 11.6819 11.6819 14.6667 7.99998 14.6667C4.31808 14.6667 1.33331 11.6819 1.33331 8.00001C1.33331 4.31811 4.31808 1.33334 7.99998 1.33334C11.6819 1.33334 14.6666 4.31811 14.6666 8.00001Z"
                stroke="#C4320A"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_80_241">
                <rect width="16" height="16" fill="white" />
              </clipPath>
            </defs>
          </svg>
          Report a bug
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="#000000" fill="none">
    <path d="M16.5 7.5L6 18" stroke="#000000" stroke-width="1.5" stroke-linecap="round" />
    <path d="M8 6.18791C8 6.18791 16.0479 5.50949 17.2692 6.73079C18.4906 7.95209 17.812 16 17.812 16" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
        </button>
      ),
    },

    // {
    //   key: "4",
    //   label: (
    //     <button
    //       target="_blank"
    //       rel="noopener noreferrer"
    //       className="info-dropdown-items"
    //       onClick={handleHowItWorks}
    //     >
    //       <svg
    //         width="16"
    //         height="16"
    //         viewBox="0 0 16 16"
    //         fill="none"
    //         xmlns="http://www.w3.org/2000/svg"
    //       >
    //         <g clip-path="url(#clip0_80_257)">
    //           <path
    //             d="M5.33335 12L0.666687 14.6667V4.00001L5.33335 1.33334M5.33335 12L10.6667 14.6667M5.33335 12V1.33334M10.6667 14.6667L15.3334 12V1.33334L10.6667 4.00001M10.6667 14.6667V4.00001M10.6667 4.00001L5.33335 1.33334"
    //             stroke="#1677ff"
    //             strokeWidth="1.5"
    //             strokeLinecap="round"
    //             strokeLinejoin="round"
    //           />
    //         </g>
    //         <defs>
    //           <clipPath id="clip0_80_257">
    //             <rect width="16" height="16" fill="white" />
    //           </clipPath>
    //         </defs>
    //       </svg>
    //       How it works
    //     </button>
    //   ),
    // },
  ];

  return (
    <div className="info-dropdown">
      <Dropdown menu={{ items }} placement="topLeft" trigger={["click"]}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 18.3333C14.6024 18.3333 18.3334 14.6024 18.3334 9.99999C18.3334 5.39762 14.6024 1.66666 10 1.66666C5.39765 1.66666 1.66669 5.39762 1.66669 9.99999C1.66669 14.6024 5.39765 18.3333 10 18.3333Z"
            stroke="black"
            strokeWidth="1.25"
          />
          <path
            d="M8.33331 7.50001C8.33331 6.57954 9.07948 5.83334 9.99998 5.83334C10.9205 5.83334 11.6666 6.57954 11.6666 7.50001C11.6666 7.8318 11.5697 8.14095 11.4026 8.40068C10.9045 9.17476 9.99998 9.91284 9.99998 10.8333V11.25"
            stroke="black"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <path
            d="M9.99335 14.1667H10.0008"
            stroke="black"
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Dropdown>
      <Modal
        open={modalData.visible && modalData.type === "shortcut"}
        title={modalData.title}
        onOk={() => setModalData({ ...modalData, visible: false })}
        onCancel={() => setModalData({ ...modalData, visible: false })}
        cancelButtonProps={{ style: { display: "none" } }}
      >
        <KeyboardShortcuts />
      </Modal>
      <Modal
        open={modalData.visible && modalData.type === "video"}
        title={modalData.title}
        onOk={() => setModalData({ ...modalData, visible: false })}
        onCancel={() => setModalData({ ...modalData, visible: false })}
        okText="Got it"
        cancelButtonProps={{ style: { display: "none" } }}
        width={650}
      >
        <iframe
          width="600"
          height="400"
          src="https://www.youtube.com/embed/z7Uv_A4bG-U?si=78QLA-9H12Lwz-P0"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </Modal>
    </div>
  );
};

export default InfoDropdown;
