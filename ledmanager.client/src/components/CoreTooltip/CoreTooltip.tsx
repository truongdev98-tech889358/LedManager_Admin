import { Tooltip, type TooltipProps } from "antd";

const CoreTooltip = (props: TooltipProps) => {
  return <Tooltip arrow={false} autoAdjustOverflow={true} placement="top" {...props} />;
};

export default CoreTooltip;
