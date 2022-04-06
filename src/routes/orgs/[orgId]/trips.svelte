<script lang="ts">
	import { writable } from 'svelte/store';
	import { page } from '$app/stores';
	import * as db from '$lib/db';
	import Select from 'svelte-select';
	import { priceFormatter } from '$lib/utils/dataFormatter';

	let rate: string;
	let quantity: string;
	$: freight = (Number(rate) || 0) * (Number(quantity) || 1);

	const billingTypes = {
		fixed: { title: 'Fixed', formula: '(Fixed)' },
		tonne: { title: 'Per Tonne', plural: 'Tonnage', formula: ' (Rate * Total Tonnage)' },
		kg: { title: 'Per Kg', plural: 'Kgs', formula: ' (Rate * Total weight in kg)' },
		km: { title: 'Per Km', plural: 'Kms', formula: ' (Rate * Number of kms)' },
		trip: { title: 'Per Trip', plural: 'Trips', formula: ' (Rate * Number of Trip)' },
		day: { title: 'Per Day', plural: 'Days', formula: ' (Rate * Number of Days)' },
		hour: { title: 'Per Hour', plural: 'Hours', formula: ' (Rate * Number of Litres)' },
		litre: { title: 'Per Litre', plural: 'Litres', formula: ' (Rate * Number of Litres)' },
		bag: { title: 'Per Bag', plural: 'Bags', formula: ' (Rate * Number of Bags)' }
	};

	let selectedBillingType = 'tonne';
	$: if (selectedBillingType === 'fixed') {
		quantity = undefined;
	}
	async function filteredParties(filterText: string) {
		const { data, error } = await db.parties.search(filterText, organizationId);
		return data.map(function (e) {
			return { label: e.name, value: e.id };
		});
	}

	async function filteredVehicles(filterText: string) {
		const { data, error } = await db.vehicles.search(filterText, organizationId);
		return data.map(function (e) {
			return { label: e.registration_number, value: e.id };
		});
	}

	async function filteredLocations(filterText: string) {
		const { data, error } = await db.trips.locations(filterText);
		return data.map(function (e) {
			return { label: e.location, value: e.location };
		});
	}

	let trips = writable(null);
	$: organizationId = $page.params.orgId;

	async function updateRecords() {
		const { data, error } = await db.trips.all(organizationId);
		trips.set(data);
	}

	$: (async () => {
		if (organizationId) {
			await updateRecords();
		}
	})();

	async function createNewRecord(e) {
		const formData = new FormData(e.target);
		const rowData = {
			organization_id: organizationId,
			ledger_id: selectedParty.value,
			vehicle_id: selectedVehicle.value,
			origin: 'Raipur',
			destination: 'Jamshedpur',
			rate: rate,
			quantity: quantity,
			per: selectedBillingType
		};
		const { data, error } = await db.trips.create(rowData);
		await updateRecords();
	}

	let selectedParty;
	let selectedVehicle;

	$: rows = $trips;
	$: columns = [
		{
			key: 'vehicle_registration_number',
			title: 'Vehicle',
			value: (v) => v.vehicle_registration_number,
			renderValue: (v) =>
				`<a href="/org${organizationId}/vehicles/${v.vehicle_id}">${v.vehicle_registration_number}</a>`,
			sortable: true
		},
		{
			key: 'party_name',
			title: 'Party Name',
			value: (v) => v.party_name,
			renderValue: (v) =>
				`<a href="/org${organizationId}/parties/${v.ledger_id}">${v.party_name}</a>`,
			sortable: true
		},
		{
			key: 'origin',
			title: 'Origin',
			value: (v) => v.origin,
			renderValue: (v) => v.origin,
			sortable: true
		},
		{
			key: 'destination',
			title: 'Destination',
			value: (v) => v.destination,
			renderValue: (v) => v.destination,
			sortable: true
		},
		{
			key: 'rate',
			title: 'Rate',
			value: (v) => v.rate,
			renderValue: (v) => v.rate,
			sortable: true
		},
		{
			key: 'quantity',
			title: 'Quantity',
			value: (v) => v.quantity,
			renderValue: (v) => v.quantity || 'Fixed',
			sortable: true
		},
		{
			key: 'rate',
			title: 'Freight',
			value: (v) => (Number(v.rate) || 1) * (Number(v.quantity) || 1),
			renderValue: (v) => priceFormatter.format((Number(v.rate) || 1) * (Number(v.quantity) || 1)),
			sortable: true
		}
	];
</script>

<div class="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-4">
	<form on:submit|preventDefault={createNewRecord} class="space-y-8 divide-y divide-gray-200">
		<div class="space-y-8 divide-y divide-gray-200">
			<div>
				<div>
					<h3 class="text-lg leading-6 font-medium">Trip Details</h3>
					<!-- <p class="mt-1 text-sm text-gray-500">
						This information will be displayed publicly so be careful what you share.
					</p> -->
				</div>

				<div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
					<div class="sm:col-span-3">
						<label for="username" class="block text-sm font-medium"> Select Party </label>
						<div class="mt-1 flex rounded-md shadow-sm">
							<div class="w-full text-gray-900">
								<Select loadOptions={filteredParties} bind:value={selectedParty} />
							</div>
						</div>
					</div>
					<div class="sm:col-span-3">
						<label for="username" class="block text-sm font-medium"> Select Vehicle </label>
						<div class="mt-1 flex rounded-md shadow-sm">
							<div class="w-full text-gray-900">
								<Select loadOptions={filteredVehicles} bind:value={selectedVehicle} />
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="pt-2">
				<div>
					<h3 class="text-lg leading-6 font-medium">Route Information</h3>
					<!-- <p class="mt-1 text-sm text-gray-500">
						Route details of the trip
					</p> -->
				</div>
				<div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
					<div class="sm:col-span-3">
						<label for="first-name" class="block text-sm font-medium"> Origin </label>
						<div class="mt-1 text-gray-900">
							<Select loadOptions={filteredLocations} isCreatable={true} />
						</div>
					</div>

					<div class="sm:col-span-3">
						<label for="last-name" class="block text-sm font-medium"> Destination </label>
						<div class="mt-1 text-gray-900">
							<Select loadOptions={filteredLocations} isCreatable={true} />
						</div>
					</div>
					<div class="sm:col-span-6">
						<label for="postal-code" class="block text-sm font-medium"> Billing Type </label>
						<div class="mt-1">
							<fieldset class="mt-2">
								<legend class="sr-only">Choose a memory option</legend>
								<div class="grid grid-cols-3 gap-3 sm:grid-cols-6">
									{#each Object.entries(billingTypes) as [billingType, billingTypeData]}
										<label
											class="{billingType === selectedBillingType
												? 'bg-gray-600 text-gray-50 border-transparent hover:bg-gray-700'
												: 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'} border rounded-md py-3 px-3 flex items-center justify-center text-sm font-medium sm:flex-1 cursor-pointer focus:outline-none"
										>
											<input
												type="radio"
												name="memory-option"
												value={billingType}
												bind:group={selectedBillingType}
												class="sr-only"
											/>
											<p id="memory-option-0-label">{billingTypeData.title}</p>
										</label>
									{/each}
								</div>
							</fieldset>
						</div>
					</div>
					<div class="sm:col-span-2">
						<label for="city" class="block text-sm font-medium"> Rate </label>
						<div class="mt-1">
							<input
								type="number"
								name="city"
								id="city"
								bind:value={rate}
								autocomplete="address-level2"
								class="text-gray-900 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
							/>
						</div>
					</div>
					{#if selectedBillingType !== 'fixed'}
						<div class="sm:col-span-2">
							<label for="region" class="block text-sm font-medium"
								>Total {billingTypes[selectedBillingType].plural}</label
							>
							<div class="mt-1">
								<input
									type="number"
									name="region"
									id="region"
									step=".01"
									bind:value={quantity}
									autocomplete="address-level1"
									class="text-gray-900 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
								/>
							</div>
						</div>
					{/if}
					<div class="sm:col-span-6 flex flex-row justify-end gap-6 items-center">
						<p class="block text-lg font-medium">
							Total Freight <span class="text-xs"
								>{billingTypes[selectedBillingType].formula || ''}</span
							>
						</p>
						<p class="text-3xl">{priceFormatter.format(freight)}</p>
					</div>
				</div>
			</div>
		</div>

		<div class="pt-5">
			<div class="flex justify-center">
				<button
					type="submit"
					class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>Save Trip</button
				>
			</div>
		</div>
	</form>
</div>
