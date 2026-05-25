import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Configure backend API base URL
const API_URL = 'http://localhost:5000/api';
axios.defaults.baseURL = API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      if (token === 'mock-guest-token') {
        const storedMockUser = localStorage.getItem('mock_user');
        if (storedMockUser) {
          setUser(JSON.parse(storedMockUser));
        } else {
          // Default mock user
          const defaultMock = {
            _id: 'mock_guest_9999',
            username: 'GuestDev_9999',
            email: 'guest@devconnect.com',
            bio: 'Lead Full-Stack Architect | Scaling Solutions',
            skills: [
              { name: 'React', endorsedBy: [] }, 
              { name: 'Node.js', endorsedBy: [] },
              { name: 'Mongoose Proxies', endorsedBy: [] },
              { name: 'Offline Caching', endorsedBy: [] }
            ],
            experience: [
              { 
                company: 'DevConnect Inc. (Scale-out Labs)', 
                role: 'Lead Full-Stack Architect', 
                duration: '2026 - Present', 
                description: 'Architected and built the full-stack DevConnect platform (WebSockets chat, Jitsi meet, ATS scanner, Kafka diagnostics). Resolved database server infrastructure constraints by designing an automatic Mongoose Proxy schema wrapper that falls back seamlessly to localized JSON caches.' 
              }
            ],
            education: [{ school: 'Self-Taught Academy', degree: 'Software Engineer', duration: '2024 - 2026' }],
            badge: 'open-to-work',
            connections: []
          };
          localStorage.setItem('mock_user', JSON.stringify(defaultMock));
          setUser(defaultMock);
        }
        setLoading(false);
      } else {
        axios.defaults.headers.common['Authorization'] = token;
        // Fetch user profile to verify token and load full data
        axios.get('/users/profile')
          .then((res) => {
            setUser(res.data);
            setError(null);
          })
          .catch((err) => {
            console.error('Session verify failed:', err.message);
            // Token expired or invalid
            logout();
          })
          .finally(() => setLoading(false));
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post('/users/signin', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      return true;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.msg || err.response?.data?.email || err.response?.data?.password || 'Login failed';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (username, email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post('/users/signup', { username, email, password });
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      return true;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.msg || err.response?.data?.username || err.response?.data?.email || err.response?.data?.password || 'Sign up failed';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const loginAsGuest = async () => {
    setError(null);
    setLoading(true);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const guestUsername = `GuestDev_${randomSuffix}`;
    const guestEmail = `guest_${randomSuffix}@devconnect.com`;
    const guestPassword = `guestpassword_${randomSuffix}`;

    try {
      // Try to register a real guest user on the backend
      const res = await axios.post('/users/signup', { 
        username: guestUsername, 
        email: guestEmail, 
        password: guestPassword 
      });
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      return true;
    } catch (err) {
      console.warn('Backend guest registration failed, falling back to local client-only mock guest session:', err.message);
      
      // Local fallback session
      const mockUser = {
        _id: `mock_guest_${randomSuffix}`,
        username: guestUsername,
        email: guestEmail,
        bio: 'Lead Full-Stack Architect | Scaling Solutions',
        skills: [
          { name: 'React', endorsedBy: [] }, 
          { name: 'Node.js', endorsedBy: [] },
          { name: 'Mongoose Proxies', endorsedBy: [] },
          { name: 'Offline Caching', endorsedBy: [] }
        ],
        experience: [
          { 
            company: 'DevConnect Inc. (Scale-out Labs)', 
            role: 'Lead Full-Stack Architect', 
            duration: '2026 - Present', 
            description: 'Architected and built the full-stack DevConnect platform (WebSockets chat, Jitsi meet, ATS scanner, Kafka diagnostics). Resolved database server infrastructure constraints by designing an automatic Mongoose Proxy schema wrapper that falls back seamlessly to localized JSON caches.' 
          }
        ],
        education: [{ school: 'Self-Taught Academy', degree: 'Software Engineer', duration: '2024 - 2026' }],
        badge: 'open-to-work',
        connections: []
      };
      
      localStorage.setItem('token', 'mock-guest-token');
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setToken('mock-guest-token');
      setUser(mockUser);
      return true;
    }
  };


  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('mock_user');
    setToken(null);
    setUser(null);
    setError(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (profileData) => {
    if (token === 'mock-guest-token') {
      // Update local storage in guest mode
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('mock_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    }

    try {
      const res = await axios.put('/users/profile', profileData);
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error('Update profile error:', err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, loginAsGuest, logout, updateProfile, setUser }}>
      {children}
    </AuthContext.Provider>
  );

};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
