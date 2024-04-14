import { collection, query, where } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { appointmentConverter, auth, firestore } from "@/utils/firebase";
import Appointment from "@/components/appointment";
import { useAuthState } from "react-firebase-hooks/auth";
import type { AppointmentType } from "@/utils/types";
import { useState } from "react";
import AppointmentDetails from "./appointmentDetails";

export default function PastAppointments() {
  const [user] = useAuthState(auth);
  const [appointments] = useCollectionData(
    query(
      collection(firestore, "appointment").withConverter(appointmentConverter),
      where("client_id", "==", user ? user.uid : ""),
      where("status", "==", "closed")
    ),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  const [appointment, setAppointment] = useState<AppointmentType>();

  return (
    <div>
      <div className="flex justify-center">
        <ul className="overflow-auto">
          {appointment ? (
            <div>
              <div className="float-right">
                <button
                  className="btn-error btn"
                  onClick={() => setAppointment(undefined)}
                >
                  <b>x</b>
                </button>
              </div>
              <AppointmentDetails {...appointment} />
            </div>
          ) : appointments ? (
            appointments
              .sort(
                (a, b) => a.date.getMilliseconds() - b.date.getMilliseconds()
              )
              .map((appointment) => (
                <div key={appointment.appointment_id}>
                  <Appointment appointment={appointment} />
                </div>
              ))
          ) : (
            <></>
          )}
        </ul>
      </div>
    </div>
  );
}
