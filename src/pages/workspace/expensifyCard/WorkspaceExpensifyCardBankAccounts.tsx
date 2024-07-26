import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import getBankIcon from '@components/Icon/BankIcons';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLastFourDigits} from '@libs/BankAccountUtils';
import * as CardUtils from '@libs/CardUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import * as Card from '@userActions/Card';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {BankName} from '@src/types/onyx/Bank';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspaceExpensifyCardBankAccountsProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_BANK_ACCOUNT>;

function WorkspaceExpensifyCardBankAccounts({route}: WorkspaceExpensifyCardBankAccountsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [bankAccountsList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const policyID = route?.params?.policyID ?? '-1';

    const handleAddBankAccount = () => {
        // TODO: call to API - UpdateCardSettlementAccount
        Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute('new', policyID, ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID)));
    };

    const handleSelectBankAccount = (value: number) => {
        Card.updateSettlementAccount(policyID, value);
        Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID));
    };

    const renderBankOptions = () => {
        if (!bankAccountsList || isEmptyObject(bankAccountsList)) {
            return null;
        }

        // const eligibleBankAccounts = Object.values(bankAccountsList).filter((bankAccount) => bankAccount.accountData.allowDebit || bankAccount.accountData.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS);
        const eligibleBankAccounts = CardUtils.getEligibleBankAccountsForCard(bankAccountsList);

        return eligibleBankAccounts.map((bankAccount) => {
            const bankName = (bankAccount.accountData?.addressName ?? '') as BankName;
            const bankAccountNumber = bankAccount.accountData?.accountNumber ?? '';
            // TODO: change 1 to 0 - applied for testing purposes, as sometimes accountData lacks fundID
            const bankAccountID = bankAccount.accountData?.fundID ?? 1;

            const {icon, iconSize, iconStyles} = getBankIcon({bankName, styles});

            return (
                <MenuItem
                    title={bankName}
                    description={`${translate('workspace.expensifyCard.accountEndingIn')} ${getLastFourDigits(bankAccountNumber)}`}
                    onPress={() => handleSelectBankAccount(bankAccountID)}
                    icon={icon}
                    iconHeight={iconSize}
                    iconWidth={iconSize}
                    iconStyles={iconStyles}
                    shouldShowRightIcon
                    displayInDefaultIconColor
                />
            );
        });
    };

    return (
        <ScreenWrapper
            testID={WorkspaceExpensifyCardBankAccounts.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
        >
            <HeaderWithBackButton
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
                title={translate('workspace.expensifyCard.chooseBankAccount')}
            />
            <View style={styles.flex1}>
                <Text style={[styles.mh5, styles.mb3]}>{translate('workspace.expensifyCard.chooseExistingBank')}</Text>
                {renderBankOptions()}
                <MenuItem
                    icon={Expensicons.Plus}
                    title={translate('workspace.expensifyCard.addNewBankAccount')}
                    onPress={handleAddBankAccount}
                />
            </View>
        </ScreenWrapper>
    );
}

WorkspaceExpensifyCardBankAccounts.displayName = 'WorkspaceExpensifyCardBankAccounts';

export default WorkspaceExpensifyCardBankAccounts;
