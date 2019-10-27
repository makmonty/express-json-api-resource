const JsonApiConfigurer = require('./jsonapi-configurer');
const express = require('express');
const adapters = require('./adapters');

// Options:
// model: Class
// dbAdapter: String
// populate: String
// send: Boolean
// catch: Boolean
// parseRequest: Function
// parseObject: Function

let JsonApi = function(options) {
  const router = express.Router({mergeParams: true});
  const configurer = new JsonApiConfigurer(options);

  router.route('/')
    .get(configurer.methods.getList())
    .post(configurer.methods.post());

  router.route('/:id')
    .get(configurer.methods.get())
    .put(configurer.methods.put())
    .patch(configurer.methods.patch())
    .delete(configurer.methods.delete());

  Object.assign(router, configurer);

  return router;
};

JsonApi.dbAdapters = adapters;

module.exports = JsonApi;
