import { CoreButton } from "@/components";
import { Result } from "antd";
import { t } from "i18next";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle={t("notFound.subTitle")}
      extra={
        <CoreButton
          type="primary"
          onClick={() => navigate(`/`)}
        >
          {t("common.backHome")}
        </CoreButton>
      }
    />
  );
};

export default NotFound;
