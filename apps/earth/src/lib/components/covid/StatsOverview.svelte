<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { CovidCountry } from '../../services/covidService';

  interface Props {
    country: CovidCountry;
  }

  let { country }: Props = $props();

  function formatNumber(num: number): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  }

  function calculateCFR(): string {
    if (!country.cases || country.cases === 0) return '0.0';
    return ((country.deaths / country.cases) * 100).toFixed(1);
  }

  function calculateTestsPerCase(): string {
    if (!country.cases || country.cases === 0) return '0';
    return Math.round(country.tests / country.cases).toLocaleString();
  }

  const stats = $derived([
    {
      title: 'Total Cases',
      value: formatNumber(country.cases),
      raw: country.cases,
      change: country.todayCases,
      icon: '🦠',
      color: '#3b82f6',
    },
    {
      title: 'Total Deaths',
      value: formatNumber(country.deaths),
      raw: country.deaths,
      change: country.todayDeaths,
      icon: '💀',
      color: '#ef4444',
    },
    {
      title: 'Recovered',
      value: formatNumber(country.recovered),
      raw: country.recovered,
      change: country.todayRecovered,
      icon: '💚',
      color: '#10b981',
    },
    {
      title: 'Active',
      value: formatNumber(country.active),
      raw: country.active,
      change: country.todayCases - country.todayDeaths - country.todayRecovered,
      icon: '📊',
      color: '#f59e0b',
    },
  ]);

  const secondaryStats = $derived([
    {
      title: 'Cases per Million',
      value: country.casesPerOneMillion.toLocaleString(),
      icon: '📈',
      color: '#8b5cf6',
    },
    {
      title: 'Deaths per Million',
      value: country.deathsPerOneMillion.toLocaleString(),
      icon: '⚰️',
      color: '#6366f1',
    },
    {
      title: 'Case Fatality Rate',
      value: `${calculateCFR()}%`,
      icon: '⚕️',
      color: '#ec4899',
    },
    {
      title: 'Tests per Case',
      value: calculateTestsPerCase(),
      icon: '🧪',
      color: '#06b6d4',
    },
  ]);
</script>

<div class="stats-grid">
  {#each stats as stat}
    <div class="stat-card" style="--accent-color: {stat.color}">
      <div class="stat-icon">{stat.icon}</div>
      <div class="stat-content">
        <span class="stat-title">{stat.title}</span>
        <span class="stat-value">{stat.value}</span>
        {#if stat.change !== undefined && stat.change !== null && stat.change !== 0}
          <span class="stat-change" class:positive={stat.change < 0} class:negative={stat.change > 0}>
            {stat.change > 0 ? '+' : ''}{formatNumber(stat.change)}
            <span class="change-label">today</span>
          </span>
        {/if}
      </div>
    </div>
  {/each}
</div>

<div class="secondary-stats">
  {#each secondaryStats as stat}
    <div class="secondary-stat">
      <span class="secondary-icon">{stat.icon}</span>
      <span class="secondary-title">{stat.title}</span>
      <span class="secondary-value" style="color: {stat.color}">{stat.value}</span>
    </div>
  {/each}
</div>

<style>
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.2s;
  }

  .stat-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--accent-color, rgba(255, 255, 255, 0.2));
  }

  .stat-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .stat-title {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .stat-value {
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
  }

  .stat-change {
    font-size: 0.75rem;
    font-weight: 500;
  }

  .stat-change.negative {
    color: #ef4444;
  }

  .stat-change.positive {
    color: #10b981;
  }

  .change-label {
    color: rgba(255, 255, 255, 0.4);
    font-weight: 400;
  }

  .secondary-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .secondary-stat {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
  }

  .secondary-icon {
    flex-shrink: 0;
  }

  .secondary-title {
    color: rgba(255, 255, 255, 0.6);
  }

  .secondary-value {
    font-weight: 600;
    margin-left: auto;
  }
</style>
