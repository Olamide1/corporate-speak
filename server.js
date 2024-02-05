require("dotenv").config();
const express = require("express");
const session = require("express-session");
/**
 * Store data in session.
 * Reset Session once payment is made.
 */

const cors = require("cors"); // Import CORS module
const app = express();
const port = process.env.PORT || 3000;

// session
const _session = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {},
};
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // trust first proxy
  _session.cookie.secure = true; // serve secure cookies
}
app.use(session(_session));

app.use(cors());
app.use(express.json());

app.use(express.static("."));

// heroku url: https://corporate-speak-b6a8f89a1523.herokuapp.com/
const _BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.NODE_ENV === "staging"
    ? "https://youreplied.com"
    : "https://youreplied.com";

const LOREM =
  "Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis dignissimos hic laborum odit ex, quas tenetur? Harum, sit obcaecati corporis modi natus voluptatibus voluptate repellendus maxime quos reiciendis, cum repudiandae.";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY_PROD, {
  apiVersion: "2022-08-01",
  appInfo: {
    // For sample support and debugging, not required for production:
    name: "stripe-checkout-corporate-speak",
    version: "0.0.1",
    //   url: "https://github.com/Olamide1/kb",
  },
});

app.post(
  "/payment",
  express.urlencoded({ extended: true }),
  async (req, res) => {
    try {
      const session = await stripe.checkout.sessions.create({
        // customer_email: newOrder.email, // maybe get from cookies
        line_items: [
          {
            price: process.env.STRIPE_PRICE_001, // test price
            quantity: 1,
          },
        ],
        mode: "payment",
        metadata: {
          //   customer_name: newOrder.name,
        },

        /**
         * {CHECKOUT_SESSION_ID} is a string literal; do not change it!
         * the actual Session ID is returned in the query parameter when your customer
         * is redirected to the success page.
         */
        success_url: `${_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${_BASE_URL}`, // failed-order
      });

      // Save the stripe session id in the stripe_session_id of an order
      req.stripe_session_id = session.id;

      console.log("going to pay");
      // 303 redirect to session.url
      res.redirect(303, session.url);
    } catch (error) {
      console.log("stripe err", error);
      res.sendStatus(500);
    }
  }
);

app.get("/success", async (req, res) => {
  const answer = req.session.answer;

  // clear session data
  req.session.answer = "";
  req.session.half_answer = "";

  res.set("Content-Type", "text/html");
  res.send(JSON.stringify(answer));
});

/* app.get("/", async (req, res) => {
  const options = {
    root: __dirname,
  };
  const fileName = "index.html";
  res.sendFile(fileName, options, function (err) {
    if (err) {
      res.json({ message: "Oops", err });
      console.error("Error sending file:", err);
    } else {
      console.log("Sent:", fileName);
    }
  });
}); */

app.post("/ask", express.json(), async (req, res) => {
  console.log("req.body", req.body);

  // Prepare the data to send to the OpenAI API
  const inputData = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `Transform the following unprofessional message into a professional, corporate-style communication suitable for email: ${req.body.message}. Please rewrite it to be formal, clear, and suitable for a professional email, ensuring that it maintains the original message's intent. In not more than 200 characters`,
      },
    ],
    max_tokens: 200, // Adjust the max tokens as needed
    temperature: 0.7, // Adjust the temperature for creativity
    n: 1, // Number of responses to generate
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPEN_AI_KEY}`, // Replace with your OpenAI API key
    "Openai-Organization": process.env.OPEN_AI_ORGANISATION_ID, // Include the Organization ID here
  };

  // Make an API request to OpenAI with the updated headers
  fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: headers,
    body: JSON.stringify(inputData),
  })
    .then((response) => response.json())
    .then((data) => {
      // Display the generated speech in the placeholder
      const generatedSpeech = data.choices[0].message.content;
      req.session.answer = generatedSpeech;

      const halfGeneratedSpeech = generatedSpeech.slice(
        0,
        Math.floor(generatedSpeech.length / 2)
      );

      const halfAnswer = halfGeneratedSpeech + `<span hide>${LOREM}</span>`;
      req.session.half_answer = halfAnswer;

      console.log("sent");
      res.send({
        say: halfAnswer,
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      res.sendStatus(500);
    });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
