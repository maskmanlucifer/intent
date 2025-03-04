import BreakPill from "../../components/break-pill";
import BreakReschedule from "../../components/break-reschedule";
import "./index.scss";

const Break = () => {
  return (
    <div className="break-page">
      <div className="break-header">
        <h1>Take</h1>
        <h1>a</h1>
        <h1 className="heading-with-dot">
          break{" "}
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10Z"
              fill="#027A48"
            />
          </svg>
        </h1>
      </div>
      <BreakPill
        text="Take a walk"
          inlineStyle={{
          top: "20%",
          left: "50%",
          background: "#FFF6ED",
          borderColor: "#FEB273",
          color: "#FEC84B",
        }}
      />
      <BreakPill
        text="Drink some water"
        inlineStyle={{
          top: "35%",
          left: "65%",
          background: "#F8F9FC",
          borderColor: "#9EA5D1",
          color: "#9EA5D1",
        }}
      />

      <BreakPill
        text="Do nothing just exist"
        inlineStyle={{
          top: "40%",
          left: "40%",
          background: "#F4F3FF",
          borderColor: "#BDB4FE",
          color: "#BDB4FE",
        }}
      />
      <BreakPill
        text="Listen to music"
        inlineStyle={{
          top: "47.5%",
          left: "60%",
          background: "#FFF1F3",
          borderColor: "#FEA3B4",
          color: "#FEA3B4",
        }}
      />
      <BreakPill
        text="Take a snack break"
        inlineStyle={{
          top: "60%",
          left: "43%",
          background: "#FFF6ED",
          borderColor: "#FEB273",
          color: "#FEC84B",
        }}
      />
      <BreakReschedule />
    </div>
  );
};

export default Break;
