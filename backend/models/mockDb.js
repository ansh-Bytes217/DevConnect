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
    Job: [],
    CommunityMessage: []
  }, null, 2));
}

let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Seed database on startup if User collection is empty
if (!db.User || db.User.length === 0) {
  const defaultUsers = [
    {
      _id: "mock_guest_9999",
      username: "GuestDev_9999",
      email: "guest@devconnect.com",
      password: "$2a$10$fVzYZh8diEDdDRiBsovkOeTIix.d4WDEK5N24EuaWxB9YpH85jVku", // password123
      profilePicture: "https://api.dicebear.com/7.x/bottts/svg?seed=Guest",
      bio: "Lead Full-Stack Architect | Scaling Solutions",
      githubUsername: "gaearon",
      skills: [
        { name: "React", endorsedBy: [] }, 
        { name: "Node.js", endorsedBy: [] },
        { name: "Mongoose Proxies", endorsedBy: [] },
        { name: "Offline Caching", endorsedBy: [] }
      ],
      experience: [
        { 
          company: "DevConnect Inc. (Scale-out Labs)", 
          role: "Lead Full-Stack Architect", 
          duration: "2026 - Present", 
          description: "Architected and built the full-stack DevConnect platform (WebSockets chat, Jitsi meet, ATS scanner, Kafka diagnostics). Resolved database server infrastructure constraints by designing an automatic Mongoose Proxy schema wrapper that falls back seamlessly to localized JSON caches." 
        }
      ],
      education: [{ school: "Self-Taught Academy", degree: "Software Engineer", duration: "2024 - 2026" }],
      badge: "open-to-work",
      connections: ["mock_user_dan", "mock_user_sarah"]
    },
    {
      _id: "mock_user_dan",
      username: "Dan_The_Coder",
      email: "dan@coder.dev",
      password: "$2a$10$fVzYZh8diEDdDRiBsovkOeTIix.d4WDEK5N24EuaWxB9YpH85jVku",
      profilePicture: "https://api.dicebear.com/7.x/bottts/svg?seed=Dan",
      bio: "Senior Frontend Engineer (React/TypeScript)",
      githubUsername: "gaearon",
      skills: [
        { name: "React", endorsedBy: [] },
        { name: "TypeScript", endorsedBy: [] }
      ],
      experience: [
        {
          company: "Vercel",
          role: "Senior Frontend Engineer",
          duration: "2023 - Present",
          description: "Working on next-generation rendering engines and styling solutions."
        }
      ],
      education: [{ school: "Tech University", degree: "Computer Science", duration: "2019 - 2023" }],
      badge: "hiring",
      connections: ["mock_guest_9999"]
    },
    {
      _id: "mock_user_sarah",
      username: "Sarah_ShaderArt",
      email: "sarah@shaderart.dev",
      password: "$2a$10$fVzYZh8diEDdDRiBsovkOeTIix.d4WDEK5N24EuaWxB9YpH85jVku",
      profilePicture: "https://api.dicebear.com/7.x/bottts/svg?seed=Sarah",
      bio: "Creative Frontend & WebGL Developer",
      githubUsername: "yyx990803",
      skills: [
        { name: "ThreeJS", endorsedBy: [] },
        { name: "WebGL", endorsedBy: [] }
      ],
      experience: [
        {
          company: "Supabase",
          role: "WebGL Graphics Developer",
          duration: "2022 - Present",
          description: "Creating interactive 3D graphs and analytics representations."
        }
      ],
      education: [{ school: "Design Academy", degree: "Digital Arts", duration: "2018 - 2022" }],
      badge: "open-to-work",
      connections: ["mock_guest_9999"]
    }
  ];

  const defaultConnections = [
    {
      _id: "mock_conn_dan",
      userId1: "mock_guest_9999",
      userId2: "mock_user_dan",
      status: "accepted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: "mock_conn_sarah",
      userId1: "mock_guest_9999",
      userId2: "mock_user_sarah",
      status: "accepted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const defaultPosts = [
    {
      _id: "mock_post_dan",
      content: "Just migrated our entire dashboard feed sorting to a custom React hook combined with local storage cache safeguards! Performance is down to sub-10ms now.",
      imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
      userId: "mock_user_dan",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
    {
      _id: "mock_post_sarah",
      content: "Check out this WebGL pixel shader I wrote for the new Big Data Event Storm analytics console! Looks like digital rain cascading down the telemetry charts.",
      imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
      userId: "mock_user_sarah",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
    }
  ];

  const defaultJobs = [
    {
      _id: "mock_job_dan",
      title: "Senior Frontend Engineer (React/TypeScript)",
      company: "Vercel",
      location: "Remote (US/Europe)",
      jobType: "Full-time",
      description: "We are looking for a Senior Frontend Engineer to help build the future of Web development. You will contribute directly to Next.js dashboard features, deploy optimizations, and custom web core vitals trackers. Experience with caching and edge architectures is highly valued.",
      skillsRequired: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
      postedBy: "mock_user_dan",
      applicants: [
        {
          userId: "mock_user_sarah",
          username: "Sarah_ShaderArt",
          email: "sarah@shaderart.dev",
          phone: "+1 415-555-2026",
          portfolio: "https://sarahshader.art",
          resumeName: "sarah_shader_threejs.pdf",
          matchScore: 94,
          status: "Shortlisted"
        },
        {
          userId: "mock_guest_9999",
          username: "GuestDev_9999",
          email: "guest@devconnect.com",
          phone: "+1 650-555-0912",
          portfolio: "https://github.com/guestdev",
          resumeName: "lead_architect_cv.pdf",
          matchScore: 88,
          status: "Pending"
        }
      ],
      views: 142,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    },
    {
      _id: "mock_job_sarah",
      title: "Backend Systems Engineer (Golang & Kubernetes)",
      company: "Supabase",
      location: "Singapore / Hybrid",
      jobType: "Full-time",
      description: "Join our systems team to work on Postgres clustering, connection pools, and containerized scale-out configurations. You will write high-performance Go libraries and manage cloud-native deployments.",
      skillsRequired: ["Go", "Postgres", "Kubernetes", "Docker"],
      postedBy: "mock_user_sarah",
      applicants: [],
      views: 89,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
    }
  ];

  const defaultCommunityMessages = [
    {
      _id: "mock_cmsg_1",
      serverId: "srv_ai",
      channel: "#general",
      sender: "mock_user_dan",
      username: "Dan_The_Coder",
      text: "Has anyone checked out the new model release parameters? The token weights look incredibly optimized.",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      _id: "mock_cmsg_2",
      serverId: "srv_ai",
      channel: "#general",
      sender: "mock_guest_9999",
      username: "GuestDev_9999",
      text: "Yes, I did! Especially the latency improvements are impressive.",
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString()
    },
    {
      _id: "mock_cmsg_3",
      serverId: "srv_web",
      channel: "#general",
      sender: "mock_user_sarah",
      username: "Sarah_ShaderArt",
      text: "Just updated three.js shader layers. WebGL drawing calls dropped by 40%!",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  db.User = defaultUsers;
  db.Connection = defaultConnections;
  db.Post = defaultPosts;
  db.Job = defaultJobs;
  db.CommunityMessage = defaultCommunityMessages;
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

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
