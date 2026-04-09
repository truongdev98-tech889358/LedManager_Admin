// import { Upload } from 'antd'
import { Button, Upload, type UploadProps } from "antd";
import { Upload as UploadIcon } from "lucide-react";

const CoreUpload = (props: UploadProps) => {
  return (
    <Upload listType="picture" beforeUpload={() => false} {...props}>
      <Button variant="outlined" icon={<UploadIcon size={18} />} disabled={props.disabled}>
        Upload
      </Button>
    </Upload>
  );
};

export default CoreUpload;
