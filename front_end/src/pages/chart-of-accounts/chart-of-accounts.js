import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import axios from 'axios';
import ChartOfAccountsOverview from './components/chart-of-accounts-overview.js';
import AccountDetails from './components/account-details';
import CategoryDetails from './components/category-details';
import { Alert, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import AccountSubtypeDetails from './components/account-subtype-details.js';
import {API_BASE_URL} from '../../components/utils/constants.js';


const CONTEXT = {
    apiUrl: 'http://localhost:8080/v0.1',
    organizationId: 1,
    personId: 1,
    localization: {
        locale: 'en-US',
        currency: 'USD'
    }
}
class ChartOfAccounts extends React.Component {
    //This component essentially acts as a controller for accounts. It declares Routes for the "Accounts" tab, and maintains the state of all operations in the accounts tab.
    //One is redirected to the AccountOverview component by default. Through the AccountOverview component, one can select a specific account to view details.
    //Utilities for account and category selection are passed as props into the AccountOverview component, and allow the AccountOverview component to communicate selection information
    //to the detailed-view components.
    constructor(props) {
        super(props);
        this.state = {
            accounts: [],
            accountSubtypes: [],
            categories: [],

            selectedAccountId: 0,
            selectedAccountSubtypeId: 0,
            selectedAccountTypeId: 0,
            
            accountNameInput: '',
            accountNameAlert: false,

            accountSubtypeNameInput: '',
            accountSubtypeNameAlert: false,

            categoryNameInput: '',
            categoryNameAlert: false,

            addAnAccountFromSubtypeModal: false,
            addAnAccountSubtypeModal: false,
            addAnAccountWithoutSubtypeModal: false,
            addACategoryModal: false,

            utils: {
                setSelectedAccountId: this.setSelectedAccountId.bind(this),
                setSelectedAccountTypeId: this.setSelectedAccountTypeId.bind(this),
                setSelectedAccountSubtypeId: this.setSelectedAccountSubtypeId.bind(this),
                setAccountNameInput: this.setAccountNameInput.bind(this),
                toggleAddAnAccountFromSubtypeModal: this.toggleAddAnAccountFromSubtypeModal.bind(this),
                toggleAddAnAccountSubtypeModal: this.toggleAddAnAccountSubtypeModal.bind(this),
                toggleAddAnAccountWithoutSubtypeModal: this.toggleAddAnAccountWithoutSubtypeModal.bind(this),
                toggleAddACategoryModal: this.toggleAddACategoryModal.bind(this),
                deleteAccount: this.deleteAccount.bind(this),
                deleteAccountSubtype: this.deleteAccountSubtype.bind(this),
                deleteCategory: this.deleteCategory.bind(this),
                fetchData: this.fetchData.bind(this)
            }
            
        };
    }

    componentDidMount() {
        this.fetchData();
    }

    componentDidUpdate(prevProps) {
        if (this.props.location.pathname !== prevProps.location.pathname) {
            this.fetchData();
        } //pull fresh data from server when url location changes. 
        //This is to make sure that the balances shown in the Chart of Accounts are correct even if the user edited journal entries from within the account or category details pages.
    }

    fetchData() {
        const url = `${API_BASE_URL}/organization/${CONTEXT.organizationId}/accountBalance`;
        axios.get(url).then(response => {
            this.setState({ accounts: response.data });
        });
        axios.get(`${API_BASE_URL}/organization/${CONTEXT.organizationId}/categoryBalance`).then(response => {
            this.setState({ categories: response.data });
        })
        axios.get(`${API_BASE_URL}/organization/${CONTEXT.organizationId}/accountSubtype`).then(response => {
            this.setState({ accountSubtypes: response.data });
        })
    }
    
    setSelectedAccountId(i) {
        this.setState({selectedAccountId: i});
    }

    setSelectedAccountTypeId(i) {
        this.setState({selectedAccountTypeId: i});
    }

    setSelectedAccountSubtypeId(i) {
        this.setState({selectedAccountSubtypeId: i});
    }

    setAccountNameInput( formInputText ) {
        this.setState({accountNameInput: formInputText});
    }

    setAccountSubtypeNameInput( formInputText ) {
        this.setState({accountSubtypeNameInput: formInputText});
    }
    
    setCategoryNameInput( formInputText ) {
        this.setState({categoryNameInput: formInputText});
    }

    toggleAddAnAccountFromSubtypeModal() {
        this.setState({addAnAccountFromSubtypeModal: !this.state.addAnAccountFromSubtypeModal});
        this.setState({accountNameInput: '', accountNameAlert: false});
    }

    toggleAddAnAccountSubtypeModal() {
        this.setState({addAnAccountSubtypeModal: !this.state.addAnAccountSubtypeModal});
        this.setState({accountSubtypeNameInput: '', accountSubtypeNameAlert: false});
    }

    toggleAddAnAccountWithoutSubtypeModal() {
        this.setState({addAnAccountWithoutSubtypeModal: !this.state.addAnAccountWithoutSubtypeModal});
        this.setState({accountNameInput: '', accountNameAlert: false});
    }

    toggleAddACategoryModal() {
        this.setState({addACategoryModal: !this.state.addACategoryModal});
        this.setState({categoryNameInput: '', categoryNameAlert: false});
    }
    
    postAccountSubtype() {
        const url = `${API_BASE_URL}/accountSubtype`;
        let data = {
            accountSubtypeName: this.state.accountSubtypeNameInput,
            accountTypeId: this.state.selectedAccountTypeId,
            organizationId: CONTEXT.organizationId
        }
        axios.post(url, data).then(response => {
            console.log(response);
            this.fetchData();
        })
    }
    postAccountWithSubtype() {
        const url = `${API_BASE_URL}/account`;
        let data = {
            accountName: this.state.accountNameInput,
            accountSubtypeId: this.state.selectedAccountSubtypeId,
            accountTypeId: this.state.accountSubtypes.slice()
                .find(accountSubtype => accountSubtype.accountSubtypeId === this.state.selectedAccountSubtypeId).accountTypeId,
            organizationId: CONTEXT.organizationId
        };
        axios.post(url, data).then( response => {
            console.log(response);
            this.fetchData();
        })
    }

    postAccountWithoutSubtype() {
        const url = `${API_BASE_URL}/account`;
        let data = {
            accountName: this.state.accountNameInput,
            accountTypeId: this.state.selectedAccountTypeId,
            organizationId: CONTEXT.organizationId
        };
        axios.post(url, data).then( response => {
            console.log(response);
            this.fetchData();
        })
    }

    postCategory() {
        const url = `${API_BASE_URL}/category`;
        let data = {
            categoryName: this.state.categoryNameInput,
            accountId: this.state.selectedAccountId,
            organizationId: CONTEXT.organizationId
        };
        axios.post(url, data).then( response => {
            console.log(response);
            this.fetchData();
        })
    }

    deleteAccount(accountId) {
        const url = `${API_BASE_URL}/account/${accountId}`
        axios.delete(url).then(response => {
            console.log(response)
            this.fetchData();
        }).catch(console.log)
    }

    deleteAccountSubtype(accountSubtypeId) {
        const url = `${API_BASE_URL}/accountSubtype/${accountSubtypeId}`
        axios.delete(url).then(response => {
            console.log(response)
            this.fetchData();
        }).catch(console.log)
    }

    deleteCategory(categoryId) {
        const url = `${API_BASE_URL}/category/${categoryId}`
        axios.delete(url).then(response => {
            console.log(response)
            this.fetchData();
        }).catch(console.log)
    }

    handleSaveNewAccountWithSubtype() {
        if (!this.state.accountNameInput) {
            this.setState({accountNameAlert: true})
        } else {
            this.postAccountWithSubtype();
            this.toggleAddAnAccountFromSubtypeModal();
        }
    }

    handleSaveNewAccountWithoutSubtype() {
        if (!this.state.accountNameInput) {
            this.setState({accountNameAlert: true})
        } else {
            this.postAccountWithoutSubtype();
            this.toggleAddAnAccountWithoutSubtypeModal();
        }
    }

    handleSaveNewAccountSubtype() {
        if (!this.state.accountSubtypeNameInput) {
            this.setState({accountSubtypeNameAlert: true});
        } else {
            this.postAccountSubtype();
            this.toggleAddAnAccountSubtypeModal();
        }
    }

    handleSaveNewCategory() {
        if (!this.state.categoryNameInput) {
            this.setState({categoryNameAlert: true});
        } else {
            this.postCategory();
            this.toggleAddACategoryModal();
        }    
    }

    render() {
        return (
            <div>
                <Switch>
                    <Route path={`${this.props.match.path}/accountDetails/:id`}>
                        <AccountDetails
                            context={CONTEXT}
                            parentPath={this.props.match.path}
                            parentName="Chart of Accounts"
                            utils={this.state.utils} //passing utils from this.state should break deletion and fetchdata from the child component upon browser refresh.
                                                     //however, it works totally fine. Hooray? 
                        />
                    </Route>
                    <Route path={`${this.props.match.path}/accountSubtypeDetails/:id`}>
                        <AccountSubtypeDetails 
                            context={CONTEXT}
                            parentPath={this.props.match.path}
                            parentName="Chart of Accounts"
                            utils={this.state.utils}
                        />
                    </Route>
                    <Route path={`${this.props.match.path}/categoryDetails/:id`}>
                        <CategoryDetails 
                            context={CONTEXT}
                            parentPath={this.props.match.path}
                            parentName="Chart of Accounts"
                            utils={this.state.utils}
                        />
                    </Route>
                    <Route path={`${this.props.match.path}`} exact={true}>
                        <ChartOfAccountsOverview
                            accounts={this.state.accounts}
                            accountSubtypes={this.state.accountSubtypes}
                            categories={this.state.categories}
                            context={CONTEXT}
                            parentPath={this.props.match.path}
                            utils={this.state.utils}
                        />
                    </Route> 
                </Switch>
                <Modal isOpen={this.state.addAnAccountFromSubtypeModal} toggle={() => this.toggleAddAnAccountFromSubtypeModal()} centered={true}>
                    <ModalHeader> Add an Account </ModalHeader>
                    <ModalBody>
                        {
                            this.state.accountNameAlert ? 
                                <Alert color="danger">
                                    Please provide a name for your account.
                                </Alert>
                            : null
                        }
                        <form onSubmit={event => {event.preventDefault(); this.handleSaveNewAccountWithSubtype()}}>
                            <div className="form-group row">
                                <label className="col-form-label col-md-3">
                                    Account Name
                                </label>
                                <div className="col-md-9">
                                    <input 
                                        className="form-control" 
                                        value={this.state.accountNameInput ? this.state.accountNameInput : ''}
                                        onChange={event => {
                                            this.setAccountNameInput(event.target.value);
                                        }}
                                    />
                                </div>
                            </div>
                        </form>
                    </ModalBody>
                    <ModalFooter>
                        <button 
                            className="btn btn-primary" 
                            onClick={() => this.handleSaveNewAccountWithSubtype()} 
                            style={{width: "10ch"}}
                        >
                            Save
                        </button>
                        <button 
                            className="btn btn-white" 
                            onClick={() => {
                                this.toggleAddAnAccountFromSubtypeModal();
                            }} 
                            style={{width: "10ch"}}
                        >
                            Cancel
                        </button>
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.addAnAccountSubtypeModal} toggle={() => this.toggleAddAnAccountSubtypeModal()} centered={true}>
                    <ModalHeader> Add an Account Subtype </ModalHeader>
                    <ModalBody>
                        {
                            this.state.accountSubtypeNameAlert ? 
                                <Alert color="danger">
                                    Please provide a name for your account.
                                </Alert>
                            : null
                        }
                        <form onSubmit={event => {event.preventDefault(); this.handleSaveNewAccountSubtype()}}>
                            <div className="form-group row">
                                <label className="col-form-label col-md-4 semi-bold">
                                    Account Subtype Name
                                </label>
                                <div className="col-md-8">
                                    <input 
                                        className="form-control" 
                                        value={this.state.accountSubtypeNameInput ? this.state.accountSubtypeNameInput : ''}
                                        onChange={event => {
                                            this.setAccountSubtypeNameInput(event.target.value);
                                        }}
                                    />
                                </div>
                            </div>
                        </form>
                    </ModalBody>
                    <ModalFooter>
                        <button 
                            className="btn btn-primary" 
                            onClick={() => this.handleSaveNewAccountSubtype()} 
                            style={{width: "10ch"}}
                        >
                            Save
                        </button>
                        <button 
                            className="btn btn-white" 
                            onClick={() => {
                                this.toggleAddAnAccountSubtypeModal();
                            }} 
                            style={{width: "10ch"}}
                        >
                            Cancel
                        </button>
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.addAnAccountWithoutSubtypeModal} toggle={() => this.toggleAddAnAccountWithoutSubtypeModal()} centered={true}>
                    <ModalHeader> Add an Account </ModalHeader>
                    <ModalBody>
                        {
                            this.state.accountNameAlert ? 
                                <Alert color="danger">
                                    Please provide a name for your account.
                                </Alert>
                            : null
                        }
                        <form onSubmit={event => {event.preventDefault(); this.handleSaveNewAccountWithoutSubtype()}}>
                            <div className="form-group row">
                                <label className="col-form-label col-md-4 semi-bold">
                                    Account Name
                                </label>
                                <div className="col-md-8">
                                    <input 
                                        className="form-control" 
                                        value={this.state.accountNameInput ? this.state.accountNameInput : ''}
                                        onChange={event => {
                                            this.setAccountNameInput(event.target.value);
                                        }}
                                    />
                                </div>
                            </div>
                        </form>
                    </ModalBody>
                    <ModalFooter>
                        <button 
                            className="btn btn-primary" 
                            onClick={() => this.handleSaveNewAccountWithoutSubtype()} 
                            style={{width: "10ch"}}
                        >
                            Save
                        </button>
                        <button 
                            className="btn btn-white" 
                            onClick={() => {
                                this.toggleAddAnAccountWithoutSubtypeModal();
                            }} 
                            style={{width: "10ch"}}
                        >
                            Cancel
                        </button>
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.addACategoryModal} toggle={() => this.toggleAddACategoryModal()} centered={true}>
                    <ModalHeader> Add a Category </ModalHeader>
                    <ModalBody>
                        {
                            this.state.categoryNameAlert ? 
                                <Alert color="danger">
                                    Please provide a name for your category.
                                </Alert>
                            : null
                        }
                        <form onSubmit={event => {event.preventDefault(); this.handleSaveNewCategory()}}>
                            <div className="form-group row">
                                <label className="col-form-label col-md-4 semi-bold">
                                    Category Name
                                </label>
                                <div className="col-md-8">
                                    <input 
                                        className="form-control" 
                                        value={this.state.categoryNameInput ? this.state.categoryNameInput : ''}
                                        onChange={event => {
                                            this.setCategoryNameInput(event.target.value);
                                        }}
                                    />
                                </div>
                            </div>
                        </form>
                    </ModalBody>
                    <ModalFooter>
                        <button 
                            className="btn btn-primary" 
                            onClick={() => this.handleSaveNewCategory()} 
                            style={{width: "10ch"}}
                        >
                            Save
                        </button>
                        <button 
                            className="btn btn-white" 
                            onClick={() => {
                                this.toggleAddACategoryModal();
                            }} 
                            style={{width: "10ch"}}
                        >
                            Cancel
                        </button>
                    </ModalFooter>
                </Modal>

            </div>

        )
    }
}

export default  withRouter(props => <ChartOfAccounts {...props}/>);