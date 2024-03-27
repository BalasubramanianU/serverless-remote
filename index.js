const functions = require('@google-cloud/functions-framework');

const {Sequelize} = require('sequelize');

console.log(process.env.DBNAME, process.env.USERNAME, process.env.PASSWORD, process.env.SQLHOST);

// Configure Sequelize to connect to your Cloud SQL instance
const sequelize = new Sequelize(process.env.DBNAME, process.env.USERNAME, process.env.PASSWORD, {
  host: process.env.SQLHOST,
  dialect: 'mysql', // or 'mysql' depending on your database
  // For Cloud SQL, using a private IP, additional options might be required
  // dialectOptions: {
  //   // For Google Cloud SQL, using SSL is recommended
  //   ssl: {
  //     // SSL configuration options
  //   }
  // }
});

// Example function to interact with the database
async function insertIntoDb() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    // Add your Sequelize code here to interact with your database
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}


// Register a CloudEvent callback with the Functions Framework that will
// be executed when the Pub/Sub trigger topic receives a message.
functions.cloudEvent('helloPubSub',async (cloudEvent) => {
  // The Pub/Sub message is passed as the CloudEvent's data payload.
  // const base64name = cloudEvent.data.message.data;
  console.log("cloud event dataaa",cloudEvent.data);
  console.log('env variables', process.env.DBNAME, process.env.SQLHOST);
const messageData = cloudEvent.data.message.data
    ? Buffer.from(cloudEvent.data.message.data, 'base64').toString() // Decodes the data
    : null;

  if (messageData) {
    // Now, 'messageData' contains the original stringified JSON, so parse it
    const data = JSON.parse(messageData);
    
    console.log('Decoded message data:', data);
    // You can now use 'data' as the original object
  } else {
    console.log('No message data!');
  }

  // const name = base64name
  //   ? Buffer.from(base64name, 'base64').toString()
  //   : 'World';

  // console.log(`Hello, ${name}!`);

  await insertIntoDb();

  const API_KEY = '7b158d3bc71e6dd69b0dfddd30ca6fd3-f68a26c9-d3297acd';
  const DOMAIN_NAME = 'cloudnativewebapp.me';

  const formData = require('form-data');
  const Mailgun = require('mailgun.js');

  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({username: 'api', key: API_KEY});

  const msgData = {
    from: 'Excited User <mailgun@cloudnativewebapp.me>',
    to: 'ubalasubramanian03@gmail.com',
    subject: 'Cloud fn test',
    text: 'Testing mailgun'
  }

  mg.messages.create(DOMAIN_NAME, msgData)
    .then((res)=>{
      console.log(res);
    })
    .catch((err)=>{
      console.error(err);
    })
});