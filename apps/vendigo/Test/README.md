# Candidate Exercise

## Requirements

Let's pretend we want to sell books online (like Amazon). As a first step we want to build a site that lists books displaying the book cover image, title, author, open library Id number (OLID), and price.

We'd also like a form that allows us to filter (on the server side) by the book's title or OLID. If searching by OLID we should validate it before we send it to our server. If it's not a valid OLID then we can assume it's a title.

The list of books we want to sell is available here https://goo.gl/Lk2MTJ. There is an example of the API response in the `books.json` file. Note that the API doesn't provide pricing. We'll have to add that later.

Finally, we’d like the front-end to be styled to match the following design. The designer forgot to add the OLID number to the mockup.

![Alt Text](design.jpg)

## What we’re looking for

* Good test coverage
* Clean, well structured code
* Logical approach to implementation
* Appropriate use of third party libs

## What is here

The backend is a simple server running [hapi](https://hapijs.com). The frontend is plain html with jQuery. You can swap out any of these technologies as you see fit.
