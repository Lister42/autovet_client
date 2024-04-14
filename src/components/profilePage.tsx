import EditProfile from "@/components/editProfile";
import Profile from "@/components/profileDetails";
import ChangePassword from "@/components/changePassword";
import { useState } from "react";
import { firestore, clientConverter, auth } from "@/utils/firebase";
import { query, collection, where } from "firebase/firestore";
import { useCollectionDataOnce } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import PastAppointments from "./pastAppointments";

export default function ProfilePage() {
  const [user] = useAuthState(auth);
  const [clients] = useCollectionDataOnce(
    query(
      collection(firestore, "client").withConverter(clientConverter),
      where("uid", "==", user ? user.uid : "")
    )
  );
  const client = clients ? clients[0] : null;
  const [editMode, setEdit] = useState<boolean>(false);
  const [value, setValue] = useState(1);

  function toggleEdit() {
    setEdit(!editMode);
  }

  function profileTab() {
    setValue(1);
  }
  function changePasswordTab() {
    setValue(2);
  }

  function pastAppointmentsTab() {
    setValue(3);
  }

  return (
    <div>
      <div className="tabs content-center p-4 pt-20">
        <div
          onClick={profileTab}
          className={`tab tab-bordered${value == 1 ? `tab-active` : ``}`}
        >
          Profile
        </div>
        <div
          onClick={changePasswordTab}
          className={`tab tab-bordered${value == 2 ? `tab-active` : ``}`}
        >
          Password
        </div>
        <div
          onClick={pastAppointmentsTab}
          className={`tab tab-bordered${value == 3 ? `tab-active` : ``}`}
        >
          History
        </div>
      </div>

      {client ? (
        <div className="scroll-behavior-auto p-8">
          {value == 1 && !editMode && <Profile {...client} />}
          {/* {value == 1 && editMode && <EditProfile {...client} />} */}
          {value == 2 && <ChangePassword />}
          {value == 3 && <PastAppointments />}
        </div>
      ) : (
        <></>
      )}

      {/* {value == 1 && (
        <div className="card-actions col-start-3 self-center justify-self-end p-8">
          <button onClick={toggleEdit} className="btn-md btn">
            {!editMode ? "Edit" : "Profile"}
          </button>
        </div>
      )} */}
    </div>
  );
}
