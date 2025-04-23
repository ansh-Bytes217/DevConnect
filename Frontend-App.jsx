// App.jsx (Frontend - React + Tailwind CSS + Framer Motion + Dynamic Features + Auth)

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Connections from './pages/Connections';
import SignIn from './pages/SignIn';
import SignOut from './pages/SignOut';
import Posts from './pages/Posts';
import Meet from './pages/Meet';

const Navbar = () => (
  <nav className="bg-white shadow-md py-4 px-8 flex justify-between items-center sticky top-0 z-50">
    <h1 className="text-2xl font-bold text-indigo-600">DevConnect</h1>
    <div className="space-x-6">
      <Link to="/" className="text-gray-700 hover:text-indigo-600 font-medium transition-all duration-200">Home</Link>
      <Link to="/profile" className="text-gray-700 hover:text-indigo-600 font-medium transition-all duration-200">Profile</Link>
      <Link to="/connections" className="text-gray-700 hover:text-indigo-600 font-medium transition-all duration-200">Connections</Link>
      <Link to="/posts" className="text-gray-700 hover:text-indigo-600 font-medium transition-all duration-200">Posts</Link>
      <Link to="/meet" className="text-gray-700 hover:text-indigo-600 font-medium transition-all duration-200">Meet</Link>
      <Link to="/signin" className="text-gray-700 hover:text-indigo-600 font-medium transition-all duration-200">Sign In</Link>
      <Link to="/signout" className="text-gray-700 hover:text-indigo-600 font-medium transition-all duration-200">Sign Out</Link>
    </div>
  </nav>
);

const App = () => (
  <Router>
    <Navbar />
    <motion.div
      className="p-8 max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/connections" element={<Connections />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/meet" element={<Meet />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signout" element={<SignOut />} />
      </Routes>
    </motion.div>
  </Router>
);

export default App;

// pages/Posts.jsx
import React, { useState } from 'react';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handlePost = () => {
    const newPost = {
      id: posts.length + 1,
      content,
      image: previewImage,
      date: new Date().toLocaleString()
    };
    setPosts([newPost, ...posts]);
    setContent('');
    setImage(null);
    setPreviewImage(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-indigo-600">Create a Post</h2>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full border border-gray-300 rounded-xl p-4"
        rows={4}
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="mb-4"
      />
      {previewImage && (
        <img src={previewImage} alt="Preview" className="w-full h-auto rounded-xl mb-4" />
      )}
      <button
        onClick={handlePost}
        className="bg-indigo-600 text-white py-2 px-6 rounded-xl hover:bg-indigo-700 font-semibold"
      >
        Post
      </button>

      <div className="mt-8 space-y-6">
        <h3 className="text-2xl font-semibold text-gray-800">Recent Posts</h3>
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white shadow-md rounded-xl p-6 space-y-2"
          >
            <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
            {post.image && (
              <img src={post.image} alt="post" className="w-full h-auto rounded-xl" />
            )}
            <p className="text-sm text-gray-500">Posted on {post.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Posts;

// pages/Meet.jsx
import React from 'react';

const Meet = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-indigo-600">Start a Meet</h2>
      <p className="text-gray-700">Use the button below to launch a video meet with others. We use an embedded Jitsi Meet instance.</p>
      <iframe
        src="https://meet.jit.si/DevConnectRoom"
        allow="camera; microphone; fullscreen; display-capture"
        style={{ width: '100%', height: '600px', border: '0px' }}
        title="DevConnect Video Meet"
      ></iframe>
    </div>
  );
};

export default Meet;
