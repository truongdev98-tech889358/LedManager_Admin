import { Button, type ButtonProps } from "antd";
import style from "./CoreButton.module.scss";
import useIsMobile from "@/hooks/useIsMobile";

const CoreButton = (props: ButtonProps) => {
  const isMobile = useIsMobile();

  return (
    <Button className={style["core-button"]} {...props} size={isMobile ? "small" : props.size} />
  );
};

export default CoreButton;
