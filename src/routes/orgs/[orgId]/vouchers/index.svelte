<script lang="ts">
    import { page } from "$app/stores";
    import { voucherTypesStore } from "$lib/utils/stores";
    $: organizationId = $page.params.orgId
</script>

<div class="flex flex-col gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl">
	<h3 class="text-2xl text-center">Select a Voucher type to create a new voucher</h3>
	<div
		class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch rounded-xl p-4"
	>
			{#each $voucherTypesStore as voucherType}
                <a href="/orgs/{organizationId}/vouchers/{voucherType.name.toLowerCase().replace(' ', '-')}">
                    <div
                        class="relative pb-12 p-4 bg-gray-200 dark:bg-gray-600 rounded-xl text-center hover:bg-gray-300 hover:dark:bg-gray-500"
                    >
                        <h4 class="text-2xl break-all">{voucherType.name}</h4>
                    </div>
                </a>
			{/each}
	</div>
</div>
