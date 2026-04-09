import useIsMobile from "@/hooks/useIsMobile";
import { DatePicker, type DatePickerProps } from "antd";
import { Calendar } from "lucide-react";
import { forwardRef } from "react";

const CoreDatePicker = forwardRef((props: DatePickerProps, ref: any) => {
  const isMobile = useIsMobile();

  return (
    <DatePicker
      ref={ref}
      style={{ width: "100%" }}
      format={["DD/MM/YYYY", "DDMMYYYY"]}
      prefix={<Calendar size={18} />}
      suffixIcon={null}
      {...props}
      size={isMobile ? "small" : props.size}
    />
  );
});

export default CoreDatePicker;
