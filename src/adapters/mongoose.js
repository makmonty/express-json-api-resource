module.exports = {
  getList: function(options, req) {
    console.log(req.query);
    let query = options.model
      .find(req.query.filter)
      .populate(options.populate);

    if (req.query.sort) {
      const fields = req.query.sort.split(',');
      const sort = {};
      fields.forEach(field => {
        const order = field.charAt(0) === '-' ? -1 : 1;
        field = order === 1 ? field : field.substr(1);
        sort[field] = order;
      });
      query = query.sort(sort);
    }

    if (req.query.page) {
      const limit = req.query.page.limit || req.query.page.size;
      const offset = req.query.page.offset || (req.query.page.number - 1) * limit;
      query = query.limit(parseInt(limit, 10)).skip(parseInt(offset, 10));
    }

    return query
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
