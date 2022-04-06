<script lang="ts">
	import '../app.css';
	import { navigating, page } from '$app/stores';
	import { browser } from '$app/env';
	import { goto } from '$app/navigation';
	import { user } from '$lib/db';
	import { darkMode } from '$lib/utils/userPref';
	import Loader from '$lib/components/Loader.svelte';
	import { loading } from '$lib/utils/stores';
	import 'sweetalert2/src/sweetalert2.scss';
	import 'tippy.js/dist/tippy.css';

	$: {
		if (browser) {
			if (!['/', '/auth'].includes($page.url.pathname) && !$user) {
				goto('/auth');
			}
		}
	}
	$: dark = $darkMode;
</script>

<div class:dark>
	<div
		class="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-300 min-h-screen break-words"
	>
		<div>
			{#if $navigating }
				<Loader />
			{/if}
			<slot />
		</div>
	</div>
</div>
