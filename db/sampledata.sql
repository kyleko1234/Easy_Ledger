INSERT INTO role(name)
    VALUES
        ('ROLE_USER'),
        ('ROLE_ADMIN');
/**
    id | name
     1 | ROLE_USER
     2 | ROLE_ADMIN
*/

INSERT INTO permission_type(name)
    VALUES
        ('VIEW'),
        ('EDIT'),
        ('ADMIN'),
        ('OWN');
/**
    id | name
     1 | VIEW
     2 | EDIT
     3 | ADMIN
     4 | OWN
*/

INSERT INTO account_type(name)
    VALUES 
        ('Assets'),
        ('Liabilities'),
        ('Owner''s Equity'),
        ('Income'),
        ('Expenses');
/** id | name
     1 | 'Assets'
     2 | 'Liabilities'
     3 | 'Owner's Equity'
     4 | 'Income'
     5 | 'Expenses' **/

INSERT INTO account_subtype(name, account_type_id)
    VALUES
       ('Cash and cash equivalents', 1),
       ('Current marketable securities', 1),
       ('Current receivables', 1),
       ('Inventory', 1),
       ('Other current assets', 1),
       ('Property, plant, and equipment', 1),
       ('Intangible assets and goodwill', 1),
       ('Non-current receivables', 1),
       ('Non-current marketable securities', 1),
       ('Other non-current assets', 1),
       ('Current payables', 2),
       ('Deferred revenue', 2),
       ('Short-term debt', 2),
       ('Deferred tax', 2),
       ('Other current liabilities', 2),
       ('Long-term debt', 2),
       ('Non-current payables', 2),
       ('Other non-current liabilities', 2),
       ('Paid-in capital', 3),
       ('Share-based compensation', 3),
       ('Dividends and equivalents', 3),
       ('Other equity items', 3),
       ('Revenue', 4),
       ('Income from investing activities', 4),
       ('Income from financing activities', 4),
       ('Other income', 4),
       ('Cost of sales', 5),
       ('Research and development', 5),
       ('Sales, general, and administration', 5),
       ('Depreciation and amortization', 5),
       ('Other expense', 5),
       ('Interest expense', 5),
       ('Tax expense', 5),
       ('Non-recurring and extraordinary items', 5);

        /*
        ASSETS
           1 Cash and cash equivalents
           2 Current marketable securities 
           3 Current receivables 
           4 Inventory 
           5 Other current assets
           6 PP&E 
           7 Intangible assets and goodwill
           8 Non-current receivables 
           9 Non-current marketable securities
           10 Other non-current assets
        LIABILITIES
           11 Current payables 
           12 Deferred revenue 
           13 Short-term debt 
           14 Deferred tax 
           15 Other current liabilities
           16 Long-term debt 
           17 Non-current payables 
           18 Other non-current liabilities
        EQUITY
           19 Paid-in capital 
           20 Share-based compensation
           21 Dividends and equivalents 
           22 Other equity items
        INCOME
           23 Revenue
           24 Income from investing activities
           25 Income from financing activities
           26 Other income
        EXPENSES
           27 Cost of sales
           28 R&D
           29 SG&A
           30 Depreciation and Amortization 
           31 Other expense
           32 Interest expense 
           33 Tax expense 
           34 Non-recurring and extraordinary items
        */



INSERT INTO person(first_name, last_name, email, password, enabled, locale, current_organization_id)
    VALUES
        ('Kyle', 'Ko', 'kyleko1234@gmail.com', '$2a$04$KNLUwOWHVQZVpXyMBNc7JOzbLiBjb9Tk9bP7KNcPI12ICuvzXQQKG', TRUE, 'en-US', 1);

/** id | first_name | last_name | email             | password
     1 | 'Kyle'   | 'Ko'    | kyleko1234@gmail.com  | $2a$04$KNLUwOWHVQZVpXyMBNc7JOzbLiBjb9Tk9bP7KNcPI12ICuvzXQQKG (bcrypted 'admin')
     2 | 'Kyle'   | 'Ko'    | thesock339@gmail.com  | $2a$04$KNLUwOWHVQZVpXyMBNc7JOzbLiBjb9Tk9bP7KNcPI12ICuvzXQQKG (bcrypted 'admin') **/

INSERT INTO person_role(person_id, role_id)
    VALUES
        (1, 1);
/** person_id | role_id
            1 | 1      
            2 | 1      */

INSERT INTO organization(name, currency, is_enterprise)
    VALUES
        ('Sample organization', 'USD', TRUE);
/** id | name                   | currency | is_enterprise
     1 | 'Sample organization'  | 'USD'    | TRUE **/


INSERT INTO permission(person_id, organization_id, permission_type_id)
    VALUES
        (1, 1, 4);
/** id | person_id | organization_id | permission_type_id
     1 |         1 | 1               | 4    **/


INSERT INTO account(name, account_subtype_id, organization_id, initial_debit_amount, initial_credit_amount, debit_total. credit_total)
    VALUES
        ('Cash', 1, 1),
        ('Accounts Receivable', 3, 1),
        ('Inventories', 4, 1),
        ('Equipment', 6, 1),
        ('Payables', 11, 1),
        ('Paid-in Capital', 19, 1),
        ('Dividends and equivalents', 21, 1),
        ('Revenue', 23, 1),
        ('Selling, general, and administration', 29, 1);

/** 1    ('Cash', 1, 1),
    2    ('Accounts Receivable', 3, 1),
    3    ('Inventories', 4, 1),
    4    ('Equipment', 6, 1),
    5    ('Payables', 11, 1),
    6    ('Paid-in Capital', 19, 1),
    7    ('Dividends and equivalents', 21, 1),
    8    ('Revenue', 23, 1),
    9    ('Selling, general, and administration', 29, 1);
 */

INSERT INTO account(name, account_group_id, initial_debit_amount, initial_credit_amount, debit_total, credit_total)
    VALUES 
        ('Cash', 1, 0, 0, 420000, 18430),
        ('Accounts receivable', 2, 0, 0, 24000, 20000),
        ('Office supplies', 3, 0, 0, 250, 0),
        ('Office equipment', 4, 0, 0, 4500, 0),
        ('Vehicles', 4, 0, 0, 25000, 0),
        ('Notes payable', 5, 0, 0, 0, 15000),
        ('Accounts payable', 5, 0, 0, 0, 4500),
        ('Dividends payable', 5, 0, 0, 0, 3000),
        ('Capital stock', 6, 0, 0, 0, 400000),
        ('Dividends', 7, 0, 0, 3000, 0),
        ('Service revenue', 8, 0, 0, 0, 24000),
        ('Office Rent', 9, 0, 500, 0, 0),
        ('Payroll', 9, 0, 0, 7500, 0),
        ('Utilities', 9, 0, 0, 180, 0);

/*      1     ('Cash', 1),
        2     ('Accounts receivable', 2),
        3     ('Office supplies', 3),
        4     ('Office equipment', 4),
        5     ('Vehicles', 4),
        6     ('Notes payable', 5),
        7     ('Accounts payable', 5),
        8     ('Dividends payable', 5),
        9     ('Capital stock', 6),
        10    ('Dividends', 7),
        11    ('Service revenue', 8),
        12    ('Office Rent', 9),
        13    ('Payroll', 9),
        14    ('Utilities', 9); */

    -----------------END SETUP DATA-------------------
    -----------------BEGIN ENTRY DATA-----------------

INSERT INTO journal_entry(journal_entry_date, organization_id, person_id, description, year_month)
    VALUES
        ('2020-11-01', 1, 1, 'Issued 20,000 shares of common stock at $20 per share', 202011),
        ('2020-11-03', 1, 1, 'Paid office rent for the month of November $500', 202011),
        ('2020-11-06', 1, 1, 'Purchased office supplies $250', 202011),
        ('2020-11-12', 1, 1, 'Purchased office equipment on account $4,500', 202011),
        ('2020-11-16', 1, 1, 'Purchased business car for $25,000. Paid $10,000 cash and issued a note for the balance.', 202011),
        ('2020-11-21', 1, 1, 'Billed clients $24,000 on account.', 202011),
        ('2020-11-25', 1, 1, 'Declared dividends $3,000. The amount of dividends will be distributed in December', 202011),
        ('2020-11-28', 1, 1, 'Paid utility bills for the month of November $180.', 202011),
        ('2020-11-29', 1, 1, 'Received $20,000 cash from clients billed on November 21.', 202011),
        ('2020-11-30', 1, 1, 'Paid salary for the month of November $7,500', 202011);

/** 1         ('2020-04-11', 1, 1, 'Issued 20,000 shares of common stock at $20 per share'),
    2         ('2020-04-18', 1, 1, 'Paid office rent for the month of November $1500'),
    3         ('2020-04-18', 1, 1, 'Purchased office supplies $250'),
    4         ('2020-04-19', 1, 1, 'Purchased office equipment on account $4,500'),
    5         ('2020-04-20', 1, 1, 'Purchased business car for $25,000. Paid $10,000 cash and issued a note for the balance.'),
    6         ('2020-04-21', 1, 1, 'Billed clients $24,000 on account.'),
    7         ('2020-04-21', 1, 1, 'Declared dividends $3,000. The amount of dividends will be distributed in December'),
    8         ('2020-04-21', 1, 1, 'Paid utility bills for the month of November $180.'),
    9         ('2020-04-21', 1, 1, 'Received $20,000 cash from clients billed on November 21.'),
    10        ('2020-04-21', 1, 1, 'Paid salary for the month of November $7,500'); */




INSERT INTO line_item(journal_entry_id, account_id, is_credit, amount, description)
    VALUES
        (1, 1, FALSE, 400000, 'Cash influx from initial offering'),
        (1, 9, TRUE, 400000, 'Issued 20000 shares of common at 20 per'),

        (2, 12, FALSE, 500, 'Office rent expense, November'),
        (2, 1, TRUE, 500, 'Paid office rent november in cash'),

        (3, 3, FALSE, 250, 'Purchase of office supplies'),
        (3, 1, TRUE, 250, 'Purchase of office supplies'),

        (4, 4, FALSE, 4500, 'Purchased office equipment on account'),
        (4, 7, TRUE, 4500, 'Purchased office equipment on account'),

        (5, 5, FALSE, 25000, 'Purchased company vehicle'),
        (5, 1, TRUE, 10000, 'Paid 10000 down for vehicle'),
        (5, 6, TRUE, 15000, 'Issued 15000 note payable for vehicle'),

        (6, 2, FALSE, 24000, 'Billed clients on account'),
        (6, 11, TRUE, 24000, 'Billed clients on account'),

        (7, 10, FALSE, 3000, 'Dividends declared to be distributed in december'),
        (7, 8, TRUE, 3000, 'Dividends declared to be distributed in december'),

        (8, 14, FALSE, 180, 'November utilities paid in cash'),
        (8, 1, TRUE, 180, 'November utilities paid in cash'),

        (9, 1, FALSE, 20000, 'Collected cash from clients billed on November 21'),
        (9, 2, TRUE, 20000, 'Collected cash from clients billed on November 21'),

        (10, 13, FALSE, 7500, 'Paid salary expense for November'),
        (10, 1, TRUE, 7500, 'Paid salary expense for November');

-------------------------------

INSERT INTO journal_entry(journal_entry_date, organization_id, person_id, description, year_month)
    VALUES
        ('2021-02-16', 3, 1, 'Paycheck', 202102),
        ('2021-02-17', 3, 1, 'Paid Rent', 202102),
        ('2021-02-18', 3, 1, 'Split Transaction Test', 202102);

INSERT INTO line_item(journal_entry_id, account_id, is_credit, amount, description)
    VALUES
        (17, 18, FALSE, 2000, 'Paycheck'),
        (17, 19, TRUE, 2000, 'Paycheck'),

        (18, 18, TRUE, 1000, 'Paid Rent'),
        (18, 22, FALSE, 1000, 'Paid Rent'),

        (19, 18, TRUE, 550, 'Split Transaction Test'),
        (19, 20, FALSE, 250, 'Groceries'),
        (19, 21, FALSE, 300, 'Expensive Takeout');





