<script lang="ts">
	import { priceFormatter } from '$lib/utils/dataFormatter';
	import Select from 'svelte-select';
	import { validateSchema, getForm, validateForm, add, remove } from '$lib/utils/vouchers/form';
	import { writable } from 'svelte/store';
    import { ledgersStore, accountGroupsCteStores, getFilteredLedgerOptions, locationSuggestionsStore, vehiclesStore } from '$lib/utils/stores' 
	import { page } from '$app/stores';
    import { billingTypes } from '$lib/utils/vouchers/trips';
    import Icon from '@iconify/svelte';
    import { createQueryStore } from '$lib/utils/query';
    
    const purchaseQuery = createQueryStore('purchase');
	let isPurchase: boolean = $purchaseQuery ? true : false;
    const salePurchaseTitle = isPurchase ? 'Purchase' : 'Sales'
    let rate: string
	let quantity: string
	let selectedBillingType = 'tonne'
    $: quantity = selectedBillingType === 'fixed' ? '1' : quantity
	$: freight = (Number(rate) || 0) * (Number(quantity) || 1)
    const organizationId = $page.params.orgId
    const creditMainNodes = isPurchase ? [9] : [11]
    const debitMainNodes = isPurchase ? [16] : [28]
    const initialTrxType = isPurchase ? 'credit' : 'debit'
    const newAddType = initialTrxType === 'credit' ? 'debit' : 'credit'
    $: creditAccounts = $accountGroupsCteStores.length ? getFilteredLedgerOptions($ledgersStore, $accountGroupsCteStores, creditMainNodes) : []
    $: debitAccounts = $accountGroupsCteStores.length ? getFilteredLedgerOptions($ledgersStore, $accountGroupsCteStores, debitMainNodes) : []

	$: voucherTypeId = isPurchase ? 2 : 1
	$: voucherTitle = isPurchase ? 'Trip Bookings (Purchase)' : 'Trip Bookings (Sales)'

	let creditEqualsDebit = writable(true)
	const validationSchema = validateSchema(creditEqualsDebit)	
	const {form, data: formData, errors: formErrors} = getForm(organizationId, validationSchema)
    $: if($formData.journals && $formData.journals.length == 1)  add(formData, 0, newAddType);
	$: if ($formData.transaction) $formData.transaction.voucher_id = voucherTypeId
	$formData.journals[1] = $formData.journals[0]

	let journalCreditTotal, journalDebitTotal, journalDiffType, journalDiffIsCredit, journalDiffAbs, addJournalButtonText, roundOff
	$: {
		[journalCreditTotal, journalDebitTotal, journalDiffType, journalDiffIsCredit, journalDiffAbs, addJournalButtonText, roundOff] = validateForm($formData);
		creditEqualsDebit.set(journalDiffAbs === 0)
        $formData.journals[0].type = initialTrxType
        $formData.transaction.data.billing_type = selectedBillingType
        if ($formData.journals[1]) $formData.journals[1].amount = freight
        $formData.journals[0].amount = freight  
    }

</script>

<div class="max-w-7xl mx-auto">
	<div class="flex flex-col gap-4 m-4 max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-4">
		<h3 class="text-2xl text-center">Add {voucherTitle} Voucher</h3>
		<form use:form class="flex flex-col gap-2">
			<div class="self-end">
				<label for="transaction.date">Date</label>
				<input
					type="date"
					id="transaction.date"
					name="transaction.date"
					class="text-gray-900"
				/>
			</div>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-200 p-4 rounded-xl mb-4">
                <div class="w-full">
                    <label for="first-name" class="block text-sm font-medium">
                        <Icon inline={true} icon="mdi:truck-check" height="32" class="mx-auto" />
                        Vehicle Number
                    </label>
                    
                    <div class="mt-1 text-gray-900 flex flex-row">
                        <div class="w-full">
                            <Select items={$vehiclesStore} isCreatable={true} 
                                on:select={(e) => {
                                    $formData.transaction.data.vehicle_number = e.detail.value.toUpperCase();
                                    if (!$vehiclesStore.includes(e.detail.value.toUpperCase())) vehiclesStore.set([e.detail.value.toUpperCase(), ...$vehiclesStore])
                                }}
                                on:clear={(e) => {
                                    $formData.transaction.data.vehicle_number = undefined;
                                }}
                                inputAttributes={{ name: 'transaction.data.vehicle_number' }}
                            />
                        </div>
                    </div>
                </div>
                <div class="w-full">
                    <label for="first-name" class="block text-sm font-medium"> 
                        <Icon inline={true} icon="mdi:map-marker-check-outline" height="32" class="mx-auto" />
                        Origin 
                    </label>
                    <div class="mt-1 text-gray-900 flex flex-row">
                        <div class="w-full">
                            <Select items={$locationSuggestionsStore} isCreatable={true} 
                            on:select={(e) => {
                                $formData.transaction.data.origin = e.detail.value.toUpperCase();
                                if (!$locationSuggestionsStore.includes(e.detail.value.toUpperCase())) locationSuggestionsStore.set([e.detail.value.toUpperCase(), ...$locationSuggestionsStore])
                            }}
                            on:clear={(e) => {
                                $formData.transaction.data.origin = undefined;
                            }}
                            inputAttributes={{ name: 'transaction.data.origin' }}
                            />
    
                        </div>
                    </div>
                </div>
    
                <div class="w-full">
                    <label for="last-name" class="block text-sm font-medium"> 
                        <Icon inline={true} icon="mdi:map-marker-check" height="32" class="mx-auto" />
                        Destination
                    </label>
                    <div class="mt-1 text-gray-900">
                        <Select items={$locationSuggestionsStore} isCreatable={true}
                        on:select={(e) => {
                            $formData.transaction.data.destination = e.detail.value.toUpperCase();
                            if (!$locationSuggestionsStore.includes(e.detail.value.toUpperCase())) locationSuggestionsStore.set([e.detail.value.toUpperCase(), ...$locationSuggestionsStore])
                        }}
                        on:clear={(e) => {
                            $formData.transaction.data.destination = undefined;
                        }}
                        inputAttributes={{ name: 'transaction.data.destination' }}
                        />
                    </div>
                </div>
    
            </div>
            <div class="flex flex-col gap-4 bg-gray-200 p-4 rounded-xl mb-4">
                <div class="flex flex-row gap-4 justify-items-center">
                    <div class="w-32">Party A/c</div>
                    <div class="flex-grow">
                        <Select
                        items={debitAccounts}
                        on:select={(e) => {
                            $formData.journals[0].ledger_id = e.detail.value;
                        }}
                        on:clear={(e) => {
                            $formData.journals[0].ledger_id = undefined;
                        }}
                        inputAttributes={{ name: `journals[0].ledger_id` }}
                        />
                    </div>
                </div>
    
                <div class="flex flex-col gap-4">
                    <div class="flex flex-row flex-wrap gap-2 max-w-9/10">
                        <div class="w-32">{salePurchaseTitle} A/c</div>
                        <div class="basis-32 flex-grow text-gray-900">
                            <Select
                                items={creditAccounts}
                                on:select={(e) => {
                                    $formData.journals[1].ledger_id = e.detail.value;
                                }}
                                on:clear={(e) => {
                                    $formData.journals[1].ledger_id = undefined;
                                }}
                                inputAttributes={{ name: `journals[1].ledger_id` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-col gap-4 bg-gray-200 p-4 rounded-xl mb-4">
                <div class="sm:col-span-6">
                    <label for="postal-code" class="block text-sm font-medium">Billing Type </label>
                    <div class="mt-1">
                        <fieldset class="mt-2">
                            <legend class="sr-only">Choose billing type</legend>
                            <div class="grid grid-cols-3 gap-3 sm:grid-cols-6">
                                {#each Object.entries(billingTypes) as [billingType, billingTypeData]}
                                    <label
                                        class="{billingType === selectedBillingType
                                            ? 'bg-gray-600 text-gray-50 border-transparent hover:bg-gray-700'
                                            : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'} border rounded-md py-3 px-3 flex items-center justify-center text-sm font-medium sm:flex-1 cursor-pointer focus:outline-none"
                                    >
                                        <input
                                            type="radio"
                                            name="memory-option"
                                            value={billingType}
                                            bind:group={selectedBillingType}
                                            class="sr-only"
                                        />
                                        <p id="memory-option-0-label">{billingTypeData.title}</p>
                                    </label>
                                {/each}
                            </div>
                        </fieldset>
                    </div>
                </div>

                <div class="sm:col-span-2">
                    <label for="transaction.data.rate" class="block text-sm font-medium"> Rate </label>
                    <div class="mt-1">
                        <input
                            type="number"
                            name="transaction.data.rate"
                            id="transaction.data.rate"
                            bind:value={rate}
                            autocomplete="address-level2"
                            class="text-gray-900 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                    </div>
                </div>
                {#if selectedBillingType !== 'fixed'}
                    <div class="sm:col-span-2">
                        <label for="transaction.data.quantity" class="block text-sm font-medium"
                            >Total {billingTypes[selectedBillingType].plural}</label
                        >
                        <div class="mt-1">
                            <input
                                type="number"
                                name="transaction.data.quantity"
                                id="transaction.data.quantity"
                                step=".01"
                                bind:value={quantity}
                                autocomplete="address-level1"
                                class="text-gray-900 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                {/if}
                <div class="sm:col-span-6 flex flex-row justify-end gap-6 items-center">
                    <p class="block text-lg font-medium">
                        Total Freight <span class="text-xs"
                            >{billingTypes[selectedBillingType].formula || ''}</span
                        >
                    </p>
                    <p class="text-3xl">{priceFormatter.format(freight)}</p>
                </div>
            </div>
		<div class="flex flex-col w-full">
			<label for="transaction.description">Description</label>
			<textarea id="transaction.description" name="transaction.description" />
		</div>
		<button class="btn btn-primary mx-auto" type="submit">SUBMIT</button>
		</form>
	</div>
</div>
