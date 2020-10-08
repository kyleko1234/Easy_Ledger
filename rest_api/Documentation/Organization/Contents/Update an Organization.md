### Update an organization
Endpoint: `PUT /organization/{id}`

Updates an organization with the values of the parameters passed.
___

#### Request Body Parameters
- **id (`Long`)** <br/>
The id for the organization you intend to update.

- **name (`String` 50)** <br/>
The name of this organization.
___
#### Returns
Returns HTTP 201 and the updated organization object upon successful update. Returns HTTP 409 and an error if id in request body does not match id in URI. Returns HTTP 404 and an error if the specified id does not exist in the database.
___
#### Sample Request
`POST /organization`

Body: 

```json
{
    "id": 1,
    "name": "Sample organization2"
}
```
<br/>
<br/>

#### Sample Response
```json
{
    "id": 1,
    "name": "Sample organization2"
}
```
