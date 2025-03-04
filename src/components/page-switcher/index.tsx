import { Segmented } from "antd";
import { PAGE_SWITCHER_OPTIONS } from "../../constant";
import "./index.scss";
import { Pages } from "../../types";

interface PageSwitcherProps {
  page: string;
  setPage: (value: Pages) => void;
}

const PageSwitcher = ({ page, setPage }: PageSwitcherProps) => {
  return (
    <Segmented
      value={page}
      options={[...PAGE_SWITCHER_OPTIONS]}
      onChange={(value) => {
        setPage(value as Pages);
      }}
      className="page-switcher"
    />
  );
};

export default PageSwitcher;
