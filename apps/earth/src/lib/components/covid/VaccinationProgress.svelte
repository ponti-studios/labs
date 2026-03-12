<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';
  import type { CovidTimeSeriesRecord } from '../../services/covidService';

  interface Props {
    data: CovidTimeSeriesRecord[];
    title?: string;
  }

  let { data, title = 'Vaccination Progress' }: Props = $props();

  let canvasRef: HTMLCanvasElement;
  let chart: Chart | null = null;

  function generateVaccinationEstimate(records: CovidTimeSeriesRecord[]): {
    dates: string[];
    partially: number[];
    fully: number[];
    boosters: number[];
  } {
    const startDate = new Date(records[0].date);
    const endDate = new Date(records[records.length - 1].date);
    const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const vaccinationStart = Math.min(180, Math.floor(daysDiff * 0.2));
    const dates: string[] = [];
    const partially: number[] = [];
    const fully: number[] = [];
    const boosters: number[] = [];
    const maxRate = 75;
    
    for (let i = vaccinationStart; i < records.length; i++) {
      const progress = (i - vaccinationStart) / (records.length - vaccinationStart);
      const curve = 1 - Math.exp(-progress * 4);
      dates.push(records[i].date);
      partially.push(Math.min(maxRate * 1.1, curve * maxRate * 1.1));
      fully.push(Math.min(maxRate, curve * maxRate * 0.9));
      boosters.push(progress > 0.5 ? Math.min(maxRate * 0.6, (progress - 0.5) * 2 * maxRate * 0.6) : 0);
    }
    return { dates, partially, fully, boosters };
  }

  onMount(() => {
    if (!canvasRef || data.length === 0) return;
    const { dates, partially, fully, boosters } = generateVaccinationEstimate(data);
    const labels = dates.map(d => {
      const date = new Date(d);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Boosters',
            data: boosters,
            borderColor: '#b3bac2',
            backgroundColor: 'rgba(179, 186, 194, 0.2)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 3,
          },
          {
            label: 'Fully Vaccinated',
            data: fully,
            borderColor: '#e7eaee',
            backgroundColor: 'rgba(231, 234, 238, 0.25)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 3,
          },
          {
            label: 'Partially Vaccinated',
            data: partially,
            borderColor: '#7a828a',
            backgroundColor: 'rgba(122, 130, 138, 0.2)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: { color: '#7a828a', font: { size: 10, family: 'Geist' }, boxWidth: 8, padding: 15 },
          },
          tooltip: {
            backgroundColor: 'rgba(15, 17, 19, 0.95)',
            titleColor: '#e7eaee',
            bodyColor: '#b3bac2',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => [`${context.dataset.label}: ${(context.raw as number).toFixed(1)}%`],
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: { color: '#7a828a', font: { size: 10, family: 'Geist' }, maxTicksLimit: 6 },
          },
          y: {
            max: 100,
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: { color: '#7a828a', font: { size: 10, family: 'Geist' }, callback: (value) => `${value}%` },
          },
        },
      },
    });
  });

  onDestroy(() => {
    if (chart) { chart.destroy(); chart = null; }
  });
</script>

<div class="chart-container">
  <div class="chart-header">
    <h4 class="chart-title">{title}</h4>
    <span class="estimate-label">estimated</span>
  </div>
  <div class="canvas-wrapper">
    <canvas bind:this={canvasRef}></canvas>
  </div>
</div>

<style>
  .chart-container {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 16px;
  }

  .chart-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .chart-title {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: #b3bac2;
    letter-spacing: -0.01em;
    text-transform: uppercase;
  }

  .estimate-label {
    font-size: 10px;
    color: #7a828a;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 2px 6px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  .canvas-wrapper {
    height: 180px;
    position: relative;
  }

  canvas {
    width: 100% !important;
    height: 100% !important;
  }
</style>
