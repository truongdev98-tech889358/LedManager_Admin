
import CoreTabs from "@/components/CoreTabs/CoreTabs";
import CoreTitle from "@/components/CoreTitle/CoreTitle";
import BackgroundManager from "./BackgroundManager";
import ColorManager from "./ColorManager";
import FontManager from "./FontManager";
import type { TabsProps } from "antd";

const NeonConfig = () => {
    const tabs: TabsProps['items'] = [
        {
            key: "fonts",
            label: "Fonts",
            children: <FontManager />,
        },
        {
            key: "colors",
            label: "Colors",
            children: <ColorManager />,
        },
        {
            key: "backgrounds",
            label: "Backgrounds",
            children: <BackgroundManager />,
        }
    ];

    return (
        <div className="h-full flex flex-col p-4 gap-4">
            <CoreTitle level={2}>Neon Configuration</CoreTitle>
            <div className="flex-1 min-h-0 bg-white p-4 rounded-lg shadow-sm flex flex-col">
                <CoreTabs items={tabs} defaultActiveKey="fonts" className="h-full [&>.ant-tabs-content-holder]:h-full [&>.ant-tabs-content-holder>.ant-tabs-content]:h-full [&>.ant-tabs-content-holder>.ant-tabs-content>.ant-tabs-tabpane]:h-full" />
            </div>
        </div>
    );
};

export default NeonConfig;
