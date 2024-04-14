// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { Course, sequelize } = require("./models");
const {Op} = require("sequelize");

// Initialize Express app
const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Synchronize the models with the database
sequelize.sync({force: true}).then(() => {
      console.log('Database synchronized');
})
.catch(err => {
  console.error('Unable to synchronize database:', err);
});

// API endpoint to get all colleges
app.get('/colleges', async (req, res) => {
  try {
    const colleges = require('./colleges.json');

    // Check if keyword is provided in query parameter
    const keyword = req.query.keyword;
    if (keyword) {
      // Perform search based on the keyword
      const filteredColleges = colleges.filter(college =>
          college.name.toLowerCase().includes(keyword.toLowerCase()) ||
          college.description.toLowerCase().includes(keyword.toLowerCase())
      );

      res.json(filteredColleges);
    } else {
      // If no keyword provided, return all colleges
      res.json(colleges);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Secret key for JWT
const JWT_SECRET = 'your_secret_key_here';

// Login Page
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Check if username and password are valid (dummy check for now)
    if (username === 'admin' && password === 'admin') {
      // Generate JWT token
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.post('/courses', authenticateToken, async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (error) {
    console.error(error, req.body);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint for retrieving courses with optional search filter
app.get('/courses', async (req, res) => {
  try {
    // Extract query parameters
    const { keyword, nfqLevel } = req.query;

    // Define options object for filtering
    const options = {};

    // If keyword is provided, add a WHERE clause to filter by name or description using SQL LIKE
    if (keyword) {
      options.where = {
        [Op.or]: [
          { name: { [Op.like]: `%${keyword}%` } },
          { description: { [Op.like]: `%${keyword}%` } }
        ]
      };
    }

    // If nfqLevel is provided, add a WHERE clause to filter by nfqLevel
    if (nfqLevel) {
      options.where = { ...options.where, nfqLevel: nfqLevel };
    }

    // Find courses with optional search filter
    const courses = await Course.findAll(options);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});