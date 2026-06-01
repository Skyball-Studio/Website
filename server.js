const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const CONTACT_WEBHOOK_URL = process.env.CONTACT_WEBHOOK_URL || '';

// Setup middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve the 'assets' directory statically under '/assets' prefix
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Submissions are local server data and should stay outside public builds/repos.
const SUBMISSIONS_FILE = process.env.SUBMISSIONS_FILE || path.join(__dirname, '.data', 'submissions.json');

// Load members database dynamically from JSON files
let members = {};
try {
  const sidakData = JSON.parse(fs.readFileSync(path.join(__dirname, 'sidak.json'), 'utf8'));
  const membersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'members.json'), 'utf8'));
  members = {
    ...membersData,
    sidak: sidakData
  };
} catch (err) {
  console.error('Error loading metadata JSON files:', err);
}

// Helper to read submissions
function readSubmissions() {
  try {
    if (!fs.existsSync(SUBMISSIONS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(SUBMISSIONS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading submissions:', err);
    return [];
  }
}

// Helper to write submissions
function writeSubmission(submission) {
  try {
    const list = readSubmissions();
    list.push(submission);
    fs.mkdirSync(path.dirname(SUBMISSIONS_FILE), { recursive: true });
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(list, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing submission:', err);
    return false;
  }
}

async function sendContactWebhook(submission) {
  if (!CONTACT_WEBHOOK_URL) {
    return;
  }

  const response = await fetch(CONTACT_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      source: 'skyball-studio-portfolio',
      ...submission
    })
  });

  if (!response.ok) {
    throw new Error(`Webhook failed with ${response.status}`);
  }
}

// Main Landing Route
app.get('/', (req, res) => {
  res.render('index');
});

// Dynamic Team Member Portfolio Route
app.get('/portfolio/:member', (req, res) => {
  const memberKey = req.params.member.toLowerCase();

  if (members[memberKey]) {
    if (memberKey === 'lee') {
      res.render('lee', { member: members[memberKey] });
    } else if (memberKey === 'sidak') {
      res.render('sidak', { member: members[memberKey] });
    } else {
      res.render('portfolio', { member: members[memberKey] });
    }
  } else {
    // Graceful redirection to Home if member not found
    res.redirect('/');
  }
});

// Contact Form API
app.post('/api/contact', async (req, res) => {
  const { name, email, message, intendedArtist } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Please fill in all required fields (Name, Email, and Message).'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.'
    });
  }

  const newSubmission = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
    intendedArtist: intendedArtist ? intendedArtist.trim() : 'Skyball Studio Core Team',
    timestamp: new Date().toISOString()
  };

  const saved = writeSubmission(newSubmission);

  try {
    await sendContactWebhook(newSubmission);
  } catch (err) {
    console.error('Error sending contact webhook:', err);
  }

  if (saved) {
    const responseMsg = intendedArtist
      ? `Thank you, ${newSubmission.name}! Your direct message to ${intendedArtist} has been logged. We will get back to you shortly.`
      : `Thank you, ${newSubmission.name}! Your message has been received. We will get back to you shortly.`;

    res.status(200).json({
      success: true,
      message: responseMsg
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Server error. We could not save your submission. Please try again later.'
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Skyball Studio Portfolio running at:`);
  console.log(`   👉 http://localhost:${PORT}`);
  console.log(`==================================================`);
});
