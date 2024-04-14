import React from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/utils/firebase";
import { type Channel } from "pusher-js";
import { notificationChannelInstance } from "@/utils/pusherUtil";
import { type AppointmentType, Status } from "@/utils/types";
import { updateDoc } from "firebase/firestore";

const CheckoutForm = (appointment: AppointmentType) => {
  const [user] = useAuthState(auth);
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [notificationChannel, setNotificationChannel] =
    React.useState<Channel>();

  React.useEffect(() => {
    async function loadChannel() {
      const nChannel = await notificationChannelInstance;
      setNotificationChannel(nChannel);
      console.log("this thing is at least loading");
    }
    void loadChannel();
  }, []);

  React.useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe
      .retrievePaymentIntent(clientSecret)
      .then(({ paymentIntent }) => {
        if (paymentIntent) {
          switch (paymentIntent.status) {
            case "succeeded":
              setMessage("Payment succeeded!");
              break;
            case "processing":
              setMessage("Your payment is processing.");
              break;
            case "requires_payment_method":
              setMessage("Your payment was not successful, please try again.");
              break;
            default:
              setMessage("Something went wrong.");
              break;
          }
        }
      })
      .catch(() => {
        setMessage("Something went wrong.");
      });
  }, [stripe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(
      "sending a notification for invoice on channel:",
      notificationChannel
    );
    notificationChannel?.trigger(
      "client-create-process-notification",
      appointment.appointment_id
    );

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    await updateDoc(appointment.appointment_ref, { status: Status.CheckedOut });

    setIsLoading(true);

    await updateDoc(appointment.appointment_ref, { status: Status.CheckedOut });

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/payment_success`,
        receipt_email: user?.email ?? "",
      },
    });

    await updateDoc(appointment.appointment_ref, {
      status: Status.InvoiceSent,
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message ?? "An unexpected error occurred.");
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      <button
        className="btn-primary btn"
        disabled={isLoading || !stripe || !elements}
        type="submit"
        id="submit"
      >
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
        </span>
      </button>
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
};

export default CheckoutForm;
