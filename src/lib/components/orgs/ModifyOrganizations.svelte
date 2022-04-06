<script lang="ts">
	import { myMembershipsStore } from '$lib/utils/stores';
	import * as db from '$lib/db';
	import { getContext } from 'svelte';
	import Swal from 'sweetalert2';
	import { parseError } from '$lib/utils/parseErrors';
	import { createForm } from 'felte';

	export let organizationId: string;

	let objIndex = $myMembershipsStore.findIndex((obj) => obj.organization_id == organizationId);
	$: myMembership = $myMembershipsStore[objIndex];

	const { open, close } = getContext('simple-modal');

	const { form } = createForm({
		onSubmit: async (values) => {
			const { data, error } = await db.myOrganizations.update(organizationId, values);
			if (error) {
				Swal.fire({
					title: parseError(error),
					icon: 'error'
				});
			} else {
				const { data: membershipDate, error: membershipError } = await db.myMemberships.all();
				myMembershipsStore.set(membershipDate);
				close();
			}
		}
	});
</script>

<form use:form class="flex flex-col gap-4">
	<div class="flex flex-col gap-2">
		<label for="name">Company Name</label>
		<input
			id="name"
			name="name"
			type="text"
			placeholder="company name"
			value={myMembership.organization_name}
		/>
	</div>
	<div class="flex flex-col gap-2">
		<label for="description">Description</label>
		<textarea
			id="description"
			name="description"
			type="text"
			placeholder="about company"
			value={myMembership.organization_description || ''}
		/>
	</div>

	<button class="success-btn mx-auto" type="submit">Submit</button>
</form>
