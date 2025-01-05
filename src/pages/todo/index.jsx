import React from "react";
import "./index.scss";
import { getTodaysDate } from "../../util";
import TodoItem from "../../components/todo-item";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewTask,
  clearCompletedTasks,
  selectCompletedTodoListLength,
  selectTodoList,
} from "../../redux/todoSlice";
import { Button, Empty, message, Popconfirm } from "antd";
import { MESSAGE_TYPES } from "../../constant";
import UserContextInfo from "../../components/context-info";

const Todo = () => {
  const todoItems = useSelector(selectTodoList);
  const completedTodoListLength = useSelector(selectCompletedTodoListLength);

  const dispatch = useDispatch();

  const [messageApi, contextHolder] = message.useMessage();

  const showMessage = ({ type, content }) => {
    messageApi.open({
      type,
      content,
    });
  };

  const handleAddTask = () => {
    dispatch(
      addNewTask({
        order: 1,
      }),
    );
  };

  const handleClearCompleted = () => {
    dispatch(clearCompletedTasks());
    showMessage({
      type: MESSAGE_TYPES.SUCCESS,
      content: "Completed tasks deleted successfully",
    });
  };

  return (
    <div className="todo-page">
      <h1 className="heading">Today</h1>{" "}
      <span className="sub-heading"> / {getTodaysDate()}</span>
      {contextHolder}
      {todoItems.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isFirstTask={todo.order === 1}
          isLastTask={todo.order === todoItems.length}
          showMessage={showMessage}
        />
      ))}
      {todoItems.length === 0 && (
        <div className="empty-state">
          <Empty
            image={
              <svg
                width="750"
                height="750"
                viewBox="0 0 750 750"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="750" height="750" fill="white" />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M512.128 547.68C403.891 569.992 333.667 505.742 190.711 505.742C141.86 505.742 23.7807 533.251 42.0634 363.259C52.4381 266.795 164.258 223.016 268.755 279.398C299.505 291.423 323.782 287.696 350.14 275.748C376.498 263.8 410.398 210.46 474.29 199.486C666.561 166.464 879.432 471.966 512.128 547.68Z"
                  fill="#1677ff"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M508.187 329.653C515.722 334.615 523.288 339.864 531.96 342.356C540.631 344.848 550.822 344.086 557.499 338.018C584.446 313.535 627.841 309.441 658.89 328.453C689.94 347.466 706.022 387.979 696.464 423.11C686.907 458.242 652.518 485.024 616.116 485.687C597.255 486.03 579.814 495.046 561.791 500.619C543.769 506.191 522.093 507.621 507.999 495.083C492.808 481.569 494.542 453.723 511.292 442.199C484.97 444.171 458.648 446.143 432.326 448.116C438.116 450.463 444.28 453.116 447.599 458.409C450.918 463.702 449.396 472.36 443.35 473.933C420.834 479.79 397.779 469.117 376.167 460.502C354.555 451.887 328.512 445.56 309.24 458.594C265.808 487.969 208.428 483.092 156.699 474.527C144.289 472.472 129.36 467.951 126.78 455.64C103.028 460.111 78.806 462.082 54.6434 461.509C48.7454 461.37 41.7827 460.441 39.0262 455.225C35.4546 448.466 41.866 440.798 48.11 436.388C67.1776 422.92 90.4574 415.511 113.801 415.479C120.451 415.47 124.89 408.522 126.583 402.091C128.276 395.661 128.75 388.506 133.068 383.449C118.385 381.245 102.83 385.727 91.5721 395.406C89.4825 397.203 85.9554 395.399 85.0783 392.787C84.2012 390.175 85.1048 387.333 86.0325 384.738C91.2273 370.209 97.7405 355.447 109.547 345.513C121.353 335.579 139.8 331.996 152.246 341.116C156.15 343.977 162.78 347.649 172.134 352.133C181.725 350.683 188.856 349.528 193.528 348.669C207.677 346.068 220.796 339.643 233.621 333.126C278.312 310.419 324.135 285.138 374.244 283.712C422.18 282.348 468.135 303.277 508.187 329.653ZM558.9 369.018L563.396 380.343C563.617 380.898 563.855 381.479 564.319 381.854C564.883 382.31 565.655 382.371 566.372 382.474C571.868 383.266 576.175 387.439 580.071 391.396C585.06 396.465 590.05 401.535 595.04 406.604C596.535 408.123 599.019 406.48 600.451 404.901C603.668 401.351 606.946 397.709 608.804 393.292C610.661 388.876 610.862 383.459 608.093 379.549C606.448 377.226 603.942 375.659 601.373 374.431C597.133 372.404 592.534 371.132 587.855 370.694C583.293 370.267 578.698 370.626 574.115 370.592C569.009 370.554 563.906 370.026 558.9 369.018Z"
                  fill="white"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M126.78 455.64C103.028 460.111 78.806 462.082 54.6434 461.509C47.69 451.376 122.935 432.706 125.663 445.014C127.821 454.747 127.92 461.076 126.78 455.64Z"
                  fill="#E7EAEE"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M491.175 422.811C493.713 422.539 503.8 420.067 514.39 421.213C520.081 418.291 547.355 420.586 563.636 423.776C574.086 425.823 600.571 427.184 610.189 432.09C626.884 440.606 627.267 445.87 624.755 446.998C617.619 450.2 609.022 451.779 604.401 451.864C596.082 452.015 579.345 444.325 560.986 439.508C552.787 437.356 546.762 435.529 542.014 433.756L542.789 433.417C532.519 438.053 521.895 438.792 511.292 442.199C484.97 444.171 458.648 446.143 432.326 448.116C438.116 450.463 351.009 418.748 376.167 414.121C377.718 413.836 379.427 413.662 381.281 413.585C404.841 412.597 451.652 427.035 491.175 422.811Z"
                  fill="#E7EAEE"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M256.104 383.659C256.425 384.233 256.182 384.996 255.7 385.443C255.218 385.89 254.555 386.083 253.909 386.204C249.15 387.097 243.951 384.501 241.806 380.161C241.567 379.677 241.358 379.146 241.431 378.611C241.504 378.076 241.953 377.559 242.492 377.591C243.877 379.119 245.283 380.665 247.008 381.796C248.732 382.927 250.841 383.616 252.87 383.243C254.021 383.032 255.532 382.638 256.104 383.659Z"
                  fill="#00160A"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M259.223 442.866C259.29 441.526 260.969 440.966 262.31 440.917C268.316 440.694 273.91 443.639 279.458 445.952C285.006 448.265 291.466 449.972 296.884 447.369C298.015 446.825 299.2 446.083 300.427 446.345C298.392 450.293 293.527 452.085 289.093 451.842C284.658 451.598 280.502 449.723 276.414 447.989C272.325 446.255 268.023 444.605 263.589 444.853C262.679 444.904 261.748 445.032 260.871 444.785C259.995 444.537 259.177 443.776 259.223 442.866Z"
                  fill="#00160A"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M269.738 454.108C265.595 452.899 260.75 453.504 257.347 450.849C256.931 450.525 256.521 450.099 256.504 449.572C256.482 448.833 257.278 448.292 258.017 448.273C258.756 448.254 259.45 448.591 260.144 448.846C262.678 449.777 265.467 449.652 268.112 450.191C272.08 451 275.574 453.262 279.312 454.821C283.049 456.38 287.532 457.178 291.012 455.107C292.416 454.272 294.261 453.025 295.425 454.171C291.636 458.487 285.222 460.286 279.742 458.569C276.252 457.476 273.249 455.132 269.738 454.108Z"
                  fill="#00160A"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M150.328 410.414C149.662 409.562 149.668 408.326 150.093 407.332C150.518 406.337 151.298 405.541 152.105 404.821C155.934 401.401 161.233 399.086 166.203 400.371C169.928 401.335 172.876 404.127 175.484 406.956C176.6 408.167 177.753 409.902 176.917 411.321C176.024 412.838 173.782 412.517 172.084 412.056C166.814 410.627 161.227 409.785 155.901 410.991C153.969 411.428 151.548 411.975 150.328 410.414Z"
                  fill="#00160A"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M236.653 461.765C237.387 462.209 237.286 463.395 236.674 463.996C236.062 464.598 235.16 464.771 234.314 464.916C229.572 465.729 224.831 466.542 220.089 467.355C219.099 467.525 217.992 467.671 217.167 467.099C216.341 466.527 216.317 464.936 217.3 464.729C223.245 463.474 229.237 462.442 235.26 461.636C235.731 461.573 236.245 461.519 236.653 461.765Z"
                  fill="#00160A"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M224.553 412.221C223.51 412.608 222.357 411.601 222.217 410.497C222.076 409.393 222.647 408.325 223.308 407.43C226.383 403.266 231.864 401.133 237.002 401.774C242.14 402.414 246.806 405.669 249.505 410.088C249.922 410.769 250.308 411.553 250.15 412.336C249.979 413.183 249.186 413.798 248.347 414.008C247.508 414.218 246.625 414.097 245.772 413.95C242.225 413.337 238.766 412.274 235.215 411.677C231.665 411.08 227.928 410.969 224.553 412.221Z"
                  fill="#00160A"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M157.505 383.721C157.909 382.539 159.618 382.831 160.843 383.074C164.662 383.832 168.397 381.703 171.71 379.658C172.152 379.385 172.741 379.904 172.731 380.423C172.721 380.943 172.347 381.376 171.982 381.745C168.679 385.083 163.74 387.367 159.274 385.914C158.276 385.589 157.166 384.714 157.505 383.721Z"
                  fill="#00160A"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M290.149 403.951C288.861 403.706 288.193 402.142 288.434 400.853C288.675 399.564 289.55 398.5 290.376 397.481C293.496 393.633 296.34 389.541 298.581 385.122C300.508 381.322 301.985 377.293 304.151 373.624C310.352 363.128 322.378 356.342 334.568 356.461C329.683 352.964 323.908 350.896 318.058 349.527C299.965 345.294 280.415 347.591 263.795 355.903C261.168 357.217 258.606 358.678 255.866 359.737C254.603 360.226 253.205 360.629 251.911 360.229C250.616 359.829 249.6 358.304 250.202 357.091C250.549 356.391 251.297 356 251.997 355.654C259.078 352.16 266.188 348.654 273.693 346.201C290.483 340.714 309.034 340.77 325.791 346.357C331.413 348.231 337.289 351.144 339.723 356.548C340.097 357.377 340.131 358.702 339.232 358.838C329.576 360.293 319.751 363.634 313.086 370.771C304.454 380.014 302.364 394.207 293.003 402.711C292.206 403.435 291.207 404.153 290.149 403.951Z"
                  fill="#00160A"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M432.326 448.116C438.116 450.463 444.28 453.116 447.599 458.409C450.918 463.702 449.396 472.36 443.35 473.933C420.834 479.79 397.779 469.117 376.167 460.502C354.555 451.887 328.512 445.56 309.24 458.594C265.808 487.969 208.428 483.092 156.699 474.527C144.289 472.472 129.36 467.951 126.78 455.64C103.028 460.111 78.806 462.082 54.6434 461.509C48.7454 461.37 41.7827 460.441 39.0262 455.225C35.4546 448.466 41.866 440.798 48.11 436.388C67.1776 422.92 90.4574 415.511 113.801 415.479C120.451 415.47 124.89 408.522 126.583 402.091C128.276 395.661 128.75 388.506 133.068 383.449C118.385 381.245 102.83 385.727 91.5721 395.406C89.4825 397.203 85.9554 395.399 85.0783 392.787C84.2012 390.175 85.1048 387.333 86.0325 384.738C91.2273 370.209 97.7405 355.447 109.547 345.513C121.353 335.579 134.421 331.809 152.165 339.889C156.812 342.005 163.449 345.765 172.075 351.168C181.609 350.379 188.76 349.546 193.528 348.669C207.677 346.068 220.796 339.643 233.621 333.126C278.312 310.419 324.135 285.138 374.244 283.712C422.18 282.348 468.135 303.277 508.187 329.653C515.722 334.615 523.288 339.864 531.96 342.356C540.631 344.848 550.822 344.086 557.499 338.018C584.446 313.535 627.841 309.441 658.89 328.453C689.94 347.466 706.022 387.979 696.464 423.11C686.907 458.242 652.518 485.024 616.116 485.687C597.255 486.03 579.814 495.046 561.791 500.619C543.769 506.191 522.093 507.621 507.999 495.083C492.808 481.569 494.542 453.723 511.292 442.199C484.97 444.171 458.648 446.143 432.326 448.116ZM584.69 399.555C571.407 386.194 551.589 379.661 532.964 382.503C541.982 379.701 551.645 378.995 560.974 380.456C534.529 342.266 491.85 318.412 448.35 302.116C427.21 294.197 405.195 287.687 382.626 287.188C353.245 286.54 324.61 296.089 297.472 307.367C267.686 319.745 238.874 334.325 210.094 348.89C218.974 348.436 227.974 352.338 233.713 359.129C209.607 349.189 181.054 350.722 158.151 363.185C158.261 358.632 161.9 354.411 166.387 353.632C153.282 342.085 133.148 339.282 117.387 346.811C101.626 354.34 91.1532 371.763 91.8996 389.214C105.21 378.206 124.408 374.801 140.692 380.562C131 396.735 125.996 415.682 126.439 434.531C131.532 432.386 137.808 433.395 141.972 437.029C137.32 437.529 132.667 438.03 128.015 438.53C128.212 440.653 128.408 442.776 128.605 444.898C133.528 444.173 138.451 443.447 143.373 442.721C140.205 446.366 135.738 448.857 130.972 449.636C130.374 455.7 134.583 461.422 139.865 464.462C145.146 467.502 151.349 468.408 157.383 469.258C172.422 471.377 187.462 473.496 202.501 475.614C199.013 471.681 198.442 465.347 196.165 460.968C193.216 455.296 188.957 452.986 186.822 445.462C186.086 442.866 184.388 439.211 186.764 437.56C187.762 436.867 189.061 436.84 190.277 436.839C195.241 436.834 200.206 436.829 205.17 436.823C206.775 436.822 208.452 436.837 209.87 437.587C214.167 439.86 212.81 446.573 209.601 450.224C206.392 453.875 201.804 456.791 200.708 461.526C199.582 466.391 202.857 471.434 207.207 473.886C211.556 476.338 216.732 476.753 221.722 476.924C232.24 477.284 242.786 476.796 253.226 475.468C279.507 472.124 307.507 461.415 319.705 437.897C318.967 443.825 315.87 449.427 311.241 453.203C330.388 446.15 352.072 446.229 371.168 453.421C389.278 460.242 406.461 473.415 425.667 471.051C424.844 470.383 424.525 469.23 423.702 468.562C421.461 466.745 418.717 465.414 416.476 463.597C423.324 466.102 430.172 468.607 437.02 471.112C436.242 469.973 437.02 468.824 435.571 467.081C434.123 465.339 430.959 462.231 429.095 459.5C434.281 461.009 438.826 464.608 441.484 469.31C443.7 468.768 445.916 468.225 448.132 467.683C436.881 452.496 421.326 440.533 403.759 433.557C395.236 430.173 384.67 426.122 383.604 417.014C402.761 435.514 430.214 443.406 456.84 443.97C483.466 444.533 509.738 438.484 535.682 432.47C529.742 429.468 524.387 425.315 520 420.31C549.139 436.636 581.742 446.745 615.006 449.769C613.119 446.571 611.232 443.373 609.346 440.175C613.472 440.292 617.328 443.422 618.291 447.436C620.361 446.621 622.43 445.806 624.499 444.992C621.621 442.17 618.743 439.348 615.865 436.526C620.495 435.41 625.689 438.981 626.306 443.703C628.243 442.696 629.842 441.05 630.794 439.085C627.352 436.48 623.91 433.874 620.468 431.269C625.686 431.163 630.922 432.908 635.032 436.124C630.17 424.303 613.717 424.021 602.788 417.392C595.519 412.982 590.684 405.584 584.69 399.555ZM559.948 365.591C566.449 367.167 573.256 365.946 579.945 365.966C586.876 365.987 593.779 367.362 600.273 369.783C604.281 371.277 608.288 373.285 610.894 376.678C615.025 382.056 614.665 389.857 611.783 395.996C608.901 402.134 603.914 406.986 599.032 411.694C609.28 416.265 619.528 420.837 629.776 425.409C632.672 426.7 635.802 428.216 637.126 431.097C639.415 436.079 634.971 441.544 630.406 444.58C616.165 454.052 596.797 455.214 581.525 447.512C571.728 442.571 560.867 440.214 550.14 437.904C544.283 436.643 538.183 435.382 532.365 436.809C528.236 437.822 524.343 440.17 520.094 440.026C516.297 439.897 513.345 443.175 511.12 446.255C503.799 456.387 497.763 469.335 502.05 481.078C504.997 489.152 512.466 494.968 520.605 497.728C528.745 500.488 537.542 500.566 546.12 500.02C556.855 499.337 567.792 497.633 577.22 492.452C583.358 489.078 588.852 484.243 595.642 482.522C603.789 480.457 612.372 483.228 620.754 482.616C627.429 482.128 633.746 479.516 639.857 476.788C654.786 470.125 669.717 462.259 680.306 449.805C696.096 431.232 699.851 404.017 692.306 380.836C684.762 357.656 666.933 338.597 645.595 326.809C639.728 323.568 633.551 320.814 627.047 319.196C611.433 315.313 594.343 318.371 580.698 326.896C573.673 331.286 567.569 337.005 560.685 341.613C553.802 346.221 545.71 349.771 537.465 348.966C543.819 355.988 550.745 363.36 559.948 365.591ZM68.4965 429.082C58.9323 432.811 49.3624 437.758 43.3008 446.043C46.0898 444.506 49.5918 444.335 52.5169 445.594C50.3846 446.648 48.2523 447.701 46.1199 448.755C44.9254 449.345 43.6906 449.967 42.861 451.01C42.0313 452.052 41.7313 453.644 42.5345 454.707C43.3377 455.77 45.3691 455.672 45.7576 454.398C47.1833 449.722 52.6884 446.733 57.3866 448.084C53.858 450.094 50.0049 452.516 49.0285 456.458C49.5561 458.234 52.1565 458.526 53.6849 457.479C55.2132 456.432 55.976 454.617 56.8549 452.986C57.7339 451.356 59.0104 449.686 60.8436 449.418C61.2305 449.361 61.6727 449.391 61.9413 449.675C62.4096 450.17 62.023 450.979 61.5824 451.499C60.5841 452.678 59.31 453.709 58.8192 455.173C58.3284 456.637 59.2055 458.684 60.7468 458.59C82.3894 457.268 103.991 455.279 125.511 452.626C126.289 450.941 123.926 449.573 122.088 449.324C117.422 448.691 112.622 449.065 108.11 450.412C108.943 447.639 111.744 445.823 114.593 445.303C117.441 444.783 120.365 445.317 123.211 445.851C123.233 443.853 122.86 441.85 122.119 439.993C117.594 439.899 113.109 438.387 109.449 435.724C112.508 434.58 116.062 434.84 118.921 436.419C120.286 437.173 121.303 434.966 121.326 433.407C121.399 428.339 121.472 423.271 121.546 418.203C103.418 418.798 85.3954 422.494 68.4965 429.082ZM566.372 382.474C571.868 383.266 576.175 387.439 580.071 391.396C585.06 396.465 590.05 401.535 595.04 406.604C596.535 408.123 599.019 406.48 600.451 404.901C603.668 401.351 606.946 397.709 608.804 393.292C610.661 388.876 610.862 383.459 608.093 379.549C606.448 377.226 603.942 375.659 601.373 374.431C597.133 372.404 592.534 371.132 587.855 370.694C583.293 370.267 578.698 370.626 574.115 370.592C569.009 370.554 563.906 370.026 558.9 369.018C560.399 372.793 561.898 376.568 563.396 380.343C563.617 380.898 563.855 381.479 564.319 381.854C564.883 382.31 565.655 382.371 566.372 382.474Z"
                  fill="#00160A"
                />
              </svg>
            }
            imageStyle={{ height: 200, width: 200 }}
            description={"All clear, Take a breather. 🍃"}
          >
            <Button type="primary" size="small" onClick={handleAddTask}>
              Add new task
            </Button>
          </Empty>
        </div>
      )}
      {completedTodoListLength > 0 && (
        <Popconfirm
          title="Delete the completed tasks?"
          description="This action cannot be undone."
          onConfirm={handleClearCompleted}
          onCancel={() => {}}
          okText="Yes"
          cancelText="No"
          icon={null}
          overlayStyle={{ width: "250px" }}
        >
          <Button size="small" type="primary" className="competed-task-rm-btn">
            Delete completed tasks
          </Button>
        </Popconfirm>
      )}
      <UserContextInfo />
    </div>
  );
};

export default Todo;
