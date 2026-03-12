<script lang="ts">
  import type { CovidCountry } from '../../services/covidService';

  interface Props {
    country: CovidCountry;
  }

  let { country }: Props = $props();

  function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
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
    { title: 'Total Cases', value: formatNumber(country.cases), raw: country.cases, change: country.todayCases },
    { title: 'Total Deaths', value: formatNumber(country.deaths), raw: country.deaths, change: country.todayDeaths },
    { title: 'Recovered', value: formatNumber(country.recovered), raw: country.recovered, change: country.todayRecovered },
    { title: 'Active', value: formatNumber(country.active), raw: country.active, change: country.todayCases - country.todayDeaths - country.todayRecovered },
  ]);

  const secondaryStats = $derived([
    { title: 'Cases per Million', value: country.casesPerOneMillion.toLocaleString() },
    { title: 'Deaths per Million', value: country.deathsPerOneMillion.toLocaleString() },
    { title: 'Case Fatality Rate', value: `${calculateCFR()}%` },
    { title: 'Tests per Case', value: calculateTestsPerCase() },
  ]);
</script>

<div class="stats-grid">
  {#each stats as stat}
    <div class="stat-card">
      <span class="stat-title">{stat.title}</span>
      <span class="stat-value">{stat.value}</span>
      {#if stat.change !== undefined && stat.change !== null && stat.change !== 0}
        <span class="stat-change" class:positive={stat.change < 0} class:negative={stat.change > 0}>
          {stat.change > 0 ? '+' : ''}{formatNumber(stat.change)}
        </span>
      {/if}
    </div>
  {/each}
</div>

<div class="secondary-stats">
  {#each secondaryStats as stat}
    <div class="secondary-stat">
      <span class="secondary-title">{stat.title}</span>
      <span class="secondary-value">{stat.value}</span>
    </div>
  {/each}
</div>

<style>
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .stat-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.12);
  }

  .stat-title {
    font-size: 12px;
    color: #7a828a;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .stat-value {
    font-size: 20px;
    font-weight: 600;
    color: #e7eaee;
    letter-spacing: -0.02em;
  }

  .stat-change {
    font-size: 12px;
    font-weight: 500;
  }

  .stat-change.negative { color: #ff3b30; }
  .stat-change.positive { color: #34c759; }

  .secondary-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: 20px;
  }

  .secondary-stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
  }

  .secondary-title {
    font-size: 11px;
    color: #7a828a;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .secondary-value {
    font-size: 15px;
    font-weight: 600;
    color: #b3bac2;
  }
</style>
