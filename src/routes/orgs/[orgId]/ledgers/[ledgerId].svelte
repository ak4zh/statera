<script lang="ts">
	import SvelteTable from 'svelte-table';
	import { accountGroupsStore, ledgersStore } from '$lib/utils/stores';
	import { priceFormatter } from '$lib/utils/dataFormatter';
	import { page } from '$app/stores';
	
	$: ledgerId = $page.params.ledgerId

	$: accountGroupOptions = $accountGroupsStore.reduce(
		(obj, item) => Object.assign(obj, { [item.slug]: obj }),
		{}
	);
	$: ledgersById = $ledgersStore.reduce((obj, item) => {
		obj[item.id] = item 
		return obj 
	}, {})

	$: rows = [];
	$: columns = [
		{
			key: 'name',
			title: 'Name',
			value: (v) => v.name,
			renderValue: (v) => `<a href="/orgs/${v.organization_id}/ledgers/${v.id}">${v.name}</a>`,
			sortable: true,
			class: 'text-left',
			headerClass: 'text-left'
		},
		{
			key: 'account_group_id',
			title: 'Account Type',
			value: (v) => v.account_group_id,
			renderValue: (v) => `<a href="/orgs/${v.organization_id}/">${accountGroupOptions[v.account_group_id]}</a>`,
			sortable: true
		},
		{
			key: 'amount',
			title: 'Amount',
			value: (v) => v.amount,
			renderValue: (v) => priceFormatter.format(v.amount),
			sortable: true,
			class: 'text-right',
			headerClass: 'text-right'
		}
	];
</script>

<div
	class="flex flex-col gap-4 p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-center max-w-7xl mx-auto text-xs sm:text-sm md:text-base"
>
	<h3 class="text-2xl text-center">{ledgersById[ledgerId]}</h3>
	<SvelteTable
		columns={columns}
		rows={rows}
		classNameThead="bg-gray-600 dark:bg-gray-400 text-gray-100 dark:text-gray-900"
	/>
</div>