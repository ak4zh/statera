<script lang="ts">
	import SvelteTable from 'svelte-table';
	import { priceFormatter } from '$lib/utils/dataFormatter';
	import { transactionsStore, voucherTypesStore, accountGroupsStore } from '$lib/utils/stores';

	const returnLedgerType = {
		1: false,
		2: true,
		3: false,
		4: true
	}
	$: rows = $transactionsStore || [];
	$: columns = [
		{
			key: 'date',
			title: 'Date',
			value: (v) => v.date,
			renderValue: (v) =>
				new Date(v.created_at).toLocaleString('en-GB', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit'
				}),
			sortable: true,
			class: 'text-left',
			headerClass: 'text-left'
		},
		{
			key: 'particulars',
			title: 'Particulars',
			value: (v) => {
				return v.journals.filter((j) => returnLedgerType[v.voucher_id] ? j.is_credit : !j.is_credit)[0].ledgers.name
			},
			renderValue: (v) => {
				let selectedJournal = v.journals.filter((j) => returnLedgerType[v.voucher_id] ? j.is_credit : !j.is_credit)[0]
				return `${selectedJournal.ledgers.name}`
			},
			sortable: true,
		},
		{
			key: 'voucher_type',
			title: 'Voucher',
			value: (v) => $voucherTypesStore.find(e => e.id === v.voucher_id).name,
			renderValue: (v) => $voucherTypesStore.find(e => e.id === v.voucher_id).name,
			sortable: true,
		},

		{
			key: 'amount',
			title: 'Amount',
			value: (v) =>
				v.journals
					.filter((j) => j.is_credit)
					.map((e) => e.amount)
					.reduce((partialSum, a) => partialSum + a, 0),
			renderValue: (v) =>
				priceFormatter.format(
					v.journals
						.filter((j) => j.is_credit)
						.map((e) => e.amount)
						.reduce((partialSum, a) => partialSum + a, 0)
				), // capitalize
			sortable: true,
			class: 'text-right',
			headerClass: 'text-right'
		}
	];
	function handleExpand(event) {
		const row = event.detail.row;
		const operation = row.$expanded ? 'open' : 'close';
	}
</script>

<div class="max-w-7xl mx-auto">

	<div
		class="flex flex-col gap-4 p-2 bg-white dark:bg-gray-800 rounded-xl text-center max-w-7xl mx-auto text-xs sm:text-sm md:text-base"
	>
		<h3 class="text-2xl text-center">Day Book</h3>
		<SvelteTable
			{columns}
			{rows}
			showExpandIcon={true}
			expandSingle={true}
			expandRowKey="id"
			iconExpand="⌄"
			iconExpanded="⌃"
			classNameThead="bg-gray-600 dark:bg-gray-400 text-gray-100 dark:text-gray-900"
			on:clickExpand={handleExpand}
		>
			<div slot="expanded" let:row class="flex flex-col justify-center gap-2 text-xs">
				<div class="grid grid-cols-3 font-semibold">
					<p>Ledger</p>
					<p>Credit</p>
					<p>Debit</p>
				</div>
				{#each [true, false] as is_credit}
					{#each row.journals as journal}
						{#if journal.is_credit == is_credit}
							<div class="grid grid-cols-3">
								<p>{journal.ledgers.name}</p>
								<p>{is_credit ? journal.amount : ''}</p>
								<p>{is_credit ? '' : journal.amount}</p>
							</div>
						{/if}
					{/each}
				{/each}
			</div>
		</SvelteTable>
	</div>
</div>
