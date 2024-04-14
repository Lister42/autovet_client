import { auth, clientConverter, firestore } from "@/utils/firebase";
import { useState } from "react";
import { useSignInWithEmailLink } from "react-firebase-hooks/auth";
import {
  addDoc,
  collection,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

const CreateAccount = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [signInWithEmailLink, user, auth_loading, auth_error] =
    useSignInWithEmailLink(auth);

  if (auth_loading) {
    return <p>Loading...</p>;
  }
  if (user) {
    return (
      <div>
        <p>Signed In User: {user.user.email}</p>
      </div>
    );
  }
  return (
    <div>
      <div className="flex h-screen">
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        ></link>

        <div className="hero bg-base-200 px-6 py-12 shadow-xl">
          <div className="hero-content flex-col lg:flex-row-reverse">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl font-bold">AutoVet Signup</h1>
              <p className="py-6">
                Welcome to Slippery Rock Veterinarian Hospital Curbside Service!
              </p>
              {/* {user ? (
                <p className="text-lg font-medium">
                  Logged in as {user.user.email}
                </p>
              ) : null} */}
            </div>
            <div className="card w-full max-w-sm flex-shrink-0 bg-base-100 shadow-2xl">
              <div className="card-body">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const success = await signInWithEmailLink(
                    email,
                    window.location.href
                  );
                  if (success) {
                    // TODO: import data from autovet
                    const email = success.user.email ?? "";

                    const docs = await getDocs(
                      query(
                        collection(firestore, "client").withConverter(
                          clientConverter
                        ),
                        where("email", "==", email)
                      )
                    );

                    if (docs.docs[0]) {
                      await updateDoc(docs.docs[0].ref, {
                        uid: success.user.uid,
                      });
                    } else {
                      const ref = await addDoc(collection(firestore, "client"), {
                        uid: success.user.uid,
                      });

                      await setDoc(ref.withConverter(clientConverter), {
                        uid: success.user.uid,
                        first_name: "",
                        last_name: "",
                        email: email,
                        phone_number: "",
                        DOB: new Date(),
                        primary_address: "",
                        secondary_address: "",
                        refferal: "",
                        co_owner: "",
                        co_owner_phone_number: "",
                        employer: "string",
                        trusted_persons: "",
                        client_ref: ref,
                      });
                    }

                    alert(`Signed in as ${email}`);
                  }
                }}>
                  <div className="form-control">
                    <label className="label" htmlFor="loginEmail">
                      <span className="label-text">Set Email</span>
                    </label>
                    <input
                      className="input-bordered input"
                      placeholder="Email"
                      type="email"
                      value={email}
                      required={true}
                      autoComplete="email"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label" htmlFor="loginPassword">
                      <span className="label-text">Set Password</span>
                    </label>
                    <input
                      className="input-bordered input"
                      placeholder="Password"
                      type="password"
                      value={password}
                      required={true}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {/* <label className="label">
                      <a 
                        onClick={() => sendPasswordResetEmail(email, { url: "http://localhost:3001" })} 
                        className="label-text-alt link link-hover">Forgot password?
                      </a>
                    </label> */}
                  </div>
                  <div className="form-control mt-6">
                    <button type="submit" className="btn-primary btn">
                      Create Account
                    </button>
                  </div>
                </form>
                {auth_error && <p>Error: {auth_error.message}</p>}
                {auth_error &&
                  (auth_error.message.includes("auth/argument-error") ||
                    auth_error.message.includes("auth/invalid-email")) && (
                    <p>Please enter a valid email</p>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
