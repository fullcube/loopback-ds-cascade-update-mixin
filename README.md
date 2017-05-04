CASCADE UPDATE MIXIN
================

[![Greenkeeper badge](https://badges.greenkeeper.io/fullcube/loopback-ds-cascade-update-mixin.svg)](https://greenkeeper.io/)

[![CircleCI](https://circleci.com/gh/fullcube/loopback-ds-cascade-update-mixin.svg?style=svg)](https://circleci.com/gh/fullcube/loopback-ds-cascade-update-mixin) [![Dependencies](http://img.shields.io/david/fullcube/loopback-ds-cascade-update-mixin.svg?style=flat)](https://david-dm.org/fullcube/loopback-ds-cascade-update-mixin)
[![Coverage Status](https://coveralls.io/repos/github/fullcube/loopback-ds-cascade-update-mixin/badge.svg?branch=master)](https://coveralls.io/github/fullcube/loopback-ds-cascade-update-mixin?branch=master)



This module is designed for the [Strongloop Loopback](https://github.com/strongloop/loopback) framework. It provides cascade update functionality with a simple configuration on your models. This can be used to keep property values synchronised across related models.

INSTALL
================

```bash
  npm install --save loopback-ds-cascade-update-mixin
```

SERVER CONFIG
=============
Add the mixins property to your server/model-config.json:

```json
{
  "_meta": {
    "sources": [
      "loopback/common/models",
      "loopback/server/models",
      "../common/models",
      "./models"
    ],
    "mixins": [
      "loopback/common/mixins",
      "../node_modules/loopback-ds-cascade-update-mixin/lib",
      "../common/mixins"
    ]
  }
}
```

CONFIG
=============

To use with your Models add the `mixins` attribute to the definition object of your model config.

The config keys are the property names that you want to cascade.

The config values are an array of relationships that the property updates should cascade to.


```json
  {
    "name": "Product",
    "properties": {
      "name": {
        "type": "string",
      }
    },
    "relations": {
        "relation1": {
          "type": "hasMany",
          "model": "Property",
          "foreignKey": ""
        }
     },
    "mixins": {
      "CascadeUpdate": {
         "status": [ "relation1", "relation2" ],
         "isTest": [ "relation1", "relation2" "relation3" ]
       }
    }
  }
```

TESTING
=============

Run the tests in `test.js`

```bash
  npm test
```

DEBUGGING
=============

Run with debugging output on:

```bash
  DEBUG='loopback:mixins:cascade-update' npm test
```
