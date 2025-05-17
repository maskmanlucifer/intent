import BreakReschedule from "../../components/break-reschedule";
import { ReactComponent as BreakImage } from "../../assets/images/break.svg";
import "./index.scss";
import BreakPill from "../../components/break-pill";

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
      <BreakImage className="break-hero-image" />
      <div className="break-pills-container">
        <BreakPill
          text="Take a walk"
          inlineStyle={{
            top: "calc(50% - 40px)",
            left: "26%",
            color: "#FEC84B",
          }}
        />
        <BreakPill
          text="Drink some water"
          inlineStyle={{
            color: "#9EA5D1",
          }}
        />

        <BreakPill
          text="Do nothing"
          inlineStyle={{
            color: "#BDB4FE",
          }}
        />
        <BreakPill
          text="Have a snack"
          inlineStyle={{
            color: "#FEC84B",
          }}
        />
      </div>
      <BreakReschedule />
    </div>
  );
};

export default Break;
