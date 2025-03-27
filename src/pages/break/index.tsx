import BreakPill from "../../components/break-pill";
import BreakReschedule from "../../components/break-reschedule";
import "./index.scss";

const Break = () => {
  return (
    <div className="break-page">
      <div className="break-header">
        <div>Take</div>
        <div>a</div>
        <div className="heading-with-dot">
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
        </div>
      </div>
      <BreakPill
        text="Take a walk"
          inlineStyle={{
          top: "24%",
          left: "8%",
          color: "#FEC84B",
        }}
      />
      <BreakPill
        text="Drink some water"
        inlineStyle={{
          top: "50%",
          left: "26%",
          color: "#9EA5D1",
        }}
      />

      <BreakPill
        text="Do nothing"
        inlineStyle={{
          top: "20%",
          left: "44%",
          color: "#BDB4FE",
        }}
      />
      <BreakPill
        text="Play some music"
        inlineStyle={{
          top: "50%",
          left: "63%",
          color: "#FEA3B4",
        }}
      />
      <BreakPill
        text="Have a snack"
        inlineStyle={{
          top: "30%",
          left: "83%",
          color: "#FEC84B",
        }}
      />
      <BreakReschedule />
    </div>
  );
};

export default Break;
