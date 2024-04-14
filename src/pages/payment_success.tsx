import { useRouter } from "next/router";
import { useEffect } from "react";

const PaymentSuccess = () => {
  const router = useRouter();
  const redirectStatus = router.query.redirect_status || "failed";
  useEffect(() => {
    router.prefetch("/home").catch((error) => console.log(error));
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      {redirectStatus === "succeeded" ? (
        <div className="rounded-md bg-neutral p-10 shadow-md">
          <h1 className="mb-4 text-3xl font-bold">Payment Successful</h1>
          <p className="mb-4">Your payment was processed successfully.</p>
          <button
            className="btn-primary btn"
            onClick={() => router.push("/home")}
          >
            Return to Home
          </button>
        </div>
      ) : (
        <div className="rounded-md bg-neutral p-10 shadow-md">
          <h1 className="mb-4 text-3xl font-bold">Payment Failed</h1>
          <p className="mb-4">Your payment was not processed successfully.</p>
          <button
            className="btn-primary btn"
            onClick={() => router.push("/home")}
          >
            Return to Home
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;
