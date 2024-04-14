import React, { useState } from "react";
import DatePicker from "react-datepicker";
import type { PetFormValues } from "@/components/petDetails";
import { addDoc, collection } from "firebase/firestore";
import { auth, firestore } from "@/utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { type SubmitHandler, useForm } from "react-hook-form";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";

export default function AddPet() {
  const { register, handleSubmit } = useForm<PetFormValues>();
  const [infoSubmitted, setSubmit] = useState<boolean>(false);
  // const [name, setName] = useState<string>();
  const [DOB, setDOB] = useState<Date>();
  // const [breed, setBreed] = useState<string>();
  // const [species, setSpecies] = useState<string>();
  // const [appearance, setAppearance] = useState<string>();
  const [sex, setSex] = useState<string>();
  const [microchipped, setMicrochipped] = useState<string>();
  const [tattoos, setTattoos] = useState<string>();

  const [user] = useAuthState(auth);

  function createID(length: number) {
    let id = "";
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charsLength = chars.length;
    let i = 0;
    while (i < length) {
      id += chars.charAt(Math.floor(Math.random() * charsLength));
      i += 1;
    }
    return id;
  }

  const onSubmit: SubmitHandler<PetFormValues> = async (data) => {
    // TODO: write to firestore, provide data to admin somehow

    console.log(data);
    await addDoc(collection(firestore, "pets"), {
      name: data.name,
      DOB: DOB,
      sex: sex,
      species: data.species,
      breed: data.breed,
      appearance: data.appearance,
      microchipped: microchipped,
      tattooed: tattoos,
      client_id: user?.uid,
      pet_id: createID(36),
    });
    setSubmit(true);
  };
  return (
    <div className="grid-cols-1">
      <form onSubmit={handleSubmit(onSubmit)}>
        <label className="input-group mb-2 input-group-vertical">
          <span>
            <b>Name</b>
          </span>
          <input
            className="input-bordered input"
            placeholder="Name"
            type="name"
            //value={name}
            {...register("name", { required: false })}
            autoComplete="name"
            required
          />
        </label>

        <label className="input-group mb-2 input-group-vertical">
          <span>
            <b>Date of Birth</b>
          </span>
          <DatePicker
            className="input-bordered input w-full"
            placeholderText="MM/DD/YYYY"
            dateFormat={"MM/dd/yyyy"}
            selected={DOB ? DOB : null}
            required
            onChange={(date) => setDOB(date != null ? date : new Date())}
          />
        </label>
        
        <label className="input-group mb-2 input-group-vertical">
          <span>
            <b>Species</b>
          </span>
          <input
            className="input-bordered input"
            placeholder="Species"
            type="species"
            //value={phone}
            {...register("species", { required: true })}
            autoComplete="species"
          />
        </label>

        <label className="input-group mb-2 input-group-vertical">
          <span>
            <b>Breed</b>
          </span>
          <input
            className="input-bordered input"
            placeholder="Breed"
            type="breed"
            //value={email}
            {...register("breed", { required: true })}
            autoComplete="breed"
          />
        </label>

        <label className="input-group mb-2 input-group-vertical">
          <span>
            <b>Appearance</b>
          </span>
          <input
            className="input-bordered input"
            placeholder="Appearance"
            type="Appearance"
            //value={address}
            {...register("appearance", { required: true })}
            autoComplete="Appearance"
          />
        </label>

        <label className="input-group input-group-vertical">
          <span>
            <b>Sex</b>
          </span>
        </label>
        <RadioGroup onChange={(e, value) => setSex(value)}>
        <div className="grid grid-cols-2 gap-3">
          <FormControlLabel
            value="male"
            control={<Radio required />}
            label="Male"
          />
          <FormControlLabel
            value="female"
            control={<Radio required />}
            label="Female"
          />
          </div>
        </RadioGroup>

        <label className="input-group input-group-vertical">
          <span>
            <b>Tattooed</b>
          </span>
        </label>
          <RadioGroup onChange={(e, value) => setMicrochipped(value)}>
          <div className="grid grid-cols-2 gap-3">
          <FormControlLabel
            value="true"
            control={<Radio required />}
            label="Yes"
          />
          <FormControlLabel
            value="false"
            control={<Radio required />}
            label="No"
          />
          </div>
        </RadioGroup>

        <label className="input-group input-group-vertical">
          <span>
            <b>Microchipped</b>
          </span>
        </label>
        <RadioGroup onChange={(e, value) => setTattoos(value)}>
        <div className="grid grid-cols-2 gap-3">
          <FormControlLabel
            value="true"
            control={<Radio required />}
            label="Yes"
          />
          <FormControlLabel
            value="false"
            control={<Radio required />}
            label="No"
          />
          </div>
        </RadioGroup>
        
        <button
          className={`btn ${
            infoSubmitted ? "btn-disabled" : "btn-success hover:scale-[0.98] hover:brightness-75"
          }  btn-block`}
          disabled={infoSubmitted}
          type="submit"
        >
          Submit
        </button>
      </form>

      {infoSubmitted && <p>Pet added.</p>}
    </div>
  );
}
