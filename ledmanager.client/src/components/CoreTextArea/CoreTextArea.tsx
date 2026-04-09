import { Input } from "antd";
import type { TextAreaProps } from "antd/es/input";

const CoreTextArea = (props: TextAreaProps) => {
  const { TextArea } = Input;

  return <TextArea {...props} />;
};

export default CoreTextArea;
