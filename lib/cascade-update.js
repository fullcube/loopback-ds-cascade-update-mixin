'use strict'

const debug = require('debug')('loopback:mixins:cascade-update')
const _ = require('lodash')
const Promise = require('bluebird')

module.exports = function cascadeUpdateMixin(Model, options) {

  debug('CascadeUpdate mixin for Model %s with options %o', Model.modelName, options)

  function idName(m) {
    return m.definition.idName() || 'id'
  }

  function getIdValue(m, data) {
    return _.get(data, idName(m))
  }

  function cascadeUpdates(instance) {
    return Promise.resolve(Object.keys(options))
      .each(property => Promise.resolve([].concat(options[property]))
        .map(relation => {
          debug(`Cascading '${property}' property via '${relation}' relation on ${Model.definition.name} model`)

          if (!Model.relations[relation]) {
            debug(`Relation ${relation} not found for model ${Model.definition.name}`)
            return null
          }

          if (typeof instance[property] === 'undefined') {
            debug(`Property ${property} not found for model ${Model.definition.name}`)
            return null
          }

          const where = {}
          const data = {}

          let relationModel = Model.relations[relation].modelTo
          const relationKey = Model.relations[relation].keyTo

          if (Model.relations[relation].modelThrough) {
            relationModel = Model.relations[relation].modelThrough
          }

          if (Model.relations[relation].polymorphic) {
            where[Model.relations[relation].polymorphic.discriminator] = Model.definition.name
          }

          where[relationKey] = getIdValue(Model, instance)
          data[property] = instance[property]

          debug(`Calling ${relationModel.definition.name}.updateAll(%o, %o)`, where, data)

          return relationModel.updateAll(where, data)
            .then(res => debug(`Updated ${res.count} items from the ${relationModel.definition.name} model`))
        })
      )
  }

  Model.observe('after save', (ctx, next) => {
    debug('after save: ctx.instance', ctx.instance)
    debug('after save: ctx.where', ctx.where)
    debug('after save: ctx.data', ctx.data)

    const name = idName(Model)
    const hasInstanceId = ctx.instance && ctx.instance[name]
    const hasWhereId = ctx.where && ctx.where[name]

    if (ctx.isNewInstance) {
      debug('Skipping update for ', Model.definition.name, 'isNewInstance')
      return next()
    }

    if (!(hasWhereId || hasInstanceId)) {
      debug('Skipping update for ', Model.definition.name, 'Multi-instance update')
      return next()
    }

    return cascadeUpdates(ctx.instance || ctx.data)
      .then(() => debug('Cascade update has successfully finished'))
      .catch(err => {
        debug('Error with cascading updates', err)
        throw err
      })
  })
}
