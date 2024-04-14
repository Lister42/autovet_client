import { initializeApp } from "firebase/app";
import type {
  DocumentData,
  DocumentReference,
  FirestoreDataConverter,
  WithFieldValue,
  Timestamp,
} from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import type { AppointmentType, ClientType, MessageType, PetType, Status } from "./types";

const firebaseConfig = {
  apiKey: "AIzaSyAVbNwodzMRNP-MFTCDOjQ62gX1xvF10KE",

  authDomain: "autovet-db.firebaseapp.com",

  projectId: "autovet-db",

  storageBucket: "autovet-db.appspot.com",

  messagingSenderId: "509888252098",

  appId: "1:509888252098:web:4aeed3bfc8a22d2170935b",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

export const firestore = getFirestore(firebaseApp);

export const auth = getAuth(firebaseApp);

export const storage = getStorage(firebaseApp);

export const appointmentConverter: FirestoreDataConverter<AppointmentType> = {
  toFirestore: (appointment: WithFieldValue<AppointmentType>): DocumentData =>
    appointment,
  fromFirestore: (snapshot, options): AppointmentType => {
    const data = snapshot.data(options);
    return {
      client_id: data.client_id as string,
      status: data.status as Status,
      notes: data.notes as string,
      reason: data.reason as string,
      appointment_id: data.appointment_id as string,
      spot_number: data.spot_number as number,
      messages: data.messages as DocumentReference<DocumentData>,
      client: data.client as DocumentReference<DocumentData>,
      date: (data.date as Timestamp).toDate(),
      cost: data.cost as number,
      pet: data.pet as DocumentReference<DocumentData>,
      appointment_ref: snapshot.ref,
    };
  },
};

export const clientConverter: FirestoreDataConverter<ClientType> = {
  toFirestore: (client: WithFieldValue<ClientType>): DocumentData => client,
  fromFirestore: (snapshot, options): ClientType => {
    const data = snapshot.data(options);
    return {
      uid: data.uid as string,
      first_name: data.first_name as string,
      last_name: data.last_name as string,
      email: data.email as string,
      phone_number: data.phone_number as string,
      DOB: (data.DOB as Timestamp).toDate(),
      primary_address: data.primary_address as string,
      secondary_address: data.secondary_address as string,
      refferal: data.refferal as string,
      co_owner: data.co_owner as string,
      co_owner_phone_number: data.co_owner_phone_number as string,
      employer: data.employer as string,
      trusted_persons: data.trusted_persons as string,
      client_ref: snapshot.ref,
    };
  },
};

export const petConverter: FirestoreDataConverter<PetType> = {
  toFirestore: (pet: WithFieldValue<PetType>): DocumentData => pet,
  fromFirestore: (snapshot, options): PetType => {
    const data = snapshot.data(options);
    return {
      pet_id: data.pet_id as string,
      name: data.name as string,
      DOB: (data.DOB as Timestamp).toDate(),
      breed: data.breed as string,
      appearance: data.appearance as string,
      sex: data.sex as string,
      microchipped: data.microchipped as string,
      species: data.species as string,
      tattooed: data.tattooed as string,
      client_id: data.client_id as string,
      pet_ref: snapshot.ref,
      pet_photo: data.pet_photo as string

    };
  },
};

export const messageConverter: FirestoreDataConverter<MessageType> = {
  toFirestore: (message: WithFieldValue<MessageType>): DocumentData => message,
  fromFirestore: (snapshot, options): MessageType => {
    const data = snapshot.data(options);
    return {
      appointment_id: data.appointment_id as string,
      content: data.content as string,
      message_id: data.message_id as number,
      name: data.name as string,
      timestamp: (data.timestamp as Timestamp).toDate(),
      uid: data.uid as string,
      shouldNotify: data.shouldNotify as boolean
    };
  }
}



