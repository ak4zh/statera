<script lang="ts">
	import Keydown from "svelte-keydown";
    import { goto } from '$app/navigation';
    import { page } from "$app/stores";

    $: organizationId = $page.params.orgId

    const shortcuts = {
        F1: {title: 'Select Company', path: '/orgs', forOrg: false},
        F4: {title: 'Sales', path: '/vouchers/sales', forOrg: true},
		F5: {title: 'Purchase', path: '/vouchers/purchase', forOrg: true},
		F6: {title: 'Payment', path: '/vouchers/payment', forOrg: true},
		F7: {title: 'Receipt', path: '/vouchers/receipt', forOrg: true},
		F8: {title: 'Contra', path: '/vouchers/contra', forOrg: true},
		F9: {title: 'Journal', path: '/vouchers/journal', forOrg: true}
    }
    $: currentShortcuts = Object.fromEntries(Object.entries(shortcuts).filter(([key, value]) => value.forOrg ? organizationId : !value.forOrg) )
</script>

<Keydown
	on:keydown={(e) => {
		if (Object.keys(shortcuts).includes(e.key)) {
            e.preventDefault()
            if (!shortcuts[e.key].forOrg || (shortcuts[e.key].forOrg && organizationId)) goto(
                shortcuts[e.key].forOrg ? `/orgs/${organizationId}${shortcuts[e.key].path}` : shortcuts[e.key].path
            )
        };
	}}
/>

<div
	class="hidden sm:block fixed md:sticky bottom-0 top-0 inset-x-0 justify-center md:h-screen w-full h-16 md:flex-fit bg-teal-800 text-white text-xs">
    {#each Object.entries(currentShortcuts) as [shortcutKey, shortcutData]}
        {@const fullPath = shortcutData.forOrg ? `/orgs/${organizationId}${shortcutData.path}` : shortcutData.path}
            <a 
            href="{fullPath}" 
            class="{$page.url.pathname === fullPath ? 'bg-teal-500' : ''} 
            block border-green-50 border-b-2 w-full py-3 px-3 text-left hover:bg-teal-300 hover:text-teal-800
            transition duration-300">
                <span class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-teal-900 bg-teal-100 rounded-full">{shortcutKey}</span>
                {shortcutData.title}
            </a>
    {/each}
</div>
