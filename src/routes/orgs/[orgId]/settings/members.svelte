<script lang="ts">
    import { page } from "$app/stores";
    import { supabase } from "$lib/db";
    import { onMount } from "svelte";
	import SvelteTable from 'svelte-table';

    let members = []

    onMount(async () => {
        const {data, error} = await supabase.from('organization_members').select('*, user_profiles!organization_members_user_id_fkey(*)').eq('organization_id', $page.params.orgId)
        members = data
    })

    const roles = {
        9: {title: 'Owner (CRUD)', description: 'Organization owner have complete rights.'},
        6: {title: 'Manager (CRUD)', description: 'Right below the owner with full organization control.'},
        5: {title: 'Accounts Head (CRUD)', description: 'Can create, edit and delete records.'},
        4: {title: 'Senior Associate (CRU)', description: 'Can create, edit and delete records.'},
        3: {title: 'Account Associate (CR)', description: 'Can create, edit and delete records.'},
        2: {title: 'Intern (R)', description: 'Can create, edit and delete records.'},
        1: {title: 'External Member', description: 'Can view own ledgers only. (access by ledger email)'},
    }
    $: columns = [
		{
			key: 'email',
			title: 'Email',
			value: (v) => v.user_profiles.email,
			renderValue: (v) => v.user_profiles.email,
			sortable: true,
			class: 'text-left',
			headerClass: 'text-left'
		},
        {
			key: 'role',
			title: 'Role',
			value: (v) => v.role,
			renderValue: (v) => roles[v.role].title,
			sortable: true,
			class: 'text-right',
			headerClass: 'text-right'
		},
	];
</script>


<div
	class="flex flex-col gap-4 p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-center max-w-7xl mx-auto"
>
	<h3 class="text-2xl text-center">Organization Members</h3>
	<SvelteTable
		columns={columns}
		rows={members}
		classNameThead="bg-gray-600 dark:bg-gray-400 text-gray-100 dark:text-gray-900"
	/>
</div>
