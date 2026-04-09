import { CoreText } from "@/components";
import CoreCard from "@/components/CoreCard/CoreCard";
import { CurrencyEnum, DATE_FORMAT } from "@/configs/constants";
import { getCurrencyStorage } from "@/utils/helper";
import { Radio, Spin } from "antd";
import dayjs from "dayjs";
import { t } from "i18next";
import { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { getStatistics } from "../apis";
import { VIEW_TYPE_OPTIONS } from "../configs/constants";
import type { IStatisticsRequest } from "../configs/types";

interface IProps {
  title: string;
  subtitle: string;
  apiUrl: string;
}

const CommonChart = (props: IProps) => {
  const { title, subtitle, apiUrl } = props;
  const [viewType, setViewType] = useState(VIEW_TYPE_OPTIONS[0].value);
  const [data, setData] = useState<number[] | undefined>([]);

  const isRevenueStatistics = useMemo(() => title === t("dashboard.revenueStatistics"), []);

  const getCurrencyLabel = useMemo(() => {
    const currency = getCurrencyStorage();
    switch (currency) {
      case CurrencyEnum.USD:
        return t("dashboard.thousandDollar");
      default:
        return t("dashboard.millionVND");
    }
  }, []);

  const series = useMemo(() => {
    if (!data) return [];
    return [
      {
        name: subtitle,
        data: data.slice(-Number(viewType)),
      },
    ] as ApexNonAxisChartSeries;
  }, [viewType, data]);

  const options = useMemo(() => {
    const xLabels: string[] = [];
    for (let i = 30; i >= 0; i--) {
      const label = dayjs().subtract(i, "d").format("DD/MM");
      xLabels.push(viewType === VIEW_TYPE_OPTIONS[1].value && i % 3 !== 0 ? "" : label);
    }

    return {
      chart: {
        id: title,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      xaxis: {
        categories: xLabels.slice(-Number(viewType)),
      },
    } as ApexCharts.ApexOptions;
  }, [viewType, data]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setData(undefined);
    const params: IStatisticsRequest = {
      currency: getCurrencyStorage(),
      startDate: dayjs().add(-30, "d").format(DATE_FORMAT),
      endDate: dayjs().format(DATE_FORMAT),
    };
    const data = await getStatistics(apiUrl, params);
    const rate = getCurrencyStorage() === CurrencyEnum.USD ? 1000 : 1000000;
    setData(
      data.map((item) =>
        isRevenueStatistics ? +Number(item.finalPrice / rate).toFixed(0) : item.count,
      ),
    );
  };

  return (
    <CoreCard className="relative">
      {data === undefined ? (
        <div className="flex items-center justify-center h-[345px]">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {isRevenueStatistics && (
            <CoreText strong className="absolute !text-[12px] top-10 left-8">
              {`(${getCurrencyLabel})`}
            </CoreText>
          )}
          <div className="flex justify-end relative">
            <CoreText strong className="absolute top-6 left-[50%] translate-x-[-50%]">
              {title}
            </CoreText>

            <Radio.Group
              options={VIEW_TYPE_OPTIONS}
              optionType="button"
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
            />
          </div>

          <Chart options={options} series={series} type="line" height={300} />
        </>
      )}
    </CoreCard>
  );
};

export default CommonChart;
