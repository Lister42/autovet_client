import { ref as storageRef } from "firebase/storage";
import { useDownloadURL, useUploadFile } from "react-firebase-hooks/storage";
import { auth, storage } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import RedirectButton from "@/components/redirectButton";
import { useState } from "react";
import Image from "next/image";
import type { ClientType } from "@/utils/types";

export default function Profile(client: ClientType) {
  const [user] = useAuthState(auth);
  const [selectedFile, setSelectedFile] = useState<File>();

  const storage_ref = storageRef(
    storage,
    user ? "images/" + user.uid : undefined
  );

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

  return (
    <div>
      {client && (
        <div>
          {/* Profile Picture Upload Modal */}
          <div>
            <input type="checkbox" id="profilepic" className="modal-toggle" />
            <div className="modal modal-bottom sm:modal-middle">
              <div className="modal-box bg-neutral">
                <h3 className="font-bold mb-3 text-lg">Upload a profile picture</h3>
                <div>
                <input
                  type="file"
                  className="file-input file-input-bordered file-input-info w-full max-w-xs"
                  onChange={(e) => {
                    const file = e.target.files ? e.target.files[0] : undefined;
                    setSelectedFile(file);
                  }}
                />
              </div>
                <div className="modal-action flex flex-row">
                  <label htmlFor="profilepic" className="btn btn-error btn-outline hover:scale-[0.98]">Cancel</label>
                  <label htmlFor="profilepic" onClick={upload} className="btn btn-primary hover:scale-[0.98]">Upload</label>
                </div>
              </div>
            </div>
          </div>

          <div className="card w-96 bg-base-100 shadow-xl">
            <label htmlFor="profilepic" className="relative group cursor-pointer">
              <figure className={!image_loading && image_url ? "" : "mt-3"}>
                  <Image 
                    src={!image_loading && !image_error && image_url
                      ? image_url
                      : "/images/profile_icon.png"
                    } 
                    width={!image_loading && image_url ? 900 : 200}
                    height={!image_loading && image_url ? 900 : 200} 
                    alt="Profile Image" 
                    className="transition group-hover:brightness-[35%] rounded-t-xl cursor-pointer" 
                  />
                </figure>
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-0 hover:opacity-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M16.72 2.34a2 2 0 00-2.83 0L3.56 12.22a1 1 0 00-.29.5L2 17a2 2 0 002 2l4.27-.27a1 1 0 00.5-.29l9.88-9.88a2 2 0 000-2.83zM5.41 14l-1.12 1.12L4 14.59 14.59 4l1.41 1.41L5.41 14z"/>
                  </svg>
              </div>
            </label>
            <div className="card-body">
              <h2 className="card-title">
                {client.first_name} {client.last_name}
              </h2>
              <hr></hr>
              <div>
              <p><b>Co-Owner </b> {client.co_owner}</p>
              <p><b>Phone Number: </b> {client.phone_number}</p>
              <p><b>E-Mail Address: </b> {client.email}</p>
              <p><b>Address: </b> {client.primary_address}</p>
              <p><b>Secondary Address: </b> {client.secondary_address}</p>
              <p><b>Trusted People: </b> {client.trusted_persons}</p>
              <p><b>Employer: </b> {client.employer}</p>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
