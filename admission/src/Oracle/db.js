// db.js
const oracledb = require('oracledb');

// Database connection details
const dbConfig = {
  user: 'varadh',
  password: 'varadh',
  connectString: 'jdbc:oracle:thin:@localhost:1522:oracle', // Replace with your Oracle DB connection string
};

// Function to connect to Oracle DB and query
async function connectToDB() {
  let connection;

  try {
    // Connect to the database
    connection = await oracledb.getConnection(dbConfig);
    console.log('Successfully connected to Oracle Database');

    return connection;
  } catch (error) {
    console.error('Error connecting to Oracle DB:', error);
    throw error;
  }
}

// Function to insert a user into the Oracle database
async function insertUser(firstName, lastName, email, password) {
  let connection;

  try {
    connection = await connectToDB();

    // Prepare an insert statement
    const result = await connection.execute(
      `INSERT INTO users (first_name, last_name, email, password) 
      VALUES (:firstName, :lastName, :email, :password)`,
      {
        firstName,
        lastName,
        email,
        password,
      },
      {
        autoCommit: true, // Automatically commit the changes
      }
    );

    console.log('User inserted:', result);
  } catch (error) {
    console.error('Error inserting user into Oracle DB:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

module.exports = { connectToDB, insertUser };
