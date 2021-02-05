export const balanceSheetRenderText = {
    "en-US": {
        "Balance Sheet": "Balance Sheet",
        "As of:": "As of:",

        "Assets": "Assets",
        "Current assets": "Current assets",
        "Total current assets": "Total current assets",
        "Non-current assets": "Non-current assets",
        "Total non-current assets": "Total non-current assets",
        "Total assets": "Total assets",

        "Liabilities": "Liabilities",
        "Current liabilities": "Current liabilities",
        "Total current liabilities": "Total current liabilities",
        "Non-current liabilities": "Non-current liabilities",
        "Total non-current liabilities": "Total non-current liabilities",
        "Total liabilities": "Total liabilities",

        "Equity": "Equity",
        "Retained Earnings": "Retained Earnings",
        "Beginning balances": (prevPeriodEndDate) => {
            return `Beginning balances (up to ${prevPeriodEndDate})`;
        },
        "Net income for current period": (currPeriodStartDate, asOfDate) => {
            return `Net income for current period (from ${currPeriodStartDate} to ${asOfDate})`;
        },  
        "Dividends for current period": (currPeriodStartDate, asOfDate) => {
            return `Less dividends and equivalents for current period (from ${currPeriodStartDate} to ${asOfDate})`;
        },
        "Ending balances of retained earnings": "Ending balances of retained earnings",
        "Total equity": "Total equity",

        //Account Subtype Names.
        "Cash and cash equivalents": "Cash and cash equivalents", 
        "Current marketable securities": "Current marketable securities", 
        "Receivables": "Receivables", 
        "Inventories": "Inventories", 
        "Other current assets": "Other current assets", 
        "Property": "Property", 
        "Plant and equipment": "Plant and equipment", 
        "Non-current marketable securities": "Non-current marketable securities", 
        "Other non-current assets": "Other non-current assets", 
        "Payables": "Payables", 
        "Deferred revenue": "Deferred revenue", 
        "Commercial paper": "Commercial paper", 
        "Current term debt": "Current term debt", 
        "Deferred tax": "Deferred tax", 
        "Other current liabilities": "Other current liabilities", 
        "Non-current term debt": "Non-current term debt", 
        "Other non-current liabilities": "Other non-current liabilities", 
        "Paid-in capital": "Paid-in capital", 
        "Dividends and equivalents": "Dividends and equivalents", 
        "Other equity items": "Other equity items", 
        "Revenue": "Revenue", 
        "Other income": "Other income", 
        "Cost of sales": "Cost of sales", 
        "Research and development": "Research and development", 
        "Selling, general, and administration": "Selling, general, and administration", 
        "Depreciation": "Depreciation", 
        "Amortization": "Amortization", 
        "Other expenses": "Other expenses", 
        "Income taxes": "Income taxes", 
    },
    "zh-TW": {
        "Balance Sheet": "資產負債表",
        "As of:": "截至",

        "Assets": "資產",
        "Current assets": "流動資產",
        "Total current assets": "流動資產合計",
        "Non-current assets": "非流動資產",
        "Total non-current assets": "非流動資產合計",
        "Total assets": "資產總計",

        "Liabilities": "負債",
        "Current liabilities": "流動負債",
        "Total current liabilities": "流動負債合計",
        "Non-current liabilities": "非流動流動負債",
        "Total non-current liabilities": "非流動負債合計",
        "Total liabilities": "負債總計",

        "Equity": "權益",
        "Retained Earnings": "保留盈餘",
        "Beginning balances": (prevPeriodEndDate) => {
            return `期初餘額 (截至 ${prevPeriodEndDate})`;
        },
        "Net income for current period": (currPeriodStartDate, asOfDate) => {
            return `本期淨收入 (自 ${currPeriodStartDate} 至 ${asOfDate})`;
        },  
        "Dividends for current period": (currPeriodStartDate, asOfDate) => {
            return `減 本期股利及約當股利 (自 ${currPeriodStartDate} 至 ${asOfDate})`;
        },
        "Ending balances of retained earnings": "期末保留營餘",
        "Total equity": "權益總計",

        //Account Subtype Names.
        "Cash and cash equivalents": "現金及約當現金", 
        "Current marketable securities": "具市場性證劵", 
        "Receivables": "應收款項", 
        "Inventories": "存貨", 
        "Other current assets": "其它流動資產", 
        "Property": "不動產", 
        "Plant and equipment": "廠房及設備", 
        "Non-current marketable securities": "不具市場性證劵", 
        "Other non-current assets": "其它非流動性資產", 
        "Payables": "應付款項", 
        "Deferred revenue": "遞延收入", 
        "Commercial paper": "商業本票", 
        "Current term debt": "一年內到期長期負債", 
        "Deferred tax": "遞延所得稅", 
        "Other current liabilities": "其它流動負債", 
        "Non-current term debt": "非一年內到期長期負債", 
        "Other non-current liabilities": "其它流動負債", 
        "Paid-in capital": "投入資本", 
        "Dividends and equivalents": "本期股利及約當股利", 
        "Other equity items": "其它業主權益", 
        "Revenue": "收入", 
        "Other income": "其它收入", 
        "Cost of sales": "銷貨成本", 
        "Research and development": "研發費用", 
        "Selling, general, and administration": "銷售、總務及管理費用", 
        "Depreciation": "折舊", 
        "Amortization": "攤銷", 
        "Other expenses": "其它費用", 
        "Income taxes": "所得稅", 
    }

}