<script lang="ts">
	import { geocodeLocation, getDirections, type Location, type DirectionsResult } from '../services/geospatialService';
	import type { CesiumViewer } from '../cesium/CesiumViewer';

	interface Props {
		viewer: CesiumViewer | null;
	}

	let { viewer }: Props = $props();

	let searchAddress = $state('');
	let originAddress = $state('');
	let destinationAddress = $state('');

	let geocodeResults = $state<Location[]>([]);
	let directionsResult = $state<DirectionsResult | null>(null);

	let isLoadingGeocode = $state(false);
	let isLoadingDirections = $state(false);
	let error = $state<string | null>(null);

	let mode = $state<'search' | 'directions'>('search');

	async function handleSearch() {
		if (!searchAddress.trim()) return;

		isLoadingGeocode = true;
		error = null;

		try {
			const results = await geocodeLocation(searchAddress);
			geocodeResults = results;

			if (results.length > 0 && viewer) {
				viewer.addGeocodeMarkers(
					results.map((r, i) => ({
						id: `result-${i}`,
						lat: r.lat,
						lng: r.lng,
						address: r.address,
						type: 'result'
					}))
				);

				viewer.flyToGeocodeResult(results[0].lat, results[0].lng);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Geocoding failed';
		} finally {
			isLoadingGeocode = false;
		}
	}

	async function handleGetDirections() {
		if (!originAddress.trim() || !destinationAddress.trim()) return;

		isLoadingDirections = true;
		error = null;

		try {
			const directions = await getDirections(originAddress, destinationAddress);
			directionsResult = directions;

			if (viewer) {
				viewer.clearGeospatial();

				// Geocode both locations
				const [originResults, destResults] = await Promise.all([
					geocodeLocation(originAddress),
					geocodeLocation(destinationAddress)
				]);

				if (originResults.length && destResults.length) {
					const origin = originResults[0];
					const dest = destResults[0];

					viewer.addGeocodeMarkers([
						{
							id: 'origin',
							lat: origin.lat,
							lng: origin.lng,
							address: origin.address,
							type: 'origin'
						},
						{
							id: 'destination',
							lat: dest.lat,
							lng: dest.lng,
							address: dest.address,
							type: 'destination'
						}
					]);

					// Create route waypoints from direction steps (simplified)
					viewer.addRoute('main-route', [
						{ lat: origin.lat, lng: origin.lng },
						{ lat: dest.lat, lng: dest.lng }
					]);

					// Fly to show the whole route
					viewer.flyToGeocodeResult(
						(origin.lat + dest.lat) / 2,
						(origin.lng + dest.lng) / 2,
						1500000
					);
				}
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Directions failed';
		} finally {
			isLoadingDirections = false;
		}
	}

	function handleClear() {
		searchAddress = '';
		originAddress = '';
		destinationAddress = '';
		geocodeResults = [];
		directionsResult = null;
		error = null;
		if (viewer) {
			viewer.clearGeospatial();
		}
	}

	function selectResult(result: Location) {
		if (viewer) {
			viewer.flyToGeocodeResult(result.lat, result.lng);
		}
	}
</script>

<div class="panel space-y-4 p-4">
	<div class="flex items-center gap-2 mb-4">
		<h2 class="text-lg font-semibold text-text-primary">Geospatial</h2>
	</div>

	<!-- Mode Tabs -->
	<div class="flex gap-2 border-b border-border-default">
		<button
			type="button"
			onclick={() => (mode = 'search')}
			class={`px-3 py-2 text-sm font-medium border-b-2 transition-all duration-160 ${
				mode === 'search'
					? 'border-accent-active text-text-primary'
					: 'border-transparent text-text-muted hover:text-text-secondary'
			}`}
		>
			Search
		</button>
		<button
			type="button"
			onclick={() => (mode = 'directions')}
			class={`px-3 py-2 text-sm font-medium border-b-2 transition-all duration-160 ${
				mode === 'directions'
					? 'border-accent-active text-text-primary'
					: 'border-transparent text-text-muted hover:text-text-secondary'
			}`}
		>
			Directions
		</button>
	</div>

	<!-- Error Message -->
	{#if error}
		<div class="bg-status-critical/10 border border-status-critical text-status-critical rounded-md p-3 text-sm">
			{error}
		</div>
	{/if}

	<!-- Search Mode -->
	{#if mode === 'search'}
		<div class="space-y-3">
			<div>
				<label for="search" class="text-label block mb-2">Address</label>
				<input
					id="search"
					type="text"
					placeholder="Enter address..."
					bind:value={searchAddress}
					onkeydown={(e) => e.key === 'Enter' && handleSearch()}
					class="input w-full"
					disabled={isLoadingGeocode}
				/>
			</div>

			<button
				type="button"
				onclick={handleSearch}
				disabled={!searchAddress.trim() || isLoadingGeocode}
				class="btn-primary w-full"
			>
				{isLoadingGeocode ? 'Searching...' : 'Search'}
			</button>

			<!-- Search Results -->
			{#if geocodeResults.length > 0}
				<div class="section space-y-2 max-h-64 overflow-y-auto">
					{#each geocodeResults as result, i}
						<button
							type="button"
							onclick={() => selectResult(result)}
							class="w-full text-left px-3 py-2 rounded-md bg-bg-panel-1 hover:bg-bg-panel-2 border border-border-default transition-all duration-160"
						>
							<div class="text-label text-text-muted">Result {i + 1}</div>
							<div class="text-sm text-text-primary font-medium">{result.address}</div>
							<div class="text-xs text-text-muted">{result.lat.toFixed(4)}, {result.lng.toFixed(4)}</div>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Directions Mode -->
	{#if mode === 'directions'}
		<div class="space-y-3">
			<div>
				<label for="origin" class="text-label block mb-2">From</label>
				<input
					id="origin"
					type="text"
					placeholder="Origin address..."
					bind:value={originAddress}
					class="input w-full"
					disabled={isLoadingDirections}
				/>
			</div>

			<div>
				<label for="destination" class="text-label block mb-2">To</label>
				<input
					id="destination"
					type="text"
					placeholder="Destination address..."
					bind:value={destinationAddress}
					onkeydown={(e) => e.key === 'Enter' && handleGetDirections()}
					class="input w-full"
					disabled={isLoadingDirections}
				/>
			</div>

			<button
				type="button"
				onclick={handleGetDirections}
				disabled={!originAddress.trim() || !destinationAddress.trim() || isLoadingDirections}
				class="btn-primary w-full"
			>
				{isLoadingDirections ? 'Calculating...' : 'Get Directions'}
			</button>

			<!-- Directions Results -->
			{#if directionsResult}
				<div class="section space-y-3">
					<div>
						<div class="text-label text-text-muted">Route Summary</div>
						<div class="text-sm text-text-primary font-medium">{directionsResult.summary.from}</div>
						<div class="text-xs text-text-muted">→</div>
						<div class="text-sm text-text-primary font-medium">{directionsResult.summary.to}</div>
					</div>

					<div class="grid grid-cols-2 gap-2">
						<div>
							<div class="text-label text-text-muted">Distance</div>
							<div class="text-sm text-text-primary font-mono">{directionsResult.summary.distance}</div>
						</div>
						<div>
							<div class="text-label text-text-muted">Duration</div>
							<div class="text-sm text-text-primary font-mono">{directionsResult.summary.duration}</div>
						</div>
					</div>

					{#if directionsResult.steps.length > 0}
						<div class="border-t border-border-default pt-3">
							<div class="text-label text-text-muted mb-2">Directions</div>
							<div class="space-y-2 max-h-48 overflow-y-auto">
								{#each directionsResult.steps as step, i}
									<div class="text-xs bg-bg-panel-1 rounded p-2">
										<div class="text-text-secondary">{i + 1}. {step.instruction}</div>
										<div class="text-text-muted">{step.distance}</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Clear Button -->
	{#if geocodeResults.length > 0 || directionsResult}
		<button type="button" onclick={handleClear} class="btn-secondary w-full">
			Clear
		</button>
	{/if}
</div>

<style>
	.panel {
		background: var(--bg-panel-0);
		border: 1px solid var(--border-default);
		border-radius: 8px;
		box-shadow: 0 8px 24px rgba(22, 21, 20, 0.08);
	}

	.section {
		background: var(--bg-panel-1);
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		padding: 12px;
	}

	.input {
		background: var(--bg-elevated);
		color: var(--text-primary);
		border: 1px solid var(--border-default);
		border-radius: 6px;
		padding: 8px 12px;
		font-family: var(--font-body);
		font-size: 13px;
		transition: border-color 120ms ease-out, background-color 120ms ease-out;
	}

	.input:focus {
		outline: none;
		border-color: var(--border-strong);
		background: white;
	}

	.input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background: var(--accent-active);
		color: var(--bg-panel-0);
		border: 1px solid var(--accent-active);
		border-radius: 6px;
		padding: 8px 14px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 120ms ease-out, border-color 120ms ease-out;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--text-primary);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: var(--bg-panel-1);
		color: var(--text-primary);
		border: 1px solid var(--border-default);
		border-radius: 6px;
		padding: 8px 14px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 120ms ease-out, border-color 120ms ease-out;
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--bg-panel-2);
		border-color: var(--border-strong);
	}

	.btn-secondary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.text-label {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
	}
</style>
