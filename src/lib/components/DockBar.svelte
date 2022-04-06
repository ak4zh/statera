<script lang="ts">
	import { page } from '$app/stores';
	// @ts-ignore
	import Icon from '@iconify/svelte';

	$: baseUrl = `/orgs/${$page.params.orgId}`;

	const baseTabs = {
		"Dashboard": {
			"url": "/",
			"icon": "mdi:monitor-dashboard"
		},
		"Account Groups": {
			"url": "/groups",
			"icon": "mdi:select-group"
		},
		"Ledgers": {
			"url": "/ledgers",
			"icon": "mdi:book-open"
		},
		"Vouchers": {
			"url": "/vouchers",
			"icon": "mdi:receipt-text-check"
		},
		"Reports": {
			"url": "/reports",
			"icon": "mdi:finance"
		}
	}
	$: tabs = $page.params.orgId ? baseTabs : []
	let inline = false;
</script>

<nav
	class="flex md:block fixed md:sticky bottom-0 md:top-0 inset-x-0 justify-center md:h-screen w-full h-16 md:flex-fit bg-gray-200 dark:bg-gray-600 text-xs"
>
	{#each Object.entries(tabs) as [tabName, tabData]}
		{@const currentUrl = `${baseUrl}${tabData['url'] || ''}`}
		<a
			href={currentUrl}
			class="{$page.url.pathname === currentUrl ? 'border-b-4 md:border-b-0 md:border-r-4' : ''}
			block border-gray-700 dark:border-gray-300 w-full py-3 px-3 text-center hover:bg-gray-300 hover:text-gray-800
			transition duration-300"
		>
			<Icon {inline} icon={tabData['icon']} height="30" class="mx-auto" />
			<span>{tabName}</span>
		</a>
	{/each}
</nav>
