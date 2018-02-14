# ExpressJS JSON-API middleware

Make JSON-API-compliant backend API resources. Mongoose support so far.

Learn about the JSON-API specification here: [http://jsonapi.org/](http://jsonapi.org/)

## Getting started

* Install it

```shell
npm install --save expressjs-json-api
```

* Require it and use it in different ways. The `jsonApi` function accepts an options object. See further down the available options:

```javascript
var jsonApi = require('expressjs-json-api');
var User = require('./models/user');
```

1. Allow it to fully control a resource
```javascript
app.use('/user', jsonApi({model: User}));
```

2. You can tell it to implement only some of the endpoints
```javascript
var router = require('express').Router({mergeParams: true});
var jsonApiUser = require('expressjs-json-api')({model: User});

router.route('/user')

// The individual methods also accept an options object
.get(jsonApiUser.methods.getList({populate: 'company'}))
.post(jsonApiUser.methods.post())
;

router.route('/user/:id')
.delete(jsonApiUser.methods.delete())
.get(function(req, res, next) {
  // Your own implementation
  return User
  .findOne({name: 'John Doe'})
  .lean()
  .then(function(user) {
    res.send(jsonApiUser.hydrateTopDocument(user, null, req));
  });
})
;
```

## Options

List of available options that can be passed:

### model
Type: `function`

Description: *Required*. A class function of the model to be implemented by the resource.

### dbAdapter
Type: `String`

Description: *Default: `'mongoose'`*. The name of the adapter to be used. Right now only Mongoose is supported.

### populate
Type: `String`

Description: A string passed to the `populate` method of the queries.

### send
Type: `Boolean`

Description: *Default: `true`*. Should the resource be sent to the client?

### catch
Type: `Boolean`

Description: *Default: `true`*. Should the errors be catched?

### preSendObjectParser
Type: `function`

Description: A function to parse each object before it is sent to the client.

Example:
```javascript
preSendObjectParser: function(obj) {
  delete obj.password;
  return obj;
}
```

## Functions available

### methods.getList(options)
### methods.get(options)
### methods.post(options)
### methods.delete(options)
### methods.patch(options)
### hydrateTopDocument(data, err, req)
### hydrateSingleObject(data, req)

## Write custom db adapter

Currently we only support Mongoose, but you can write your own database adapter. Just write the methods needed. Here's the Mongoose implementation as an example. Remember that every function should return a `Promise` except `getId`.

```javascript
var jsonApi = require('expressjs-json-api');

jsonApi.dbAdapters.mongoose = {
  getList: function(options, req) {
    return options.model
      .find(req.query.filter)
      .populate(options.populate)
      .exec();
  },

  get: function(options, req) {
    return options.model
      .findById(req.params.id)
      .populate(options.populate)
      .exec();
  },

  post: function(options, req) {
    var m = extend({}, req.body);

    return options.model
      .create(m)
      .then(function(obj) {
        return options.model
          .populate(obj, {
            path: options.populate
          });
      });
  },

  patch: function(options, req) {
    return options.model
      .findById(req.params.id)
      .exec()
      .then(function(obj) {
        extend(obj, req.body);

        return obj
          .save()
          .then(function(newObj) {
            return options.model
              .populate(newObj, {
                path: options.populate
              });
          });
      });
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
```

## TODO

* Find out a way to add `links` to the objects
* Improve documentation
