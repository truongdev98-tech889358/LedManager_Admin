import useIsMobile from "@/hooks/useIsMobile";
import { Typography } from "antd";
import type { TextProps } from "antd/es/typography/Text";

const CoreText = (props: TextProps) => {
  const isMobile = useIsMobile();

  return (
    <Typography.Text
      {...props}
      className={isMobile ? `!text-xs ${props.className ?? ""}` : props.className}
    />
  );
};

export default CoreText;
