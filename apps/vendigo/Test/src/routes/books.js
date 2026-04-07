const axios = require('axios')
const baseParams = { jscmd: 'data', format: 'json' }

function getBooksFromObj (books) {
  return Object.keys(books).map(r => Object.assign({ uid: r }, books[r]))
}

module.exports = {
  method: 'GET',
  path: '/books',
  handler: function (request, reply) {
    const search = request.query.search

    const booksIds = (
      'OLID:OL22895148M,OLID:OL6990157M,OLID:OL7101974M,OLID:OL6732939M,OLID:OL7193048M,OLID:OL24347578M,OLID:OL24364628M,OLID:OL24180216M,OLID:OL24948637M,OLID:OL1631378M,OLID:OL979600M,OLID:OL33674M,OLID:OL7950349M,OLID:OL349749M,OLID:OL30460M,OLID:OL24347578M'
        .split(',')
    )

    axios
      .get('https://openlibrary.org/api/books', {
        params: Object.assign({}, baseParams, { bibkeys: booksIds.join(',') })
      })
      .then(response => {
        const books = getBooksFromObj(response.data)

        if (search) {
          const book = books.filter(book => (
            // Check uid
            new RegExp(search, 'ig').test(book.uid) ||
            // Check title
            new RegExp(search, 'ig').test(book.title) ||
            // Check author
            new RegExp(search, 'ig').test(book.authors.map(a => a.name).join(' '))
          ))

          if (book.length) {
            return reply(book)
          } else {
            return reply({ error: 'book not found' }).code(400)
          }
        }

        return reply(books)
      })
      .catch(response => {
        return reply(response.message)
      })
  }
}
