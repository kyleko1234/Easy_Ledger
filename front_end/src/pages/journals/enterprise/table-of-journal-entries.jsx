import React from 'react'
import { Modal, ModalBody, ModalFooter } from 'reactstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../utils/constants.js';
import JournalEntryViewMode from './journal-entry-view-mode';
import JournalEntryEditMode from './journal-entry-edit-mode';
import { PageSettings } from '../../../config/page-settings.js';
import { tableOfJournalEntriesText } from '../../../utils/i18n/table-of-journal-entries-text.js';
import JournalEntryEditHistory from './journal-entry-edit-history.js';

//optional props: parentComponentAccountId
function TableOfJournalEntries({
    tableTitle, 
    hasAddEntryButton,
    parentComponentAccountId,
    fetchData,
    pageSize,
    pageIndex,
    columns,
    data,
    totalPages,
    totalElements,
    pageLength,
    first,
    last,
    loading,
    previousPage,
    nextPage
}) {
    const appContext = React.useContext(PageSettings);

    const [journalEntryModal, setJournalEntryModal] = React.useState(false);
    const toggleJournalEntryModal = () => setJournalEntryModal(!journalEntryModal);
    const expandJournalEntry = (journalEntryId) => {
        fetchJournalEntry(journalEntryId);
        toggleJournalEntryModal();
    }
    const [editMode, setEditMode] = React.useState(false); //Toggle editmode for an expanded entry
    const [createMode, setCreateMode] = React.useState(false);
    const toggleEditMode = () => setEditMode(!editMode);
  
    const [lineItemData, setLineItemData] = React.useState([]);
    const [journalEntryId, setJournalEntryId] = React.useState(null);
    const [journalEntryDescription, setJournalEntryDescription] = React.useState('');
    const [journalEntryDate, setJournalEntryDate] = React.useState('');
    const [alertMessages, setAlertMessages] = React.useState([]);
    const [accountOptions, setAccountOptions] = React.useState([]);

    const [journalEntryHistoryModal, setJournalEntryHistoryModal] = React.useState(false);
    const toggleJournalEntryHistoryModal = () => setJournalEntryHistoryModal(!journalEntryHistoryModal);    

    const fetchJournalEntry = journalEntryId => {
        axios.get(`${API_BASE_URL}/journalEntry/${journalEntryId}`)
            .then(response => {
                let formattedLineItems = []
                let journalEntry = response.data;
                journalEntry.lineItems.forEach(lineItem => {
                    let formattedLineItem = {
                        lineItemId: lineItem.lineItemId,
                        accountName: lineItem.accountName,
                        accountId: lineItem.accountId,
                        description: lineItem.description,
                        debitAmount: (lineItem.isCredit ? null : lineItem.amount),
                        creditAmount: (lineItem.isCredit ? lineItem.amount : null)
                    }
                    formattedLineItems.push(formattedLineItem);
                })
                formattedLineItems.sort((a, b) => a.lineItemId > b.lineItemId ? 1 : -1) //sort by LineItemId to preserve insertion order
                setLineItemData(formattedLineItems);
                setJournalEntryId(journalEntry.journalEntryId);
                setJournalEntryDescription(journalEntry.description);
                setJournalEntryDate(journalEntry.journalEntryDate);
                setAlertMessages([]); //reset alert messages every time an entry is fetched to refresh the page          
            })
            .catch(console.log)
    }

    const openEditorForNewEntry = () => {
        setJournalEntryId(null);
        let today = new Date();
        setJournalEntryDate(today.toISOString().split('T')[0]);
        setJournalEntryDescription('');
        setLineItemData([{
            lineItemId: "",
            accountName: "",
            accountId: "",
            description: "",
            debitAmount: 0,
            creditAmount: 0
        },
        {
            lineItemId: "",
            accountName: "",
            accountId: "",
            description: "",
            debitAmount: 0,
            creditAmount: 0
        }])
        toggleEditMode();
        setCreateMode(true);
        toggleJournalEntryModal();
    }

    const cancelCreateMode = () => {
        setCreateMode(false);
        setEditMode(false);
        setAlertMessages([]);
        toggleJournalEntryModal();
    }

    const cancelEditMode = () => {
        fetchJournalEntry(journalEntryId);
        toggleEditMode()
    }

    const handleEditButton = () => {
        toggleEditMode();
        fetchAccounts();
    }

    //refresh lists of accounts and categories, should be called every time the 'edit' button for an entry is clicked
    const fetchAccounts = () => {
        axios.get(`${API_BASE_URL}/organization/${appContext.currentOrganizationId}/account`)
            .then(response => {
                const formattedAccounts = response.data.filter(account => !account.hasChildren).map(account => {
                    return ({
                        value: account.accountId,
                        label: account.accountCode ? account.accountCode + " - " + account.accountName : account.accountName,
                        object: account
                    })
                });
                setAccountOptions(formattedAccounts);
            })
            .catch(console.log);
    }

    //if column accessor is debitAmount or creditAmount, format the value of this table cell as a currency, else return the value of this table cell
    const formatCell = (cellValue, columnAccessor) => {
        if (columnAccessor === "debitAmount" || columnAccessor === "creditAmount") {
            if (cellValue == 0) { //falsey items qualify as zero
                return '';
            }
            return (new Intl.NumberFormat(appContext.locale, { style: 'currency', currency: appContext.currency }).format(cellValue));    
        }
        return cellValue;
    }

    const checkEntryForValidationErrors = () => {
        let errorMessages = [];
        if (!journalEntryDate) {
            errorMessages.push(tableOfJournalEntriesText[appContext.locale]["Please choose a date for this entry."]);
        }
        if (!journalEntryDescription) {
            errorMessages.push(tableOfJournalEntriesText[appContext.locale]["Please provide a description for this entry."]);
        }
        if (lineItemData.length == 0) {
            errorMessages.push(tableOfJournalEntriesText[appContext.locale]["Entry must have line-items."]);
        }
        let debitSum = 0;
        let creditSum = 0;
        let missingAmount = false;
        let missingAccount = false;
        lineItemData.forEach(lineItem => { // check for missing fields within lineItems, and sum debits and credits.
            if (!lineItem.creditAmount && !lineItem.debitAmount) {
                missingAmount = true;
            }
            if (!lineItem.accountId) {
                missingAccount = true;
            }

            // sum debits and credits
            if (lineItem.debitAmount) {
                debitSum += lineItem.debitAmount;
            }
            if (lineItem.creditAmount) {
                creditSum += lineItem.creditAmount;
            }
        })
        //move missing description and missing amount error messages out of the loop to avoid duplicate messages
        if (missingAmount) {
            errorMessages.push(tableOfJournalEntriesText[appContext.locale]["Line-items must have either a debit or credit."]);
        }
        if (missingAccount) {
            errorMessages.push(tableOfJournalEntriesText[appContext.locale]["Line-items must be assigned to an account."]);
        }
        if (debitSum.toFixed(2) !== creditSum.toFixed(2)) {
            errorMessages.push(tableOfJournalEntriesText[appContext.locale]["Debits and Credits must balance."])
        }
        setAlertMessages(errorMessages);
        return errorMessages;
    }

    //Returns a valid request body for PUT/POST /journalEntry created from this function's state
    //POSTable entries have null journalEntryId, otherwise they should be PUT instead. 
    //Before calling this function please check for validity of the entry by making sure checkEntryForValidationErrors().length == 0
    const formatJournalEntryToSendToServer = () => {
        let lineItems = lineItemData.map(lineItem => {
            return {
                accountId: lineItem.accountId,
                amount: (lineItem.debitAmount ? lineItem.debitAmount : lineItem.creditAmount),
                description: lineItem.description,
                isCredit: (lineItem.creditAmount ? true : false)
            }
        });
        return {
            journalEntryId: journalEntryId,
            journalEntryDate: journalEntryDate,
            description: journalEntryDescription,
            organizationId: appContext.currentOrganizationId,
            lineItems: lineItems
        }
    }

    const postJournalEntry = (data) => {
        console.log(data);
        axios.post(`${API_BASE_URL}/journalEntry`, data)
            .then(response => {
                fetchData(pageIndex, pageSize);
                fetchJournalEntry(response.data.journalEntryId);
                setCreateMode(false);
                toggleEditMode();
            }).catch(console.log);
    }

    const putJournalEntry = (id, data) => {
        axios.put(`${API_BASE_URL}/journalEntry/${id}`, data)
            .then(response => {
                console.log(response);
                fetchData(pageIndex, pageSize);
                fetchJournalEntry(id);
                toggleEditMode();
            }).catch(console.log);
    }

    const handleCopyJournalEntryButton = () => {
        let today = new Date();
        setJournalEntryDate(today.toISOString().split('T')[0]);
        toggleEditMode();
        setCreateMode(true);
        setJournalEntryId(null); //must set journalEntryId to null, otherwise program will edit the original journal entry instead of posting a copy to the server. Server requires journalEntryId to be null for POST requests, so we cannot check for createMode=true to determine PUT/POST instead.
    }

    const handleSaveJournalEntryButton = () => {
        if (checkEntryForValidationErrors().length === 0) {
            let formattedEntry = formatJournalEntryToSendToServer();
            if (journalEntryId) {
                putJournalEntry(journalEntryId, formattedEntry);
            } else {
                postJournalEntry(formattedEntry);
            }
        }
    }

    const handleDeleteJournalEntryButton = (id) => {
        axios.delete(`${API_BASE_URL}/journalEntry/${id}`)
            .then(response => {
                console.log(response)
                fetchData(pageIndex, pageSize);
                toggleEditMode();
                toggleJournalEntryModal();
            });
    }

    const handleExitJournalEntryModal = () => {
        setCreateMode(false);
        setEditMode(false);
        setAlertMessages([]);
        toggleJournalEntryModal();
    }


    React.useEffect(() => {
        fetchData(pageIndex, pageSize);
        fetchAccounts();
    }, [pageIndex, pageSize, parentComponentAccountId]);

    return (
        <>
            <div className="d-sm-flex  justify-content-between align-items-center">
                {tableTitle}
                {hasAddEntryButton ?
                    <button type="button" className="btn btn-primary d-none d-sm-inline-block" onClick={() => openEditorForNewEntry()}>
                        {tableOfJournalEntriesText[appContext.locale]["Add an entry"]}
                    </button>
                : null}
            </div>
            <div className="d-sm-none"> {/**On small screens render button-block */}
                <button type="button" className="btn btn-primary btn-lg btn-block" onClick={() => openEditorForNewEntry()}>
                    {tableOfJournalEntriesText[appContext.locale]["Add an entry"]}
                </button>
            </div>
            <div className="my-2">
                <div className="thead">
                    <div className="d-none d-md-flex tr bg-light border rounded">
                        {columns.map(column => {
                            return(
                                <div key={column.accessor} className={"th " + column.className}>
                                    {column.header}
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className="tbody">
                    {data.map((row, i) => {
                        return (
                            <Link replace to="#" className="tr d-none d-md-flex" key={i} onClick={() => expandJournalEntry(row.journalEntryId)}>
                                {columns.map(column => {
                                    return(
                                        <div key={column.accessor} className={"td " + column.className}>
                                            {formatCell(row[column.accessor], column.accessor)}
                                        </div>
                                    )
                                })}
                            </Link>
                        )
                    })}
                    { /**This is not really reuseable and should be refactored. For small screens */}
                    {data.map((row, i) => {
                        return(
                            <Link replace to="#" className="tr d-flex justify-content-between d-md-none align-items-center td" key={i} onClick={() => expandJournalEntry(row.journalEntryId)}>
                                <div className="px-0 w-100">
                                    <div className={"px-0 font-size-compact font-weight-600 " + columns[0].className}>
                                        {formatCell(row[columns[0].accessor], columns[0].accessor)}
                                    </div>
                                    <div className={"px-0 " + columns[1].className}>
                                        {formatCell(row[columns[1].accessor], columns[1].accessor)}
                                    </div>
                                    <div className="d-flex justify-content-between pt-2">
                                        <div className="font-size-compact">
                                            <div className="font-weight-600 ">
                                                    {columns[2].header}
                                            </div>
                                            <div className={"px-0 " + columns[2].className}>
                                                {formatCell(row[columns[2].accessor], columns[2].accessor)}
                                            </div>
                                        </div>
                                        <div className="font-size-compact">
                                            <div className="font-weight-600 text-right">
                                                    {columns[3].header}
                                            </div>
                                            <div className={"px-0 " + columns[3].className}>
                                                {formatCell(row[columns[3].accessor], columns[3].accessor)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })} 
                </div>
                <div className="d-flex justify-content-between px-1 py-2 border-top " >
                    <div className={first ? "invisible" : " "}>
                        <Link replace onClick={previousPage} to="#">&larr; {tableOfJournalEntriesText[appContext.locale]["Newer"]}</Link>
                    </div>
                    <div className="align-self-center">
                        Showing {((pageIndex * pageSize) + 1) + "-" + ((pageIndex * pageSize) + pageLength)} of {totalElements}{' '}
                    results
                    </div>{/**TODO replace with page selector */}
                    <div className={last ? "invisible" : ""}>
                        <Link replace onClick={nextPage} to="#">{tableOfJournalEntriesText[appContext.locale]["Older"]} &rarr;</Link>
                    </div>
                </div>
            </div>
            <Modal
                isOpen={journalEntryModal}
                toggle={handleExitJournalEntryModal}
                size="xl"
                centered={true}
            >
                <h5 className="px-3 py-3 my-0 border-bottom d-flex justify-content-between align-items-center">
                    <div>{tableOfJournalEntriesText[appContext.locale]["Journal Entry"]}</div>
                    {!editMode?
                        <div>
                            <button className="btn btn-white width-175" onClick={toggleJournalEntryHistoryModal}>{tableOfJournalEntriesText[appContext.locale]["View edit history"]}</button>
                        </div>
                    : null}
                </h5>
                <ModalBody>
                    {editMode 
                        ?   <JournalEntryEditMode
                                data={lineItemData} setLineItemData={setLineItemData}
                                journalEntryDate={journalEntryDate} setJournalEntryDate={setJournalEntryDate}
                                journalEntryDescription={journalEntryDescription} setJournalEntryDescription={setJournalEntryDescription}
                                accountOptions={accountOptions}
                                alertMessages={alertMessages}
                                handleSaveJournalEntryButton={handleSaveJournalEntryButton}
                            />
                        :   <JournalEntryViewMode
                                data={lineItemData}
                                journalEntryDate={journalEntryDate}
                                journalEntryDescription={journalEntryDescription}
                            />
                    }
                </ModalBody>
                <ModalFooter className=" justify-content-between">
                    {editMode ?
                        <>
                            <div>
                                {createMode ? null :
                                    <button className="btn btn-danger width-10ch" onClick={() => handleDeleteJournalEntryButton(journalEntryId)}>
                                        {tableOfJournalEntriesText[appContext.locale]["Delete"]}
                                    </button>}
                            </div>
                            <div>
                                <button className="btn btn-primary width-10ch"onClick={() => handleSaveJournalEntryButton()}>
                                    {tableOfJournalEntriesText[appContext.locale]["Save"]}
                                </button>
                                <button className="btn btn-white ml-2 width-10ch" onClick={createMode ? cancelCreateMode : cancelEditMode}>
                                    {tableOfJournalEntriesText[appContext.locale]["Cancel"]}
                                </button>
                            </div>
                        </>
                        :
                        <>
                            <div>
                                {/**empty div to push buttons rightwards */}
                            </div>
                            <div>
                                <button className="btn btn-info width-10ch" onClick={handleCopyJournalEntryButton}>{tableOfJournalEntriesText[appContext.locale]["Copy"]}</button>
                                <button className="btn btn-primary ml-2 width-10ch" onClick={handleEditButton}>{tableOfJournalEntriesText[appContext.locale]["Edit"]}</button>
                                <button className="btn btn-white ml-2 width-10ch" onClick={handleExitJournalEntryModal}>{tableOfJournalEntriesText[appContext.locale]["Close"]}</button>
                            </div>
                        </>
                    }
                </ModalFooter>
            </Modal>
            <JournalEntryEditHistory journalEntryId={journalEntryId} isOpen={journalEntryHistoryModal} toggle={toggleJournalEntryHistoryModal} /> 
        </>
    )

}

export default TableOfJournalEntries

