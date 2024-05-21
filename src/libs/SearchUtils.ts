import type {ValueOf} from 'react-native-gesture-handler/lib/typescript/typeUtils';
import TransactionListItem from '@components/SelectionList/TransactionListItem';
import type {TransactionListItemType} from '@components/SelectionList/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {SearchAccountDetails, SearchDataTypes, SearchTypeToItemMap} from '@src/types/onyx/SearchResults';
import * as TransactionUtils from './TransactionUtils';
import * as UserUtils from './UserUtils';

type SortOrder = 'asc' | 'desc';

type SearchColumnType = (typeof CONST.SEARCH_TABLE_COLUMNS)[keyof typeof CONST.SEARCH_TABLE_COLUMNS];

function getSearchType(search: OnyxTypes.SearchResults['search']): SearchDataTypes | undefined {
    switch (search.type) {
        case CONST.SEARCH_DATA_TYPES.TRANSACTION:
            return CONST.SEARCH_DATA_TYPES.TRANSACTION;
        default:
            return undefined;
    }
}

function getShouldShowMerchant(data: OnyxTypes.SearchResults['data']): boolean {
    return Object.values(data).some((item) => {
        const merchant = item.modifiedMerchant ? item.modifiedMerchant : item.merchant ?? '';
        return merchant !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT && merchant !== CONST.TRANSACTION.DEFAULT_MERCHANT;
    });
}

function getShouldShowColumn(data: OnyxTypes.SearchResults['data'], columnName: ValueOf<typeof CONST.SEARCH_TABLE_COLUMNS>) {
    return Object.values(data).some((item) => !!item[columnName]);
}

function getTransactionsSections(data: OnyxTypes.SearchResults['data']): TransactionListItemType[] {
    const shouldShowMerchant = getShouldShowMerchant(data);
    const shouldShowCategory = getShouldShowColumn(data, CONST.SEARCH_TABLE_COLUMNS.CATEGORY);
    const shouldShowTag = getShouldShowColumn(data, CONST.SEARCH_TABLE_COLUMNS.TAG);
    const shouldShowTax = getShouldShowColumn(data, CONST.SEARCH_TABLE_COLUMNS.TAX_AMOUNT);

    return Object.entries(data)
        .filter(([key]) => key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION))
        .map(([, transactionItem]) => {
            const isExpenseReport = transactionItem.reportType === CONST.REPORT.TYPE.EXPENSE;
            const from = data.personalDetailsList?.[transactionItem.accountID];
            const to = isExpenseReport
                ? (data[`${ONYXKEYS.COLLECTION.POLICY}${transactionItem.policyID}`] as SearchAccountDetails)
                : (data.personalDetailsList?.[transactionItem.managerID] as SearchAccountDetails);

            const formattedFrom = from.displayName ?? from.login ?? '';
            const formattedTo = to.name ?? to.displayName ?? to.login ?? '';
            const formattedTotal = TransactionUtils.getAmount(transactionItem, isExpenseReport);
            const date = transactionItem?.modifiedCreated ? transactionItem.modifiedCreated : transactionItem?.created;

            return {
                ...transactionItem,
                from,
                to,
                formattedFrom,
                formattedTo,
                date,
                formattedTotal,
                shouldShowMerchant,
                shouldShowCategory,
                shouldShowTag,
                shouldShowTax,
                keyForList: transactionItem.transactionID,
            };
        });
}

const searchTypeToItemMap: SearchTypeToItemMap = {
    [CONST.SEARCH_DATA_TYPES.TRANSACTION]: {
        listItem: TransactionListItem,
        getSections: getTransactionsSections,
    },
};

function getListItem<K extends keyof SearchTypeToItemMap>(type: K): SearchTypeToItemMap[K]['listItem'] {
    return searchTypeToItemMap[type].listItem;
}

function getSections<K extends keyof SearchTypeToItemMap>(data: OnyxTypes.SearchResults['data'], type: K): ReturnType<SearchTypeToItemMap[K]['getSections']> {
    return searchTypeToItemMap[type].getSections(data) as ReturnType<SearchTypeToItemMap[K]['getSections']>;
}

function getQueryHash(query: string, policyID?: string): number {
    const textToHash = [query, policyID].filter(Boolean).join('_');
    return UserUtils.hashText(textToHash, 2 ** 32);
}

export {getListItem, getQueryHash, getSections, getShouldShowColumn, getShouldShowMerchant, getSearchType};
export type {SearchColumnType, SortOrder};
