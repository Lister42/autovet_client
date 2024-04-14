import { collection, query, where } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { appointmentConverter, auth, firestore } from "@/utils/firebase";
import Appointment from "@/components/appointment";
import AppointmentDetails from "@/components/appointmentDetails";
import { useAuthState } from "react-firebase-hooks/auth";
import { useState } from "react";
import { type AppointmentType, Status } from "@/utils/types";
import {
  appointmentNotificationList,
  observedAppointmentChannels,
} from "@/utils/pusherUtil";

type callProps = {
  text: string;
};
export function CallVetButton(props: callProps) {
  return (
    <div>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      ></link>
      <button
        onClick={() => {
          window.location.href = "tel:+7247948545";
        }}
        className="justify-right btn-success btn-block btn hover:scale-[0.99]"
      >
        <b>
          {props.text}
          <i className="fa fa-phone ml-3"></i>
        </b>
      </button>
    </div>
  );
}

export default function Appointments() {
  const [user] = useAuthState(auth);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentType>();
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>();
  const [lock, setLock] = useState<string>();
  const [appointments, loadingAppointments] = useCollectionData(
    query(
      collection(firestore, "appointment").withConverter(appointmentConverter),
      where("client_id", "==", user ? user.uid : "")
    ),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  function resetNotifications(apptID: string) {
    //if apptID is not in the appointmentNotificationList
    if (!(apptID in appointmentNotificationList)) {
    } else {
      appointmentNotificationList[apptID] = {
        apptID: apptID,
        appointmentNotifications: 0,
        messageNotifications:
          (appointmentNotificationList[apptID]?.messageNotifications ?? 0) + 1,
        hasCompletedProcessStep: false,
      };
    }
  }

  function resetSelectedAppointment() {
    setSelectedAppointment(undefined);
    if (selectedAppointmentId)
      observedAppointmentChannels[selectedAppointmentId] = false;
    setSelectedAppointmentId("");
  }

  return (
    <div>
      <div className="z-30 flex justify-center pt-20">
        {/* {Either load the list of appointments, or load the currently viewed appointment} */}
        {appointments && selectedAppointment ? (
          <div>
            <button
              className="btn-primary btn-block btn hover:scale-[0.98]"
              onClick={() => resetSelectedAppointment()}
            >
              <b>{"<"} Back to appointments</b>
            </button>
            <AppointmentDetails {...(appointments.find(
                (x) => x.appointment_id == selectedAppointmentId
              ) || selectedAppointment)} />
          </div>
        ) : (
          <div>
            <CallVetButton text="Schedule an appointment" />
            <ul>
              {/* {List Appointments} */}
              {appointments && appointments.length !== 0 ? (
                appointments
                  .sort((a, b) => b.date.getTime() - a.date.getTime()) //sort in order of date
                  .filter((app) => (app.status !== Status.Closed)) //figure out how to implement status on client
                  .map((app) => {
                    return (
                      <li
                        // className={`${lock === app.appointment_id ?  'hpointer-events-none': ''}`}
                        key={app.appointment_id}
                        onClick={
                          lock != app.appointment_id
                            ? () => {
                                setSelectedAppointment(app);
                                setSelectedAppointmentId(app.appointment_id);
                                resetNotifications(app.appointment_id);
                              }
                            : undefined
                        }
                      >
                        <Appointment
                          appointment={app}
                          lock={() => setLock(app.appointment_id)}
                          unlock={() => setLock(undefined)}
                        />
                      </li>
                    );
                  })
              ) : loadingAppointments ? (
                <p className="animate-pulse text-lg">Loading...</p>
              ) : (
                <p className="text-lg">No Appointments</p>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
