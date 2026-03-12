<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';
  import type { CovidCountry } from '../../services/covidService';

  interface Props {
    countries: CovidCountry[];
    metric: 'cases' | 'deaths' | 'casesPerOneMillion' | 'deathsPerOneMillion';
    title: string;
    color?: string;
    limit?: number;
  }

  let { countries, metric, title, color = '#e7eaee', limit = 15 }: Props = $props();

  let canvasRef: HTMLCanvasElement;
  let chart: Chart | null = null;

  function formatValue(value: number): string {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  }

  function getMetricValue(country: CovidCountry): number {
    switch (metric) {
      case 'cases': return country.cases;
      case 'deaths': return country.deaths;
      case 'casesPerOneMillion': return country.casesPerOneMillion;
      case 'deathsPerOneMillion': return country.deathsPerOneMillion;
      default: return country.cases;
    }
  }

  onMount(() => {
    if (!canvasRef || countries.length === 0) return;

    const sorted = [...countries]
      .sort((a, b) => getMetricValue(b) - getMetricValue(a))
      .slice(0, limit);

    const labels = sorted.map(c => c.country);
    const values = sorted.map(c => getMetricValue(c));

    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: title,
          data: values,
          backgroundColor: color + '80',
          borderColor: color,
          borderWidth: 1,
          borderRadius: 3,
          barThickness: 'flex',
          maxBarThickness: 16,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 17, 19, 0.95)',
            titleColor: '#e7eaee',
            bodyColor: '#b3bac2',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => `${formatValue(context.raw as number)} ${metric.includes('Per') ? 'per million' : ''}`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: { color: '#7a828a', font: { size: 10, family: 'Geist' }, callback: (value) => formatValue(value as number) },
          },
          y: {
            grid: { display: false },
            ticks: { color: '#b3bac2', font: { size: 11, family: 'Geist' } },
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
  <h4 class="chart-title">{title}</h4>
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

  .chart-title {
    margin: 0 0 12px 0;
    font-size: 13px;
    font-weight: 600;
    color: #b3bac2;
    letter-spacing: -0.01em;
    text-transform: uppercase;
  }

  .canvas-wrapper {
    height: 300px;
    position: relative;
  }

  canvas {
    width: 100% !important;
    height: 100% !important;
  }
</style>
