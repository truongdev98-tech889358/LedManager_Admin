import { Table, type TableProps } from "antd";
import { forwardRef } from "react";

const CoreTable = forwardRef((props: TableProps, ref: any) => {
  return <Table ref={ref} {...props} />;
});

export default CoreTable;
