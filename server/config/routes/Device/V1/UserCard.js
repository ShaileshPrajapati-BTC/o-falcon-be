module.exports.routes = {
  'get /api/v1/customer/cards/paginate': {
      controller: 'Device/V1/UserCardController',
      action: 'paginate',
  },
  'POST /api/v1/customer/cards/add': {
    controller: 'Device/V1/UserCardController',
    action: 'addCard',
  },
  'DELETE /api/v1/customer/cards/deletecard': {
    controller: 'Device/V1/UserCardController',
    action: 'deleteCard',
  },
  'PUT /api/v1/customer/cards/setdefault': {
    controller: 'Device/V1/UserCardController',
    action: 'setDefaultCard',
  },
}
