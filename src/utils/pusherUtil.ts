/* eslint-disable prefer-const */
import type { User } from "firebase/auth";
import type { ClientType, NotificationInfo, PusherDetails, TextMessageInfo } from "./types";
import { auth, clientConverter, firestore } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import Pusher from "pusher-js";

interface SendMessageParams {
    to: string;
    message: string;
}

//##DEVELOPMENT CONTROLS##
export const messagesSavedToDB = true;
export const textMessageIsEnabled = true; //Definitely set to false, but for testing if you would like to see, it will send messages to my number at the moment

//===CLIENT===>
export const currentClient = getCurrentClient();
export const pusherInstance = connectToPusher();
export const pusherDetails: PusherDetails = {
    appId: "1562542",
    key: "5c22e8b85c80909c84d5",
    secret: "74623b7c9fdf213bf1be",
    cluster: "us2" 
}
export const notificationChannelInstance = connectToNotificationChannel();
export const processChannelInstance = connectToProcessChannel();


export let appointmentNotificationList: {[apptID: string]: NotificationInfo} = {};
export let observedAppointmentChannels: {[apptID: string]: boolean} = {};

void clientGlobalNotification(); //this bind function should only be triggered by the admins




async function clientGlobalNotification() {
    const nChannel = await notificationChannelInstance;
    const curClient = await currentClient;
    nChannel.bind("client-text-message-notification-" + curClient.uid, (data: TextMessageInfo) => {
        console.log("Client text message notification ran:", data.apptID);

        //Eventually run to add and handle various phone numbers
        // void handlePhoneNumber(curClient.phone_number);

        // const phoneNum = curClient.phone_number; //what it will actually be
        const phoneNum = "7243162916"
        const message = "AutoVet: New Message\n"+data.senderName+": "+data.message;

        //Client has never viewed the appointment, send them a message
        if (!(data.apptID in observedAppointmentChannels)) {
            if (textMessageIsEnabled) sendMessage({ to: phoneNum, message})
            
        } //Client is no longer viewing the appointment
        else if ((data.apptID in observedAppointmentChannels) && !observedAppointmentChannels[data.apptID]) {
            if (textMessageIsEnabled) sendMessage({ to: phoneNum, message})
        }
        else {
            console.log("Didn't send a message. Why would I?");
        }
    })
}

function sendMessage({ to, message }: SendMessageParams) {
    fetch('/api/twilio/sendMessage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            phone: to,
            message: message,
        }),
    })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error(error))
}


async function connectToNotificationChannel() {
    const pusher = await pusherInstance;
    const notificationChannel = pusher.subscribe('presence-client-notifications');
    return notificationChannel;
}

async function connectToProcessChannel() {
    const pusher = await pusherInstance;
    const processChannel = pusher.subscribe('presence-client-process');
    return processChannel;
}

async function connectToPusher() {
    const pusher = await handlePusherCreation();
    pusher.signin();
    return pusher;
}


async function waitForAuthUser(): Promise<User> {
    while (!auth.currentUser) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return auth.currentUser;
  }
   
async function getCurrentClient(): Promise<ClientType> {
    const user = await waitForAuthUser();
    const clientCollection = collection(firestore, "client").withConverter(clientConverter);
    const clientQuerySnapshot = await getDocs(clientCollection);
    const client: ClientType[] = clientQuerySnapshot.docs
        .filter((doc) => {
            //filter for the current client ID from the doc
            return (doc.data().uid.includes(user?.uid));
        })
        .map((doc) => {return doc.data()})

    if (client[0]) {
        console.log("Client was found", client[0])
        return client[0];
    } else {
        throw new Error("Client not found");
    }
}

async function handlePusherCreation(): Promise<Pusher> {
    const pusher = new Pusher('5c22e8b85c80909c84d5', {
        cluster: "us2",
        authEndpoint: "/api/pusher/auth",
        userAuthentication: {
            endpoint: "/api/pusher/userAuthenticate",
            transport: "ajax",
            params: {
                user_id: (await currentClient).uid,
                first_name: (await currentClient).first_name,
                last_name: (await currentClient).last_name
            }
        }
      });
      return pusher;
}