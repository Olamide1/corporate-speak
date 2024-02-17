require("dotenv").config();

const crypto = require("crypto");
const express = require("express");
const session = require("express-session");
const cookieParser = require('cookie-parser')
/**
 * Store data in session.
 * Reset Session once payment is made.
 */

// https://corporate-speak-b6a8f89a1523.herokuapp.com/success

// https://youreplied.com

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
  // _session.cookie.secure = true; // serve secure cookies
}
app.use(session(_session));

const cookieOptions = {
  httpOnly: true, // so frontend js can't access
  maxAge: (1000 * 60 * 60 * 24), // 1 day
  sameSite: 'none',
  // path: '' // until we figure out how to add multiple path
}

if (process.env.NODE_ENV === 'production') {
  cookieOptions.secure = true // localhost, too, won't work if true
}
app.use(cookieParser(process.env.SESSION_SECRET, cookieOptions))

const corsOptions = {
  origin: ['https://youreplied.com'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));
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

// https://gist.github.com/aabiskar/c1d80d139f83f6a43593ce503e29964c

const encryption_key = process.env.ENCRYPTION_KEY; // Must be 32 characters
const initialization_vector = process.env.INITIALIZATION_VECTOR; // Must be 16 characters

function encrypt(text){
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryption_key), Buffer.from(initialization_vector))
  let crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

function decrypt(text){
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryption_key), Buffer.from(initialization_vector))
  let dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8')
  return dec
}

app.post(
  "/payment",
  express.urlencoded({ extended: true }),
  async (req, res) => {
    try {
      const session = await stripe.checkout.sessions.create({
        // customer_email: newOrder.email, // maybe get from cookies
        line_items: [
          {
            price: process.env.STRIPE_PRICE_70_CENTS, // stripe price id
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
        success_url: `${_BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
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

app.post("/success", express.json(), async (req, res) => {
  // const answer = req.session.answer ? req.session.answer : req.cookies.a ? decrypt(req.cookies.a) : 'Go home to ask a question.'
  const answer = req.body.answer ? decrypt(req.body.answer) : "Go home to ask a question.";

  // const question = decrypt(req.body.question)
  // clear session data
  req.session.answer = "";
  req.session.half_answer = "";

  // res.set("Content-Type", "text/html");
  // res.send(JSON.stringify(answer));

  res.send({
    // question: question,
    answer: answer
  })
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

/**
 * How do we know who's a first time asker?
 * If there's no cookie present in the request.
 * If they've cleared cookies - we can also check the body.
 */
app.post("/ask", express.json(), async (req, res) => {
  console.log("req.body", req.body);

  // Prepare the data to send to the OpenAI API
  const inputData = {
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: `Transform the following unprofessional message into a professional, corporate-style communication suitable for email: ${req.body.message}. Please rewrite it to be formal, clear, and suitable for a professional email, ensuring that it maintains the original message's intent. In not more than 200 characters`,
      },
    ],
    max_tokens: 200, // Adjust the max tokens as needed
    temperature: 1.0, // Adjust the temperature for creativity
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

      // TODO; do this better later. genSp / lorem.length - also maybe do a modulus thingy
      const halfLorem = LOREM.repeat(5).slice(0, Math.floor(generatedSpeech.length / 2))
      
      const halfAnswer = halfGeneratedSpeech;
      req.session.half_answer = halfAnswer;

      console.log("sent");

      // Hash the answer

      res.cookie('asking', crypto.randomBytes(5).toString('hex')) // 10 random numbers as identifiers??
      const encryptedAnswer = encrypt(generatedSpeech)
      res.cookie('a', encryptedAnswer)
      res.cookie('q', encrypt(req.body.message))
      res.cookie('dfk', '72*IO8cb9uOMP')

      const askedBefore = req.cookies.dfk
      
      res.send({
        say: askedBefore ? halfAnswer : generatedSpeech,
        hide: `<span hide>${halfLorem}</span>`,
        answer: encryptedAnswer
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
