import { goto } from '$app/navigation';
import { createClient } from '@supabase/supabase-js';
import { readable } from 'svelte/store';
import { loading } from './utils/stores';

const dbAPI = async (query) => {
	return await query;
};

const Loader = (fn) => {
	return async function (query) {
		loading.set(true);
		const { data, error } = await query;
		loading.set(false);
		return { data, error };
	};
};

const loaderQuery = Loader(dbAPI);

export const supabase = createClient(
	String(import.meta.env.VITE_SUPABASE_URL),
	String(import.meta.env.VITE_SUPABASE_ANON_KEY)
);

export const user = readable(supabase.auth.user(), (set) => {
	supabase.auth.onAuthStateChange((event, session) => {
		if (event == 'SIGNED_OUT') {
			set(null);
			goto('/');
		} else if (event == 'SIGNED_IN') {
			set(session.user);
		}
	});
});

export const auth = supabase.auth;


export const myOrganizations = {
	async insert(rowData) {
		const query = supabase.from('organizations').insert(rowData);
		return await loaderQuery(query);
	},
	async update(organizationId: string, rowData) {
		const query = supabase.from('organizations').update(rowData).eq('id', organizationId);
		return await loaderQuery(query);
	}
};

export const myMemberships = {
	async all() {
		const query = supabase.from('my_memberships').select('*');
		return await loaderQuery(query);
	}
};

export const transactions = {
	async insert(organizationId: string, transaction: object, journals: object[]) {
		const query = supabase
			.rpc('insert_transaction', {
				organization_id: organizationId,
				transaction_record: transaction,
				journal_records: journals
			})
			.select('*, journals(*)');
		return await loaderQuery(query);
	},
	async insert_transactions(organizationId: string, transactions: object[]) {
		const query = supabase
			.rpc('insert_transactions', {
				organization_id: organizationId,
				transactions: transactions
			})
			.select('*, journals(*)');
		return await loaderQuery(query);
	}
};


export const accountGroups = {
	async all(organizationId: string) {
		const query = supabase
			.from('account_groups')
			.select('*')
			.or(`organization_id.is.null,organization_id.eq.${organizationId}`)
			.order('account_group_id', { nullsFirst: true })
			.order('name', { ascending: true });
		return await loaderQuery(query);
	},
	async insert(organizationId: string, rowData: object) {
		rowData['organization_id'] = organizationId;
		const query = supabase.from('account_groups').insert(rowData);
		return await loaderQuery(query);
	},
	async update(accountGroupId: number, rowData: object) {
		const query = supabase
			.from('account_groups')
			.update(rowData)
			.eq('id', accountGroupId);
		return await loaderQuery(query);
	}
};

export const ledgers = {
	async get_nodes(organizationId: string, nodeIds: number[]) {
		const preQuery = supabase.rpc('account_groups_cte', {
			org_id: organizationId,
			nodeids: nodeIds
		}).select('id')
		return await preQuery
	},
	async all(organizationId: string) {
		const query = supabase
			.from('ledgers')
			.select('*')
			.eq(`organization_id`, organizationId);
		return await loaderQuery(query);
	},
	async get_ledgers_by_node(nodeId: number, organizationId: string) {
		const preQuery = supabase.rpc('account_groups_cte', {
			org_id: organizationId,
			nodeids: [2, 21]
		}).select('id')
		const {data, error} = await loaderQuery(preQuery)
		const query = supabase
			.from('ledgers')
			.select('*, account_groups!inner(*)')
			.eq(`organization_id`, organizationId)
			.in('account_group_id', data.map((e) => e.id))
		return await loaderQuery(query);
	},
	async search_ledger_by_node(nodeId: number[], organizationId: string, searchTerm: string) {
		const preQuery = supabase.rpc('account_groups_cte', {
			org_id: organizationId,
			main_node_id: nodeId[0]
		}).select('id')
		const {data, error} = await loaderQuery(preQuery)

		const query = supabase
			.from('ledgers')
			.select('*, account_groups!inner(*)')
			.eq(`organization_id`, organizationId)
			.in('account_group_id', data.map((e) => e.id))
			.ilike('name', `%${searchTerm}%`);
		return await loaderQuery(query);
	},
	async search(organizationId: string, searchTerm: string) {
		const query = supabase
			.from('ledgers')
			.select('*, account_groups!inner(*)')
			.eq(`organization_id`, organizationId)
			.ilike('name', `%${searchTerm}%`);
		return await loaderQuery(query);
	},
	async insert(rowData) {
		const query = supabase.from('ledgers').insert(rowData)
		return await loaderQuery(query)
	}
};

export async function signOut() {
	await supabase.auth.signOut();
}
