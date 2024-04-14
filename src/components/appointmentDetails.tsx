import { useState } from "react";
import type { AppointmentType } from "@/utils/types";
import { Status } from "@/utils/types";
import Checkin from "@/components/checkin";
import Checkout from "@/components/checkout";
import ChatBox from "@/components/chatBox";
import { CallVetButton } from "./appointments";
import StatusView from "./status";

export default function AppointmentDetails(appointment: AppointmentType) {
  const [checkin, setCheckin] = useState(false);

  const [checkout, setCheckout] = useState(false);

  function render() {
    if (appointment != null) {
      return (
        <div className="mt-3" key={appointment.appointment_id}>
          <div className="flex justify-between">

          <b>{appointment.reason}</b>
          
          <StatusView className="" status={appointment.status} />
          </div>
          <hr></hr>
          <p className="text-sm">{appointment.date.toLocaleString()}</p>

          {/* Client Action Buttons */}
          <div className="my-2">
            <div className="mb-2">
              <CallVetButton text="Call" />
            </div>

            {appointment.status === Status.NotCheckedIn ? (
              !checkin ? (
                <button
                  type="button"
                  className="btn-success btn-block btn hover:scale-[0.98]"
                  onClick={() => setCheckin(true)}
                >
                  Check in
                </button>
              ) : (
                <button
                type="button" className="btn-error btn w-full" onClick={() => setCheckin(false)}> cancel</button>
              )
            ) : undefined}

            {appointment.status == Status.InvoiceSent ? (
              !checkout ? (
                <button
                type="button"
                  className="btn-success btn w-full"
                  onClick={() => setCheckout(true)}
                >
                  Check out
                </button>
              ) : (
                <button
                type="button" className="btn-error btn w-full" onClick={() => setCheckout(false)}> cancel</button>
              )
            ) : undefined}

            {checkin ? (
              <div>
                <Checkin
                  appointment={appointment}
                  setCheckin={() => setCheckin(false)}
                />
              </div>
            ) : checkout ? (
              <div>
                <Checkout appointment={appointment} />
              </div>
            ) : (
              <ChatBox appointmentID={appointment?.appointment_id} />
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <h1>
            <b>Error</b>
          </h1>
        </div>
      );
    }
  }

  return render();
}
