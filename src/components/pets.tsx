import { useCollectionData } from "react-firebase-hooks/firestore";
import { auth, firestore, petConverter } from "@/utils/firebase";
import PetDetails from "@/components/petDetails";
import { collection, query, where } from "firebase/firestore";
import { useState } from "react";
import AddPet from "./addPet";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Pets() {
  const [user] = useAuthState(auth);

  console.log("uid: ", user);

  const [pets, loading, error] = useCollectionData(
    query(
      collection(firestore, "pets").withConverter(petConverter),
      where("client_id", "==", user ? user.uid : "")
    ),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  console.log("Pets", pets);

  const [addPet, setAddPet] = useState<boolean>();

  return (
    <div className="mb-6 mt-16">
      <h1 className="text-center text-4xl font-bold">Pets</h1>

      {!addPet ?
        (<div>
          <button
            className="btn-primary btn-block btn my-3 hover:scale-[0.98]"
            onClick={() => setAddPet(true)}
          >
            <strong>+ Add Pet</strong>
          </button>
          <div className="flex justify-center">

            <div className="grid grid-cols-1 gap-3">
              {error && <strong>Error: {JSON.stringify(error)}</strong>}
              {loading && <span> pets: Loading...</span>}
              {pets
                ?.sort((a, b) => a.name.localeCompare(b.name))
                .map((pet) => (
                  <div key={pet.pet_id}>
                    <PetDetails {...pet} />
                  </div>
                ))}
            </div>
          </div>
        </div>
        )
        :
        (<div>
          <div className="mb-6">
            <div className="card w-96 bg-neutral shadow-xl">
              <div className="card-body">
                <AddPet />
                <button 
                  onClick={() => setAddPet(false)}
                  className=" btn btn-error btn-outline hover:scale-[0.98]">
                    Cancel
                </button>
              </div>
            </div>
          </div>
        </div>)
      }
    </div>
  );
}
