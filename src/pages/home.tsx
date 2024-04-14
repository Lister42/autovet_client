import Pets from "@/components/pets";
import Image from "next/image";
import Appointments from "@/components/appointments";
import { useState } from "react";
import ProfilePage from "@/components/profilePage";
import router from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/utils/firebase";

const redirect = () => {
  router
    .push("/login")
    .then((success) => {
      if (!success) console.log(`redirect failed`);
    })
    .catch((error) => console.log(error));
  return <div></div>;
};

export default function Home() {
  const [user, userLoading, userError] = useAuthState(auth);

  const [value, setValue] = useState(1);
  if (userLoading) {
    return <div></div>;
  }

  if (userError) {
    return <div>Error loading: {userError.message}</div>;
  }

  // If user is not logged in, redirect to login page
  if (!userLoading && !user) {
    return redirect();
  }

  return (
    <div className="flex max-h-screen justify-center">
      <div className="navbar fixed z-50 bg-base-200">
        <div className="navbar-start">
          <button
            className="btn-ghost btn-circle btn"
            onClick={() => {
              setValue(0);
            }}
          >
            <Image
              alt="Pets Icon"
              src="/images/paw-icon-light.png"
              height={32}
              width={32}
            />
          </button>
        </div>
        <div className="navbar-center">
          <button
            onClick={() => {
              setValue(1);
            }}
          >
            <a className="btn-ghost btn text-xl normal-case">AutoVet</a>
          </button>
        </div>
        <div className="navbar-end">
          <button
            className="btn-ghost btn-circle btn"
            onClick={() => {
              setValue(2);
              console.log("profile");
            }}
          >
            <Image
              alt="Profile Icon"
              src="/images/profile_icon-light.png"
              height={32}
              width={32}
            />
          </button>
        </div>
      </div>
      <div className="flex w-[30rem] justify-center px-6">
        {value === 0 && <Pets />}
        {value === 1 && <Appointments />}
        {value === 2 && <ProfilePage />}
      </div>
    </div>
  );
}
