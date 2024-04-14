import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

import stripe from "stripe";
import { env } from "@/env/server.mjs";

const stripeClient = new stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export const paymentRouter = createTRPCRouter({
  intent: publicProcedure
    .input(z.object({ cost : z.number()})) //add input that has the invoice id or something
    .query(async ({input}) => {
      const customer = await stripeClient.customers.create();
      console.log(customer.id + 'created');

      const paymentIntent = await stripeClient.paymentIntents.create({
        customer: customer.id,
        setup_future_usage: "off_session",
        amount: input.cost * 100,
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
      };
    }),
});
