
module.exports = [
  {
    method: 'GET',
    path: '/css/{param*}',
    handler: {
      directory: {
        path: 'src/assets',
        listing: true
      }
    }
  },
  {
    method: 'GET',
    path: '/js/{param*}',
    handler: {
      directory: {
        path: 'src/assets',
        listing: true
      }
    }
  }
]
