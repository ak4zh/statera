<script lang="ts">
    import { page } from "$app/stores";
    import { supabase } from "$lib/db";
    import { ledgersStore, organizationIdStore, transactionsStore, accountGroupsStore, voucherTypesStore, accountGroupsCteStores, locationSuggestionsStore, vehiclesStore } from "$lib/utils/stores";
    import { onMount } from "svelte";

    $: organizationIdStore.set($page.params.orgId)

    onMount(async() => {
        const {data: ledgerData} = await supabase
            .from('ledgers')
            .select('*, account_groups(name)')
            .eq('organization_id', $organizationIdStore)
        ledgersStore.set(ledgerData || [])

        const {data: transactionData} = await supabase
            .from('transactions')
            .select('*, journals(*, ledgers(name, account_group_id))')
            .eq('organization_id', $organizationIdStore)
        transactionsStore.set(transactionData || [])

        const {data: accountGroupsData} = await supabase
            .from('account_groups')
            .select('*')
            .or(`organization_id.is.null,organization_id.eq.${$organizationIdStore}`)
        accountGroupsStore.set(accountGroupsData || [])

        const {data: accountGroupsCteData} = await supabase
            .rpc('account_groups_cte', {org_id: $organizationIdStore})
            .select('*')
        accountGroupsCteStores.set(accountGroupsCteData)

        const {data: locationSuggestionsData} = await supabase
            .rpc('location_suggestions', {'org_id': $organizationIdStore})
            .select('*')
        locationSuggestionsStore.set(locationSuggestionsData.map(e => e.location))

        const {data: vehiclesData} = await supabase
            .rpc('transactions_distinct_values', {'org_id': $organizationIdStore, 'key': 'vehicle_number'})
            .select('*')
            vehiclesStore.set(vehiclesData.map(e => e.value))
    })
</script>

<slot />
