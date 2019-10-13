const adapters = require('./adapters');

module.exports = function JsonConfigurer(options) {
  var jsonApi = this;

  if (!options.model) {
    throw new Error('Model must be set');
  }

  var defaults = {
    dbAdapter: 'mongoose',
    populate: '',
    send: true,
    catch: true
  };

  var commonOptions = Object.assign({}, defaults, options);

  var Model = options.model;
  var dbAdapter = adapters[commonOptions.dbAdapter];

  var methodWrapper = function(fn) {
    return function(options) {
      options = Object.assign({}, commonOptions, options);

      return function(req, res, next) {
        var promise = fn(options, req);

        if (options.send) {
          promise.then(function(obj) {
            res.status(201).send(jsonApi.hydrateTopDocument(obj, null, req));
          });
        }

        if (options.catch) {
          promise.catch(function(err) {
            if (options.send) {
              res.status(err.status);
              res.send(jsonApi.hydrateTopDocument(null, err, req));
            } else {
              next(err);
            }
          });
        }

        return promise;
      };
    };
  };

  this.methods = {
    getList: methodWrapper(dbAdapter.getList),
    get: methodWrapper(dbAdapter.get),
    post: methodWrapper(dbAdapter.post),
    put: methodWrapper(dbAdapter.put),
    patch: methodWrapper(dbAdapter.patch),
    delete: methodWrapper(dbAdapter.delete)
  };

  // Creates a JSON API top level document
  // http://jsonapi.org/format/#document-top-level
  this.hydrateTopDocument = function(data, err, req) {
    var doc = {};

    doc.links = {
      self: req.protocol + '://' + req.get('host') + req.originalUrl
    };

    if (data) {
      doc.data = jsonApi.hydrateData(data, req);
    }

    if (err) {
      doc.errors = jsonApi.hydrateErrors(err, req);
    }

    return doc;
  };

  this.hydrateData = function(data, req) {
    return Array.isArray(data) ?
      data.map(function(obj) {
        return jsonApi.hydrateSingleObject(obj, req);
      }) :
      jsonApi.hydrateSingleObject(data, req);
  };

  this.hydrateSingleObject = function(obj, req) {
    return obj ? {
      id: adapters[commonOptions.dbAdapter].getId(obj),
      type: commonOptions.model.modelName.toLowerCase(),
      attributes: commonOptions.preSendObjectParser ?
        commonOptions.preSendObjectParser(obj.toObject()) :
        obj.toObject()
    } :
    null;
  };

  this.hydrateErrors = function(errors, req) {
    // TODO
    return errors;
  };
};
