module.exports = {
  getList: function(options, req) {
    return options.model
      .find(req.query.filter)
      .populate(options.populate)
      .lean()
      .exec();
  },

  get: function(options, req) {
    return options.model
      .findById(req.params.id)
      .populate(options.populate)
      .lean()
      .exec();
  },

  post: function(options, req) {
    var m = Object.assign({}, req.body.data.attributes);

    return options.model
      .create(m)
      .then(function(obj) {
        return options.model
          .populate(obj, {
            path: options.populate
          });
      })
      .then(function(obj) {
        return obj.toObject();
      });
  },

  patch: function(options, req) {
    return options.model
      .findById(req.params.id)
      .exec()
      .then(function(obj) {
        Object.assign(obj, req.body.data.attributes);

        return obj
          .save()
          .then(function(newObj) {
            return options.model
              .populate(newObj, {
                path: options.populate
              });
          })
          .then(function(obj) {
            return obj.toObject();
          });
      });
  },

  put: function(options, req) {
    return this.patch(options, req);
  },

  delete: function(options, req) {
    return options.model
      .findById(req.params.id)
      .exec()
      .then(function(obj) {
        return obj.remove();
      });
  },

  getId: function(obj) {
    return obj._id;
  }
};
