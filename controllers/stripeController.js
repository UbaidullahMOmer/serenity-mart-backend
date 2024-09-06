const asyncHandler = require("express-async-handler");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const createPaymentIntent = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    console.log('Received amount:', amount);
  
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "usd",
      });
      console.log('Payment intent created:', paymentIntent.id);
      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error('Stripe error:', error);
      res.status(500).json({ error: error.message });
    }
  });

module.exports = { createPaymentIntent };