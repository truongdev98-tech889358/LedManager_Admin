import { Typography } from "antd";
import type { TitleProps } from "antd/es/typography/Title";

const CoreTitle = (props: TitleProps) => {
  return <Typography.Title {...props} />;
};

export default CoreTitle;
