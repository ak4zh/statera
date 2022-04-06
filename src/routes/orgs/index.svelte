<script lang="ts">
	import { myMembershipsStore } from '$lib/utils/stores';
	import * as db from '$lib/db';
	import { writable } from 'svelte/store';
	import Modal, { bind } from 'svelte-simple-modal';
	import ModifyOrganizations from '$lib/components/orgs/ModifyOrganizations.svelte';
	import Icon from '@iconify/svelte';

	const modal = writable(null);

	function setModel(organizationId: string) {
		// @ts-ignore
		modal.set(bind(ModifyOrganizations, { organizationId }));
	}

	async function createNewOrg(e) {
		const formData = new FormData(e.target);
		const { data, error } = await db.myOrganizations.insert({
			name: formData.get('name'),
			description: formData.get('description') || null
		});
		if (!error) {
			const { data: membershipDate, error: membershipError } = await db.myMemberships.all();
			myMembershipsStore.set(membershipDate);
		}
	}
</script>

<Modal show={$modal} />

<div class="flex flex-col gap-4 m-4 max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-4">
	<h3 class="text-2xl text-center">Create New Company</h3>
	<form on:submit|preventDefault={createNewOrg} class="flex flex-col gap-2">
		<div class="flex flex-col w-full">
			<label for="name">Name</label>
			<input id="name" type="text" name="name" placeholder="company name" />
		</div>
		<div class="flex flex-col w-full">
			<label for="description">Description</label>
			<textarea name="description" placeholder="about the company" />
		</div>
		<button class="btn mx-auto">SUBMIT</button>
	</form>
</div>
<div class="flex flex-col gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl">
	<h3 class="text-2xl text-center">You are a member in following companies</h3>
	<div
		class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch rounded-xl p-4"
	>
		{#if $myMembershipsStore}
			{#each $myMembershipsStore as membership}
				<div>
					<a href="/orgs/{membership.organization_id}">
						<div
							class="relative pb-12 p-4 bg-gray-200 dark:bg-gray-600 rounded-t-xl text-center hover:bg-gray-300 hover:dark:bg-gray-500"
						>
							<h4 class="text-2xl break-all">{membership.organization_name}</h4>
							<p class="text-sm font-light">{membership.organization_description || ''}</p>
						</div>
					</a>
					<div class="flex flex-row justify-center">
						<button
							class="dark:text-red-600 text-red-600 hover:dark:bg-red-500 hover:bg-red-200 flex-grow py-2 rounded-bl-xl bg-gray-200 dark:bg-gray-700"
						>
							<Icon inline={true} icon="mdi:bin" height="16" class="mx-auto" />
						</button>
						<button
							class="bg-gray-200 dark:bg-gray-700 text-teal-600 hover:dark:bg-teal-400 hover:bg-teal-200 flex-grow py-2 rounded-br-xl"
							on:click={() => setModel(membership.organization_id)}
						>
							<Icon inline={true} icon="mdi:pencil" height="16" class="mx-auto" />
						</button>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
