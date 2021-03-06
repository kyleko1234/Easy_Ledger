import React from 'react';
import {Link} from 'react-router-dom';
import {PageSettings} from '../../config/page-settings.js';
import {ACCESS_TOKEN, API_BASE_URL, REFRESH_TOKEN, LOCALE_OPTIONS} from '../../utils/constants.js';
import axios from 'axios';
import {Alert} from 'reactstrap';
import {loginV3Text} from '../../utils/i18n/login-v3-text.js'

function LoginV3Render(props) {
    //required props: history
    //optional props: className
    const [emailInput, setEmailInput] = React.useState('');
    const [passwordInput, setPasswordInput] = React.useState('');
    const [loginAlert, setLoginAlert] = React.useState(false);
    const [accountDisabledAlert, setAccountDisabledAlert] = React.useState(false);
    const [lastAttemptedEmail, setLastAttemptedEmail] = React.useState('');
    const [verificationSentAlert, setVerificationSentAlert] = React.useState(false);

    const appContext = React.useContext(PageSettings);
    const axiosLoginInstance = axios.create();


    const handleSubmit = event => {
        event.preventDefault();
        setLoginAlert(false);
        setAccountDisabledAlert(false);
        setVerificationSentAlert(false);
        setLastAttemptedEmail(emailInput.slice());

        let requestBody = {
            email: emailInput,
            password: passwordInput
        }

        axiosLoginInstance.post(`${API_BASE_URL}/auth/signin`, requestBody).then( response => {
            localStorage.setItem(ACCESS_TOKEN, response.data.accessToken);
            localStorage.setItem(REFRESH_TOKEN, response.data.refreshToken);
            appContext.checkForAuthentication();
            props.history.push('/');
        }).catch( error => {
            if (error.response.data.message == "User is disabled") {
                setAccountDisabledAlert(true);
            } else {
                setLoginAlert(true);
            }
        });

    }

    const handleResendEmail = () => {
        axiosLoginInstance.get(`${API_BASE_URL}/verification/resend/${lastAttemptedEmail}`).then( response => {
            setAccountDisabledAlert(false);
            setVerificationSentAlert(true);
        }).catch(console.log);
    }



    return (
        <>
            <div className="login-header mb-3">
                my<b>Easy</b>Ledger
            </div>
            <div className="login-content">
                {loginAlert? <Alert color="danger">{loginV3Text[appContext.locale]["Invalid email or password."]}</Alert> : null}
                {accountDisabledAlert? 
                    <Alert color="danger">
                        {loginV3Text[appContext.locale]["Email not verified"]}
                        &nbsp;<Link to="#" onClick={() => handleResendEmail()} className="alert-link">{loginV3Text[appContext.locale]["Click here to send a new verification email."]}</Link>
                    </Alert> 
                : null}
                {verificationSentAlert? <Alert color="success">{loginV3Text[appContext.locale]["Verification email sent!"]}</Alert> : null}
                <form className="mb-0" onSubmit={event => handleSubmit(event)}>
                    <div className="form-group mb-3">
                        <input type="email" className="form-control form-control-lg" placeholder={loginV3Text[appContext.locale]["Email Address"]} required value={emailInput} onChange={event => setEmailInput(event.target.value)}/>
                    </div>
                    <div className="form-group mb-3">
                        <input type="password" className="form-control form-control-lg" placeholder={loginV3Text[appContext.locale]["Password"]} required value={passwordInput} onChange={event => setPasswordInput(event.target.value)} />
                    </div>
                    <div className="mb-3">
                        <Link to="/user/login/forgot/find-email" className="text-primary">{loginV3Text[appContext.locale]["Forgot Password?"]}</Link>
                    </div>
                    <div className="mb-3">
                        <button type="submit" className="btn btn-primary btn-block btn-lg">{loginV3Text[appContext.locale]["Sign me in"]}</button>
                    </div>
                    <div className="mb-5 pb-5 text-inverse">
                        {loginV3Text[appContext.locale]["Not a member"]}
                    </div>
                </form>
            </div>
        </>
    )

}

export default LoginV3Render;