import { Select, type SelectProps } from "antd";
import style from "./CoreSelect.module.scss";
import { forwardRef } from "react";
import useIsMobile from "@/hooks/useIsMobile";

const CoreSelect = forwardRef((props: SelectProps & { name?: string }, ref: any) => {
  const isMobile = useIsMobile();

  return (
    <Select
      ref={ref}
      id={props.id || props.name}
      placement="bottomLeft"
      className={style["core-select"]}
      style={{ width: "100%" }}
      styles={{
        popup: {
          root: {
            minWidth: "fit-content",
          },
        },
      }}
      {...props}
      size={isMobile ? "small" : props.size}
    />
  );
});

export default CoreSelect;
