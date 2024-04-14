import { auth } from "@/utils/firebase";
import {
  useSendPasswordResetEmail,
  useSignInWithEmailAndPassword,
} from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { AuthError } from "firebase/auth";

const LoginPage = () => {
  const router = useRouter();
  const [signInWithEmailAndPassword, user, user_loading, user_error] =
    useSignInWithEmailAndPassword(auth);

  const [sendPasswordResetEmail, reset_loading, reset_error] =
    useSendPasswordResetEmail(auth);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    router.prefetch("/home").catch((err) => console.log(err));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(email, password);
      if (userCredential) {
        const result = await router.push("/home");
        if (!result) console.log("error pushing to home");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex h-screen">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      ></link>

      <div className="hero bg-base-200 px-6 py-12 shadow-xl">
        <div className="hero-content flex-col lg:flex-row-reverse">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl font-bold">AutoVet</h1>
            <p className="py-6">
              Slippery Rock Veterinarian Hospital Curbside Service
            </p>
            {user ? (
              <p className="text-lg font-medium">
                Logged in as {user.user.email}
              </p>
            ) : null}
          </div>
          <div className="card w-full max-w-sm flex-shrink-0 bg-base-100 shadow-2xl">
            <div className="card-body">
              <form onSubmit={onSubmit}>
                <div className="form-control">
                  <label className="label" htmlFor="loginEmail">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    className="input-bordered input w-full"
                    id="loginEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    placeholder="Email address"
                  />
                </div>
                <div className="form-control">
                  <label className="label" htmlFor="loginPassword">
                    <span className="label-text">Password</span>
                  </label>
                  <input
                    className="input-bordered input w-full"
                    id="loginPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Password"
                  />
                  <label className="label">
                    <a
                      onClick={() =>
                        sendPasswordResetEmail(email, {
                          url: "http://autovet.gcc.edu:8080",
                        })
                      }
                      className="link-hover label-text-alt link"
                    >
                      Forgot password?
                    </a>
                  </label>
                </div>
                <div className="form-control mt-6">
                  <button type="submit" className="btn-primary btn">
                    Login
                  </button>
                </div>
              </form>
              {user_loading && <p>Loading...</p>}
              {user_error && user_error.code === "auth/user-not-found" && (
                <p>Email not found</p>
              )}
              {user_error && user_error.code === "auth/wrong-password" && (
                <p>Wrong password, please try again.</p>
              )}
              {reset_loading && <p>Loading...</p>}
              {reset_error &&
              (reset_error as AuthError).code === "auth/user-not-found" ? (
                <p>Email not found</p>
              ) : reset_error ? (
                <p>Error sending reset email.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
