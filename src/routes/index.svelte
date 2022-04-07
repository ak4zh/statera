<script>
	import NavBar from '$lib/components/NavBar.svelte';
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<NavBar />
<section>
	<main class="mt-16 mx-auto max-w-7xl px-4 sm:mt-24">
	<div class="text-center">
		<h1 class="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl">
		Manages your money matters'<br />
		<span class="block text-transparent bg-clip-text bg-gradient-to-br from-green-500 to-pink-500 xl:inline">because your money matters</span>
		</h1>
		<p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">Yet another accounting software? But why? umm... why not 😕 !</p>
		<div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
		<div class="rounded-md shadow">
			<a href="/orgs" class="w-full bg-gradient-to-br from-green-500 hover:from-green-400 hover:to-pink-400 to-pink-500 flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white md:py-4 md:text-lg md:px-10"> Get started </a>
		</div>
	</div>
	</div>
	</main>
</section>
