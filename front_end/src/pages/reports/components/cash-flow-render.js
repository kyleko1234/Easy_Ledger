import React from 'react';
import { Card, CardBody } from 'reactstrap';
import { PageSettings } from '../../../config/page-settings';
import axios from 'axios';
import {API_BASE_URL} from '../../../utils/constants.js';
import {cashFlowReportText} from '../../../utils/i18n/cash-flow-report-text.js';
import Select from 'react-select';
import { Link } from 'react-router-dom';


function CashFlowRender() {
    const appContext = React.useContext(PageSettings);

    const dateToday = new Date();
    const today = dateToday.toISOString().split(`T`)[0];
    const getDateInCurrentYear = date => {
        let dateComponentArray = date.split('-');
        return (dateToday.getFullYear() + "-" + dateComponentArray[1] + "-" + dateComponentArray[2]);
    }
    const beginningOfCurrentFiscalYear = getDateInCurrentYear(appContext.permissions.find(permission => permission.organization.id === appContext.currentOrganizationId).organization.fiscalYearBegin);

    const [startDate, setStartDate] = React.useState(dateToday.getFullYear() + "-01-01");
    const [endDate, setEndDate] = React.useState(dateToday.toISOString().split('T')[0]);
    const [loading, setLoading] = React.useState(true);

    const [cashFlowJson, setCashFlowJson] = React.useState(null);
    const [cashBeginningBalances, setCashBeginningBalances] = React.useState(0);
    const [cashEndingBalances, setCashEndingBalances] = React.useState(0);

    const [cashFlowObjects, setCashFlowObjects] = React.useState([]);
    const [datesToRequest, setDatesToRequest] = React.useState([{
        label: "Custom",
        startDate: beginningOfCurrentFiscalYear,
        endDate: today
    }]);
    const [columnLabels, setColumnLabels] = React.useState([]);
    const [dateRangePresets, setDateRangePresets] = React.useState([]);

    const handleChangeStartDate = (date, i) => {
        let newDatesToRequestArray = datesToRequest.slice();
        newDatesToRequestArray[i] = {
            label: "Custom", startDate: date
        }
        setDatesToRequest(newDatesToRequestArray)
    }
    const handleChangeEndDate = (date, i) => {
        let newDatesToRequestArray = datesToRequest.slice();
        newDatesToRequestArray[i] = {
            label: "Custom", endDate: date
        }
        setDatesToRequest(newDatesToRequestArray)
    }

    const numberAsCurrency = (number) => {
        if (number == 0) {
            return new Intl.NumberFormat(appContext.locale, { style: 'currency', currency: appContext.currency }).format(0);
        } else if (number > 0) {
            return new Intl.NumberFormat(appContext.locale, { style: 'currency', currency: appContext.currency }).format(number)
        } else if (number < 0) {
            return "(" + new Intl.NumberFormat(appContext.locale, { style: 'currency', currency: appContext.currency }).format(number * -1) + ")";
        }
    }

    const requestCashFlowObjects = async arrayToStoreObjects => {
        let newColumnLabels = [];
        for (const dateObject of datesToRequest) {
            await axios.get(`${API_BASE_URL}/organization/${appContext.currentOrganizationId}/reports/cashFlow/${dateObject.startDate}/${dateObject.endDate}`).then(response => {
                newColumnLabels.push(dateObject);     //column labels are not updated until the report is actually updated
                arrayToStoreObjects.push(response.data);
            }).catch(console.log);
        }
        setColumnLabels(newColumnLabels);
    }

    const handleUpdateReportButton = async () => {
        setLoading(true);
        let fetchedCashFlowObjects = [];
        await requestCashFlowObjects(fetchedCashFlowObjects);
        setCashFlowObjects(fetchedCashFlowObjects);
        setLoading(false);
    }

    const handleSelectDateRangePreset = (selectedOption, i) => {
        if (selectedOption) {
            let dateToRequestObject = {
                label: selectedOption.label,
                startDate: selectedOption.object.startDate,
                endDate: selectedOption.object.endDate
            };
            let newDatesToRequestArray = datesToRequest.slice();
            newDatesToRequestArray[i] = dateToRequestObject;
            setDatesToRequest(newDatesToRequestArray);
        }
    }

    const handleRemoveDateRangeButton = i => {
        let datesArray = datesToRequest.slice();
        datesArray.splice(i, 1);
        setDatesToRequest(datesArray);
    }

    const handleCompareButton = () => {
        let datesArray = datesToRequest.slice();
        datesArray.push({
            label: "Custom", 
            startDate: beginningOfCurrentFiscalYear,
            endDate:today}
        )
        setDatesToRequest(datesArray);
    }

    const hasAdjustmentsInOperatingIncome = () => {
        let returnedBoolean = false;
        cashFlowObjects.forEach(cashFlowObject => {
            if (cashFlowObject.depreciationAndAmortization || cashFlowObject.deferredTax || cashFlowObject.shareBasedCompensation || cashFlowObject.nonOperatingIncome) {
                returnedBoolean = true;
            }
        })
        return returnedBoolean;
    }

    const hasChangesInOperatingAssetsLiabilities = () => {
        let returnedBoolean = false;
        cashFlowObjects.forEach(cashFlowObject => {
            if (cashFlowObject.receivables || cashFlowObject.payables || cashFlowObject.inventory || cashFlowObject.deferredRevenue || cashFlowObject.otherAssets || cashFlowObject.otherLiabilities) {
                returnedBoolean = true;
            }
        })
        return returnedBoolean;
    }

    const hasZeroAmountsForFieldInAllDateRanges = (fieldName) => {
        let nonZeroAmount = []
        nonZeroAmount = cashFlowObjects.filter(cashFlowObject => cashFlowObject[fieldName] != 0);
        if (nonZeroAmount.length) {
            return false;
        } 
        return true;
    }

    const renderCellsForField = (fieldName, sign) => {
        return(
            <div className="text-right d-flex">
                {cashFlowObjects.map((cashFlowObject, i) => {
                    return(
                        <div key={i} className="width-175">
                            {numberAsCurrency(cashFlowObject[fieldName] * (sign >= 0 ? 1 : -1))}
                        </div>
                    )
                })}
            </div>
        )
    }

    React.useEffect(() => {
        async function fetchData() {
            setLoading(true);
            await axios.get(`${API_BASE_URL}/organization/${appContext.currentOrganizationId}/dateRangePresetsUpToDate/${today}`).then(response => {
                let formattedPresets = response.data.map(preset => {
                    return{
                        value: preset.name,
                        label: preset.name,
                        object: preset
                    }
                })
                setDateRangePresets(formattedPresets);
            })
            let fetchedCashFlowObjects = [];
            await requestCashFlowObjects(fetchedCashFlowObjects);
            setCashFlowObjects(fetchedCashFlowObjects);
            
            await axios.get(`${API_BASE_URL}/organization/${appContext.currentOrganizationId}/reports/cashFlow/${startDate}/${endDate}`).then(response => {
                if (response.data) {
                    setCashFlowJson(response.data);
          
            
                    let beginningCashSubtype = response.data.beginningAccountSubtypeBalances.find(accountSubtype => accountSubtype.accountSubtypeId == response.data.cashAndCashEquivalentsSubtypeId);
                    if (beginningCashSubtype) {
                        setCashBeginningBalances(beginningCashSubtype.debitsMinusCredits);
                    }
                    let endingCashSubtype = response.data.endingAccountSubtypeBalances.find(accountSubtype => accountSubtype.accountSubtypeId == response.data.cashAndCashEquivalentsSubtypeId);
                    if (endingCashSubtype) {
                        setCashEndingBalances(endingCashSubtype.debitsMinusCredits);
                    }
                }
            }).catch(error => {
                console.log(error);
            });
            setLoading(false);
        }
        fetchData();
    }, [])

    return (
        <>
            <Card className="bg-light very-rounded shadow-sm my-4">
                <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h2 className="h5">{cashFlowReportText[appContext.locale]["Options"]}</h2>
                        <button className="btn btn-primary" onClick={handleUpdateReportButton}>
                            {cashFlowReportText[appContext.locale]["Update report"]}
                        </button>
                    </div>
                    <div className="d-none d-md-block">
                        {datesToRequest.map((dateObject, i) => {
                            return (
                                <div key={i}>
                                    {datesToRequest.length > 1
                                    ?   <div className="font-weight-600 my-1 d-flex align-items-center">
                                            {cashFlowReportText[appContext.locale]["Date range"] + " " + (i + 1)}
                                            <button className="btn btn-light py-0 px-1 mx-1 border-0" onClick={() => handleRemoveDateRangeButton(i)}>
                                                <i className="ion ion-md-close fa-fw"></i>
                                            </button>
                                        </div>
                                    : null}
                                    <div className="d-flex w-100 align-items-center mb-2">
                                        <Select
                                            className="col-4 px-0"
                                            options={dateRangePresets}
                                            menuPortalTarget={document.body}
                                            menuShouldScrollIntoView={false}
                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                            onChange={selectedOption => handleSelectDateRangePreset(selectedOption, i)}
                                            placeholder={"Custom"}
                                            value={datesToRequest[i].label === "Custom" ? null : dateRangePresets.find(preset => preset.label == datesToRequest[i].label)}
                                        />
                                        <label className="my-0 text-right col-1 px-2">{cashFlowReportText[appContext.locale]["From:"]} </label>
                                        <input type="date" className="form-control col-3" value={datesToRequest[i].startDate} onChange={event => handleChangeStartDate(event.target.value, i)} />
                                        <label className="my-0 text-right col-1 px-2">{cashFlowReportText[appContext.locale]["To:"]} </label>
                                        <input type="date" className="form-control col-3" value={datesToRequest[i].endDate} onChange={event => handleChangeEndDate(event.target.value, i)} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="d-md-none">
                        {datesToRequest.map((dateObject, i) => {
                            return (
                                <div key={i}>
                                    <div className="d-flex my-1 justify-content-between">
                                        <div className="font-weight-600 d-flex align-items-center">
                                            {cashFlowReportText[appContext.locale]["Date range"] + (datesToRequest.length > 1? (" " + (i + 1)) : "" )}
                                            <button className={"btn btn-light py-0 px-1 mx-1 border-0 " + (datesToRequest.length > 1 ? "" : " invisible")} onClick={() => handleRemoveDateRangeButton(i)}>
                                                <i className="ion ion-md-close fa-fw"></i>
                                            </button>
                                        </div>
                                        <Select
                                            className="col-6 px-0"
                                            options={dateRangePresets}
                                            menuPortalTarget={document.body}
                                            menuShouldScrollIntoView={false}
                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                            onChange={selectedOption => handleSelectDateRangePreset(selectedOption, i)}
                                            placeholder={"Custom"}
                                            value={datesToRequest[i].label === "Custom" ? null : dateRangePresets.find(preset => preset.label == datesToRequest[i].label)}
                                        />
                                    </div>
                                    <div className="d-flex justify-content-between text-left align-items-center my-1">
                                        <label className="my-0 col-3 px-0">{cashFlowReportText[appContext.locale]["From:"]} </label>
                                        <input type="date" className="form-control" value={datesToRequest[i].startDate} onChange={event => handleChangeStartDate(event.target.value, i)} />
                                    </div>
                                    <div className="d-flex justify-content-between text-left align-items-center mb-2">
                                        <label className="my-0 col-3 px-0">{cashFlowReportText[appContext.locale]["To:"]} </label>
                                        <input type="date" className="form-control" value={datesToRequest[i].endDate} onChange={event => handleChangeEndDate(event.target.value, i)} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    {datesToRequest.length < 3
                    ?   <div className="mb-2">
                            <Link replace to="#" onClick={handleCompareButton} className="text-decoration-none">
                            <i className="ion ion-md-add"></i> {cashFlowReportText[appContext.locale]["Compare"]}                            </Link>
                        </div>
                    : null}
                </CardBody>
            </Card>
            <div >
                    {(loading || !cashFlowObjects.length) ? <div className="d-flex justify-content-center fa-3x py-3"><i className="fas fa-circle-notch fa-spin"></i></div> : 
                    <div className="overflow-auto">
                        <div className="min-width-lg">
                            <div className="d-flex justify-content-between font-weight-600 text-right">
                                <div>{/*empty div for spacing*/}</div>
                                <div className="text-right d-flex">
                                {
                                    columnLabels.map((columnLabel, i) => {
                                        return(
                                            <div className="td width-175" key={i}>
                                                {columnLabel.label === "Custom"
                                                ?   <>
                                                        <div>
                                                            {cashFlowReportText[appContext.locale]["From:"] + " " + columnLabel.startDate}
                                                        </div>
                                                        <div>
                                                            {cashFlowReportText[appContext.locale]["To:"] + " " + columnLabel.endDate}
                                                        </div>
                                                    </>
                                                : columnLabel.label}
                                            </div>
                                        )
                                    })
                                }
                                </div>
                            </div>
                            <div>
                                <div className="striped-row justify-content-between font-weight-600">
                                    <div>{cashFlowReportText[appContext.locale]["Cash and cash equivalents, beginning of period"]}</div>
                                    <div className="text-right d-flex">
                                        {cashFlowObjects.map((cashFlowObject, i) => {
                                            let beginningCashSubtype = cashFlowObject.beginningAccountSubtypeBalances.find(accountSubtype => accountSubtype.accountSubtypeId == cashFlowObject.cashAndCashEquivalentsSubtypeId);
                                            if (beginningCashSubtype) {
                                                return(
                                                    <div key={i} className="width-175">
                                                        {numberAsCurrency(beginningCashSubtype.debitsMinusCredits)}
                                                    </div>
                                                )
                                            }
                                        })}
                                    </div>
                                </div>
                                <div className="striped-row"><div className="invisible">spacer</div> {/*spacer row*/}</div>

                                <div className="striped-row font-weight-600">{cashFlowReportText[appContext.locale]["Operating activities"]}</div>
                                <div className="striped-row justify-content-between indent">
                                    <div>{cashFlowReportText[appContext.locale]["Net Income"]}</div>
                                    {renderCellsForField("netIncome", 1)}
                                </div>
                                {(!hasAdjustmentsInOperatingIncome())? null : 
                                    <div className="striped-row indent font-weight-600">
                                        {cashFlowReportText[appContext.locale]["Adjustments to reconcile operating income to cash generated by operating activities"]}
                                    </div>
                                }
                                {hasZeroAmountsForFieldInAllDateRanges("depreciationAndAmortization")? null : 
                                    <div className="striped-row justify-content-between indent-2">
                                        <div>{cashFlowReportText[appContext.locale]["Depreciation and amortization"]}</div>
                                        {renderCellsForField("depreciationAndAmortization", 1)}
                                    </div>
                                }
                                {hasZeroAmountsForFieldInAllDateRanges("deferredTax")? null : 
                                    <div className="striped-row justify-content-between indent-2">
                                        <div>{cashFlowReportText[appContext.locale]["Increase (decrease) in deferred taxes"]}</div>
                                        {renderCellsForField("deferredTax", 1)}
                                    </div>
                                }
                                {hasZeroAmountsForFieldInAllDateRanges("shareBasedCompensation")? null : 
                                    <div className="striped-row justify-content-between indent-2">
                                        <div>{cashFlowReportText[appContext.locale]["Share-based compensation"]}</div>
                                        {renderCellsForField("shareBasedCompensation", 1)}
                                    </div>
                                }
                                {hasZeroAmountsForFieldInAllDateRanges("nonOperatingIncome")? null : 
                                    <div className="striped-row justify-content-between indent-2">
                                        <div>{cashFlowReportText[appContext.locale]["Adjustment for non-operating loss (income)"]}</div>
                                        {renderCellsForField("nonOperatingIncome", 1)}
                                    </div>
                                }
                                {!hasChangesInOperatingAssetsLiabilities()? null : 
                                    <div className="striped-row font-weight-600 indent">{cashFlowReportText[appContext.locale]["Changes in operating assets and liabilities"]}</div>
                                }
                                {hasZeroAmountsForFieldInAllDateRanges("receivables")? null : 
                                    <div className="striped-row justify-content-between indent-2">
                                        <div>{cashFlowReportText[appContext.locale]["Decrease (increase) in receivables"]}</div>
                                        {renderCellsForField("receivables", -1)}
                                    </div>
                                }
                                {hasZeroAmountsForFieldInAllDateRanges("payables")? null : 
                                    <div className="striped-row justify-content-between indent-2">
                                        <div>{cashFlowReportText[appContext.locale]["Increase (decrease) in payables"]}</div>
                                        {renderCellsForField("payables", 1)}
                                    </div>
                                }
                                {hasZeroAmountsForFieldInAllDateRanges("inventory") ? null : 
                                    <div className="striped-row justify-content-between indent-2">
                                        <div>{cashFlowReportText[appContext.locale]["Decrease (increase) in inventory"]}</div>
                                        {renderCellsForField("inventory", -1)}
                                    </div>}
                                {hasZeroAmountsForFieldInAllDateRanges("deferredRevenue")? null : 
                                    <div className="striped-row justify-content-between indent-2">
                                        <div>{cashFlowReportText[appContext.locale]["Increase (decrease) in deferred revenue"]}</div>
                                        {renderCellsForField("deferredRevenue", 1)}
                                    </div>
                                }
                                {hasZeroAmountsForFieldInAllDateRanges("otherAssets")? null : 
                                    <div className="striped-row justify-content-between indent-2">
                                        <div>{cashFlowReportText[appContext.locale]["Decrease (increase) in other assets"]}</div>
                                        {renderCellsForField("otherAssets", -1)}
                                    </div>
                                }
                                {hasZeroAmountsForFieldInAllDateRanges("otherLiabilities")? null : 
                                    <div className="striped-row justify-content-between indent-2">
                                        <div>{cashFlowReportText[appContext.locale]["Increase (decrease) in other liabilities"]}</div>
                                        {renderCellsForField("otherLiabilities", 1)}
                                    </div>
                                }
                                <div className="striped-row justify-content-between font-weight-600">
                                    <div>{cashFlowReportText[appContext.locale]["Cash flow from operations"]}</div>
                                    {renderCellsForField("cashFlowFromOperations", 1)}
                                </div>
                                <div className="striped-row"><div className="invisible">spacer</div> {/*spacer row*/}</div>

                                <div className="striped-row font-weight-600">{cashFlowReportText[appContext.locale]["Investing activities"]}</div>
                                {hasZeroAmountsForFieldInAllDateRanges("netIncomeFromInvesting")? null : 
                                    <div className="striped-row justify-content-between indent">
                                        <div>{cashFlowReportText[appContext.locale]["Income (loss) from investing, net"]}</div>
                                        {renderCellsForField("netIncomeFromInvesting", 1)}
                                    </div>
                                }
                                {hasZeroAmountsForFieldInAllDateRanges("marketableSecurities")? null : 
                                    <div className="striped-row justify-content-between indent">
                                        <div>{cashFlowReportText[appContext.locale]["Decrease (increase) in marketable securities"]}</div>
                                        {renderCellsForField("marketableSecurities", -1)}
                                    </div>
                                }
                                {hasZeroAmountsForFieldInAllDateRanges("propertyPlantAndEquipment")? null : 
                                    <div className="striped-row justify-content-between indent">
                                        <div>{cashFlowReportText[appContext.locale]["Decrease (increase) in property, plant, and equipment"]}</div>
                                        {renderCellsForField("propertyPlantAndEquipment", -1)}
                                    </div>
                                }
                                {hasZeroAmountsForFieldInAllDateRanges("depreciationAndAmortization")? null : 
                                    <div className="striped-row justify-content-between indent-2">
                                        <div>{cashFlowReportText[appContext.locale]["Adjustment for change in book value of property, plant, and equipment due to depreciation and amortization"]}</div>
                                        {renderCellsForField("depreciationAndAmortization", -1)}
                                    </div>
                                }
                                <div className="striped-row justify-content-between font-weight-600">
                                    <div>{cashFlowReportText[appContext.locale]["Cash flow from investing"]}</div>
                                    {renderCellsForField("cashFlowFromInvesting", 1)}
                                </div>
                                <div className="striped-row"><div className="invisible">spacer</div> {/*spacer row*/}</div>
                                
                                <div className="striped-row font-weight-600">{cashFlowReportText[appContext.locale]["Financing activities"]}</div>
                                {hasZeroAmountsForFieldInAllDateRanges("netIncomeFromFinancing")? null : 
                                    <div className="striped-row justify-content-between indent">
                                        <div>{cashFlowReportText[appContext.locale]["Income (loss) from financing activities, net"]}</div>
                                        {renderCellsForField("netIncomeFromFinancing", -1)}
                                    </div>
                                }
                                {hasZeroAmountsForFieldInAllDateRanges("paidInCapital")? null : 
                                    <div className="striped-row justify-content-between indent">
                                        <div>{cashFlowReportText[appContext.locale]["Increase (decrease) in paid-in capital"]}</div>
                                        {renderCellsForField("paidInCapital", 1)}
                                    </div>
                                }
                                {hasZeroAmountsForFieldInAllDateRanges("otherEquity")? null : 
                                    <div className="striped-row justify-content-between indent">
                                        <div>{cashFlowReportText[appContext.locale]["Increase (decrease) in other equity"]}</div>
                                        {renderCellsForField("otherEquity", 1)}
                                    </div>
                                }
                                {hasZeroAmountsForFieldInAllDateRanges("dividendPayments")? null : 
                                    <div className="striped-row justify-content-between indent">
                                        <div>{cashFlowReportText[appContext.locale]["Payments for dividends and equivalents"]}</div>
                                        {renderCellsForField("dividendPayments", -1)}
                                    </div>
                                }
                                {hasZeroAmountsForFieldInAllDateRanges("debt")? null : 
                                    <div className="striped-row justify-content-between indent">
                                        <div>{cashFlowReportText[appContext.locale]["Increase (decrease) in debt"]}</div>
                                        {renderCellsForField("debt", 1)}
                                    </div>
                                }
                                <div className="striped-row justify-content-between font-weight-600">
                                    <div>{cashFlowReportText[appContext.locale]["Cash flow from financing"]}</div>
                                    {renderCellsForField("cashFlowFromFinancing", 1)}
                                </div>
                                <div className="striped-row"><div className="invisible">spacer</div> {/*spacer row*/}</div>

                                <div className="striped-row justify-content-between font-weight-600">
                                    <div>{cashFlowReportText[appContext.locale]["Increase (decrease) in cash and equivalents"]}</div>
                                    {renderCellsForField("cashFlow", 1)}
                                </div>
                                <div className="striped-row justify-content-between font-weight-600">
                                    <div>{cashFlowReportText[appContext.locale]["Cash and cash equivalents, end of period"]}</div>
                                    <div className="text-right d-flex">
                                        {cashFlowObjects.map((cashFlowObject, i) => {
                                            let endingCashSubtype = cashFlowObject.endingAccountSubtypeBalances.find(accountSubtype => accountSubtype.accountSubtypeId == cashFlowObject.cashAndCashEquivalentsSubtypeId);
                                            if (endingCashSubtype) {
                                                return(
                                                    <div key={i} className="width-175">
                                                        {numberAsCurrency(endingCashSubtype.debitsMinusCredits)}
                                                    </div>
                                                )
                                            }
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    }
            </div>

        </>
    )
}

export default CashFlowRender;