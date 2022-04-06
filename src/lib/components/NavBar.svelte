<script lang="ts">
	import { user, auth } from '$lib/db';
	import { darkMode } from '$lib/utils/userPref';
</script>

<header class="p-4">
	<div class="flex flex-col md:flex-row justify-between place-items-center m-4">
		<div class="pb-4">
			<a href="/">
				<h1 class="text-2xl md:text-3xl">StatEra</h1>
			</a>
		</div>
		<div class="flex gap-4">
			<button class="" on:click={() => ($darkMode = !$darkMode)}>
				{#if $darkMode}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
						/>
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
						/>
					</svg>
				{/if}
			</button>
			{#if $user}
				<a href="/orgs"><button class="btn">Companies</button></a>
				<button class="btn" on:click={() => auth.signOut()}>Sign Out</button>
			{:else}
				<a href="/auth"><button class="btn">Sign In / Sign Up</button></a>
			{/if}
		</div>
	</div>
</header>
