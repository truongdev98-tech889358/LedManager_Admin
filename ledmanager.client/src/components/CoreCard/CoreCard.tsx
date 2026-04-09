import { Card, type CardProps } from "antd";

interface CoreCardProps extends CardProps {
  noPadding?: boolean;
}

const CoreCard = (props: CoreCardProps) => {
  return (
    <Card
      styles={{
        body: {
          padding: props.noPadding ? 0 : undefined,
        },
      }}
      {...props}
    />
  );
};

export default CoreCard;
