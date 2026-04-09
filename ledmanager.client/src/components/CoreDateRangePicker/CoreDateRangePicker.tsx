import { DatePicker } from "antd";
import type { RangePickerProps } from "antd/es/date-picker";
import { Calendar } from "lucide-react";
import { forwardRef } from "react";

const CoreDateRangePicker = forwardRef((props: RangePickerProps, ref: any) => {
  return (
    <DatePicker.RangePicker
      ref={ref}
      style={{ width: "100%" }}
      format="DD/MM/YYYY"
      prefix={<Calendar size={18} />}
      suffixIcon={null}
      {...props}
    />
  );
});

export default CoreDateRangePicker;
