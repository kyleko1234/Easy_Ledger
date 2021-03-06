import React from 'react';
import { PageSettings } from '../../../config/page-settings';
import axios from 'axios';
import { API_BASE_URL } from '../../../utils/constants';
import {netWorthReportText} from '../../../utils/i18n/net-worth-report-text.js';
import { balanceSheetRenderText } from '../../../utils/i18n/balance-sheet-render-text';
import { Card, CardBody } from 'reactstrap';

function NetWorthRender() {
    const appContext = React.useContext(PageSettings);
    const today = new Date();

    const [endDate, setEndDate] = React.useState(today.toISOString().split('T')[0]);
    const [accounts, setAccounts] = React.useState([]);
    const [balanceSheetAssets, setBalanceSheetAssets] = React.useState(null);
    const [balanceSheetLiabilities, setBalanceSheetLiabilities] = React.useState(null);
    const [detailedView, setDetailedView] = React.useState(false);
    const toggleDetailedView = () => setDetailedView(!detailedView);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchData() {
            setLoading(true);
            await axios.get(`${API_BASE_URL}/organization/${appContext.currentOrganizationId}/reports/balanceSheet/${endDate}`).then(response => {
                let formattedAccounts = response.data.accountBalances;
                formattedAccounts.forEach(account => {
                    if (account.hasChildren) {
                        let totalDebits = 0;
                        let totalCredits = 0;    
                        formattedAccounts.filter(childAccount => childAccount.parentAccountId == account.accountId).forEach(childAccount => {
                            totalDebits = totalDebits + childAccount.debitTotal;
                            totalCredits = totalCredits + childAccount.creditTotal;
                        })
                        account.debitTotal = totalDebits;
                        account.creditTotal = totalCredits;
                        account.debitsMinusCredits = totalDebits - totalCredits;    
                    }
                })
                setAccounts(formattedAccounts);
                setBalanceSheetAssets(response.data.balanceSheetAssets);
                setBalanceSheetLiabilities(response.data.balanceSheetLiabilities);
            }).catch(console.log);  
            setLoading(false);  
        }
        fetchData();
    },[endDate])

    const handleChangeDate = event => {
        setEndDate(event.target.value);
    }
    
    const formatNumber = (number) => {
        if (number == 0) {
            return new Intl.NumberFormat(appContext.locale, { style: 'currency', currency: appContext.currency }).format(0);
        }
        return new Intl.NumberFormat(appContext.locale, { style: 'currency', currency: appContext.currency }).format(number)
    }

    return(
        <>
            <Card className="bg-light shadow-sm very-rounded my-4">
                <CardBody>
                    <h2 className="h5">{balanceSheetRenderText[appContext.locale]["Options"]}</h2>
                    <div className="d-flex mb-2 align-items-center">
                        <label className="pr-2 mb-0">{netWorthReportText[appContext.locale]["As of:"]}</label>
                        <input type="date" className="form-control form-control-sm width-150 align-self-center" value={endDate} onChange={handleChangeDate}/>
                    </div>
                    <div className="custom-control custom-switch">
                        <input type="checkbox" id="detailedViewCheckbox" className="custom-control-input" value={detailedView} onChange={toggleDetailedView} />
                        <label htmlFor="detailedViewCheckbox" className="my-0 custom-control-label">{balanceSheetRenderText[appContext.locale]["Detailed View"]}</label>
                    </div>
                </CardBody>
            </Card>
            <div>
                {loading? <div className="d-flex justify-content-center fa-3x py-3"><i className="fas fa-circle-notch fa-spin"></i></div>:
                    <>
                        <div className="striped-row font-weight-600">
                            {netWorthReportText[appContext.locale]["Assets"]}
                        </div>
                        {accounts.filter(account => account.accountTypeId == 1).map(account => {
                            return(
                                <React.Fragment key={account.accountId}>
                                    <div className="striped-row indent d-flex justify-content-between font-weight-600">
                                        <div>{account.accountName}</div>
                                        <div className={account.debitsMinusCredits >= 0? "" : "text-red"}>{formatNumber(account.debitsMinusCredits)}</div>
                                    </div>
                                    {detailedView? 
                                        accounts
                                            .filter(childAccount => childAccount.parentAccountId == account.accountId)
                                            .map(childAccount => {
                                                return(
                                                        <div key={childAccount.accountId} className="striped-row indent-2 d-flex justify-content-between">
                                                            <div>{childAccount.accountName}</div>
                                                            <div className={childAccount.debitsMinusCredits >= 0? "" : "text-red"}>{formatNumber(childAccount.debitsMinusCredits)}</div>
                                                        </div> 
                                                )
                                        })
                                    : null}
                                </React.Fragment>
                            )
                        })}
                        <div className="font-weight-600 striped-row d-flex justify-content-between">
                            <div>{netWorthReportText[appContext.locale]["Total Assets"]}</div>
                            <div className={balanceSheetAssets.totalAssets >= 0? "" : "text-red"}>{formatNumber(balanceSheetAssets.totalAssets)}</div>
                        </div>
                        <div className="striped-row"><div className="invisible">{/*empty row */}empty row</div></div>
                        <div className="striped-row font-weight-600">
                            {netWorthReportText[appContext.locale]["Liabilities"]}
                        </div>
                        {accounts.filter(account => account.accountTypeId == 2).map(account => {
                            return(
                                <React.Fragment key={account.accountId}>
                                    <div className="striped-row indent d-flex justify-content-between font-weight-600">
                                        <div>{account.accountName}</div>
                                        <div className={account.debitsMinusCredits > 0? "" : "text-red"}>{formatNumber(account.debitsMinusCredits * -1)}</div>
                                    </div>
                                    {detailedView?
                                        accounts
                                            .filter(childAccount => childAccount.parentAccountId == account.accountId)
                                            .map(childAccount => {
                                                    return(
                                                        <div key={childAccount.accountId} className="striped-row indent-2 d-flex justify-content-between">
                                                            <div>{childAccount.accountName}</div>
                                                            <div className={childAccount.debitsMinusCredits > 0? "" : "text-red"}>{formatNumber(childAccount.debitsMinusCredits * -1)}</div>
                                                        </div> 
                                                    )
                                        })
                                    :null}
                                </React.Fragment>
                            )
                        })}
                        <div className="striped-row font-weight-600 d-flex justify-content-between">
                            <div>{netWorthReportText[appContext.locale]["Total Liabilities"]}</div>
                            <div className={balanceSheetLiabilities.totalLiabilities > 0? "" : "text-red"}>{formatNumber(balanceSheetLiabilities.totalLiabilities)}</div>
                        </div>
                        <div className="striped-row"><div className="invisible">{/*empty row */}empty row</div></div>
                        <div className="striped-row font-weight-600 d-flex justify-content-between py-3">
                            <div>{netWorthReportText[appContext.locale]["Total Net Worth"]}</div>
                            <div>{formatNumber(balanceSheetAssets.totalAssets - balanceSheetLiabilities.totalLiabilities)}</div>
                        </div>
                    </>
                }
            </div>
        </>
    )
}

export default NetWorthRender;