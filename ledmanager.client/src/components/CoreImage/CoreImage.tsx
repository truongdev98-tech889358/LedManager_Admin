import { images } from "@/assets/images";
import { Image, type ImageProps } from "antd";

const CoreImage = (props: ImageProps) => {
  return (
    <Image
      preview={false}
      onError={({ currentTarget }) => {
        currentTarget.src = images.noImageAvailable;
      }}
      {...props}
    />
  );
};

export default CoreImage;
