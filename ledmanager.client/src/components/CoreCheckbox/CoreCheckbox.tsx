import { Checkbox } from "antd";
import type { CheckboxProps } from "antd/lib";
import { forwardRef } from "react";

const CoreCheckbox = forwardRef((props: CheckboxProps, ref: any) => {
  return <Checkbox ref={ref} {...props} />;
});

export default CoreCheckbox;
