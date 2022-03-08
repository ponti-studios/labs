# API

## Description
 * Design an API to manage a job board. This can include descriptions of endpoints, requests, responses 
 * or anything else that will help us understand your design, but please don’t write any code. 
 * 
 * The API should satisfy the following requirements:
    ● Jobs postings should have at least a title and description
    ● Users can create job postings
    ● Users can update job postings
    ● Users can read a specific job posting
    ● Users read multiple job postings, optionally filtering by title
    ● Users can delete job postings

## Models

```ts
type JobPosting {
    id: ID!
    title: String!
    description: String!
}
```

## Endpoints

GET `/jobs?title=XYZ Corp` - Retrieve list of allowing for a title query parameter for filtering by title
    - Responses:
        200 `{ postings: [ { id: 123, title: "Senior Software Engineer", description: "Come build awesome stuff 🚀" }, ...]}`
    - Notes
        - The request handler for this endpoint will validate the query parameter and execute a query against the data store.

POST `/job` - Create job
    - Form data: `{ title: "Senior Software Engineer", description: "Come build awesome stuff 🚀" }`
    - Responses:
        200 `{ id: "ID_OF_NEW_POSTING" }`
    - Notes
        - The request handler for this endpoint will validate the posted form data and push to data store.

PUT `/job/:id` - Update job posting
    - Form data: `{ title: "Senior Software Engineer", description: "Come build awesome stuff 🚀" }`
    - Responses: 
        200 `{ id: "ID_OF_NEW_POSTING" }`
        401 `{ message: "UNAUTHORIZED" }`
        404 `{ message: "POSTING_NOT_FOUND" }`
    - Notes
        - The request handler for this endpoint will validate the post belongs to the user.
        - The request handler for this endpoint will validate the posted form data and push to data store.

DELETE `/job/:id` - Delete job posting
    - Responses:
        200 `{ id: "ID_OF_DELETED_POSTING" }`
        401 `{ message: "UNAUTHORIZED" }`
        404 `{ message: "POSTING_NOT_FOUND" }`
    - Notes
        - The request handler for this endpoint will validate the post belongs to the user.