import React from 'react';
import { PageSettings } from '../../config/page-settings';
import { API_BASE_URL, CURRENCY_OPTIONS } from '../../utils/constants';
import { sidebarText } from '../../utils/i18n/sidebar-text';
import Select from 'react-select';
import {useHistory} from 'react-router-dom';
import axios from 'axios';

function NewOrganizationForm(props) {
    const appContext = React.useContext(PageSettings);
    const history = useHistory();
    const currencyOptions = CURRENCY_OPTIONS(appContext.locale);
    const [organizationNameInput, setOrganizationNameInput] = React.useState('');
    const [selectedCurrency, setSelectedCurrency] = React.useState(appContext.currency);
    const [isEnterprise, setIsEnterprise] = React.useState(false);

    const handleChangeIsEnterprise = (event) => {
        setIsEnterprise(event.target.value === "true" ? true : false)
    }

    const handleSaveButton = async () => {
        let requestBody = {
            name: organizationNameInput,
            currency: selectedCurrency,
            isEnterprise: isEnterprise
        };
        await axios.post(`${API_BASE_URL}/organization`, requestBody).then(async response => {
            console.log(response);
            await appContext.fetchUserInfo(appContext.personId);
            history.push("/");
        }).catch(console.log); 
    }


    return (
        <div className="my-3">
            <div className="form-group row">
                <label className="col-xl-3 col-form-label">
                    {sidebarText[appContext.locale]["Enter a name for this EasyLedger"] + ":"}
                </label>
                <div className="col-xl-4">
                    <input
                        type="text"
                        className="form-control"
                        value={organizationNameInput}
                        onChange={event => setOrganizationNameInput(event.target.value)}
                    />
                </div>
            </div>
            <div className="form-group row">
                <label className="col-xl-3 col-form-label">
                    {sidebarText[appContext.locale]["Select a currency for this EasyLedger"] + ":"}
                </label>
                <div className="col-xl-4">
                    <Select
                        options={currencyOptions}
                        onChange={selectedOption => setSelectedCurrency(selectedOption.value)}
                        value={currencyOptions.find(currencyOption => currencyOption.value == selectedCurrency)}
                        menuPortalTarget={document.body}
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        menuPlacement={'auto'}

                    />
                </div>
            </div>
            <div className="form-group row">
                <div className="col-xl-3">
                    {sidebarText[appContext.locale]["Create an EasyLedger for"] + ":"}
                </div>
                <div className="col-xl-4">
                    <div className="radio radio-css">
                        <input type="radio" value={false} id="is-enterprise-false" name="is-enterprise" checked={!isEnterprise} onChange={handleChangeIsEnterprise} />
                        <label className="mx-2" htmlFor="is-enterprise-false">{sidebarText[appContext.locale]["Personal"]}</label>
                    </div>
                    <div className="radio radio-css">
                        <input type="radio" value={true} id="is-enterprise-true" name="is-enterprise" checked={isEnterprise} onChange={handleChangeIsEnterprise} />
                        <label className="mx-2" htmlFor="is-enterprise-true">{sidebarText[appContext.locale]["Enterprise"]}</label>
                    </div>
                </div>
            </div>
            <button className="btn btn-primary" onClick={handleSaveButton}>{sidebarText[appContext.locale]["Create this EasyLedger"]}</button>

        </div>
    )
}

export default NewOrganizationForm;