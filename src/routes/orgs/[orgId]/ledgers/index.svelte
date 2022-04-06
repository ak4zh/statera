<script lang="ts">
	import { accountGroupsStore, ledgersStore } from '$lib/utils/stores';
	import { page } from '$app/stores';
	import * as db from '$lib/db'
	import { createForm } from 'felte';
	import { validator } from '@felte/validator-yup';
	import * as yup from 'yup';
	import reporter from '@felte/reporter-tippy';
	import Swal from 'sweetalert2';

	let organizationId = $page.params.orgId

	$: parentAccountGroups = $accountGroupsStore.reduce(
		(obj, item) => Object.assign(obj, { [item.id]: item.name }),
		{}
	);

	var groupBy = function(xs, key) {
		return xs.reduce(function(rv, x) {
			(rv[x[key]] = rv[x[key]] || []).push(x);
			return rv;
		}, {});
	};

	$: groupWiseLedgers = groupBy($ledgersStore, 'account_group_id')

	const validateSchema = yup.object({
		organization_id: yup.string().required(),
		name: yup.string().required(),
		opening_balance: yup.number().required(),
		account_group_id: yup.number().required()
	});

	const {
		form,
		data: formData,
		errors: formErrors
	} = createForm({
		initialValues: {
			organization_id: organizationId,
			name: '',
			opening_balance: '',
			account_group_id: undefined
		},
		transform: (values) => ({
			...values,
			opening_balance: values.opening_balance ? Number(values.opening_balance) : 0,
			account_group_id: parseInt(values.account_group_id) || 1
		}),
		extend: [reporter(), validator({ schema: validateSchema })],
		onSubmit: async (values, context) => {
			const { data, error } = await db.ledgers.insert(values);
			if (error) {
				throw error
			} else {
				ledgersStore.set([data[0], ...$ledgersStore]);
			}
		},
		onSuccess(response, context) {
			Swal.fire({
				position: 'top-end',
				title: `Ledger ${$formData.name} created successfully.`,
				icon: 'success',
				showConfirmButton: false,
				timer: 1000
			});
		},
		onError(err, context) {
			Swal.fire({
				title: err.message,
				icon: 'error',
				showConfirmButton: true
			});
		}
	});
</script>


<div class="flex flex-col gap-4 m-4 max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-4">
	<h3 class="text-2xl text-center">Add Ledger</h3>
	<form use:form class="flex flex-col gap-4">
		<div class="flex flex-col w-full">
			<label for="name">Name</label>
			<input id="name" type="text" name="name" />
		</div>
		<div class="flex flex-col w-full">
			<label for="opening_balance">Opening Balance</label>
			<input id="opening_balance" type="number" name="opening_balance" />
		</div>
		<div class="flex flex-row w-full gap-4">
			<input id="maintain_balance_bill_by_bill" type="checkbox" name="maintain_balance_bill_by_bill" />
			<label for="maintain_balance_bill_by_bill">Maintain balance bill by bill?</label>
		</div>
        <div>
            <label for="account_group_id">Accounts Group</label>
            <select id="account_group_id" name="account_group_id" class="text-gray-900">
                {#each $accountGroupsStore as accountGroup}
                    <option value={accountGroup.id}
                        >{accountGroup.account_group_id
                            ? `${parentAccountGroups[accountGroup.account_group_id]} => ${accountGroup.name}`
                            : accountGroup.name}</option>
                {/each}
            </select>
        </div>
		<button type="submit" class="btn mx-auto">SUBMIT</button>
	</form>
</div>
<div class="flex flex-col gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl">
	<h3 class="text-2xl text-center">List of Ledgers</h3>
	{#each Object.entries(groupWiseLedgers) as [accountGroupId, ledgers]}
		{parentAccountGroups[accountGroupId]}
		<div
			class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ledgers-stretch rounded-xl p-4"
		>
			{#each ledgers as ledger}
				<div class="relative pb-12 p-4 bg-gray-50 dark:bg-gray-600 rounded-xl text-center">
					<h4 class="text-2xl break-all">{ledger.name}</h4>
				</div>
			{/each}
		</div>
	{/each}
</div>
