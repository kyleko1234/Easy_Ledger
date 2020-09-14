import React from 'react';
import { Link } from 'react-router-dom';
import { Panel, PanelHeader } from '../../components/panel/panel.jsx';
import JournalTable from './components/journal-table'



const API_URL = 'http://localhost:8080/v0.1';
const localization = {
	locale: 'en-US',
	currency: 'USD'
}

class Journals extends React.Component {
	constructor(props) {
		super(props);
		
	}
    
    componentDidMount() {

    }
	render() {


		return (
			<div>
				<ol className="breadcrumb float-xl-right">
					<li className="breadcrumb-item"><Link to="/">Home</Link></li>
					<li className="breadcrumb-item active">Journals</li>
				</ol>
				<h1 className="page-header">Journals </h1>
				<Panel>
					<PanelHeader noButton={true}>
						Accounting Entries
					</PanelHeader>
					<JournalTable API_URL={API_URL} localization={localization}/>
				</Panel>
			</div>
		)
	}
}

export default Journals;