import { auth, clientConverter, firestore } from "@/utils/firebase";
import { addDoc, collection, updateDoc } from "firebase/firestore";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthState } from "react-firebase-hooks/auth";
import type {} from "@/utils/types";
import { type AppointmentType, Status } from "@/utils/types";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useDocumentDataOnce } from "react-firebase-hooks/firestore";
import { notificationChannelInstance } from "@/utils/pusherUtil";
import { type Channel } from "pusher-js";

const schema = z.object({
  parked_somewhere_else: z.string().optional(),
  spot: z.coerce.number().nonnegative().int(),
  name: z.string().min(2, "Name should have at least 2 alphabets"),
  primary_phone: z
    .string()
    .regex(/^\d{10}$/, "Please enter a valid phone number"), // phone number must be 10 digits
  email: z.string().email("Please enter a valid email"), // email must be valid
  primary_address: z.string(),
  secondary_address: z.string().optional(),
  employer: z.string(),
  coowner: z.string().optional(),
  coowner_phone: z.union([
    z.string().length(0),
    z
      .string()
      .regex(/^\d{10}$/, "please enter a valid phone number")
      .optional(),
  ]),
  notes: z.string().optional(),
});

type SchemaType = z.infer<typeof schema>;

interface Props {
  appointment: AppointmentType;
  setCheckin: () => void;
}

const Checkin = ({ appointment, setCheckin }: Props) => {
  const [user] = useAuthState(auth);
  const [client] = useDocumentDataOnce(
    appointment.client.withConverter(clientConverter)
  );
  const [notificationChannel, setNotificationChannel] = useState<Channel>();
  const { register, setValue, handleSubmit, formState } = useForm<SchemaType>({
    resolver: zodResolver(schema),
  });
  const [parked, setParked] = useState<boolean>(false);

  const onSubmit: SubmitHandler<SchemaType> = async (data) => {
    if (!user) return;

    // TODO: write to firestore, provide data to admin somehow
    const docRef = await addDoc(collection(firestore, "checkin_data"), {
      parked_somewhere_else: data.parked_somewhere_else ?? "",
      spot: data.spot,
      name: data.name,
      primary_phone: data.primary_phone,
      email: data.email,
      primary_address: data.primary_address,
      secondary_address: data.secondary_address,
      employer: data.employer,
      coowner: data.coowner,
      coowner_phone: data.coowner_phone,
      notes: data.notes,
      uid: user.uid,
      appointment_ref: appointment.appointment_ref,
    });

    console.log("Document written with ID: ", docRef.id);

    await updateDoc(appointment.appointment_ref, {
      status: Status.Waiting,
    });

    setCheckin && setCheckin();

    console.log("sending a notification on channel:", notificationChannel);
    notificationChannel?.trigger(
      "client-create-process-notification",
      appointment.appointment_id
    );
  };

  useEffect(() => {
    if (client) {
      setValue("name", `${client.first_name} ${client.last_name}`);
      setValue("primary_phone", client.phone_number);
      // setValue("work_phone", client);
      setValue("email", client.email);
      setValue("primary_address", client.primary_address);
      setValue("secondary_address", client.secondary_address);
      setValue("employer", client.employer);
      setValue("coowner", client.co_owner);
      setValue("coowner_phone", client.co_owner_phone_number);
      setValue("notes", appointment.notes);
    }
  }, [client, appointment, setValue]);

  useEffect(() => {
    async function loadChannel() {
      const nChannel = await notificationChannelInstance;
      setNotificationChannel(nChannel);
    }
    void loadChannel();
  }, []);

  return (
    <div className="mt-3">
      <h1 className="text-center text-xl mb-2">Check In</h1>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>

      <label className="input-group mb-2 input-group-vertical">
          <span>
            <b>Spot #</b>
          </span>
          <input
            className={`input${formState.errors.spot ? ` input-error` : ``}`}
            id="spot"
            type="number"
            {...register("spot", { required: true })}
            placeholder="Spot #"
          />
      </label>
      {formState.errors.spot ? <p>{formState.errors.spot.message}</p> : null}

      <label className="input-group mb-2 input-group-vertical">
          <span>
            <b>Name</b>
          </span>
          <input
            className={`input${formState.errors.name ? ` input-error` : ``}`}
            id="name"
            type="text"
            {...register("name", { required: true })}
            placeholder="Name"
          />
      </label>
      {formState.errors.name ? <p>{formState.errors.name.message}</p> : null}

      <label className="input-group mb-2 input-group-vertical">
          <span>
            <b>Primary Phone</b>
          </span>
          <input
            className={`input${
              formState.errors.primary_phone ? ` input-error` : ``
            }`}
            id="primary_phone"
            type="tel"
            {...register("primary_phone", { required: true })}
            placeholder="Primary Phone"
          />
      </label>
      {formState.errors.primary_phone ? (
          <p>{formState.errors.primary_phone.message}</p>
        ) : null}

      <label className="input-group mb-2 input-group-vertical">
          <span>
            <b>Email</b>
          </span>
          <input
            className={`input${formState.errors.email ? ` input-error` : ``}`}
            id="email"
            type="email"
            {...register("email", { required: true })}
            placeholder="Email"
          />
      </label>
      {formState.errors.email ? (
          <p>{formState.errors.email.message}</p>
        ) : null}

      <label className="input-group mb-2 input-group-vertical">
          <span>
            <b>Primary Address</b>
          </span>
          <input
            className={`input${
              formState.errors.primary_address ? ` input-error` : ``
            }`}
            id="primary_address"
            type="text"
            {...register("primary_address", { required: true })}
            placeholder="Primary Address"
          />
      </label>
      {formState.errors.primary_address ? (
          <p>{formState.errors.primary_address.message}</p>
        ) : null}

      <label className="input-group mb-2 input-group-vertical">
          <span>
            <b>Secondary Address</b>
          </span>
          <input
            className={`input${
              formState.errors.secondary_address ? ` input-error` : ``
            }`}
            id="secondary_address"
            type="text"
            {...register("secondary_address")}
            placeholder="Secondary Address"
          />
      </label>
        {formState.errors.secondary_address ? (
          <p>{formState.errors.secondary_address.message}</p>
        ) : null}

        <label className="input-group mb-2 input-group-vertical">
          <span>
            <b>Employer</b>
          </span>
          <input
            className={`input${formState.errors.employer ? ` input-error` : ``}`}
            id="employer"
            type="text"
            {...register("employer")}
            placeholder="Employer"
          />
      </label>
        {formState.errors.employer ? (
          <p>{formState.errors.employer.message}</p>
        ) : null}

      <label className="input-group mb-2 input-group-vertical">
          <span>
            <b>Co-Owner Name</b>
          </span>
          <input
          className={`input${formState.errors.coowner ? ` input-error` : ``}`}
          id="coowner"
          type="text"
          {...register("coowner")}
          placeholder="Co-Owner"
        />
      </label>
        {formState.errors.coowner ? (
          <p>{formState.errors.coowner.message}</p>
        ) : null}

        <label className="input-group mb-2 input-group-vertical">
          <span>
            <b>Co-Owner Phone</b>
          </span>
          <input
          className={`input${
            formState.dirtyFields.coowner_phone &&
            formState.errors.coowner_phone
              ? ` input-error`
              : ``
          }`}
          id="coowner_phone"
          type="tel"
          {...register("coowner_phone")}
          placeholder="Co-Owner Phone"
        />
      </label>
        {formState.dirtyFields.coowner_phone &&
        formState.errors.coowner_phone ? (
          <p>{formState.errors.coowner_phone.message}</p>
        ) : null}

        <label className="input-group mb-2 input-group-vertical">
          <span>
            <b>Notes</b>
          </span>
          <textarea
          className={`input${formState.errors.notes ? ` input-error` : ``}`}
          id="notes"
          {...register("notes")}
          placeholder="Notes"
        />
      </label>
        {formState.errors.notes ? (
          <p>{formState.errors.notes.message}</p>
        ) : null}

        <button className="btn-primary btn" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Checkin;
