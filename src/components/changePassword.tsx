import { auth } from "@/utils/firebase";
import { useState } from "react";
import { useUpdatePassword } from "react-firebase-hooks/auth";

export default function ChangePassword() {
  const [newPassword, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChangedMsg, setMsg] = useState("");

  const [updatePassword, updating, error] = useUpdatePassword(auth);

  async function confirmChange() {
    try {
      if (newPassword) {
        if (newPassword === confirmPassword) {
          if (await updatePassword(newPassword)) {
            setMsg("Password has been changed.");
          } else {
            setMsg("Password could not be changed, you may need to login.");
          }
        } else {
          setMsg("Passwords do not match.");
        }
      }
    } catch {
      setMsg("Cannot change password.  You may need to re-login.");
    }
  }

  return (
    <div>
      <p>
        <input
          className="input-bordered input"
          placeholder="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setPassword(e.target.value)}
        />
      </p>
      <p>
        <input
          className="input-bordered input"
          placeholder="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </p>
      {newPassword != confirmPassword && (
        <p className="text-red-400">Passwords do not match.</p>
      )}
      <div className="card-actions col-start-3 self-center justify-self-end p-8">
        <button onClick={confirmChange} className="btn-md btn" type="submit">
          Change Password
        </button>
        {passwordChangedMsg && <p>{passwordChangedMsg}</p>}
        {!updating && error && <p>{error.message}</p>}
      </div>
    </div>
  );
}
