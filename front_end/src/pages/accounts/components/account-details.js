import React from 'react';
import ClickableTableWithPaginationAndJournalEntryModal from '../../../components/table/clickable-table-with-pagination-and-journal-entry-modal';
import axios from 'axios';


function AccountDetails(props) {
    // required props: accounts, selectedAccountId, context
    const selectedAccount = props.accounts.slice().find(account => account.accountId === props.selectedAccountId);

    const columns = React.useMemo(
        () => [ // accessor is the "key" in the data},
            { Header: 'Date', accessor: 'journalEntryDate', width: "20%" },
            { Header: 'Description', accessor: 'description', width: "50%" },
            { Header: 'Debit', accessor: 'debitAmount', width: "15%" },
            { Header: 'Credit', accessor: 'creditAmount', width: "15%" },
        ],
        []
    )

    // We'll start our table without any data
    const [data, setData] = React.useState([])
    const [pageCount, setPageCount] = React.useState(0)
    const [elementCount, setElementCount] = React.useState(0)
    const fetchIdRef = React.useRef(0)

    const fetchData = React.useCallback(({ pageSize, pageIndex }) => {
        // This will get called when the table needs new data

        //fetch data from Easy Ledger API
        const url = `${props.context.apiUrl}/account/${props.context.organizationId}/lineItem/?page=${pageIndex}&size=${pageSize}`;
        axios.get(url).then(response => {
            var dataContent = response.data.content;
            dataContent.forEach(lineItem => {
                if (lineItem.isCredit) {
                    lineItem.debitAmount = 0;
                    lineItem.creditAmount = lineItem.amount;
                } else {
                    lineItem.creditAmount = 0;
                    lineItem.debitAmount = lineItem.amount;
                }
            })
            setData(dataContent);
            setPageCount(response.data.totalPages);
            setElementCount(response.data.totalElements);
        })
            .catch(console.log);
    }, [])

    return (
        <div >
            <ClickableTableWithPaginationAndJournalEntryModal
                context={props.context}
                columns={columns}
                data={data}
                fetchData={fetchData}
                pageCount={pageCount}
                elementCount={elementCount}
                tableTitle={selectedAccount.accountName}
                hasAddEntryButton={false}
            />
        </div>
    )
}




export default AccountDetails