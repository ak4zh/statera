<script lang="ts">
	import DockBar from '$lib/components/DockBar.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import ShortcutsBar from '$lib/components/ShortcutsBar.svelte';
    import { supabase } from "$lib/db";
    import { myMembershipsStore, voucherTypesStore } from "$lib/utils/stores";
    import { onMount } from "svelte";

	
	onMount(async () => {
		const {data: membershipData} = await supabase.from('my_memberships').select('*');
		myMembershipsStore.set(membershipData)
		
		const {data: voucherData} = await supabase.from('vouchers').select('*')
		voucherTypesStore.set(voucherData)
	})
</script>

<div class="flex flex-row md:flex-row">
	<div class="flex z-40">
		<DockBar />
	</div>
	<div class="flex-1 flex-grow m-2 mb-40">
		<NavBar />
		<slot />
	</div>
	<div class="flex z-40">
		<ShortcutsBar />
	</div>
</div>

