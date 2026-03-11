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

  let { 
    countries, 
    metric, 
    title, 
    color = '#3b82f6',
    limit = 15 
  }: Props = $props();

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

    // Sort and get top countries
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
          backgroundColor: color + 'cc',
          borderColor: color,
          borderWidth: 1,
          borderRadius: 3,
          barThickness: 'flex',
          maxBarThickness: 20,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                return `${formatValue(context.raw as number)} ${metric.includes('Per') ? 'per million' : ''}`;
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
              callback: (value) => formatValue(value as number),
            },
          },
          y: {
            grid: {
              display: false,
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: { size: 10 },
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
    height: 280px;
    position: relative;
  }

  canvas {
    width: 100% !important;
    height: 100% !important;
  }
</style>
