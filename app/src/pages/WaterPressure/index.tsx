import React, { Component } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import * as c3 from "c3";
import "c3/c3.min.css";
import classes from "./style.module.sass";

const SERVER_IP = "server_ip";

enum DataInterval { // 資料區間
  last10Data, // 最新10筆
  last12Hours, // 最新12小時
  last24Hours, // 最新24小時
  today // 今日
}

interface States {
  chart: c3.ChartAPI | null; // c3 chart reference
  loading: boolean; // 讀取中
  lastUpdated: string; // 最後更新時間
  dataInterval: DataInterval; // 資料區間
}

interface Props {}

interface WaterPressureData {// 水壓資料
  time: string; // 時間
  pressure_value: number; // 水壓值
}

type C3Column = Array<string | number>;

class WaterPressure extends Component<Props, States> {
  state: States = {
    chart: null,
    loading: true,
    lastUpdated: "",
    dataInterval: DataInterval.last10Data
  };

  private mapDataToColumns(pressureData: WaterPressureData[]) {
    const datetimes: C3Column = pressureData.map(
      (data: WaterPressureData) => data.time
    );
    datetimes.unshift("時間");
    const pressureValues: C3Column = pressureData.map(
      (data: WaterPressureData) => data.pressure_value
    );
    pressureValues.unshift("水壓");
    return [datetimes, pressureValues];
  }

  private async getPressureData() {
    const apiLink =
      process.env.NODE_ENV === "development"
        ? `http://${SERVER_IP}/api/getData?type=${this.state.dataInterval}`
        : `/api/getData?type=${this.state.dataInterval}`;
    const response = await fetch(apiLink);
    const pressureData = await response.json();
    return pressureData;
  }

  private c3Config(columns: Array<C3Column>) {
    // 產生 c3.generate 所需 options
    // TODO: grid bug (x grid render wrong position)
    return {
      data: {
        x: "時間",
        xFormat: "%Y-%m-%d %H:%M:%S",
        columns: columns
      },
      axis: {
        x: {
          type: "timeseries",
          localtime: true,
          tick: {
            format: "%H:%M"
          }
        }
      },
      grid: {
        x: {
          show: false
        },
        y: {
          show: false
        }
      },
      legend: {
        show: false
      }
    };
  }

  async renderChart(dataInterval: DataInterval) {
    await this.setState({ loading: true, dataInterval });
    const pressureData: WaterPressureData[] = await this.getPressureData();
    const columns: C3Column[] = this.mapDataToColumns(pressureData);
    const chart: c3.ChartAPI = c3.generate(this.c3Config(columns));
    const lastUpdated = new Date().toLocaleString("zh-Hant", {
      timeZone: "Asia/Taipei"
    });

    this.setState({ chart, loading: false, lastUpdated });
  }

  componentDidMount() {
    this.renderChart(this.state.dataInterval);
  }

  render() {
    return (
      <Card>
        <CardContent>
          <div id="chart" />
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            onClick={() => this.renderChart(this.state.dataInterval)}
          >
            更新
          </Button>
          <Button
            className={classes.button}
            variant="contained"
            color="secondary"
            onClick={() => this.renderChart(DataInterval.last10Data)}
          >
            最新10筆
          </Button>
          <Button
            className={classes.button}
            variant="contained"
            color="secondary"
            onClick={() => this.renderChart(DataInterval.last12Hours)}
          >
            最新12小時
          </Button>
          <Button
            className={classes.button}
            variant="contained"
            color="secondary"
            onClick={() => this.renderChart(DataInterval.last24Hours)}
          >
            最新24小時
          </Button>
          <Typography variant="h6">
            最後更新時間: {this.state.lastUpdated}
          </Typography>
        </CardContent>
      </Card>
    );
  }
}

export default WaterPressure;
