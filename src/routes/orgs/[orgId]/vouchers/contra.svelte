<script lang="ts">
	import { priceFormatter } from '$lib/utils/dataFormatter';
	import Select from 'svelte-select';
	import { getFilteredLedgerOptions } from '$lib/utils/stores';
	import { validateSchema, getForm, validateForm, add, remove } from '$lib/utils/vouchers/form';
	import { writable } from 'svelte/store';
    import { ledgersStore, accountGroupsCteStores } from '$lib/utils/stores' 
    import { page } from '$app/stores';
    const organizationId = $page.params.orgId
    const voucherTypeId = 5
	const voucherTitle = 'Contra'
    const initialTrxType = 'credit'
    const newAddType = initialTrxType === 'credit' ? 'debit' : 'credit'
    const debitTitle = 'Transferred in A/c'
    const creditTitle = 'Transferred from A/c'
    const creditMainNodes = [18, 21, 23]
    const debitMainNodes = [18, 21, 23]
    $: creditAccounts = $accountGroupsCteStores.length ? getFilteredLedgerOptions($ledgersStore, $accountGroupsCteStores, creditMainNodes) : []
    $: debitAccounts = $accountGroupsCteStores.length ? getFilteredLedgerOptions($ledgersStore, $accountGroupsCteStores, debitMainNodes) : []

	let creditEqualsDebit = writable(true)
	const validationSchema = validateSchema(creditEqualsDebit)	
	const {form, data: formData} = getForm(organizationId, validationSchema)
    $: if($formData.journals && $formData.journals.length == 1)  add(formData, 0, newAddType);
	$: if ($formData.transaction) $formData.transaction.voucher_id = voucherTypeId
    
	let journalCreditTotal, journalDebitTotal, journalDiffType, journalDiffIsCredit, journalDiffAbs, addJournalButtonText, roundOff

	$: {
		[journalCreditTotal, journalDebitTotal, journalDiffType, journalDiffIsCredit, journalDiffAbs, addJournalButtonText, roundOff] = validateForm($formData);
		creditEqualsDebit.set(journalDiffAbs === 0)
        $formData.journals[0].type = initialTrxType
        $formData.journals[0].amount = initialTrxType === 'credit' ? journalDebitTotal : journalCreditTotal;
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
            <div class="flex flex-row gap-4 justify-items-center">
                <div class="">{creditTitle}</div>
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
            <div>{debitTitle}</div>
			{#each $formData.journals as journal, j}
            {#if j !== 0 }
                <div class="flex flex-col gap-4">
                    <div class="flex flex-row flex-wrap gap-2 max-w-9/10">
                        <div class="basis-32 flex-grow text-gray-900">
                            <Select
                                items={creditAccounts}
                                on:select={(e) => {
                                    $formData.journals[j].ledger_id = e.detail.value;
                                }}
                                on:clear={(e) => {
                                    $formData.journals[j].ledger_id = undefined;
                                }}
                                inputAttributes={{ name: `journals[${j}].ledger_id` }}
                            />
                        </div>
                        <div class="flex flex-row gap-2 text-gray-900">
                            <select
                                class="sm:hidden"
                                disabled
                                name={`journals[${j}].type`}
                                bind:value={$formData.journals[j].type}
                            >
                                <option value="debit">Dr.</option>
                                <option value="credit">Cr.</option>
                            </select>
                            <select
                                disabled
                                class="hidden sm:block"
                                name={`journals[${j}].type`}
                                bind:value={$formData.journals[j].type}
                            >
                                <option value="debit">Debit</option>
                                <option value="credit">Credit</option>
                            </select>
                            <div class="flex w-fit">
                                <span
                                    class="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 {$formData
                                        .journals[j].type == 'credit'
                                        ? 'bg-teal-200 text-teal-900'
                                        : 'bg-red-200 text-red-900'}  text-sm"
                                    >{priceFormatter.format(0).replace(/\d/g, '').trim()}</span
                                >
                                <input
                                    class="w-36 rounded-l-none"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max="999999999999999999.00"
                                    placeholder="0.0"
                                    name={`journals[${j}].amount`}
                                    bind:value={$formData.journals[j].amount}
                                />
                            </div>
                            <div>
                                {#if $formData.journals.length !== 1}
                                    <button class="danger-btn" type="button" on:click={remove(formData, j)}>-</button>
                                {/if}
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-row gap-4 justify-center sm:justify-end">
                        {#if j === $formData.journals.length - 1}
                            <div>
                                <button
                                    class="{journalDiffIsCredit ? 'success-btn' : 'danger-btn'} mx-auto"
                                    type="button"
                                    on:click={() => add(formData, journalDiffAbs, newAddType)}>{addJournalButtonText}</button
                                >
                            </div>
                            <!-- {#if roundOff}
                                <div>
                                    <button
                                        class="{journalDiffIsCredit ? 'success-btn' : 'danger-btn'} mx-auto"
                                        type="button"
                                        on:click={() => add(formData, journalDiffAbs, 'debit')}>Add roundoff {journalDiffAbs}</button
                                    >
                                </div>
                            {/if} -->
                        {/if}
                    </div>
                </div>
            {/if}
            {/each}
		<div class="flex flex-col w-full">
			<label for="transaction.description">Description</label>
			<textarea id="transaction.description" name="transaction.description" />
		</div>
		<button class="btn btn-primary mx-auto" type="submit">SUBMIT</button>
		</form>
	</div>
</div>
