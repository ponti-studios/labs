<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';
  import type { CovidTimeSeriesRecord } from '../../services/covidService';

  interface Props {
    data: CovidTimeSeriesRecord[];
    metric: 'cases' | 'deaths' | 'recovered';
    title: string;
    color?: string;
    showDaily?: boolean;
    showMovingAverage?: boolean;
  }

  let { 
    data, 
    metric, 
    title, 
    color = '#3b82f6',
    showDaily = false,
    showMovingAverage = true 
  }: Props = $props();

  let canvasRef: HTMLCanvasElement;
  let chart: Chart | null = null;

  function calculateDailyNew(records: CovidTimeSeriesRecord[]): number[] {
    const daily: number[] = [];
    for (let i = 1; i < records.length; i++) {
      const prev = records[i - 1][metric];
      const curr = records[i][metric];
      daily.push(Math.max(0, curr - prev));
    }
    return daily;
  }

  function calculateMovingAverage(values: number[], days = 7): number[] {
    const ma: number[] = [];
    for (let i = days - 1; i < values.length; i++) {
      let sum = 0;
      for (let j = i - days + 1; j <= i; j++) {
        sum += values[j];
      }
      ma.push(Math.round(sum / days));
    }
    return ma;
  }

  function formatValue(value: number): string {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  }

  onMount(() => {
    if (!canvasRef || data.length === 0) return;

    const labels = data.slice(1).map(d => {
      const date = new Date(d.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const dailyData = calculateDailyNew(data);
    const maData = calculateMovingAverage(dailyData);

    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.slice(6),
        datasets: [
          ...(showDaily ? [{
            label: 'Daily',
            data: dailyData.slice(6),
            borderColor: color + '40',
            backgroundColor: color + '20',
            borderWidth: 1,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            order: 2,
          }] : []),
          ...(showMovingAverage ? [{
            label: '7-day Average',
            data: maData,
            borderColor: color,
            backgroundColor: color + '40',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
            order: 1,
          }] : []),
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            display: showDaily && showMovingAverage,
            labels: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: { size: 10 },
              boxWidth: 12,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${formatValue(context.raw as number)}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.5)',
              font: { size: 9 },
              maxTicksLimit: 8,
            },
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.5)',
              font: { size: 9 },
              callback: (value) => formatValue(value as number),
            },
          },
        },
      },
    });
  });

  onDestroy(() => {
    if (chart) {
      chart.destroy();
      chart = null;
    }
  });
</script>

<div class="chart-container">
  <h4 class="chart-title">{title}</h4>
  <div class="canvas-wrapper">
    <canvas bind:this={canvasRef}></canvas>
  </div>
</div>

<style>
  .chart-container {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .chart-title {
    margin: 0 0 0.5rem 0;
    font-size: 0.8rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
  }

  .canvas-wrapper {
    height: 150px;
    position: relative;
  }

  canvas {
    width: 100% !important;
    height: 100% !important;
  }
</style>
