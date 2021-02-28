import React from 'react';
import axios from 'axios';
import { API_BASE_URL, CATEGORY_ACCOUNT_TYPES, NON_CATEGORY_ACCOUNT_TYPES, ACCOUNT_TYPE_OPTIONS} from '../../../utils/constants.js';
import { PageSettings } from '../../../config/page-settings';
import { useHistory } from "react-router-dom";
import { balanceSummaryText } from "../../../utils/i18n/balance-summary-text.js";
import { Link } from 'react-router-dom';
import Select from 'react-select';


function AccountSwitcher(props) {
    //required props: widgetTitle (string) selectedAccountId (number), isEnterprise (boolean)
    //valid widgetTitles: "Switch Accounts", "Switch Categories"
    //if category is true there will be balances for each account shown in the list, otherwise not. Obviously if category is true this is a list of categories, otherwise it is a list of accounts. This is relevant for personal ui only; for enterprise category should always be false
    //optional props: externalRefreshToken, category(boolean)
    //externalRefreshToken can be any data. This prop should be changed when you want to force this component to refresh data. This prop should not be used for anything else. 
    const appContext = React.useContext(PageSettings);
    const history = useHistory();
    const accountTypeOptions = ACCOUNT_TYPE_OPTIONS(appContext.locale);

    const [loading, setLoading] = React.useState(true);
    const [accountGroups, setAccountGroups] = React.useState([]);
    const [accounts, setAccounts] = React.useState([]);
    const [selectedAccountTypeOptionId, setSelectedAccountTypeOptionId] = React.useState(null);
    //fetch data on component mount
    React.useEffect(() => {
        setLoading(true);
        axios.get(`${API_BASE_URL}/organization/${appContext.currentOrganizationId}/accountGroup`).then(response => {
            if (response.data) {
                setAccountGroups(response.data);
            }
        }).catch(console.log);
        if (props.category || props.isEnterprise) {
            axios.get(`${API_BASE_URL}/organization/${appContext.currentOrganizationId}/account`).then(response => {
                if (response.data) {
                    setAccounts(response.data);
                    setSelectedAccountTypeOptionId(response.data.find(account => account.accountId == props.selectedAccountId).accountTypeId);
                }
                setLoading(false);
            }).catch(console.log);
        } else {
            axios.get(`${API_BASE_URL}/organization/${appContext.currentOrganizationId}/accountBalance`).then(response => {
                if (response.data) {
                    let formattedAccounts = response.data;
                    formattedAccounts.forEach(account => (account.amount = (account.accountTypeId == 1 ?
                        account.debitTotal - account.creditTotal : account.creditTotal - account.debitTotal)));
                    setAccounts(formattedAccounts);
                    setSelectedAccountTypeOptionId(response.data.find(account => account.accountId == props.selectedAccountId).accountTypeId);
                }
                setLoading(false);
            }).catch(console.log);
        }
    }, [appContext.currentOrganizationId, props.externalRefreshToken])

    const formatBalance = (accountTypeId, amount) => {
        let formattedNumber = new Intl.NumberFormat(appContext.locale, { style: 'currency', currency: appContext.currency }).format(amount)
        let className = "";
        if (accountTypeId == 1 && amount < 0) {
            className = "text-red"
        } else if (accountTypeId == 2 && amount > 0) {
            className = "text-red"
        }

        return (
            <div className={className}>{formattedNumber}</div>
        )
    }
    return (
        <div className="widget widget-rounded widget-list widget-list-rounded mb-3">
            <div className="widget-header border-bottom bg-light">
                <h4 className="widget-header-title">{balanceSummaryText[appContext.locale][props.widgetTitle]}</h4>
            </div>
            <div className="row px-3 py-2 border-bottom">
                <label className="col-form-label col-md-6">
                    {props.category? balanceSummaryText[appContext.locale]["Select a category type:"]: balanceSummaryText[appContext.locale]["Select an account type:"]}
                </label>
                <div className="col-md-6">
                    <Select
                        options={props.isEnterprise? accountTypeOptions : 
                            (props.category? accountTypeOptions.filter(accountTypeOption => CATEGORY_ACCOUNT_TYPES.includes(accountTypeOption.value)): accountTypeOptions.filter(accountTypeOption => NON_CATEGORY_ACCOUNT_TYPES.includes(accountTypeOption.value)))}
                        value={accountTypeOptions.find(accountTypeOption => accountTypeOption.value == selectedAccountTypeOptionId)}
                        onChange={selectedOption => setSelectedAccountTypeOptionId(selectedOption.value)}
                    />
                </div>
            </div>

            <div className="overflow-auto" style={{ height: '500px' }}>
                {//loading ? <div className="d-flex justify-content-center fa-3x py-3"><i className="fas fa-circle-notch fa-spin"></i></div> :     --add this line in case you need a loading spinner. currently it is removed because it is annoying to see a spinner every click.
                    accountGroups.filter(accountGroup => accountGroup.accountTypeId == selectedAccountTypeOptionId).map(accountGroup => {
                        return (
                            <React.Fragment key={accountGroup.accountGroupId}>
                                <div className="widget-list-item bg-light">
                                    <div className="widget-list-content font-weight-600">
                                        <div className="widget-list-title">{accountGroup.accountGroupName}</div>
                                    </div>
                                </div>
                                {accounts ?
                                    accounts.filter(account => account.accountGroupId == accountGroup.accountGroupId).map(account => {
                                        return (
                                            <React.Fragment key={account.accountId}>
                                                {account.accountId == props.selectedAccountId ?
                                                    <div className="widget-list-item bg-white-hover">
                                                        <div className="widget-list-content p-l-30">
                                                            <div className="widget-list-title">{account.accountName}</div>
                                                        </div>
                                                        {props.category || props.isEnterprise ? null :
                                                            <div className="widget-list-content text-right">
                                                                {formatBalance(account.accountTypeId, account.amount)}
                                                            </div>
                                                        }
                                                        <div className="m-r-10 widget-list-action text-right">
                                                            <i className="fa fa-angle-right fa-lg text-muted"></i>
                                                        </div>
                                                    </div>
                                                    :
                                                    <Link className="widget-list-item bg-white" to={props.category ? `/category-details/${account.accountId}` : `/account-details/${account.accountId}`}>
                                                        <div className="widget-list-content p-l-30">
                                                            <div className="widget-list-title">{account.accountName}</div>
                                                        </div>
                                                        {props.category || props.isEnterprise ? null :
                                                            <div className="widget-list-content text-right">
                                                                {formatBalance(account.accountTypeId, account.amount)}
                                                            </div>
                                                        }
                                                        <div className="m-r-10 widget-list-action text-right">
                                                            <i className="fa fa-angle-right fa-lg text-muted"></i>
                                                        </div>
                                                    </Link>
                                                }
                                            </React.Fragment>
                                        )
                                    })
                                    : <div className="d-flex justify-content-center fa-3x py-3"><i className="fas fa-circle-notch fa-spin"></i></div>}
                            </React.Fragment>
                        )
                    })
                }
            </div>
        </div>
    )
}
AccountSwitcher.defaultProps = {
    category: false
}
export default AccountSwitcher;