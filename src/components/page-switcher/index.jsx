import { Segmented } from "antd";
import { PAGE_SWITCHER_OPTIONS } from "../../constant";
import "./index.scss";

const PageSwitcher = ({ page, setPage }) => {
  return (
    <Segmented
      value={page}
      options={[...PAGE_SWITCHER_OPTIONS]}
      onChange={(value) => {
        setPage(value);
      }}
      className="page-switcher"
    />
  );
};

export default PageSwitcher;
