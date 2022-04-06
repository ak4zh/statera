<script>
	import { page } from "$app/stores";
</script>
<div class="flex flex-wrap gap-4">
	<a href="{$page.url.pathname}/ledger-balances">
		<div class="p-4 bg-gray-200 rounded-xl hover:bg-gray-300">
			Ledger Balances
		</div>	
	</a>
	<a href="{$page.url.pathname}/day-book">
		<div class="p-4 bg-gray-200 rounded-xl hover:bg-gray-300">
			Day Book
		</div>
	</a>
</div>