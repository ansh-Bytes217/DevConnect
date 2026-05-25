// models/mockDb.js
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/db.json');

// Ensure data folder and db.json exist
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({
    User: [],
    Post: [],
    Connection: [],
    Message: [],
    Job: []
  }, null, 2));
}

let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

function saveDb() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// Helpers for basic querying
function matchesQuery(doc, query) {
  if (!query) return true;
  return Object.keys(query).every(key => {
    const val = query[key];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      // Handle operators like $ne, $or, $nin, $in
      return Object.keys(val).every(op => {
        const opVal = val[op];
        if (op === '$ne') {
          return String(doc[key]) !== String(opVal);
        }
        if (op === '$nin') {
          const list = Array.isArray(opVal) ? opVal.map(String) : [];
          return !list.includes(String(doc[key]));
        }
        if (op === '$in') {
          const list = Array.isArray(opVal) ? opVal.map(String) : [];
          return list.includes(String(doc[key]));
        }
        return true;
      });
    }
    if (key === '$or') {
      return val.some(subQuery => matchesQuery(doc, subQuery));
    }
    // Simple matching
    return String(doc[key]) === String(val);
  });
}

class MockQuery {
  constructor(result) {
    this.result = result;
  }
  populate(pathStr, selectFields) {
    if (!this.result) return this;
    
    const resolvePopulate = (doc, path) => {
      if (!doc) return doc;
      if (path.includes('.')) {
        const parts = path.split('.');
        const parentKey = parts[0];
        const childKey = parts[1];
        
        if (doc[parentKey] && Array.isArray(doc[parentKey])) {
          doc[parentKey] = doc[parentKey].map(item => {
            const val = item[childKey];
            if (Array.isArray(val)) {
              return { ...item, [childKey]: val.map(id => this._fetchRef(id)).filter(Boolean) };
            } else if (val) {
              return { ...item, [childKey]: this._fetchRef(val) };
            }
            return item;
          });
        }
      } else {
        const val = doc[path];
        if (Array.isArray(val)) {
          doc[path] = val.map(id => this._fetchRef(id)).filter(Boolean);
        } else if (val) {
          doc[path] = this._fetchRef(val);
        }
      }
      return doc;
    };

    if (Array.isArray(this.result)) {
      this.result = this.result.map(doc => resolvePopulate({ ...doc }, pathStr));
    } else {
      this.result = resolvePopulate({ ...this.result }, pathStr);
    }
    return this;
  }
  _fetchRef(id) {
    for (const colName of Object.keys(db)) {
      const found = db[colName].find(d => String(d._id) === String(id));
      if (found) {
        return { ...found };
      }
    }
    return null;
  }
  sort(sortObj) {
    if (Array.isArray(this.result)) {
      const key = Object.keys(sortObj)[0];
      const order = sortObj[key];
      this.result.sort((a, b) => {
        if (a[key] < b[key]) return order;
        if (a[key] > b[key]) return -order;
        return 0;
      });
    }
    return this;
  }
  limit(num) {
    if (Array.isArray(this.result)) {
      this.result = this.result.slice(0, num);
    }
    return this;
  }
  select(fields) {
    return this;
  }
  async then(resolve, reject) {
    if (resolve) resolve(this.result);
    return this.result;
  }
}

class MockModelInstance {
  constructor(modelName, data) {
    this._modelName = modelName;
    Object.assign(this, data);
    if (!this._id) {
      this._id = 'mock_' + Math.random().toString(36).substring(2, 9);
    }
    if (!this.createdAt) {
      this.createdAt = new Date().toISOString();
      this.updatedAt = new Date().toISOString();
    }
  }
  async save() {
    const col = db[this._modelName];
    const index = col.findIndex(d => String(d._id) === String(this._id));
    
    const plainObj = { ...this };
    delete plainObj._modelName;

    if (index > -1) {
      plainObj.updatedAt = new Date().toISOString();
      col[index] = plainObj;
    } else {
      col.push(plainObj);
    }
    saveDb();
    return this;
  }
}

const models = {};

function getModel(modelName, schema) {
  if (models[modelName]) return models[modelName];

  class Model {
    constructor(data) {
      return new MockModelInstance(modelName, data);
    }

    static find(query) {
      const col = db[modelName] || [];
      const matches = col.filter(doc => matchesQuery(doc, query));
      return new MockQuery(matches);
    }

    static findOne(query) {
      const col = db[modelName] || [];
      const match = col.find(doc => matchesQuery(doc, query)) || null;
      return new MockQuery(match ? new MockModelInstance(modelName, match) : null);
    }

    static findById(id) {
      const col = db[modelName] || [];
      const match = col.find(doc => String(doc._id) === String(id)) || null;
      return new MockQuery(match ? new MockModelInstance(modelName, match) : null);
    }

    static findByIdAndUpdate(id, update, options) {
      const col = db[modelName] || [];
      const index = col.findIndex(doc => String(doc._id) === String(id));
      if (index === -1) return new MockQuery(null);

      const doc = col[index];
      let updatedDoc = { ...doc };

      if (update.$set) {
        Object.assign(updatedDoc, update.$set);
      }
      if (update.$addToSet) {
        Object.keys(update.$addToSet).forEach(key => {
          const val = update.$addToSet[key];
          if (!updatedDoc[key]) updatedDoc[key] = [];
          if (!updatedDoc[key].includes(String(val))) {
            updatedDoc[key].push(String(val));
          }
        });
      }
      if (update.$pull) {
        Object.keys(update.$pull).forEach(key => {
          const val = update.$pull[key];
          if (updatedDoc[key]) {
            updatedDoc[key] = updatedDoc[key].filter(item => String(item) !== String(val));
          }
        });
      }
      
      if (!update.$set && !update.$addToSet && !update.$pull) {
        Object.assign(updatedDoc, update);
      }

      updatedDoc.updatedAt = new Date().toISOString();
      col[index] = updatedDoc;
      saveDb();
      return new MockQuery(new MockModelInstance(modelName, updatedDoc));
    }

    static findByIdAndDelete(id) {
      const col = db[modelName] || [];
      const index = col.findIndex(doc => String(doc._id) === String(id));
      if (index === -1) return new MockQuery(null);

      const deleted = col.splice(index, 1)[0];
      saveDb();
      return new MockQuery(new MockModelInstance(modelName, deleted));
    }
    
    static findByIdAndRemove(id) {
      return this.findByIdAndDelete(id);
    }

    static findOneAndDelete(query) {
      const col = db[modelName] || [];
      const index = col.findIndex(doc => matchesQuery(doc, query));
      if (index === -1) return new MockQuery(null);

      const deleted = col.splice(index, 1)[0];
      saveDb();
      return new MockQuery(new MockModelInstance(modelName, deleted));
    }

    static countDocuments(query) {
      const col = db[modelName] || [];
      const matches = col.filter(doc => matchesQuery(doc, query));
      return new MockQuery(matches.length);
    }
  }

  models[modelName] = Model;
  return Model;
}

module.exports = {
  getModel
};
