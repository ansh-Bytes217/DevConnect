const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
  console.log('--- Starting Backend Route Integration Tests ---');
  
  let authToken = '';
  let otherUserId = '';
  let otherAuthToken = '';

  const testUser = {
    username: 'test_dev_' + Math.random().toString(36).substring(7),
    email: 'test_dev_' + Math.random().toString(36).substring(7) + '@test.com',
    password: 'password123'
  };

  const otherUser = {
    username: 'other_dev_' + Math.random().toString(36).substring(7),
    email: 'other_dev_' + Math.random().toString(36).substring(7) + '@test.com',
    password: 'password123'
  };

  try {
    // 1. SignUp Test User 1
    console.log('\n[1/10] Testing User Signup...');
    const signupRes = await fetch(`${BASE_URL}/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const signupData = await signupRes.json();
    if (signupRes.status !== 201) throw new Error(`Signup failed: ${JSON.stringify(signupData)}`);
    authToken = signupData.token;
    console.log(`✓ Signup successful. Username: ${testUser.username}`);

    // SignUp User 2 (for connections/chat tests)
    const otherSignupRes = await fetch(`${BASE_URL}/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(otherUser)
    });
    const otherSignupData = await otherSignupRes.json();
    if (otherSignupRes.status !== 201) throw new Error(`Other user signup failed`);
    otherUserId = otherSignupData.user.id;
    otherAuthToken = otherSignupData.token;

    // 2. SignIn Test
    console.log('\n[2/10] Testing User Signin...');
    const signinRes = await fetch(`${BASE_URL}/users/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });
    const signinData = await signinRes.json();
    if (signinRes.status !== 200) throw new Error(`Signin failed: ${JSON.stringify(signinData)}`);
    console.log('✓ Signin successful.');

    // 3. Profile Fetch Test
    console.log('\n[3/10] Testing Profile GET...');
    const profileRes = await fetch(`${BASE_URL}/users/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const profileData = await profileRes.json();
    if (profileRes.status !== 200) throw new Error(`Profile fetch failed: ${JSON.stringify(profileData)}`);
    console.log(`✓ Profile loaded. Bio tagline: "${profileData.bio}"`);

    // 4. Profile Update Test
    console.log('\n[4/10] Testing Profile Update PUT...');
    const updatePayload = {
      bio: 'Senior Cloud Systems Architect',
      githubUsername: 'gaearon',
      skills: [{ name: 'React', endorsedBy: [] }, { name: 'Node.js', endorsedBy: [] }]
    };
    const updateRes = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(updatePayload)
    });
    const updateData = await updateRes.json();
    if (updateRes.status !== 200) throw new Error(`Profile update failed: ${JSON.stringify(updateData)}`);
    console.log(`✓ Profile updated. Synced GitHub username: "${updateData.githubUsername}"`);

    // 5. Create Post Test
    console.log('\n[5/10] Testing Post Creation POST...');
    const postPayload = {
      content: 'Just deployed a new proxy schema pattern for Mongoose fallbacks!',
      imageUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3'
    };
    const createPostRes = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(postPayload)
    });
    const postData = await createPostRes.json();
    if (createPostRes.status !== 201) throw new Error(`Create post failed: ${JSON.stringify(postData)}`);
    console.log(`✓ Post created. Content: "${postData.content}"`);

    // 6. Get Posts Feed Test
    console.log('\n[6/10] Testing Feed List GET...');
    const getPostsRes = await fetch(`${BASE_URL}/posts`);
    const feedList = await getPostsRes.json();
    if (getPostsRes.status !== 200) throw new Error(`Fetch posts failed`);
    console.log(`✓ Loaded feed successfully. Total posts: ${feedList.length}`);

    // 7. Connections Add Request Test
    console.log('\n[7/10] Testing Connection Invitation POST...');
    const connRes = await fetch(`${BASE_URL}/connections/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ userId2: otherUserId })
    });
    const connData = await connRes.json();
    if (connRes.status !== 201) throw new Error(`Send connection failed: ${JSON.stringify(connData)}`);
    console.log(`✓ Connection request created. Status: ${connData.status}`);

    // 8. Connections Pending List Test
    console.log('\n[8/10] Testing Pending Connections GET...');
    const pendingRes = await fetch(`${BASE_URL}/connections/pending`, {
      headers: { 'Authorization': `Bearer ${otherAuthToken}` }
    });
    const pendingData = await pendingRes.json();
    if (pendingRes.status !== 200) throw new Error(`Fetch pending list failed`);
    console.log(`✓ Loaded pending incoming list for recipient. Count: ${pendingData.incoming.length}`);

    // 9. Job Creation Test
    console.log('\n[9/10] Testing Recruiter Job Posting POST...');
    const jobPayload = {
      title: 'Staff Fullstack Architect',
      company: 'GitLab',
      location: 'Remote',
      jobType: 'Full-time',
      description: 'Design and review highly scaled repository architectures.',
      skillsRequired: ['Git', 'Ruby', 'Vue', 'Go']
    };
    const jobRes = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(jobPayload)
    });
    const jobData = await jobRes.json();
    if (jobRes.status !== 201) throw new Error(`Job post failed: ${JSON.stringify(jobData)}`);
    console.log(`✓ Recruiter job posted successfully. Role: ${jobData.title}`);

    // 10. Analytics Metrics Test
    console.log('\n[10/10] Testing Big Data Analytics Metrics GET...');
    const metricsRes = await fetch(`${BASE_URL}/analytics/metrics`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const metricsData = await metricsRes.json();
    if (metricsRes.status !== 200) throw new Error(`Metrics fetch failed`);
    console.log(`✓ Loaded analytics diagnostics. Active eventsCount: ${JSON.stringify(metricsData.eventTypeCounts)}`);

    console.log('\n=== ALL 10 BACKEND ROUTE INTEGRATION TESTS COMPLETED SUCCESSFULLY! ===');
  } catch (err) {
    console.error('\n❌ INTEGRATION TEST CRITICAL FAILURE:');
    console.error(err.message);
    process.exit(1);
  }
}

runTests();
