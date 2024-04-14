import React, { useState } from "react";
import { ref as storageRef } from "firebase/storage";
import type { PetType } from "@/utils/types";
import { collection, query, updateDoc, where } from "firebase/firestore";
import Image from "next/image";
import { useCollection } from "react-firebase-hooks/firestore";
import DatePicker from "react-datepicker";
import { firestore, petConverter, storage } from "@/utils/firebase";
import { type SubmitHandler, useForm } from "react-hook-form";
import "react-datepicker/dist/react-datepicker.css";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { useDownloadURL, useUploadFile } from "react-firebase-hooks/storage";

export type PetFormValues = {
  name: string;
  dob: Date;
  sex: string;
  species: string;
  breed: string;
  appearance: string;
  microchipped: string;
  tattooed: string;
};

export default function PetDetails(pet: PetType) {
  const [editPet, setEditPet] = useState<boolean>();

  function formatAge(DOB: Date) {
    const total_years =
      (new Date().valueOf() - DOB.valueOf()) / (60000 * 60 * 24 * 365);
    const years = Math.floor(total_years);
    const months = Math.floor((total_years - years) * 12);
    return `${years} Y ${months} M`;
  }

  function toggleEdit() {
    setEditPet(!editPet);
  }
  const { register, handleSubmit } = useForm<PetFormValues>();
  const [DOB, setDOB] = useState<Date>();
  const [sex, setSex] = useState<string>();
  const [microchipped, setMicrochipped] = useState<string>();
  const [tattooed, setTattooed] = useState<string>();
  const [selectedFile, setSelectedFile] = useState<File>();

  const storage_ref = storageRef(storage, "images/pets/" + pet.pet_ref.id);

  const [image_url, image_loading, image_error] = useDownloadURL(storage_ref);

  const [uploadFile] = useUploadFile();

  const upload = async () => {
    if (selectedFile && storage_ref) {
      const result = await uploadFile(storage_ref, selectedFile, {
        contentType: "image/jpeg",
      });
      if (!result) {
        console.log("error uploading file");
      }
    }
  };

  const [pets] = useCollection(
    query(
      collection(firestore, "pets").withConverter(petConverter),
      where("pet_id", "==", pet?.pet_id)
    )
  );

  const petRef = pets != null ? pets.docs[0] : null;
  const petDoc = petRef ? petRef.data() : null;

  const onSubmit: SubmitHandler<PetFormValues> = async (data) => {
    // TODO: write to firestore, provide data to admin somehow

    await upload();

    console.log(data);
    if (petDoc != null) {
      await updateDoc(petDoc.pet_ref, {
        name: data.name ?? pet?.name,
        DOB: DOB ?? pet?.DOB,
        sex: sex ?? pet?.sex,
        species: data.species ?? pet?.species,
        breed: data.breed ?? pet?.breed,
        appearance: data.appearance ?? pet?.appearance,
        microchipped: microchipped ?? pet?.microchipped,
        tattooed: tattooed ?? pet?.tattooed,
      });
      setEditPet(false);
    }
  };

  return (
    <div className="" key={pet.pet_id}>

      {/* Pet Picture Upload Modal */}
      <div>
        <input type="checkbox" id={`petpic${pet.pet_id}`} className="modal-toggle" />
        <div className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-neutral">
            <h3 className="font-bold mb-3 text-lg">Upload {pet.name}{`'s`} picture</h3>
            <input
              type="file"
              className="file-input file-input-bordered file-input-info w-full max-w-xs"
              onChange={(e) => {
                const file = e.target.files ? e.target.files[0] : undefined;
                setSelectedFile(file);
              }}
            />
            <div className="modal-action flex flex-row">
              <label htmlFor={`petpic${pet.pet_id}`} className="btn btn-error btn-outline hover:scale-[0.98]">Cancel</label>
              <label htmlFor={`petpic${pet.pet_id}`} onClick={upload} className="btn btn-primary hover:scale-[0.98]">Upload</label>
            </div>
          </div>
        </div>
      </div>

      <div className="card h-full w-full bg-neutral shadow-xl">
        {!editPet && (
          <label htmlFor={`petpic${pet.pet_id}`} className="relative group cursor-pointer">
              <figure className={!image_loading && image_url ? "" : "mt-3"}>
                  <Image 
                    src={!image_loading && !image_error && image_url
                      ? image_url
                      : "/images/profile_icon.png"
                    } 
                    width={!image_loading && image_url ? 900 : 200}
                    height={!image_loading && image_url ? 900 : 200} 
                    alt="Profile Image" 
                    className="transition group-hover:brightness-[35%] rounded-t-md cursor-pointer" 
                  />
                </figure>
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-0 hover:opacity-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M16.72 2.34a2 2 0 00-2.83 0L3.56 12.22a1 1 0 00-.29.5L2 17a2 2 0 002 2l4.27-.27a1 1 0 00.5-.29l9.88-9.88a2 2 0 000-2.83zM5.41 14l-1.12 1.12L4 14.59 14.59 4l1.41 1.41L5.41 14z"/>
                  </svg>
              </div>
          </label>
        )}
        {/* <label htmlFor="profilepic" className="relative hover:brightness-75 cursor-pointer">
          <figure className={!image_loading && image_url
            ? "" : "mt-3"}>
            <div className="rounded-xl">
              {!image_loading && !image_error && image_url ? (
                <Image
                  src={image_url}
                  alt="profile picture"
                  width={900}
                  height={900}
                  className="transition hover:brightness-75 rounded-t-xl cursor-pointer" 
                />
              ) : (
                <Image
                  src={"/images/paw_icon.png"}
                  alt="profile picture"
                  width={200}
                  height={200}
                  className="transition hover:brightness-75 rounded-t-xl cursor-pointer" 
                />
              )}
            </div>
          </figure>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-0 hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M16.72 2.34a2 2 0 00-2.83 0L3.56 12.22a1 1 0 00-.29.5L2 17a2 2 0 002 2l4.27-.27a1 1 0 00.5-.29l9.88-9.88a2 2 0 000-2.83zM5.41 14l-1.12 1.12L4 14.59 14.59 4l1.41 1.41L5.41 14z"/>
            </svg>
          </div>
        </label> */}

        <div className={editPet ? "card-body h-3/5 overflow-y-auto" : "card-body"}>
          {!editPet ? (
            <div>
              <h2 className="card-title overflow-hidden">
                {pet.name} - {pet.species}: {pet.breed}
              </h2>
              <hr></hr>

              {/* Sex */}
              <div className="my-1 flex flex-row">
                <p className="badge badge-lg rounded-md border bg-base-100 p-2 text-center">
                  <b>{pet.sex.toUpperCase()}</b>
                </p>
              </div>

              {/* Date of birth & age */}
              <div className="stats stats-vertical w-full shadow">
                <div className="stat">
                  <div className="stat-figure text-secondary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="inline-block h-8 w-8 stroke-current"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2zm4.6 9.99l-1.07-1.07-1.08 1.07c-1.3 1.3-3.58 1.31-4.89 0l-1.07-1.07-1.09 1.07C6.75 16.64 5.88 17 4.96 17c-.73 0-1.4-.23-1.96-.61V21c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-4.61c-.56.38-1.23.61-1.96.61-.92 0-1.79-.36-2.44-1.01zM18 9h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v1.54c0 1.08.88 1.96 1.96 1.96.52 0 1.02-.2 1.38-.57l2.14-2.13 2.13 2.13c.74.74 2.03.74 2.77 0l2.14-2.13 2.13 2.13c.37.37.86.57 1.38.57 1.08 0 1.96-.88 1.96-1.96V12C21 10.34 19.66 9 18 9z"
                      />
                    </svg>
                  </div>
                  <div className="stat-title">Age</div>
                  <div className="stat-value">
                    {pet.DOB ? formatAge(pet.DOB) : "N/A"}
                  </div>
                  <div className="stat-desc">
                    <b>DOB: </b>
                    {pet.DOB ? pet.DOB.toLocaleDateString() : "N/A"}
                  </div>
                </div>
              </div>

              <div className="flex flex-row">
                {/* Left section */}
                <div className="flex-none flex-row">
                  <div className="flex flex-row gap-3">
                    <p>
                      <b>Microchipped</b>
                      {pet.microchipped == "true" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24"
                          viewBox="0 0 24 24"
                          width="24"
                          className="inline-block h-8 w-8 stroke-current"
                        >
                          <path
                            fill="white"
                            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24"
                          viewBox="0 0 24 24"
                          width="24"
                          className="inline-block h-8 w-8 stroke-current"
                        >
                          <path
                            fill="white"
                            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                          />
                        </svg>
                      )}
                      {/* {pet.microchipped ? "yes" : "no"} */}
                    </p>
                    <p>
                      <b>Tattooed</b>
                      {pet.tattooed == "true" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24"
                          viewBox="0 0 24 24"
                          width="24"
                          className="inline-block h-8 w-8 stroke-current"
                        >
                          <path
                            fill="white"
                            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24"
                          viewBox="0 0 24 24"
                          width="24"
                          className="inline-block h-8 w-8 stroke-current"
                        >
                          <path
                            fill="white"
                            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                          />
                        </svg>
                      )}
                    </p>
                  </div>

                  <p>
                    <b>Appearance:</b> {pet.appearance}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Text Inputs */}
                <div className="mb-3">
                  {/* Name */}
                  <div className="form-control mb-2">
                    <label className="input-group input-group-vertical">
                      <span>
                        <b>Name</b>
                      </span>
                      <input
                        type="text"
                        placeholder="name"
                        className="input-bordered input"
                        defaultValue={pet?.name}
                        {...register("name", { required: false })}
                        autoComplete="name"
                        required
                        // onChange={(e) => setName(e.target.value)}
                      />
                    </label>
                  </div>
                  {/* DOB */}
                  <div className="form-control mb-2">
                    <label className="input-group input-group-vertical">
                      <span>
                        <b>Date of birth</b>
                      </span>
                      <DatePicker
                        className="input-bordered input w-full"
                        placeholderText="MM/DD/YYYY"
                        dateFormat={"MM/dd/yyyy"}
                        selected={DOB ? DOB : pet?.DOB}
                        required
                        onChange={(date) => setDOB(date ? date : new Date())}
                      />
                    </label>
                  </div>
                  {/* Species */}
                  <div className="form-control mb-2">
                    <label className="input-group input-group-vertical">
                      <span>
                        <b>Species</b>
                      </span>
                      <input
                        className="input-bordered input w-full"
                        placeholder="Species"
                        type="species"
                        //value={phone}
                        defaultValue={pet?.species}
                        {...register("species", { required: false })}
                        autoComplete="species"
                        required
                        // onChange={(e) => setPhone(e.target.value)}
                      />
                    </label>
                  </div>
                  {/* Breed */}
                  <div className="form-control mb-2">
                    <label className="input-group input-group-vertical">
                      <span>
                        <b>Breed</b>
                      </span>
                      <input
                        className="input-bordered input w-full"
                        placeholder="Breed"
                        type="breed"
                        //value={email}
                        defaultValue={pet?.breed}
                        {...register("breed", { required: false })}
                        autoComplete="breed"
                        required
                        // onChange={(e) => setEmail(e.target.value)}
                      />
                    </label>
                  </div>
                  {/* Appearance */}
                  <div className="form-control mb-2">
                    <label className="input-group input-group-vertical">
                      <span>
                        <b>Apppearance</b>
                      </span>
                    </label>
                    <input
                      className="input-bordered input w-full"
                      placeholder="Appearance"
                      type="Appearance"
                      //value={address}
                      defaultValue={pet?.appearance}
                      {...register("appearance", { required: false })}
                      autoComplete="Appearance"
                      required
                      // onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>

                {/* Radio Buttons */}
                <div>
                  {/* Sex */}
                  <label className="input-group input-group-vertical">
                    <span>
                      <b>Sex</b>
                    </span>
                  </label>
                  <RadioGroup
                    onChange={(e, value) => setSex(value)}
                    defaultValue={
                      pet?.sex.toUpperCase() === "MALE"
                        ? "MALE"
                        : sex?.toLowerCase() === "FEMALE"
                        ? "FEMALE"
                        : ""
                    }
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <FormControlLabel
                        value="MALE"
                        control={<Radio />}
                        label="Male"
                      />
                      <FormControlLabel
                        value="FEMALE"
                        control={<Radio />}
                        label="Female"
                      />
                    </div>
                  </RadioGroup>

                  {/* Tattooed */}
                  <label className="input-group input-group-vertical">
                    <span>
                      <b>Tattooed</b>
                    </span>
                  </label>
                  <RadioGroup
                    onChange={(e, value) => setMicrochipped(value)}
                    defaultValue={
                      pet?.microchipped === "true" ? "true" : "false"
                    }
                  >
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

                  {/* Microchipped */}
                  <label className="input-group input-group-vertical">
                    <span>
                      <b>Microchipped</b>
                    </span>
                  </label>
                  <RadioGroup
                    onChange={(e, value) => setTattooed(value)}
                    defaultValue={pet?.tattooed === "true" ? "true" : "false"}
                  >
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
                </div>

                {/* Pet Picture Upload */}
                <label className="input-group mb-2 input-group-vertical">
                    <span>
                      <b>Pet Picture</b>
                    </span>
                  </label>
                <input
                  type="file"
                  className="file-input file-input-bordered file-input-info w-full max-w-xs"
                  onChange={(e) => {
                    const file = e.target.files ? e.target.files[0] : undefined;
                    setSelectedFile(file);
                  }}
                />
              </form>
            </div>
          )}
          <div className="mt-2">
          {editPet && (
            <button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              className="btn-success hover:brightness-75 hover:scale-[0.98] btn-block btn"
            >
              <p className="">Save Changes</p>
            </button>
          )}
          </div>
          <button
            onClick={toggleEdit}
            className="btn-primary btn-block btn hover:scale-[0.98]"
          >
            {!editPet ? "Edit Pet" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
