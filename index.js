const functions = require("@google-cloud/functions-framework");

const formData = require("form-data");
const Mailgun = require("mailgun.js");
const { Sequelize } = require("sequelize");
const User = require("./models/user");

async function updateUserAndSendEmail(username, verificationUrl) {
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      console.error("user not found");
      throw new Error(`User not found: ${username}`);
    }

    const tokenExpiration = new Date(new Date().getTime() + 2 * 60000); // 2 minutes from now
    await user.update({
      token_expiration: tokenExpiration,
      email_sent: true,
      email_sent_at: new Date(),
    });

    const API_KEY = "7b158d3bc71e6dd69b0dfddd30ca6fd3-f68a26c9-d3297acd";
    const DOMAIN_NAME = "cloudnativewebapp.me";

    // Initialize Mailgun
    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({
      username: "api",
      key: API_KEY,
    });

    const msgData = {
      from: "Verify your account <mailgun@cloudnativewebapp.me>",
      to: username,
      subject: "Verification Link",
      text: `Please verify your email by clicking on the link: ${verificationUrl}. This link will expire in 2 minutes.`,
    };

    mg.messages
      .create(DOMAIN_NAME, msgData)
      .then((res) => {
        console.log(res);
        console.log(`Email sent to ${username}`);
      })
      .catch((err) => {
        console.error(err);
      });
  } catch (error) {
    console.error("Error in updateUserAndSendEmail:", error);
  }
}

// Register a CloudEvent callback with the Functions Framework that will
// be executed when the Pub/Sub trigger topic receives a message.
functions.cloudEvent("helloPubSub", async (cloudEvent) => {
  // The Pub/Sub message is passed as the CloudEvent's data payload.
  const messageData = cloudEvent.data.message.data
    ? Buffer.from(cloudEvent.data.message.data, "base64").toString() // Decodes the data
    : null;

  if (messageData) {
    const data = JSON.parse(messageData);
    console.log("Decoded message data:", data);
    await updateUserAndSendEmail(data.username, data.verificationUrl);
  } else {
    console.log("No message data!");
  }
});
