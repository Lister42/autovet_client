import Checkin from "@/components/checkin";
import { ref as storageRef } from "firebase/storage";
import { petConverter, storage } from "../utils/firebase";
import type { AppointmentType } from "@/utils/types";
import { Status } from "@/utils/types";
import { useDocumentDataOnce } from "react-firebase-hooks/firestore";
import { useEffect, useState } from "react";
import {
  appointmentNotificationList,
  notificationChannelInstance,
  observedAppointmentChannels,
} from "@/utils/pusherUtil";

import { setDoc } from "firebase/firestore";
import Image from "next/image";
import Checkout from "@/components/checkout";
import StatusView from "@/components/status";
import { useDownloadURL } from "react-firebase-hooks/storage";

interface Props {
  appointment: AppointmentType;
  lock?: () => void;
  unlock?: () => void;
}

export default function Appointment({ appointment, lock, unlock }: Props) {
  //Ideally, this value is cached and accessed, not fetched every time it loads.
  const [pet] = useDocumentDataOnce(
    appointment.pet.withConverter(petConverter)
  );

  const storage_ref = (pet ? storageRef(
    storage,
    `images/pets/${pet.pet_ref.id}`
   ) : undefined);

  const [image_url, image_loading, image_error] = useDownloadURL(storage_ref);

  const [checkin, setCheckin] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [addNotification, setAddNotification] = useState(Date.now());
  const [curApptID, setCurApptID] = useState<string>();
  const [, updateNotifUpdater] = useState(Date.now());
  const [change, updatePage] = useState(false);

  //Funny logic to enforce it only runs once
  useEffect(() => {
    //ALSO, just so it's known, messageNotifications is not actually used...
    if (curApptID) {
      if (!(curApptID in observedAppointmentChannels)) {
        //So appointment notifications and message notifications should only be updated
        appointmentNotificationList[curApptID] = {
          apptID: curApptID,
          appointmentNotifications:
            (appointmentNotificationList[curApptID]?.appointmentNotifications ??
              0) + 1,
          messageNotifications:
            (appointmentNotificationList[curApptID]?.messageNotifications ??
              0) + 1,
          hasCompletedProcessStep: false,
        };
        updateNotifUpdater(Date.now());
        //do stuff to make sure the new messages have red icons beside them
      } //If user has viewed appointment at some point but left
      else if (
        curApptID in observedAppointmentChannels &&
        !observedAppointmentChannels[curApptID]
      ) {
        appointmentNotificationList[curApptID] = {
          apptID: curApptID,
          appointmentNotifications:
            (appointmentNotificationList[curApptID]?.appointmentNotifications ??
              0) + 1,
          messageNotifications:
            (appointmentNotificationList[curApptID]?.messageNotifications ??
              0) + 1,
          hasCompletedProcessStep: false,
        };
        updateNotifUpdater(Date.now());
        //do stuff to make sure the new messages have red icons beside them
      }
      //Then user is currently viewing the appointment that received the notification
      else if (observedAppointmentChannels[curApptID]) {
        appointmentNotificationList[curApptID] = {
          apptID: curApptID,
          appointmentNotifications:
            appointmentNotificationList[curApptID]?.appointmentNotifications ??
            0,
          messageNotifications:
            appointmentNotificationList[curApptID]?.messageNotifications ?? 0,
          hasCompletedProcessStep: false,
        };
        updateNotifUpdater(Date.now());
        //If we want then, this logic allows us to do special effects on messages as they appear. Might need to do some fancy work tho to talk with chatBox.
      }
    } else {
      console.log("Appointment ID was undefined", curApptID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addNotification]);

  useEffect(() => {
    async function handleNotification() {
      const nChannel = await notificationChannelInstance;
      nChannel.bind("client-create-message-notification", (apptID: string) => {
        //Only send a notification if you are the associated appointment (since it will call on all the listed appointments)
        if (apptID == appointment.appointment_id) {
          const randomAddTrigger = Date.now();
          //will always increment so it will always update
          setAddNotification(randomAddTrigger);
          setCurApptID(apptID);
        }
      });
    }
    void handleNotification();

    if (
      isCloseEnoughInTimeToCheckIn(appointment.date) &&
      appointment.status == "upcoming"
    ) {
      updateFromUpcomingToNotCheckedIn();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function setStatus(newStatus: string) {
    updatePage(!change);
    await setDoc(
      appointment.appointment_ref,
      { status: newStatus },
      { merge: true }
    );
  }

  const isCloseEnoughInTimeToCheckIn = (date: Date): boolean => {
    const now = new Date();
    //less than 5 minutes away or past the current time
    return (
      Date.now() - date.getTime() <= 5 * 60 * 1000 ||
      date.getTime() < now.getTime()
    );
  };

  function updateFromUpcomingToNotCheckedIn() {
    void setStatus("not_checked_in");
  }

  return (
    <div className="my-2" key={appointment.appointment_id}>
      <div className="card w-full border border-slate-700 bg-neutral shadow-xl transition duration-100 ease-in-out hover:scale-[0.99] hover:shadow-2xl hover:brightness-125">
        {/*Make sure to only display notifications if there are currently more than 0*/}
        {(appointmentNotificationList[appointment.appointment_id]
          ?.appointmentNotifications ?? 0) > 0 ? (
          <div className="indicator-end indicator-item">
            <div className="relative inline-flex h-5 w-5 justify-center rounded-full bg-red-600 pt-0.5">
              {appointmentNotificationList[appointment.appointment_id]
                ?.appointmentNotifications ?? 0}
            </div>
          </div>
        ) : (
          <></>
        )}
        <div className="card-body p-4">
          <StatusView className="text-center" status={appointment.status} />

          <div className="mb-1">
            <h2 className="border-b pb-1 card-title">{appointment.reason}</h2>
            <p className="text-sm card-subtitle">
              {appointment.date.toLocaleDateString()}{" "}
              {appointment.date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          
          <div className="grid grid-cols-2">
            <div>
              <div className="avatar">
                <div className="rounded-full">
                  <Image src={!image_loading && !image_error && image_url ? image_url : "/images/paw_icon.png"} alt="pet image" width={64} height={64} />
                </div>
              </div>
              <h2 className="card-title">{pet ? pet.name : ""}</h2>
            </div>

            {/* Checkin Button */}
            <div className="flex flex-col">
            <div className="flex-grow"></div>
              <div>
              {appointment.status === Status.NotCheckedIn ? (
                !checkin ? (
                  <div className="card-actions col-start-3 self-end justify-self-end">
                    <button
                      onClick={(e: React.FormEvent<EventTarget>) => {
                        e.stopPropagation();
                        setCheckin(true);
                        lock && lock();
                      }}
                      className="btn-success btn-md btn"
                    >
                      Check In
                    </button>
                  </div>
                ) : (
                  <div className="card-actions col-start-3 self-center justify-self-end">
                    <button
                      type="button"
                      className="btn-error btn-md btn"
                      onClick={(e: React.FormEvent<EventTarget>) => {
                        e.stopPropagation();
                        setCheckin(false);
                        unlock && unlock();
                      }}
                    >
                      {" "}
                      Cancel
                    </button>
                  </div>
                )
              ) : appointment.status === Status.CheckedIn ? (
                <div className="card-actions col-start-3 self-center justify-self-end">
                  <button className="btn-accent btn-md btn">Current</button>
                </div>
              ) : appointment.status === Status.Upcoming ? (
                <div className="card-actions col-start-3 self-center justify-self-end">
                  <button className="btn-disabled btn-md btn">Upcoming</button>
                </div>
              ) : appointment.status === Status.InvoiceSent ? (
                !checkout ? (
                  <div className="card-actions col-start-3 self-center justify-self-end">
                    <button
                      type="button"
                      onClick={(e: React.FormEvent<EventTarget>) => {
                        e.stopPropagation();
                        setCheckout(true);
                        lock && lock();
                      }}
                      className="btn-info btn-md btn"
                    >
                      Check Out
                    </button>
                  </div>
                ) : (
                  <div className="card-actions col-start-3 self-center justify-self-end">
                    <button
                      type="button"
                      className="btn-error btn-md btn"
                      onClick={() => setCheckout(false)}
                    >
                      {" "}
                      cancel
                    </button>
                  </div>
                )
              ) : null}
              </div>
            </div>
          </div>

            {checkin ? (
              <div className="row-start-2">
                <div className="">
                  <Checkin
                    appointment={appointment}
                    setCheckin={() => {
                      setCheckin(false);
                      unlock && unlock();
                    }}
                  />
                </div>
              </div>
            ) : checkout ? (
              <div className="col-span-full row-start-2">
                <div className="">
                  <Checkout appointment={appointment} />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
  );
}
