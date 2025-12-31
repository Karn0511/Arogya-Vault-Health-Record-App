import { Component, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';

interface VitalData {
  day: string;
  value: number;
}

@Component({
  selector: 'app-health-vitals-chart',
  templateUrl: './health-vitals-chart.component.html',
  styleUrls: ['./health-vitals-chart.component.scss']
})
export class HealthVitalsChartComponent implements OnInit {
  chartOption: EChartsOption = {};
  lastValue: number = 0;

  // Mock data for the chart
  private heartRateData: VitalData[] = [
    { day: 'Mon', value: 72 },
    { day: 'Tue', value: 75 },
    { day: 'Wed', value: 70 },
    { day: 'Thu', value: 78 },
    { day: 'Fri', value: 80 },
    { day: 'Sat', value: 74 },
    { day: 'Sun', value: 76 },
  ];

  ngOnInit(): void {
    this.lastValue = this.heartRateData[this.heartRateData.length - 1].value;
    this.initChart();
  }

  private initChart(): void {
    this.chartOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '5%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: this.heartRateData.map(d => d.day.slice(0, 1)),
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#64748b',
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        show: false,
        min: 60,
        max: 90
      },
      series: [
        {
          data: this.heartRateData.map((item, index) => ({
            value: item.value,
            itemStyle: {
              color: index === 2 ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
              borderRadius: [3, 3, 0, 0]
            }
          })),
          type: 'bar',
          barWidth: 12
        }
      ]
    };
  }
}
