### Retrieve an account subtype
Endpoint: `GET /accountSubtype/{id}`

Retrieves an account subtype using the specified id.
___

#### Request Body Parameters
None
___
#### Returns
Returns an AccountSubtype object if a valid ID was supplied, otherwise returns HTTP 404 and an error.
___


#### Sample Request
`GET /accountSubtype/1`
<br/>

#### Sample Response
```json
{
    "accountSubtypeId": 1,
    "accountSubtypeName": "Cash",
    "accountTypeId": 1,
    "accountTypeName": "Assets",
    "organizationId": 1,
    "organizationName": "Sample organization",
    "deleted": false
}
```