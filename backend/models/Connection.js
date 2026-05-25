// models/Connection.js
const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  userId1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userId2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

const MongooseConnection = mongoose.model('Connection', connectionSchema);
const mockDb = require('./mockDb');

const ConnectionProxy = new Proxy(function() {}, {
  get(target, prop) {
    const isConnected = mongoose.connection.readyState === 1;
    const actualModel = isConnected ? MongooseConnection : mockDb.getModel('Connection', connectionSchema);
    const value = actualModel[prop];
    if (typeof value === 'function') {
      return value.bind(actualModel);
    }
    return value;
  },
  construct(target, args) {
    const isConnected = mongoose.connection.readyState === 1;
    const actualModel = isConnected ? MongooseConnection : mockDb.getModel('Connection', connectionSchema);
    return new actualModel(...args);
  }
});

module.exports = ConnectionProxy;
