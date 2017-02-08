const loopback = require('loopback')

const chai = require('chai')
const expect = chai.expect

chai.use(require('sinon-chai'))
chai.use(require('dirty-chai'))
require('mocha-sinon')

// Set up promise support for loopback in non-ES6 runtime environment.
global.Promise = require('bluebird')

// Create a new loopback app.
const app = loopback()

// Register the mixin.
app.loopback.modelBuilder.mixins.define('CascadeUpdate', require('../lib/cascade-update'))

// Connect to db
const dbConnector = loopback.memory()

const Item = loopback.PersistedModel.extend('Item', {
  name: String,
  status: String,
  isTest: Boolean,
}, {
  mixins: {
    CascadeUpdate: {
      status: [ 'one', 'many', 'poly' ],
      isTest: [ 'one' ],
    },
  },
  relations: {
    one: {
      type: 'hasOne',
      model: 'One',
      foreignKey: 'itemId',
    },
    many: {
      type: 'hasMany',
      model: 'Many',
      foreignKey: 'itemId',
    },
    poly: {
      type: 'hasMany',
      model: 'Poly',
      polymorphic: {
        as: 'poly',
        foreignKey: 'referenceId',
        discriminator: 'referenceType',
      },
    },
  },
})

const One = loopback.PersistedModel.extend('One', {
  name: String,
  status: String,
  itemId: String,
  isTest: Boolean,
})
const Many = loopback.PersistedModel.extend('Many', {
  name: String,
  status: String,
  itemId: String,
  isTest: Boolean,
})
const Poly = loopback.PersistedModel.extend('Poly', {
  name: String,
  status: String,
  isTest: Boolean,
  referenceType: String,
  referenceId: String,
})

// Attach models to db
Item.attachTo(dbConnector)
app.model(Item)

One.attachTo(dbConnector)
app.model(One)

Many.attachTo(dbConnector)
app.model(Many)

Poly.attachTo(dbConnector)
app.model(Poly)

beforeEach(function() {
  this.sinon.spy(One, 'updateAll')
  this.sinon.spy(Many, 'updateAll')
  this.sinon.spy(Poly, 'updateAll')
})

describe('save', function() {
  beforeEach(function() {
    return Item.create({
      name: 'Item',
      status: 'new',
      isTest: true,
    })
      .then(item => {
        item.status = 'archived'
        return item.save()
      })
      .then(item => (this.item = item))
  })

  describe('hasOne', function() {
    it('should update related items', function() {
      expect(One.updateAll).to.have.been.calledTwice()
      expect(One.updateAll.firstCall).to.have.been.calledWith({ itemId: this.item.id }, { status: 'archived' })
      expect(One.updateAll.secondCall).to.have.been.calledWith({ itemId: this.item.id }, { isTest: true })
    })
  })
  describe('hasMany', function() {
    it('should update related items', function() {
      expect(Many.updateAll).to.have.been.calledOnce()
      expect(Many.updateAll).to.have.been.calledWith({ itemId: this.item.id }, { status: 'archived' })
    })
  })
  describe('polymorphic', function() {
    it('should update related items', function() {
      expect(Poly.updateAll).to.have.been.calledOnce()
      expect(Poly.updateAll).to.have.been.calledWith(
        { referenceType: 'Item', referenceId: this.item.id },
        { status: 'archived' }
      )
    })
  })
})

describe('upsert', function() {
  beforeEach(function() {
    return Item.create({
      name: 'Item',
      status: 'new',
      isTest: true,
    })
      .then(item => {
        item.status = 'archived'
        return Item.upsert(item)
      })
      .then(item => (this.item = item))
  })

  describe('hasOne', function() {
    it('should update related items', function() {
      expect(One.updateAll).to.have.been.calledTwice()
      expect(One.updateAll.firstCall).to.have.been.calledWith({ itemId: this.item.id }, { status: 'archived' })
      expect(One.updateAll.secondCall).to.have.been.calledWith({ itemId: this.item.id }, { isTest: true })
    })
  })
  describe('hasMany', function() {
    it('should update related items', function() {
      expect(Many.updateAll).to.have.been.calledOnce()
      expect(Many.updateAll).to.have.been.calledWith({ itemId: this.item.id }, { status: 'archived' })
    })
  })
  describe('polymorphic', function() {
    it('should update related items', function() {
      expect(Poly.updateAll).to.have.been.calledOnce()
      expect(Poly.updateAll).to.have.been.calledWith(
        { referenceType: 'Item', referenceId: this.item.id },
        { status: 'archived' }
      )
    })
  })
})

describe('updateAttributes', function() {
  beforeEach(function() {
    return Item.create({
      name: 'Item',
      status: 'new',
      isTest: true,
    })
      .then(item => item.updateAttribute('status', 'archived'))
      .then(item => (this.item = item))
  })

  describe('hasOne', function() {
    it('should update related items', function() {
      expect(One.updateAll).to.have.been.calledTwice()
      expect(One.updateAll.firstCall).to.have.been.calledWith({ itemId: this.item.id }, { status: 'archived' })
      expect(One.updateAll.secondCall).to.have.been.calledWith({ itemId: this.item.id }, { isTest: true })
    })
  })
  describe('hasMany', function() {
    it('should update related items', function() {
      expect(Many.updateAll).to.have.been.calledOnce()
      expect(Many.updateAll).to.have.been.calledWith({ itemId: this.item.id }, { status: 'archived' })
    })
  })
  describe('polymorphic', function() {
    it('should update related items', function() {
      expect(Poly.updateAll).to.have.been.calledOnce()
      expect(Poly.updateAll).to.have.been.calledWith(
        { referenceType: 'Item', referenceId: this.item.id },
        { status: 'archived' }
      )
    })
  })
})
