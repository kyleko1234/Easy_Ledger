import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap'
import axios from 'axios';
import { PageSettings } from '../../../config/page-settings';
import { API_BASE_URL } from '../../../utils/constants.js';
import Select from 'react-select';
import SweetAlert from 'react-bootstrap-sweetalert';
import { accountDetailsEditorText } from '../../../utils/i18n/account-details-editor-text.js';
import { useHistory } from 'react-router-dom';



function AccountDetailsEditor(props) {
    //required props: isOpen, toggle, fetchData, createMode
    //optional props: accountTypeId, selectedAccountId, selectedParentAccount, category
    const appContext = React.useContext(PageSettings);
    const history = useHistory();

    const [accountNameInput, setAccountNameInput] = React.useState('');
    const [accountCodeInput, setAccountCodeInput] = React.useState('');
    const [parentAccountOptions, setParentAccountOptions] = React.useState([]);
    const [selectedParentAccountId, setSelectedParentAccountId] = React.useState(null);
    const [accountSubtypeOptions, setAccountSubtypeOptions] = React.useState([]);
    const [selectedAccountSubtypeId, setSelectedAccountSubtypeId] = React.useState(null);
    const [accountTypeId, setAccountTypeId] = React.useState(null);
    const [initialDebitValueInput, setInitialDebitValueInput] = React.useState('0');
    const [initialCreditValueInput, setInitialCreditValueInput] = React.useState('0');
    const [currentAccountHasChildren, setCurrentAccountHasChildren] = React.useState(false);
    const [noAccountNameAlert, setNoAccountNameAlert] = React.useState(false);
    const [noParentOrSubtypeAlert, setNoParentOrSubtypeAlert] = React.useState(false);
    const [deleteAccountAlert, setDeleteAccountAlert] = React.useState(false);
    const [cannotDeleteAccountAlert, setCannotDeleteAccountAlert] = React.useState(false);
    const toggleDeleteAccountAlert = () => {
        setDeleteAccountAlert(!deleteAccountAlert);
    }
    const toggleCannotDeleteAccountAlert = () => {
        setCannotDeleteAccountAlert(!cannotDeleteAccountAlert);
    }

    const resetToDefaultSubtypeId = () => {
        if (!appContext.isEnterprise) {
            let defaultSubtypeId;
            if (accountTypeId == 1) {
                defaultSubtypeId = 5;
            } else if (accountTypeId == 2) {
                defaultSubtypeId = 16;
            } else if (accountTypeId == 4) {
                defaultSubtypeId = 24;
            } else if (accountTypeId == 5) {
                defaultSubtypeId = 27;
            }
            setSelectedAccountSubtypeId(defaultSubtypeId);
        }
    }

    React.useEffect(() => {
        async function fetchAccountData() {
            if (props.selectedAccountId) {
                await axios.get(`${API_BASE_URL}/account/${props.selectedAccountId}`).then(response => {
                    if (response.data) {
                        setAccountNameInput(response.data.accountName);
                        setAccountCodeInput(response.data.accountCode);
                        setAccountTypeId(response.data.accountTypeId);
                        setSelectedParentAccountId(response.data.parentAccountId);
                        setSelectedAccountSubtypeId(response.data.accountSubtypeId);
                        setInitialDebitValueInput(response.data.initialDebitAmount);
                        setInitialCreditValueInput(response.data.initialCreditAmount);
                        setCurrentAccountHasChildren(response.data.hasChildren);
                    }
                }).catch(console.log);    
            } else if (props.selectedParentAccount) {
                setAccountTypeId(props.selectedParentAccount.accountTypeId);
                setSelectedParentAccountId(props.selectedParentAccount.accountId);
                setSelectedAccountSubtypeId(props.selectedParentAccount.accountSubtypeId);
            } else if (props.accountTypeId) {
                setAccountTypeId(props.accountTypeId);
            }
            resetToDefaultSubtypeId();
            await axios.get(`${API_BASE_URL}/organization/${appContext.currentOrganizationId}/account`).then(response => {
                if (response.data) {
                    let validParentAccountOptions = response.data.filter(account => (account.parentAccountId == null && account.debitTotal == 0 && account.creditTotal == 0) || account.hasChildren).map(account => {
                        return ({
                            value: account.accountId,
                            label: appContext.isEnterprise? account.accountCode + " - " + account.accountName: account.accountName,
                            object: account
                        });
                    });
                    validParentAccountOptions.unshift({value: 0, label: "None", object: {accountTypeId: accountTypeId}});
                    setParentAccountOptions(validParentAccountOptions);
                }
            }).catch(console.log);
            await axios.get(`${API_BASE_URL}/accountSubtype`).then(response => {
                if (response.data) {
                    setAccountSubtypeOptions(response.data.map(accountSubtype => {
                        return ({
                            value: accountSubtype.id,
                            label: accountDetailsEditorText[appContext.locale][accountSubtype.name],
                            object: accountSubtype
                        })
                    }))
                }
            }).catch(console.log);
        }
        fetchAccountData();
    }, [props.selectedAccountId, props.selectedParentAccount, props.isOpen, props.createMode, accountTypeId])

    const modalOnClose = () => {
        setNoAccountNameAlert(false);
        setNoParentOrSubtypeAlert(false);
        setAccountNameInput('');
        setAccountCodeInput('');
        setSelectedParentAccountId(null);
        setSelectedAccountSubtypeId(null);
        setInitialDebitValueInput('0');
        setInitialCreditValueInput('0');
        setCurrentAccountHasChildren(false);
    }
    const handleSaveButton = () => {
        
        let requestBody;
        if (!selectedParentAccountId) {
            requestBody = {
                accountId: props.selectedAccountId,
                accountCode: accountCodeInput,
                accountName: accountNameInput,
                accountSubtypeId: selectedAccountSubtypeId,
                organizationId: appContext.currentOrganizationId,
                initialDebitAmount: Number(initialDebitValueInput),
                initialCreditAmount: Number(initialCreditValueInput)
            }  
        } else {
            requestBody = {
                accountId: props.selectedAccountId,
                accountCode: accountCodeInput,
                accountName: accountNameInput,
                parentAccountId: selectedParentAccountId,
                organizationId: appContext.currentOrganizationId,
                initialDebitAmount: Number(initialDebitValueInput),
                initialCreditAmount: Number(initialCreditValueInput)
            }
        }
        if (!accountNameInput || (!selectedParentAccountId && !selectedAccountSubtypeId)) {
            if (!accountNameInput) {
                setNoAccountNameAlert(true);
            }
            if (!selectedParentAccountId && !selectedAccountSubtypeId) {
                setNoParentOrSubtypeAlert(true);
            }
        } else {
            if (props.createMode) {
                requestBody.accountId = null;
                postAccountToServer(requestBody);
            } else {
                putAccountToServer(requestBody);
            }
        }
    }
    const handleDeleteButton = () => {
        props.toggle();
        setDeleteAccountAlert(true);
    }
    const handleCancelButton = () => {
        props.toggle();
    }
    const handleConfirmDeleteAccountButton = () => {
        axios.delete(`${API_BASE_URL}/account/${props.selectedAccountId}`).then(response => {
            console.log(response);
            if (appContext.isEnterprise) {
                history.push("/chart-of-accounts");
            } else {
                if (props.category) {
                    history.push("/categories");
                } else {
                    history.push("/accounts");
                }
            }
        }).catch(() => {
            toggleDeleteAccountAlert();
            toggleCannotDeleteAccountAlert();
        });
    }
    const handleChangeParentAccountOption = selectedOption => {
        setSelectedParentAccountId(selectedOption.object.accountId);
        setSelectedAccountSubtypeId(selectedOption.object.accountSubtypeId);
        resetToDefaultSubtypeId(); //prevents personal interface from throwing an error when parent account is changed from something other than 'none' to 'none
    }


    const handleChangeAccountSubtypeOption = selectedOption => {
        setSelectedAccountSubtypeId(selectedOption.object.id);
        setSelectedParentAccountId(null);
    }


    const postAccountToServer = (requestBody) => {
        axios.post(`${API_BASE_URL}/account`, requestBody).then(response => {
            console.log(response);
            props.fetchData();
            props.toggle();
        }).catch(console.log);
    }

    const putAccountToServer = (requestBody) => {
        axios.put(`${API_BASE_URL}/account/${props.selectedAccountId}`, requestBody).then(response => {
            console.log(response);
            props.fetchData();
            props.toggle();
        }).catch(console.log);
    }



    return (
        <>
            <Modal isOpen={props.isOpen} toggle={props.toggle} onClosed={modalOnClose} centered={true} className="very-rounded">
                <ModalHeader>
                    {props.createMode
                        ? (props.category? accountDetailsEditorText[appContext.locale]["Create a New Category"] : accountDetailsEditorText[appContext.locale]["Create a New Account"])
                        : (props.category? accountDetailsEditorText[appContext.locale]["Edit Category Details"] : accountDetailsEditorText[appContext.locale]["Edit Account Details"])
                    }
                </ModalHeader>
                <ModalBody>
                    {noAccountNameAlert ?
                        <Alert color="danger">
                            {props.category? accountDetailsEditorText[appContext.locale]["Please provide a name for your category."] : accountDetailsEditorText[appContext.locale]["Please provide a name for your account."]}
                        </Alert>
                        : null}
                    {noParentOrSubtypeAlert ?
                        <Alert color="danger">
                            {accountDetailsEditorText[appContext.locale]["Account must belong to either a subtype or a parent account."] /* conditional rendering not required; this alert should never appear when isEnterprise is false; i.e. when 'category' exists as a classification */} 
                        </Alert>
                        : null}
                    <form onSubmit={event => { event.preventDefault(); handleSaveButton() }}>
                        <div className="form-group row">
                            <label className="col-form-label col-md-4">
                                {props.category? accountDetailsEditorText[appContext.locale]["Category Name"] : accountDetailsEditorText[appContext.locale]["Account Name"]}
                            </label>
                            <div className="col-md-8">
                                <input
                                    className="form-control"
                                    value={accountNameInput}
                                    onChange={event => {
                                        setAccountNameInput(event.target.value);
                                    }}
                                />
                            </div>
                        </div>
                        {appContext.isEnterprise? 
                            <div className="form-group row">
                                <label className="col-form-label col-md-4">
                                    {accountDetailsEditorText[appContext.locale]["Account Code"]}
                                </label>
                                <div className="col-md-8">
                                    <input
                                        className="form-control"
                                        value={accountCodeInput}
                                        onChange={event => {
                                            setAccountCodeInput(event.target.value);
                                        }}
                                    />
                                </div>
                            </div>
                        : null }
                    </form>
                    <div className="form-group row">
                        <label className="col-form-label col-md-4">
                            {props.category? accountDetailsEditorText[appContext.locale]["Parent Category"] : accountDetailsEditorText[appContext.locale]["Parent Account"]}
                        </label>
                        <div className="col-md-8">
                            <Select
                                options={parentAccountOptions.filter(option => option.object.accountTypeId == accountTypeId)}
                                value={parentAccountOptions.find(option => option.object.accountId == selectedParentAccountId)}
                                isSearchable={true}
                                onChange={handleChangeParentAccountOption}
                                isDisabled={currentAccountHasChildren}
                            />
                        </div>
                    </div>
                    {appContext.isEnterprise?
                        <div className="form-group row">
                        <label className="col-form-label col-md-4">
                            {accountDetailsEditorText[appContext.locale]["Account Subtype"]}
                        </label>
                        <div className="col-md-8">
                            <Select
                                options={accountSubtypeOptions.filter(option => option.object.accountType.id == accountTypeId)}
                                value={accountSubtypeOptions.find(option => option.object.id == selectedAccountSubtypeId)}
                                isSearchable={true}
                                onChange={handleChangeAccountSubtypeOption}
                            />
                        </div>
                    </div>
                    : null}
                    {appContext.isEnterprise? 
                    <form onSubmit={event => { event.preventDefault(); handleSaveButton() }}>
                        <div className="form-group row">
                            <label className="col-form-label col-md-4">
                                {accountDetailsEditorText[appContext.locale]["Initial Debit Value"]}
                            </label>
                            <div className="col-md-8">
                                <input
                                    type="number"
                                    className="form-control"
                                    value={initialDebitValueInput}
                                    onChange={event => {
                                        setInitialDebitValueInput(event.target.value);
                                    }}
                                    disabled={currentAccountHasChildren}

                                />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-form-label col-md-4">
                                {accountDetailsEditorText[appContext.locale]["Initial Credit Value"]}
                            </label>
                            <div className="col-md-8">
                                <input
                                    type="number"
                                    className="form-control"
                                    value={initialCreditValueInput}
                                    onChange={event => {
                                        setInitialCreditValueInput(event.target.value);
                                    }}
                                    disabled={currentAccountHasChildren}
                                />
                            </div>
                        </div>
                    </form> : null}
                </ModalBody>
                <ModalFooter className="justify-content-between">
                    <div>
                        {!props.selectedAccountId? null : <button className="btn btn-danger width-10ch" onClick={handleDeleteButton}>{accountDetailsEditorText[appContext.locale]["Delete"]}</button>}
                    </div>
                    <div>
                        <button className="btn btn-primary width-10ch" onClick={handleSaveButton}>{accountDetailsEditorText[appContext.locale]["Save"]}</button>
                        <button className="btn btn-white width-10ch ml-2" onClick={handleCancelButton}>{accountDetailsEditorText[appContext.locale]["Cancel"]}</button>
                    </div>
                </ModalFooter>
            </Modal>

            {deleteAccountAlert ?
                <SweetAlert primary showCancel
                    confirmBtnText={accountDetailsEditorText[appContext.locale]["Yes, delete it!"]}
                    confirmBtnBsStyle="primary"
                    cancelBtnBsStyle="default"
                    cancelBtnText={accountDetailsEditorText[appContext.locale]["Cancel"]}
                    title={accountDetailsEditorText[appContext.locale]["Are you sure?"]}
                    onConfirm={handleConfirmDeleteAccountButton}
                    onCancel={toggleDeleteAccountAlert}
                >
                    {props.category? accountDetailsEditorText[appContext.locale]["Are you sure you want to delete this category?"] : accountDetailsEditorText[appContext.locale]["Are you sure you want to delete this account?"]}
                </SweetAlert>
                : null}
            {cannotDeleteAccountAlert ?
                <SweetAlert danger showConfirm={false} showCancel={true}
                    cancelBtnBsStyle="default"
                    cancelBtnText={accountDetailsEditorText[appContext.locale]["Cancel"]}
                    title={props.category? accountDetailsEditorText[appContext.locale]["Cannot delete this category."] : accountDetailsEditorText[appContext.locale]["Cannot delete this account."]}
                    onConfirm={toggleCannotDeleteAccountAlert}
                    onCancel={toggleCannotDeleteAccountAlert}
                >
                    {props.category
                        ? accountDetailsEditorText[appContext.locale]["Please remove all line items and child categories from this category and try again."]
                        : accountDetailsEditorText[appContext.locale]["Please remove all line items and child accounts from this account and try again."]}
                </SweetAlert>
                : null}

        </>
    )
}

AccountDetailsEditor.defaultProps = {
    createMode: false,
    category: false
};

export default AccountDetailsEditor;