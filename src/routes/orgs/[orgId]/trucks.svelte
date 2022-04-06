<!-- <script lang="ts">
	import { supabase, organizations } from '$lib/db';
	import { writable } from 'svelte/store';
	import { page } from '$app/stores';

	$: organizationId = $page.params.orgId;

	let vehicles = writable(null);

	async function updateAccounts() {
		const { data, error } = await organizations.vehicles(organizationId);
		vehicles.set(data);
	}

	$: (async () => {
		if (organizationId) {
			await updateAccounts();
		}
	})();
	async function createNewAccount(e) {
		const formData = new FormData(e.target);
		const { data, error } = await supabase.from('vehicles').insert({
			registration_number: formData.get('registration_number'),
			organization_id: organizationId
		});
		await updateAccounts();
	}
</script>

<div class="flex flex-col gap-4 m-4 max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-4">
	<h3 class="text-2xl text-center">Add Vehicle</h3>
	<form on:submit|preventDefault={createNewAccount} class="flex flex-col gap-2">
		<div class="flex flex-col w-full">
			<label for="name">Registration Number</label>
			<input id="name" type="text" name="registration_number" />
		</div>
		<button class="btn mx-auto">SUBMIT</button>
	</form>
</div>
<div class="flex flex-col gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl">
	<h3 class="text-2xl text-center">List of Vehicles</h3>
	<div
		class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ledgers-stretch rounded-xl p-4"
	>
		{#if $vehicles}
			{#each $vehicles as vehicle}
				<div class="relative pb-12 p-4 bg-gray-50 dark:bg-gray-600 rounded-xl text-center">
					<h4 class="text-2xl break-all">{vehicle.registration_number}</h4>
					<a href="/orgs/{vehicle.organizationId}">
						<button
							class="absolute btn inset-x-0 bottom-0 text-center w-full hover:dark:bg-gray-500"
							>Enter</button
						>
					</a>
				</div>
			{/each}
		{/if}
	</div>
</div> -->
