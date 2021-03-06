import React from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../utils/constants.js';
import { PageSettings } from '../../../config/page-settings';
import { Link, useHistory } from "react-router-dom";
import {balanceSummaryText} from "../../../utils/i18n/balance-summary-text.js";
import { Card, CardBody, CardTitle } from 'reactstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';


function BalanceSummary(props) {
    //optional props: selectedAccountId, externalRefreshToken
    //externalRefreshToken can be any data. This prop should be changed when you want to force this component to refresh data. This prop should not be used for anything else. 
    const appContext = React.useContext(PageSettings);
    const history = useHistory();
    const [loading, setLoading] = React.useState(true);
    const [assetAndLiabilityAccounts, setAssetAndLiabilityAccounts] = React.useState([]);

    //fetch data on component mount
    React.useEffect(() => {
        axios.get(`${API_BASE_URL}/organization/${appContext.currentOrganizationId}/account`).then(response => {
            if (response.data) {
                let filteredAccounts = response.data.filter(account => (account.accountTypeId == 1 || account.accountTypeId == 2) && account.hasChildren === false);
                setAssetAndLiabilityAccounts(filteredAccounts);
            }
            setLoading(false);
        }).catch(console.log);

    }, [appContext.currentOrganizationId, props.externalRefreshToken])


    return (
        <Card className="shadow-sm very-rounded" style={{ height: '500px' }}>
            <CardBody>
                <CardTitle className="font-weight-600">
                    {balanceSummaryText[appContext.locale]["Balance Summary"]}
                </CardTitle>
				<PerfectScrollbar style={{maxHeight: "427px", marginLeft: "-1.25rem", marginRight: "-1.25rem"}} options={{suppressScrollX: true, wheelPropagation: false}}>
                    <div style={{paddingLeft: "1.25rem", paddingRight: "1.25rem"}}>
                        {loading 
                            ?   <div className="d-flex justify-content-center fa-3x py-3"><i className="fas fa-circle-notch fa-spin"></i></div> 
                            :   
                                <div>
                                    {assetAndLiabilityAccounts.map(account => {
                                        return(
                                            <Link key={account.accountId} to={`/account-details/${account.accountId}`} className="tr d-flex align-items-center">
                                                <div className="td d-flex col-11 justify-content-between align-items-center">
                                                    <div className="col-8">
                                                        <div className={"font-size-compact font-weight-600 " + (account.accountCode? "" : " d-none")}>
                                                            {account.accountCode}
                                                        </div>
                                                        <div className="text-truncate">
                                                            {account.accountName}
                                                        </div>
                                                    </div>
                                                    <div className={" text-right " + (account.creditTotal > account.debitTotal ? "text-red" : "")}>
                                                        {new Intl.NumberFormat(appContext.locale, { style: 'currency', currency: appContext.currency }).format(account.accountTypeId === 1? account.debitsMinusCredits : (account.debitsMinusCredits === 0? account.debitsMinusCredits : account.debitsMinusCredits * -1))}
                                                    </div>
                                                </div>
                                                <div className="col-1 pl-0 text-muted"><i className="fas fa-angle-right "></i></div>
                                            </Link>
                                        )
                                    })}
                                </div>
                        }
                    </div>
                </PerfectScrollbar>
            </CardBody>
        </Card>
    )
}

export default BalanceSummary;