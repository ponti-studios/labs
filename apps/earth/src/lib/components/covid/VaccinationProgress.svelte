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

  // Simulated vaccination data based on total cases/recovered trends
  // In a real app, this would come from a vaccination API
  function generateVaccinationEstimate(records: CovidTimeSeriesRecord[]): {
    dates: string[];
    partially: number[];
    fully: number[];
    boosters: number[];
  } {
    const startDate = new Date(records[0].date);
    const endDate = new Date(records[records.length - 1].date);
    const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Start vaccinations ~6 months after first cases
    const vaccinationStart = Math.min(180, Math.floor(daysDiff * 0.2));
    const dates: string[] = [];
    const partially: number[] = [];
    const fully: number[] = [];
    const boosters: number[] = [];
    
    const maxRate = 75; // Max vaccination rate %
    
    for (let i = vaccinationStart; i < records.length; i++) {
      const progress = (i - vaccinationStart) / (records.length - vaccinationStart);
      const curve = 1 - Math.exp(-progress * 4); // Exponential approach to max
      
      dates.push(records[i].date);
      partially.push(Math.min(maxRate * 1.1, curve * maxRate * 1.1)); // 10% more get first dose
      fully.push(Math.min(maxRate, curve * maxRate * 0.9)); // 90% complete primary
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
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.3)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 3,
          },
          {
            label: 'Fully Vaccinated',
            data: fully,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.3)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 3,
          },
          {
            label: 'Partially Vaccinated',
            data: partially,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.3)',
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
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: { size: 9 },
              boxWidth: 10,
              padding: 10,
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
                return `${context.dataset.label}: ${(context.raw as number).toFixed(1)}%`;
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
            max: 100,
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.5)',
              font: { size: 9 },
              callback: (value) => `${value}%`,
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
  <h4 class="chart-title">{title} <span class="estimate-label">(estimated)</span></h4>
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
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .estimate-label {
    font-size: 0.7rem;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.4);
    font-style: italic;
  }

  .canvas-wrapper {
    height: 160px;
    position: relative;
  }

  canvas {
    width: 100% !important;
    height: 100% !important;
  }
</style>
