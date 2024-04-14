import { firestore } from "@/utils/firebase";
import type { ClientType } from "@/utils/types";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";

type ProfileFormValues = {
  first_name: string;
  last_name: string;
  co_owner: string;
  phone_number: string;
  email: string;
  primary_address: string;
  secondary_address: string;
  trusted_persons: string;
  employer: string;
};

export default function EditProfile(client: ClientType) {
  const { register, handleSubmit } = useForm<ProfileFormValues>();

  const [infoSubmitted, setSubmit] = useState<boolean>(false);

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    // TODO: write to firestore, provide data to admin somehow

    console.log(data);
    const docRef = await addDoc(collection(firestore, "profile_data"), {
      first_name: data.first_name ?? client.first_name,
      last_name: data.last_name ?? client.last_name,
      phone_number: data.phone_number ?? client.phone_number,
      co_owner: data.co_owner ?? client.co_owner,
      email: data.email ?? client.email,
      primary_address: data.primary_address ?? client.primary_address,
      secondary_address: data.secondary_address ?? client.secondary_address,
      trusted_persons: data.trusted_persons ?? client.trusted_persons,
      employer: data.employer ?? client.employer,
      uid: client.uid,
    });

    console.log("Document written with ID: ", docRef.id);
    /*router
      .push(`/home`)
      .then((success) => {
        if (!success) console.log(`redirect failed`);
      })
      .catch((error) => console.log(error));*/
    setSubmit(true);
  };

  console.log(infoSubmitted);

  return (
    <div className="grid-cols-1">
      <form onSubmit={handleSubmit(onSubmit)}>
        <p>
          <input
            className="input-bordered input"
            placeholder="First Name"
            type="name"
            //value={name}
            defaultValue={client?.first_name}
            {...register("first_name", { required: false })}
            autoComplete="name"
            // onChange={(e) => setName(e.target.value)}
          />
        </p>
        <p>
          <input
            className="input-bordered input"
            placeholder="Last Name"
            type="surname"
            //value={surname}
            defaultValue={client?.last_name}
            {...register("last_name", { required: false })}
            autoComplete="surname"
            // onChange={(e) => setSurname(e.target.value)}
          />
        </p>
        <p>
          <input
            className="input-bordered input"
            placeholder="Co-Owner"
            type="co_owner"
            //value={surname}
            defaultValue={client?.co_owner}
            {...register("co_owner", { required: false })}
            autoComplete="co_owner"
            // onChange={(e) => setCoOwner(e.target.value)}
          />
        </p>
        <p>
          <input
            className="input-bordered input"
            placeholder="Phone #"
            type="phone"
            //value={phone}
            defaultValue={client?.phone_number}
            {...register("phone_number", { required: false })}
            autoComplete="phone"
            // onChange={(e) => setPhone(e.target.value)}
          />
        </p>
        <p>
          <input
            className="input-bordered input"
            placeholder="Email"
            type="email"
            //value={email}
            defaultValue={client?.email}
            {...register("email", { required: false })}
            autoComplete="email"
            // onChange={(e) => setEmail(e.target.value)}
          />
        </p>
        <p>
          <input
            className="input-bordered input"
            placeholder="Address"
            type="address"
            //value={address}
            defaultValue={client?.primary_address}
            {...register("primary_address", { required: false })}
            autoComplete="address"
            // onChange={(e) => setAddress(e.target.value)}
          />
        </p>
        <p>
          <input
            className="input-bordered input"
            placeholder="Secondary Address"
            type="address2"
            //value={address}
            defaultValue={client?.secondary_address}
            {...register("secondary_address", { required: false })}
            autoComplete="address2"
            // onChange={(e) => setAddress2(e.target.value)}
          />
        </p>
        <p>
          <input
            className="input-bordered input"
            placeholder="Trusted Persons"
            type="trustees"
            //value={trustees}
            defaultValue={client?.trusted_persons}
            {...register("trusted_persons", { required: false })}
            autoComplete="trustees"
            // onChange={(e) => setTrustees(e.target.value)}
          />
        </p>
        <p>
          <input
            className="input-bordered input"
            placeholder="Employer"
            type="employer"
            //value={trustees}
            defaultValue={client?.employer}
            {...register("employer", { required: false })}
            autoComplete="employaer"
            // onChange={(e) => setEmployer(e.target.value)}
          />
        </p>
        <div className="card-actions col-start-3 self-center justify-self-end p-8">
          <button
            className={`btn ${
              infoSubmitted ? "btn-disabled" : "btn-success"
            }  btn-md`}
            disabled={infoSubmitted}
            type="submit"
          >
            Submit
          </button>
        </div>
        {infoSubmitted && <p>Changes submitted for approval.</p>}
      </form>
    </div>
  );
}
