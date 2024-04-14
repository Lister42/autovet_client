import React from "react";
import type { PetType } from "@/utils/types";

export default function Pet(pet: PetType) {
  return (
    <div key={pet.pet_id}>
      <h2 className="py-2">
        {" "}
        {pet.name} <b>|</b> {pet.breed}{" "}
      </h2>
    </div>
  );
}
