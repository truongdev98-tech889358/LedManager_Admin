import { formatNumber } from "@/utils/helper";
import { Input, type InputProps, type InputRef } from "antd";
import { forwardRef, useState, useEffect } from "react";

interface CoreInputNumberProps extends InputProps {
  isPositive?: boolean;
}

const CoreInputNumber = forwardRef<InputRef, CoreInputNumberProps>(
  ({ isPositive = true, value, onChange, ...rest }, ref) => {
    const [displayValue, setDisplayValue] = useState("");

    useEffect(() => {
      setDisplayValue(value ? formatNumber(String(value ?? "")) : "");
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/,/g, "");

      if (rawValue === "") {
        setDisplayValue("");
        onChange?.({
          ...e,
          target: { ...e.target, value: "" },
        });
        return;
      }

      if (isNaN(Number(rawValue))) return;
      if (isPositive && Number(rawValue) < 0) return;

      const formatted = formatNumber(rawValue);
      setDisplayValue(formatted);

      onChange?.({
        ...e,
        target: { ...e.target, value: rawValue },
      });
    };

    return <Input ref={ref} {...rest} value={displayValue} onChange={handleInputChange} maxLength={15} />;
  },
);

export default CoreInputNumber;
