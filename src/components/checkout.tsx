import { type AppointmentType } from "@/utils/types";
import { loadStripe } from "@stripe/stripe-js";
import { env } from "@/env/client.mjs";
import { api } from "@/utils/api";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "@/components/paymentForm";

const stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

interface Props {
  appointment: AppointmentType;
}

const Checkout = ({ appointment }: Props) => {
  const query = api.payment.intent.useQuery({ cost: appointment.cost || 0 });
  return (
    <div>
      <h1>Checkout</h1>
      <p>${appointment.cost} is due today</p>

      {query.data && query.data.clientSecret ? (
        <Elements
          options={{
            clientSecret: query.data.clientSecret,
            appearance: {
              theme: "night",
            },
          }}
          stripe={stripePromise}
        >
          <PaymentForm {...appointment} />
        </Elements>
      ) : (
        <div>loading...</div>
      )}
    </div>
  );
};

export default Checkout;
