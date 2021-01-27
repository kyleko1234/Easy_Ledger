import React from 'react';
import { PageSettings } from '../../../config/page-settings';
import { API_BASE_URL} from '../../../utils/constants';
import axios from 'axios';

/**
 * INCOME STATEMENT FORMAT
 * 
 * 21 Revenue
 *      Revenue account groups
 *          Total Revenue
 * empty
 * 23 Cost of sales
 *      COS account groups
 *          total COS
 *          Gross Margin 
 * empty
 * Operating Expenses
 *      24 R&D
 *      25 SG&A
 *      26 Depreciation
 *      27 Amortization
 *          Total operating expenses
 * empty
 * Operating income
 * 22 - 28 Other income/expense, net
 * Income before provision for income taxes
 * 29 Income taxes
 * empty
 * Net income
 */
function IncomeStatementRender() {
    const appContext = React.useContext(PageSettings);

    const today = new Date();
    const [startDate, setStartDate] = React.useState(today.getFullYear() + "-01-01");
    const [endDate, setEndDate] = React.useState(today.toISOString().split('T')[0]);
    const [loading, setLoading] = React.useState(true);

    const [totalRevenue, setTotalRevenue] = React.useState(null);
    const [totalCostOfSales, setTotalCostOfSales] = React.useState(null);
    const [grossMargin, setGrossMargin] = React.useState(null);
    const [rd, setRd] = React.useState(null);
    const [sga, setSga] = React.useState(null);
    const [depreciation, setDepreciation] = React.useState(null);
    const [amortization, setAmortization] = React.useState(null);
    const [totalOperatingExpenses, setTotalOperatingExpenses] = React.useState(null);
    const [operatingIncome, setOperatingIncome] = React.useState(null);
    const [netOtherIncomeExpense, setNetOtherIncomeExpense] = React.useState(null);
    const [incomeBeforeTax, setIncomeBeforeTax] = React.useState(null);
    const [incomeTax, setIncomeTax] = React.useState(null);
    const [netIncome, setNetIncome] = React.useState(null);

    const [revenueSubtypeId, setRevenueSubtypeId] = React.useState(null);
    const [otherIncomeSubtypeId, setOtherIncomeSubtypeId] = React.useState(null);
    const [costOfSalesSubtypeId, setCostOfSalesSubtypeId] = React.useState(null);
    const [researchAndDevelopmentSubtypeId, setResearchAndDevelopmentSubtypeId] = React.useState(null);
    const [sgaSubtypeId, setSgaSubtypeId] = React.useState(null);
    const [depreciationSubtypeId, setDepreciationSubtypeId] = React.useState(null);
    const [amortizationSubtypeId, setAmortizationSubtypeId] = React.useState(null);
    const [otherExpensesSubtypeId, setOtherExpensesSubtypeId] = React.useState(null);
    const [incomeTaxSubtypeId, setIncomeTaxSubtypeId] = React.useState(null);

    const [accountGroupBalances, setAccountGroupBalances] = React.useState(null);
    const [accountBalances, setAccountBalances] = React.useState(null);


    React.useEffect(() => {
        async function fetchData() {
            setLoading(true);
            await axios.get(`${API_BASE_URL}/organization/${appContext.currentOrganization}/reports/incomeStatement/${startDate}/${endDate}`).then(response => {
                if (response.data) {
                    setTotalRevenue(response.data.totalRevenue);
                    setTotalCostOfSales(response.data.totalCostOfSales);
                    setGrossMargin(response.data.grossMargin);
                    setRd(response.data.totalResearchAndDevelopment);
                    setSga(response.data.totalSalesGeneralAndAdministration);
                    setDepreciation(response.data.totalDepreciation);
                    setAmortization(response.data.totalAmortization);
                    setTotalOperatingExpenses(response.data.totalOperatingExpenses);
                    setOperatingIncome(response.data.operatingIncome);
                    setNetOtherIncomeExpense(response.data.otherIncomeExpense);
                    setIncomeBeforeTax(response.data.incomeBeforeTax);
                    setIncomeTax(response.data.incomeTax);
                    setNetIncome(response.data.netIncome);
                    setAccountGroupBalances(response.data.accountGroupBalances);
                    setAccountBalances(response.data.accountBalances);
                    setRevenueSubtypeId(response.data.revenueSubtypeId);
                    setOtherIncomeSubtypeId(response.data.otherIncomeSubtypeId);
                    setCostOfSalesSubtypeId(response.data.costOfSalesSubtypeId);
                    setResearchAndDevelopmentSubtypeId(response.data.researchAndDevelopmentSubtypeId);
                    setSgaSubtypeId(response.data.sgaSubtypeId);
                    setDepreciationSubtypeId(response.data.depreciationSubtypeId);
                    setAmortizationSubtypeId(response.data.amortizationSubtypeId);
                    setOtherExpensesSubtypeId(response.data.otherExpensesSubtypeId);
                    setIncomeTaxSubtypeId(response.data.incomeTaxSubtypeId);
                }
            }).catch(error => {
                console.log(error);
            });
            setLoading(false);
        }
        fetchData();
    }, [startDate, endDate]);

    const handleChangeStartDate = date => {
        setStartDate(date);
    }
    const handleChangeEndDate = date => {
        setEndDate(date);
    }

    const numberAsCurrency = (number) => {
        if (number == 0) {
            return new Intl.NumberFormat(appContext.locale, { style: 'currency', currency: appContext.currency }).format(0);
        }
        return new Intl.NumberFormat(appContext.locale, { style: 'currency', currency: appContext.currency }).format(number)
    }


    return (
        <div className="widget widget-rounded m-b-30">
            <div className="widget-header bg-light border-bottom">
                <div className="widget-header-title">
                    <div className="form-inline justify-content-between">
                        <div className="font-weight-600">Income Statement</div>    
                        <div className="form-group">
                            <label className="ml-sm-5 px-1">From: </label>
                            <input type="date" className="form-control form-control-sm width-125" value={startDate} onChange={event => handleChangeStartDate(event.target.value)} />
                            <label className="ml-sm-5 px-1">to: </label>
                            <input type="date" className="form-control form-control-sm width-125" value={endDate} onChange={event => handleChangeEndDate(event.target.value)} />
                        </div> 
                    </div>
                </div>
            </div>
            <div>
                {loading? "Loading..." : 
                <div>
                    <table className="table table-striped m-b-0">
                        <tbody>
                            <tr><td className="font-weight-600">Revenue</td></tr>
                            {accountGroupBalances.filter(accountGroup => accountGroup.accountSubtypeId == revenueSubtypeId).map(accountGroup => {
                                return(
                                    <tr><td className="d-flex justify-content-between p-l-30"><div>{accountGroup.accountGroupName}</div><div>{numberAsCurrency(accountGroup.debitsMinusCredits * -1)}</div></td></tr>
                                )
                            })}
                            <tr><td className="d-flex justify-content-between p-l-30 font-weight-600"><div className="p-l-30">Total revenue</div><div>{numberAsCurrency(totalRevenue)}</div></td></tr>
                            <tr><td>{/* empty row */}<div className="visibility-hidden">spacer row</div></td></tr>
                            <tr><td className="font-weight-600">Cost of sales</td></tr>
                            {accountGroupBalances.filter(accountGroup => accountGroup.accountSubtypeId == costOfSalesSubtypeId).map(accountGroup => {
                                return(
                                    <tr><td className="d-flex justify-content-between p-l-30"><div>{accountGroup.accountGroupName}</div><div>{numberAsCurrency(accountGroup.debitsMinusCredits)}</div></td></tr>
                                )
                            })}
                            <tr><td className="d-flex justify-content-between p-l-30 font-weight-600"><div className="p-l-30">Total cost of sales</div><div>{numberAsCurrency(totalCostOfSales)}</div></td></tr>
                            <tr><td className="d-flex justify-content-between p-l-30 font-weight-600"><div className="p-l-30">Gross margin</div><div>{numberAsCurrency(grossMargin)}</div></td></tr>
                            <tr><td>{/* empty row */}<div className="visibility-hidden">spacer row</div></td></tr>
                            <tr><td className="font-weight-600">Operating expenses</td></tr>
                            <tr><td className="d-flex justify-content-between p-l-30"><div>Research and development</div><div>{numberAsCurrency(rd)}</div></td></tr>
                            <tr><td className="d-flex justify-content-between p-l-30"><div>Sales, general, and administration</div><div>{numberAsCurrency(sga)}</div></td></tr>
                            <tr><td className="d-flex justify-content-between p-l-30"><div>Depreciation</div><div>{numberAsCurrency(depreciation)}</div></td></tr>
                            <tr><td className="d-flex justify-content-between p-l-30"><div>Amortization</div><div>{numberAsCurrency(amortization)}</div></td></tr>
                            <tr><td className="d-flex justify-content-between p-l-30 font-weight-600"><div className="p-l-30">Total operating expenses</div><div>{numberAsCurrency(totalOperatingExpenses)}</div></td></tr>
                            <tr><td>{/* empty row */}<div className="visibility-hidden">spacer row</div></td></tr>
                            <tr><td className="d-flex justify-content-between font-weight-600"><div>Operating income</div><div>{numberAsCurrency(operatingIncome)}</div></td></tr>
                            <tr><td className="d-flex justify-content-between"><div>Other income/expense, net</div><div>{numberAsCurrency(netOtherIncomeExpense)}</div></td></tr>
                            <tr><td className="d-flex justify-content-between font-weight-600"><div>Income before tax</div><div>{numberAsCurrency(incomeBeforeTax)}</div></td></tr>
                            <tr><td className="d-flex justify-content-between"><div>Income tax</div><div>{numberAsCurrency(incomeTax)}</div></td></tr>
                            <tr><td>{/* empty row */}<div className="visibility-hidden">spacer row</div></td></tr>
                            <tr><td className="d-flex justify-content-between font-weight-600"><div>Net income</div><div>{numberAsCurrency(netIncome)}</div></td></tr>
                        </tbody>
                    </table>
                </div>
                }
            </div>
        </div>
    )
}

export default IncomeStatementRender;