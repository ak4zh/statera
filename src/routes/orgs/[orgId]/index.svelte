<script lang="ts">
	import { page } from "$app/stores";
	import { supabase } from "$lib/db";
	import { priceFormatter } from "$lib/utils/dataFormatter";
	import { voucherTypesStore } from "$lib/utils/stores";
	import { onMount } from "svelte";
	import { writable } from "svelte/store";

	$: organizationId = $page.params.orgId

	let financialTotals = writable([])
	onMount(async () => {
		const {data, error} = await supabase
			.rpc('get_financial_totals', {'org_id': organizationId})
			.select('*')
		financialTotals.set(data)
	})
	$: dataLoaded = $voucherTypesStore.length && $financialTotals.length
</script>

<div>
	<h3 class="text-lg leading-6 font-medium text-gray-900">Last 30 days</h3>
	<dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
		{#if dataLoaded }
			{#each $voucherTypesStore as voucherType}
				{@const financialTotal = $financialTotals.find(e => e.voucher_id === voucherType.id) || null}
				<div class="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
					<dt class="text-sm font-medium text-gray-500 truncate">Total {voucherType.name}</dt>
					<dd class="mt-1 text-3xl font-semibold text-gray-900">{
						priceFormatter.format(financialTotal?.total || 0)
					}</dd>
				</div>
			{/each}
		{/if}
	</dl>
</div>
