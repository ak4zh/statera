import * as db from '$lib/db';
import { createForm } from 'felte';
import { validator } from '@felte/validator-yup';
import * as yup from 'yup';
import reporter from '@felte/reporter-tippy';
import Swal from 'sweetalert2';
import { get } from 'svelte/store';
import type { Writable } from 'svelte/store'
import mapValues from 'lodash/mapValues';
import { todayStr, transactionsStore } from '../stores';

interface TransactionData {
    vehicle_number?: string,
    origin?: string,
    destination?: string,
    rate?: number,
    quantity?: number,
    billing_type?: string
}

interface TransactionRow {  
    voucher_id: number;
    description: string;
    date: string,
    data: TransactionData
}

interface JournalRow {  
    ledger_id: number;
    amount: number | string;
    type: string,
    is_credit: boolean
}

interface Transaction {  
    transaction: TransactionRow;
    journals: JournalRow[];
}

export const validateSchema = (creditEqualsDebit: Writable<boolean>) => yup.object({
    transaction: yup.lazy(obj =>
        yup.object(
            mapValues(obj, (value, key) => {
                if (key === 'voucher_id') {
                    return yup.number().required('Please select voucher type.');
                }
                if (key === 'description') {
                    return yup.string();
                }
                if (key === 'date') {
                    return yup
                        .string()
                        .matches(
                            /[1-2]\d\d\d-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/,
                            'Please select transaction date.'
                        );
                }
                if (key === 'data') {
                    return yup.lazy(obj =>
                        yup.object(
                            mapValues(obj, (value, key) => {
                                if (key === 'vehicle_number') {
                                    return yup.string().trim().matches(/^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/, 'Vehicle number seems incorrect').required('Please enter vehicle number');
                                }
                                if (key === 'material') {
                                    return yup.string().required('Please select material');
                                }
                                if (key === 'billing_type') {
                                    return yup.string().required();
                                }
                                if (key === 'rate') {
                                    return yup.number().required('Please enter the rate');
                                }
                                if (key === 'quantity') {
                                    return yup.number().required('Please enter the quantity');
                                }
                                if (key === 'origin') {
                                    return yup.string().required('Please select trip origin');
                                }
                                if (key === 'destination') {
                                    return yup.string().required('Please select trip destination');
                                }
                            })
                        )
                    )
                }
            })
        )
    ),

    journals: yup.array().of(
        yup.object().shape({
            ledger_id: yup
                .number()
                .typeError('Please select account ledger.')
                .required('Please select account ledger.'),
            amount: yup
                .number()
                .typeError('you must specify an amount')
                .min(0.01, 'Min amount 0.01.')
                .test(
                    'test-debit-equals-credit',
                    'Total of debit amount must be equal to total of credit amount.',
                    (value) => get(creditEqualsDebit)
                )
                .required(),
            type: yup.string().oneOf(['debit', 'credit']).required(),
            is_credit: yup.bool()
        })
    )
});

export const getForm = (organizationId: string, validationSchema) => createForm({
    initialValues: {
        transaction: {
            data: {},
            date: todayStr(),
        },
        journals: [
            {
                ledger_id: undefined,
                amount: '',
                type: 'debit'
            }
        ]
    },
    extend: [reporter(), validator({ schema: validationSchema })],
    transform: (values: Transaction) => ({
        ...values,
        // transaction: {
        //         voucher_id: values.transaction.voucher_id,
        //         description: values.transaction.description,
        //         date: values.transaction.date,
        //         data: values.transaction.data
        // },
        journals: values.journals.map((e) => {
            return {
                ledger_id: e.ledger_id,
                amount: Number(e.amount) || '',
                type: e.type,
                is_credit: e.type == 'credit'
            };
        })
    }),
    onSubmit: async (values, context) => {
        const { data, error } = await db.transactions.insert(organizationId, values.transaction, values.journals);
        if (error) {
            Swal.fire({
                title: error.message,
                icon: 'error',
                showConfirmButton: true
            });
        } else {
            Swal.fire({
                toast: true,
                position: 'top',
                title: `Transaction ${values.transaction.description} created successfully.`,
                icon: 'success',
                showConfirmButton: false,
                timer: 1000
            });
            transactionsStore.set([data[0], ...get(transactionsStore)])
        }
    },
});

export const add = (data: Writable<Transaction>, diffAbs: number, diffType: string) => {
    data.set(
        {
            transaction: get(data).transaction, 
            journals: [
                ...get(data).journals,
                { ledger_id: undefined, amount: diffAbs || '', type: diffType, is_credit: undefined }
            ]
        }
    )
};

export const remove = (data: Writable<Transaction>, i: number) => () => {
    data.set({transaction: get(data).transaction, journals: get(data).journals.filter((u, j) => j !== i)})
};

function round(num: number) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

export const validateForm = (data: Transaction) => {
    const journalCreditTotal = data.journals
        .filter((e) => e.type == 'credit')
        .map((e) => round(Number(e.amount) || 0))
        .reduce((partialSum, a) => partialSum + a, 0);
    const journalDebitTotal = data.journals
        .filter((e) => e.type == 'debit')
        .map((e) => round(Number(e.amount) || 0))
        .reduce((partialSum, a) => partialSum + a, 0);
    const journalDiff = round(journalCreditTotal - journalDebitTotal);
    const journalDiffType = journalDiff <= 0 ? 'credit' : 'debit';
    const journalDiffIsCredit = journalDiff <= 0;
    const journalDiffAbs = Math.abs(journalDiff);
    const addJournalButtonText = journalDiffAbs
        ? `+ ${journalDiffType == 'credit' ? 'Credit' : 'Debit'} ${journalDiffAbs}`
        : '+';
    const roundOff = journalDiffAbs && journalDiffAbs < 1 ? journalDiffAbs : 0;
    return [journalCreditTotal, journalDebitTotal, journalDiffType, journalDiffIsCredit, journalDiffAbs, addJournalButtonText, roundOff]
}
