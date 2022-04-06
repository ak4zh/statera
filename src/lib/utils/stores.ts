import { page } from '$app/stores';
import { get, writable } from 'svelte/store';
const today = new Date();
const month = today.getMonth() + 1
export const loading = writable(false);
export const todayStr = () => `${today.getFullYear()}-${month < 10 ? '0' + month : month}-${today.getDate()}`

export const voucherTypesStore = writable([])
export const organizationIdStore = writable(undefined)

export const ledgersStore = writable([])
export const accountGroupsStore = writable([])
export const myMembershipsStore = writable([])
export const transactionsStore = writable([])
export const collectionsStore = writable([])
export const locationSuggestionsStore = writable([])
export const accountGroupsCteStores = writable([])
export const vehiclesStore = writable([])

interface AccountGroups {
    id: number,
    path: string,
    name: string
}

interface Ledger {
    id: number,
    name: string
    account_group_id: number,
    account_groups: AccountGroups
}

export const getFilteredLedgerOptions = (ledgers: Ledger[], groups: AccountGroups[], nodeIds: number[]) => {
    return ledgers.filter(ls => groups.find((a) => a.id === ls.account_group_id).path.split('->').map(s => parseInt(s)).some(item => nodeIds.includes(item))).map(function (e) {
        return { label: `${e.name} [${e.account_groups.name}]`, value: e.id };
    })
}

export const getOrganizationId = () => get(page).params.orgId