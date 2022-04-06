<script lang="ts">
	import { page } from '$app/stores';
	import { ledgersStore, accountGroupsStore } from '$lib/utils/stores';
	import SvelteTable from 'svelte-table';
	import { priceFormatter } from '$lib/utils/dataFormatter';
	import Chart from 'svelte-frappe-charts';

	$: accountGroupOptions = ($accountGroupsStore || []).reduce(
		(obj, item) => Object.assign(obj, { [item.id]: item.name }),
		{}
	);

	$: balanceColumns = [
		{
			key: 'name',
			title: 'Name',
			value: (v) => v.name,
			renderValue: (v) => `<a href="/orgs/${v.organization_id}/${v.account_groups.slug}/${v.id}">${v.name}</a>`,
			sortable: true,
			class: 'text-left',
			headerClass: 'text-left'
		},
		{
			key: 'account_group_id',
			title: 'Account Type',
			value: (v) => v.account_group_id,
			renderValue: (v) => `<a href="/orgs/${v.organization_id}/${v.account_groups.slug}">${accountGroupOptions[v.account_group_id]}</a>`,
			sortable: true
		},
		{
			key: 'closing_balance',
			title: 'Closing Balance',
			value: (v) => v.closing_balance,
			renderValue: (v) => priceFormatter.format(v.closing_balance),
			sortable: true,
			class: 'text-right',
			headerClass: 'text-right'
		}
	];
	$: chartData = $accountGroupsStore.reduce(
		(obj, item) =>
			Object.assign(obj, {
				[item.id]: {
					labels: $ledgersStore
						.filter((account) => account.account_group_id === item.id)
						.map((a) => a.name),
					datasets: [
						{
							name: item.name,
							values: $ledgersStore
								.filter((account) => account.account_group_id === item.id)
								.map((a) => a.closing_balance),
							chartType: 'bar'
						}
					]
				}
			}),
		{}
	);
</script>

<div
	class="flex flex-col gap-4 p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-center max-w-7xl mx-auto text-xs sm:text-sm md:text-base"
>
	<h3 class="text-2xl text-center">Account Balances</h3>
	<SvelteTable
		columns={balanceColumns}
		rows={$ledgersStore}
		classNameThead="bg-gray-600 dark:bg-gray-400 text-gray-100 dark:text-gray-900"
	/>
</div>

{#each Object.entries(chartData) as [accountGroupId, accountChartData]}
	{#if accountGroupId !== '5' && accountChartData.labels.length}
		<h2>{accountGroupOptions[accountGroupId]}</h2>
		<Chart data={accountChartData} />
	{/if}
{/each}
