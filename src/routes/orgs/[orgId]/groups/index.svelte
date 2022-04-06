<script lang="ts">
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import * as db from '$lib/db';
	import { accountGroupsStore } from '$lib/utils/stores';
	import { createForm } from 'felte';
	import { validator } from '@felte/validator-yup';
	import * as yup from 'yup';
	import reporter from '@felte/reporter-tippy';
	import Swal from 'sweetalert2';
	import { parseError } from '$lib/utils/parseErrors';

	// modal imports
	import { writable } from 'svelte/store';
	import Modal, { bind } from 'svelte-simple-modal';
	import ModifyAccountGroups from '$lib/components/orgs/ModifyAccountGroups.svelte';

	$: organizationId = $page.params.orgId;
	$: parentAccountGroups = $accountGroupsStore.reduce(
		(obj, item) => Object.assign(obj, { [item.id]: item.name }),
		{}
	);

	$: groupsById = $accountGroupsStore.reduce(
		(obj, item) => Object.assign(obj, { [item.id]: item }),
		{}
	);
	const validateSchema = yup.object({
		name: yup.string().required(),
		parent_id: yup.number().required()
	});

	const { form, data: formData } = createForm({
		initialValues: {
			parent_id: 1
		},
		extend: [reporter(), validator({ schema: validateSchema })],
		transform: (values) => ({
			...values,
			parent_id: parseInt(values.parent_id)
		}),
		onSubmit: async (values, context) => {
			const { data, error } = await db.accountGroups.insert(organizationId, values);
			if (error) {
				throw error;
			} else {
				accountGroupsStore.set([...$accountGroupsStore, data[0]]);
			}
		},
		onSuccess(response, context) {
			Swal.fire({
				position: 'top-end',
				title: `Account group ${$formData.name} created successfully.`,
				icon: 'success',
				showConfirmButton: false,
				timer: 1000
			});
		},
		onError(err, context) {
			Swal.fire({
				title: parseError(err),
				icon: 'error',
				showConfirmButton: true
			});
		}
	});

	const modal = writable(null);

	function setModel(accountGroupId: number, accountGroupName: string, accountGroupIcon: string) {
		modal.set(bind(ModifyAccountGroups, { accountGroupId, accountGroupName, accountGroupIcon }));
	}
</script>

<Modal show={$modal} />

<div class="flex flex-col gap-4 m-4 max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-4">
	<h3 class="text-2xl text-center">Add Account Group</h3>
	<form use:form class="flex flex-wrap justify-center gap-2">
		<div>
			<label for="name">Group Name</label>
			<input id="name" type="text" name="name" />
		</div>
		{#if $accountGroupsStore}
			<div>
				<label for="parent_id">Parent Group</label>
				<select id="parent_id" name="parent_id" class="text-gray-900">
					{#each $accountGroupsStore as accountGroup}
						<option value={accountGroup.id}
							>{accountGroup.parent_id
								? `${parentAccountGroups[accountGroup.parent_id]} => ${accountGroup.name}`
								: accountGroup.name}</option
						>
					{/each}
				</select>
			</div>
		{/if}
		<button class="btn">SUBMIT</button>
	</form>
</div>

<div class="flex flex-col gap-8">
	<div class="flex flex-col gap-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-xl">
		<div>
			<h2 class="text-3xl">Custom groups</h2>
			<p class="text-xs">You can modify or delete following groups.</p>
		</div>
		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 text-center gap-4 items-stretch">
			{#if $accountGroupsStore}
				{#each $accountGroupsStore as accountGroup}
					{@const icon = accountGroup.icon || groupsById[accountGroup.parent_id].icon}
					{#if accountGroup.organization_id}
						<div>
							<!-- <a href="/orgs/{organizationId}/groups/{accountGroup.id}"> -->
								<div
									class="transition ease-in-out bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 hover:dark:bg-gray-600 p-4 rounded-t-xl pb-8"
								>
									<Icon inline={true} {icon} height="32" class="mx-auto" />
									<h4 class="text-xl">{accountGroup.name}</h4>
									<p class="text-xs">{groupsById[accountGroup.parent_id].name}</p>
								</div>
							<!-- </a> -->
							<div class="flex flex-row justify-center">
								<button
									class="dark:text-red-600 text-red-600 hover:dark:bg-red-500 hover:bg-red-200 flex-grow py-2 rounded-bl-xl bg-gray-200 dark:bg-gray-700"
								>
									<Icon inline={true} icon="mdi:bin" height="16" class="mx-auto" />
								</button>
								<button
									class="bg-gray-200 dark:bg-gray-700 text-teal-600 hover:dark:bg-teal-400 hover:bg-teal-200 flex-grow py-2 rounded-br-xl"
									on:click={() => setModel(accountGroup.id, accountGroup.name, icon)}
								>
									<Icon inline={true} icon="mdi:pencil" height="16" class="mx-auto" />
								</button>
							</div>
						</div>
					{/if}
				{/each}
			{/if}
		</div>
	</div>
	<div class="flex flex-col bg-gray-100 dark:bg-gray-800 p-4 rounded-xl gap-4">
		<div>
			<h2 class="text-3xl">Pre-Defined Groups</h2>
			<p class="text-xs">You cannot modify or delete following groups.</p>
		</div>
		<div class="flex flex-col gap-4">
			<h3 class="text-xl">Primary Groups</h3>
			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 text-center gap-4">
				{#if $accountGroupsStore}
					{#each $accountGroupsStore as accountGroup}
						{#if !accountGroup.parent_id}
							<!-- <a href="/orgs/{organizationId}/groups/{accountGroup.id}"> -->
								<div
									class="transition ease-in-out bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 hover:dark:bg-gray-600 p-4 rounded-xl"
								>
									<Icon
										inline={true}
										icon={accountGroup['icon'] || 'mdi:alert-circle-outline'}
										height="32"
										class="mx-auto"
									/>
									{accountGroup.name}
								</div>
							<!-- </a> -->
						{/if}
					{/each}
				{/if}
			</div>
		</div>

		<div class="flex flex-col gap-4">
			<h3 class="text-xl">Sub Groups</h3>
			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 text-center gap-4">
				{#if $accountGroupsStore}
					{#each $accountGroupsStore as accountGroup}
						{#if accountGroup.parent_id && !accountGroup.organization_id}
							<!-- <a href="/orgs/{organizationId}/groups/{accountGroup.id}"> -->
								<div
									class="transition ease-in-out bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 hover:dark:bg-gray-600 p-4 rounded-xl"
								>
									<Icon
										inline={true}
										icon={accountGroup['icon'] || 'mdi:moped-electric'}
										height="32"
										class="mx-auto"
									/>
									{accountGroup.name}
								</div>
							<!-- </a> -->
						{/if}
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>
