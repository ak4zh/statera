<script lang="ts">
	import { accountGroupsStore } from '$lib/utils/stores';
	import * as db from '$lib/db';
	import { getContext, onMount } from 'svelte';
	import Swal from 'sweetalert2';
	import { parseError } from '$lib/utils/parseErrors';
	import { mdiIconTags } from '$lib/utils/iconTags';
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';

	export let accountGroupId: number;
	export let accountGroupName: string = '';
	export let accountGroupIcon: string = '';
	let prefix = 'mdi:';
	let selectedIcon = accountGroupIcon.replace(prefix, '');
	$: mdiIcon = selectedIcon ? `${prefix}${selectedIcon}` : null;
	let availableIcons = [];
	let iconString: string;
	let iconSearchString = 'bank,credit-card,account';

	const { open, close } = getContext('simple-modal');

	async function updateAccountGroup() {
		const { data, error } = await db.accountGroups.update(accountGroupId, {
			name: accountGroupName,
			icon: mdiIcon
		});
		if (error) {
			Swal.fire({
				title: parseError(error),
				icon: 'error'
			});
		} else {
			let objIndex = $accountGroupsStore.findIndex((obj) => obj.id == accountGroupId);
			$accountGroupsStore[objIndex] = data[0];
			close();
		}
	}

	$: availableIconTags = mdiIconTags
		.filter((a) => (iconString || iconSearchString).split(',').some((x) => a.includes(x)))
		.slice(0, 18)
		.join(',');
	async function loadIcons(text: string) {
		const response = await fetch(`https://api.iconify.design/mdi.json?icons=${text}`);
		const icons = await response.json();
		availableIcons = Object.keys(icons.icons).map((key) => {
			return {
				value: key,
				label: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="mx-auto iconify iconify--mdi" width="32" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" style="vertical-align: -0.125em; ">${icons.icons[key].body}</svg>`
			};
		});
	}
	onMount(async () => {
		await loadIcons(availableIconTags);
	});
	$: loadIcons(availableIconTags);
</script>

<form on:submit|preventDefault={updateAccountGroup} class="flex flex-col gap-4">
	<div
		class="transition ease-in-out bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 hover:dark:bg-gray-600 p-4 rounded-xl text-center"
	>
		<Icon inline={true} icon={mdiIcon} height="32" class="mx-auto" />
		<h2 class="text-xl">{accountGroupName}</h2>
	</div>
	<div class="flex flex-col gap-4">
		<div>
			<label for="name">Group Name</label>
			<input type="text" name="name" id="name" bind:value={accountGroupName} />
		</div>
		<div>
			<label for="icon-search">Search Icon</label>
			<input
				id="icon-search"
				name="icon-search"
				placeholder="type to search icons"
				type="text"
				bind:value={iconString}
			/>
		</div>
		<div>
			<fieldset class="mt-2">
				<legend class="sr-only">Choose a memory option</legend>
				<div class="grid grid-cols-3 gap-3 sm:grid-cols-6">
					{#each availableIcons as availableIcon}
						<label
							class="{selectedIcon === availableIcon.value
								? 'bg-gray-600 text-gray-50 border-transparent hover:bg-gray-700'
								: 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'} border rounded-md py-3 px-3 flex items-center justify-center text-sm font-medium sm:flex-1 cursor-pointer focus:outline-none"
						>
							<input
								type="radio"
								value={availableIcon.value}
								bind:group={selectedIcon}
								class="sr-only"
							/>
							{@html availableIcon.label}
						</label>
					{/each}
				</div>
			</fieldset>
		</div>

		<button class="success-btn mx-auto" type="submit">Submit</button>
	</div>
</form>
