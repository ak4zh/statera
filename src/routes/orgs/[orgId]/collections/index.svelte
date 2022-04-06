<script lang="ts">
	import { collectionsStore } from '$lib/utils/stores';
	import { page } from '$app/stores';
	import * as db from '$lib/db'

    import { createForm } from 'felte';
	import { validator } from '@felte/validator-yup';
	import * as yup from 'yup';
	import reporter from '@felte/reporter-tippy';
	import { parseError } from '$lib/utils/parseErrors';

	let organizationId = $page.params.orgId

    let dataTypes = ['Text', 'Number', 'Checkbox', 'Multiline']
	const validateSchema = yup.object({
        organization_id: yup.string().required(),
        name: yup.string().required(),
		data: yup.array().of(
            yup.object().shape({
                type: yup.string().oneOf(['text', 'multiline', 'number', 'checkbox']).required('Select a data type.'),
                label: yup.string().required('Please enter a data label.'),
                placeholder: yup.string(),
                is_required: yup.bool()
            })
        ),
	});

	const { form, data: formData } = createForm({
		initialValues: {
            organization_id: organizationId,
			name: '',
            data: [
                {
                    type: 'text',
                    label: '',
                    placeholder: '',
                    is_required: true
                }
            ]
		},
		extend: [reporter(), validator({ schema: validateSchema })],
		transform: (values) => ({
			...values,
			data: values.data.map((e) => {
				return {
					type: e.type,
                    label: e.label,
                    placeholder: e.placeholder,
                    is_required: e.is_required ? e.is_required.toString() == 'true' : false
				};
			})
		}),
		onSubmit: async (values, context) => {
			const { data, error } = await db.collections.insert(organizationId, values);
			if (error) {
				throw error;
			} else {
				collectionsStore.set([data[0], ...$collectionsStore]);
			}
		},
		onSuccess(response, context) {
			Swal.fire({
				position: 'top-end',
				title: `Account group ${$formData.name} created successfully.`,
				icon: 'success',
				showConfirmButton: false,
				timer: 1000
			});
		},
		onError(err, context) {
			Swal.fire({
				title: parseError(err),
				icon: 'error',
				showConfirmButton: true
			});
		}
	});
    const add = () => {
		$formData.data = [
			...$formData.data,
			{ type: 'text', label: '', placeholder: '', is_required: true }
		];
	};
	const remove = (i) => () => {
		$formData.data = $formData.data.filter((u, j) => j !== i);
	};
</script>

<div class="flex flex-col gap-4 m-4 max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-4">
	<h3 class="text-2xl text-center">Add Ledger</h3>
	<form use:form class="flex flex-col gap-2">
		<div class="flex flex-col w-full">
			<label for="name">Collection Name</label>
			<input id="name" type="text" name="name" />
		</div>
        {#if $formData.data}
            {#each $formData.data as i, j}
                <div class="flex flex-col gap-4">
                    <div class="flex flex-row flex-wrap gap-2 max-w-9/10">
                        <div>
                            <select name={`data[${j}].type`} id={`data[${j}].type`}>
                                {#each dataTypes as dataType}
                                    <option value="{dataType.toLowerCase()}">{dataType}</option>
                                {/each}
                            </select>
                        </div>
                        <div>
                            <input name={`data[${j}].label`} id={`data[${j}].type`} type="text" placeholder="Label"/>
                        </div>
                        <div>
                            <input name={`data[${j}].placeholder`} id={`data[${j}].placeholder`} type="text" placeholder="Placeholder"/>
                        </div>
                        <div>
                            <input name={`data[${j}].is_required`} id={`data[${j}].is_required`} type="checkbox"/>
                        </div>

                        <div>
                            {#if $formData.data.length !== 1}
                                <button class="danger-btn" type="button" on:click={remove(j)}>-</button>
                            {/if}
                        </div>
                    </div>
                    <div class="flex flex-row gap-4 justify-center sm:justify-end">
                        {#if j === $formData.data.length - 1}
                            <div>
                                <button
                                    class="success-btn mx-auto"
                                    type="button"
                                    on:click={add}>+</button
                                >
                            </div>
                        {/if}
                    </div>
                </div>
            {/each}
        {/if}
        <button class="btn mx-auto">SUBMIT</button>
	</form>
</div>

<div class="flex flex-col gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl">
	<h3 class="text-2xl text-center">List of COllections</h3>
		<div
			class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ledgers-stretch rounded-xl p-4"
		>
			{#each $collectionsStore as collection}
				<div class="relative pb-12 p-4 bg-gray-50 dark:bg-gray-600 rounded-xl text-center">
					<h4 class="text-2xl break-all">{collection.name}</h4>
				</div>
			{/each}
		</div>
</div>
