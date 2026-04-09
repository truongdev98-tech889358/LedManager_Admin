import { Input } from "antd";
import type { InputProps } from "antd";
import { forwardRef, useMemo, useCallback } from "react";
import _ from "lodash";
import useIsMobile from "@/hooks/useIsMobile";

interface CoreInputProps extends InputProps {
  debounceTime?: number;
  isUpperCase?: boolean;
}

const CoreInput = forwardRef<any, CoreInputProps>(
  ({ debounceTime = 0, isUpperCase = false, onChange, ...rest }, ref) => {
    const isMobile = useIsMobile();

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = isUpperCase ? e.target.value.toUpperCase() : e.target.value;

        const newEvent = {
          ...e,
          target: { ...e.target, value },
        };

        onChange?.(newEvent as React.ChangeEvent<HTMLInputElement>);
      },
      [onChange, isUpperCase],
    );

    const debouncedOnChange = useMemo(() => {
      if (!onChange) return undefined;
      if (debounceTime > 0) {
        return _.debounce(handleChange, debounceTime);
      }
      return handleChange;
    }, [handleChange, debounceTime]);

    return (
      <Input
        {...rest}
        ref={ref}
        onChange={debouncedOnChange}
        size={isMobile ? "small" : rest.size}
      />
    );
  },
);

export default CoreInput;
