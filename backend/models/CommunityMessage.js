// models/CommunityMessage.js
const mongoose = require('mongoose');

const communityMessageSchema = new mongoose.Schema({
  serverId: { type: String, required: true },
  channel: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  text: { type: String, required: true }
}, { timestamps: true });

const MongooseCommunityMessage = mongoose.model('CommunityMessage', communityMessageSchema);
const mockDb = require('./mockDb');

const CommunityMessageProxy = new Proxy(function() {}, {
  get(target, prop) {
    const isConnected = mongoose.connection.readyState === 1;
    const actualModel = isConnected ? MongooseCommunityMessage : mockDb.getModel('CommunityMessage', communityMessageSchema);
    const value = actualModel[prop];
    if (typeof value === 'function') {
      return value.bind(actualModel);
    }
    return value;
  },
  construct(target, args) {
    const isConnected = mongoose.connection.readyState === 1;
    const actualModel = isConnected ? MongooseCommunityMessage : mockDb.getModel('CommunityMessage', communityMessageSchema);
    return new actualModel(...args);
  }
});

module.exports = CommunityMessageProxy;
