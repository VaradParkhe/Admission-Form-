const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const xlsx = require('xlsx');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

// MySQL Database Configuration
const dbConfig = {
  host: 'localhost', // MySQL host
  user: 'root', // MySQL username
  password: 'varadh', // MySQL password
  database: 'users', // Replace with your MySQL database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  port: 3306, // Add this line if your MySQL runs on a custom port
};

const JWT_SECRET = 'your_jwt_secret_key'; // Replace with your actual JWT secret key

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create MySQL connection pool
const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

// File upload handling
const upload = multer({ dest: 'uploads/' });

// Path for the JSON file to store records
const DATA_FILE = 'data.json';

// Helper function to read records from the JSON file
const readRecords = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Helper function to write records to the JSON file
const writeRecords = (records) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
};

// Serve Static and Protected Files
const PUBLIC_DIR = path.join(__dirname, 'public'); // Directory for public files
const PROTECTED_DIR = path.join(__dirname, 'protected'); // Directory for protected files
app.use(express.static(PUBLIC_DIR));

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(403).send('Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send('Invalid or expired token.');
  }
};

// Login route (MySQL-based)
app.post('/login-mysql', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password are required.');
  }

  try {
    console.log('Received login request:', { username, password }); // Debug log

    const [rows] = await promisePool.execute(
      'SELECT username, password FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      console.warn(`User not found: ${username}`); // Debug log
      return res.status(401).send('User not found.');
    }

    const user = rows[0];

    // Check if the password matches
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      console.warn(`Invalid password attempt for user: ${username}`); // Debug log
      return res.status(401).send('Invalid password.');
    }

    // Generate JWT token with an expiration time of 1 hour
    const token = jwt.sign({ username: user.username }, JWT_SECRET, {
      expiresIn: '1h',
    });

    console.log(`User logged in: ${username}`); // Debug log
    res.json({ message: 'Login successful!', token });
  } catch (err) {
    console.error('Error during MySQL login:', err);
    res.status(500).send('Internal server error: ' + err.message);
  }
});

// Registration route (MySQL-based)
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password are required.');
  }

  try {
    // Check if the username already exists
    const [existingUser] = await promisePool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (existingUser.length > 0) {
      return res.status(400).send('Username already taken.');
    }

    // Hash the password before storing it
    const hashedPassword = bcrypt.hashSync(password, 10); // bcrypt with 10 rounds of hashing

    // Insert the new user into the users table
    await promisePool.execute(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    res.status(201).send('User registered successfully.');
  } catch (err) {
    console.error('Error during user registration:', err);
    res.status(500).send('Internal server error: ' + err.message);
  }
});

// Serve Protected Admission.js File
app.get('/Admission.js', verifyToken, (req, res) => {
  const filePath = path.join(PROTECTED_DIR, 'Admission.js');
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File not found:', filePath);
      return res.status(404).send('File not found');
    }
    res.sendFile(filePath);
  });
});

// Protected route example
app.get('/protected', verifyToken, (req, res) => {
  res.send(`Hello, ${req.user.username}. This is a protected route.`);
});

// Fetch all records
app.get('/records', (req, res) => {
  const records = readRecords();
  res.json(records);
});

// Submit a new record
app.post('/submit', upload.any(), async (req, res) => {
  const records = readRecords();

  // Destructure the form fields from the request body
  const {
    title, firstName, middleName, lastName, motherName, gender, address,
    taluka, district, pinCode, state, mobileNumber, emailId, aadhaarNumber,
    dob, religion, casteCategory, caste, age, physicallyHandicapped, 
    casteCertificate, marksheet, photo, signature,
  } = req.body;

  // Calculate the full name
  const fullName = `${firstName || ''} ${middleName ? middleName + ' ' : ''}${lastName || ''}`;

  // Calculate the age if not passed from the frontend
  const calculatedAge = age || (dob ? calculateAge(dob) : null);

  // Construct the new record
  const newRecord = {
    id: records.length ? records[records.length - 1].id + 1 : 1,
    title: title || null,
    firstName: firstName || null,
    middleName: middleName || null,
    lastName: lastName || null,
    fullName: fullName || null,
    motherName: motherName || null,
    gender: gender || null,
    address: address || null,
    taluka: taluka || null,
    district: district || null,
    pinCode: pinCode || null,
    state: state || null,
    mobileNumber: mobileNumber || null,
    emailId: emailId || null,
    aadhaarNumber: aadhaarNumber || null,
    dob: dob || null,
    age: calculatedAge,
    religion: religion || null,
    casteCategory: casteCategory || null,
    caste: caste || null,
    physicallyHandicapped: physicallyHandicapped || null,
    casteCertificate: req.files.find(f => f.fieldname === 'casteCertificate')?.path || null,
    marksheet: req.files.find(f => f.fieldname === 'marksheet')?.path || null,
    photo: req.files.find(f => f.fieldname === 'photo')?.path || null,
    signature: req.files.find(f => f.fieldname === 'signature')?.path || null,
  };

  // Add the new record to the JSON file
  records.push(newRecord);
  writeRecords(records);

  // Insert the admission form details into the SQL database
  try {
    const sql = `
      INSERT INTO admission_forms 
        (id, title, first_name, middle_name, last_name, full_name, mother_name, gender,
         address, taluka, district, pin_code, state, mobile_number, email_id,
         aadhaar_number, date_of_birth, age, religion, caste_category, caste,
         physically_handicapped, caste_certificate, marksheet, photo, signature)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      newRecord.id, title, firstName, middleName, lastName, fullName, motherName, gender,
      address, taluka, district, pinCode, state, mobileNumber, emailId,
      aadhaarNumber, dob, calculatedAge, religion, casteCategory, caste,
      physicallyHandicapped, newRecord.casteCertificate, newRecord.marksheet, 
      newRecord.photo, newRecord.signature,
    ];

    // Log the SQL values for debugging
    console.log("SQL Values:", values);

    // Execute the query
    await promisePool.execute(sql, values);

    res.send('Record added successfully and stored in the database!');
  } catch (err) {
    console.error('Error inserting admission form details into database:', err.message);
    res.status(500).send(`Failed to store admission form details in the database. Error: ${err.message}`);
  }
});

// Update an existing record
app.put('/update/:id', upload.any(), async (req, res) => {
  const records = readRecords();
  const id = parseInt(req.params.id, 10);
  const recordIndex = records.findIndex((record) => record.id === id);

  if (recordIndex === -1) {
    return res.status(404).send('Record not found!');
  }

  const updatedRecord = { ...records[recordIndex], ...req.body };

  // Handle file uploads (if any)
  req.files.forEach((file) => {
    updatedRecord[file.fieldname] = file.path;
  });

  // Update the in-memory records
  records[recordIndex] = updatedRecord;
  writeRecords(records);

  // SQL Query to update the record in the database
  try {
    const sql = `
      UPDATE admission_forms SET
        title = ?, first_name = ?, middle_name = ?, last_name = ?, full_name = ?, mother_name = ?, 
        gender = ?, address = ?, taluka = ?, district = ?, pin_code = ?, state = ?, mobile_number = ?, 
        email_id = ?, aadhaar_number = ?, date_of_birth = ?, age = ?, religion = ?, caste_category = ?, caste = ?,
        physically_handicapped = ?, caste_certificate = ?, marksheet = ?, photo = ?, signature = ?
      WHERE id = ?
    `;

    // Log for debugging: Check the values being passed to the query
    console.log("SQL Update Values:", [
      updatedRecord.title, updatedRecord.firstName, updatedRecord.middleName, updatedRecord.lastName,
      updatedRecord.fullName, updatedRecord.motherName, updatedRecord.gender, updatedRecord.address,
      updatedRecord.taluka, updatedRecord.district, updatedRecord.pinCode, updatedRecord.state,
      updatedRecord.mobileNumber, updatedRecord.emailId, updatedRecord.aadhaarNumber, updatedRecord.dob,
      updatedRecord.age, updatedRecord.religion, updatedRecord.casteCategory, updatedRecord.caste,
      updatedRecord.physicallyHandicapped, updatedRecord.casteCertificate, updatedRecord.marksheet,
      updatedRecord.photo, updatedRecord.signature, id
    ]);

    // Execute the SQL update
    await promisePool.execute(sql, [
      updatedRecord.title, updatedRecord.firstName, updatedRecord.middleName, updatedRecord.lastName,
      updatedRecord.fullName, updatedRecord.motherName, updatedRecord.gender, updatedRecord.address,
      updatedRecord.taluka, updatedRecord.district, updatedRecord.pinCode, updatedRecord.state,
      updatedRecord.mobileNumber, updatedRecord.emailId, updatedRecord.aadhaarNumber, updatedRecord.dob,
      updatedRecord.age, updatedRecord.religion, updatedRecord.casteCategory, updatedRecord.caste,
      updatedRecord.physicallyHandicapped, updatedRecord.casteCertificate, updatedRecord.marksheet,
      updatedRecord.photo, updatedRecord.signature, id
    ]);

    res.send('Record updated successfully in both JSON and database!');
  } catch (err) {
    console.error('Error updating admission form details in the database:', err.message);
    res.status(500).send(`Failed to update admission form details in the database. Error: ${err.message}`);
  }
});


// Delete a record
app.delete('/delete/:id', async (req, res) => {
  const records = readRecords();
  const id = parseInt(req.params.id, 10);

  // Filter out the record to delete from the JSON file
  const newRecords = records.filter((record) => record.id !== id);

  // If no records were deleted, return 404
  if (records.length === newRecords.length) {
    return res.status(404).send('Record not found!');
  }

  // Update the JSON file with the new records
  writeRecords(newRecords);

  // SQL query to delete the record from the database
  try {
    const sql = `DELETE FROM admission_forms WHERE id = ?`;

    // Log for debugging
    console.log("SQL Delete Values:", [id]);

    // Execute the SQL delete
    await promisePool.execute(sql, [id]);

    res.send('Record deleted successfully from both JSON and database!');
  } catch (err) {
    console.error('Error deleting admission form details from the database:', err.message);
    res.status(500).send(`Failed to delete admission form details from the database. Error: ${err.message}`);
  }
});


// Export records to Excel
app.get('/export', (req, res) => {
  const records = readRecords();

  const worksheet = xlsx.utils.json_to_sheet(records);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Records');

  const filePath = path.join(__dirname, 'records.xlsx');
  xlsx.writeFile(workbook, filePath);

  res.download(filePath, 'records.xlsx', (err) => {
    if (err) {
      console.error('Error exporting to Excel:', err);
    }

    // Delete the file after sending it to the client
    fs.unlinkSync(filePath);
  });
});

// Test database connection at the start
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1); // Exit the app if the connection fails
  } else {
    console.log('Connected to MySQL database successfully!');
    connection.release(); // Release the connection back to the pool
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
