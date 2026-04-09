import { Switch } from "antd";
import type { SwitchProps } from "antd/lib";
import { forwardRef } from "react";

const CoreSwitch = forwardRef((props: SwitchProps, ref: any) => {
  return <Switch ref={ref} {...props} />;
});

export default CoreSwitch;
