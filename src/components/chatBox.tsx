import React, { useEffect, useRef, useState } from "react";
import type { Channel } from "pusher-js";
import { firestore, messageConverter } from "@/utils/firebase";
import type { DocumentData } from "firebase/firestore";
import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import type { ChatInfo, ClientType, MessageType } from "@/utils/types";
import {
  currentClient,
  messagesSavedToDB,
  notificationChannelInstance,
  observedAppointmentChannels,
  pusherInstance,
} from "@/utils/pusherUtil";

interface AppointmentID {
  appointmentID: string;
}

export default function ChatBox({ appointmentID }: AppointmentID) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatInfo[]>([]);
  const [client, setClient] = useState<ClientType>();
  const [channel, setChannel] = useState<Channel>();
  const [curReceivedMessage, setCurReceivedMessage] = useState<ChatInfo>();
  const [addMessage, setAddMessage] = useState(Date.now());
  const [notificationsChannel, setNotificationsChannel] = useState<Channel>();
  const messageEndRef = useRef<HTMLDivElement>(null);

  //#DEVELOPMENT#: hard constraint to control whether messages get added to the database
  const addMessagesToDB = messagesSavedToDB;

  //Implemented to enforce that it only runs once
  useEffect(() => {
    if (curReceivedMessage) {
      setMessages([...messages, curReceivedMessage]);
    } else {
      console.log("curRecieivedMessage was undefined", curReceivedMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addMessage]);

  useEffect(() => {
    //Switch the chat box to current appointment's channel.
    async function loadChannel() {
      const pusher = await pusherInstance;

      //May want to do this stuff in appointment details, we'll have to wait and see
      handleAppointmentObservation();

      const nChannel = await notificationChannelInstance;
      setNotificationsChannel(nChannel);

      const result = pusher.subscribe("presence-client-" + appointmentID);

      //==> Initialize behavior when receiving a message
      result.bind("client-handled-message", (data: ChatInfo) => {
        //make sure it only runs once
        setAddMessage(Date.now());
        setCurReceivedMessage(data);
      });

      setChannel(result);
    }
    void loadChannel();

    async function loadClient() {
      const result = await currentClient;
      setClient(result);
    }
    void loadClient();

    //Load messages that are in the DB
    async function loadMessagesFromDB() {
      const messageCollection = collection(firestore, "messages").withConverter(
        messageConverter
      );
      const messageQuery = query(
        messageCollection,
        where("appointment_id", "==", appointmentID)
      );
      const messageSnapshot = await getDocs(messageQuery);
      const loadedMessages: MessageType[] = messageSnapshot.docs.map((doc) => {
        return doc.data();
      });
      const sortedMessages = loadedMessages?.sort(
        (a, b) => a.message_id - b.message_id
      );
      const result: ChatInfo[] = sortedMessages?.map((val: MessageType) => {
        const data: ChatInfo = {
          username: val.name,
          message: val.content,
          time_sent: val.timestamp.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
            hourCycle: "h12",
          }),
          uid: val.uid,
          shouldNotify: val.shouldNotify,
        };
        return data;
      });
      setMessages([...result]);
    }
    void loadMessagesFromDB();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function messageIsValidated() {
    if (message === "") {
      return false;
    }
    //add any other cases of contains or something for filtering
    return true;
  }

  //Used to auto-scroll to the bottom of the messages when a new one is received.
  useEffect(() => {
    if (messageEndRef.current) {
        messageEndRef.current.scrollIntoView({behavior: 'smooth'})
    }
  }, [messages])

  function currentTimeToString() {
    const now = new Date();
    const dateString = now.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      hourCycle: "h12",
    });
    return dateString;
  }

  //Adds message to database
  async function addMessageToDatabase(data: ChatInfo) {
    if (!addMessagesToDB) return;
    const messageCollection = collection(firestore, "messages");
    await addDoc(messageCollection, {
      appointment_id: appointmentID,
      content: data.message,
      message_id: messages.length,
      name: data.username,
      timestamp: Timestamp.fromDate(new Date()),
      uid: data.uid,
      shouldNotify: data.shouldNotify,
    });
  }

  //Update all the messages that are not this appt to NOT should notify (bc they have seen)
  async function updateShouldNotifyInDB() {
    const messageQuery = query(
      collection(firestore, "messages"),
      where("uid", "!=", client?.uid)
    );
    try {
      const querySnapshot = await getDocs(messageQuery);
      const updatePromises: DocumentData[] = [];
      querySnapshot.docs.forEach((doc) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const updatePromise = updateDoc(doc.ref, { shouldNotify: false });
        updatePromises.push(updatePromise);
      });
      //Run update promises in parallel using Promise.all()
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error updating documents:", error);
    }
  }

  function handleAppointmentObservation() {
    //Sets all observed values of all other appointments to false
    for (const key in observedAppointmentChannels) {
      if (
        Object.prototype.hasOwnProperty.call(observedAppointmentChannels, key)
      ) {
        observedAppointmentChannels[key] = false;
      }
    }
    //Admin is now viewing only this appointment
    observedAppointmentChannels[appointmentID] = true;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    //Make sure format of input is valid
    if (!messageIsValidated()) return;

    const data: ChatInfo = {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      username: `${client?.first_name ?? ""} ${client?.last_name ?? ""} `,
      message: message,
      time_sent: currentTimeToString(),
      uid: client?.uid,
      shouldNotify: true,
    };

    //Send message to all connected users to channel
    channel?.trigger("client-handled-message", data);

    //Make all new messages no longer new
    const viewedMessages = messages.map((val) => {
      val.shouldNotify = false;
    });

    //Update the the current messages current instance
    setMessages([...messages, data]);

    //Reset the displayed message back to empty
    setMessage("");

    void addMessageToDatabase(data);

    //Set all messages in database excluding THIS appts to no longer be shown as "new"
    void updateShouldNotifyInDB();

    //Sending a message gets rid of the notification, so update all the admins list to be up to date.
    //void updateAppointmentNotificationListInDB()

    //#######################
    //==> Notification shtuff
    notificationsChannel?.trigger(
      "client-create-message-notification",
      appointmentID
    );
  };
  return (
    <div className="mb-6 h-[25rem] rounded-md border border-gray-800 bg-neutral md:h-[50rem] lg:h-[32rem] xl:h-[32rem] 2xl:h-[40rem]">
      <div className="rounded-t-md bg-neutral-focus p-3">
        <h1 className="text-center">Chat</h1>
      </div>
      <div className="h-2/3 overflow-y-scroll px-3 md:h-2/3 lg:h-[rem] xl:h-[28rem] 2xl:h-[32rem]">
        <ul className="h-full">
          {messages.map((message, index) => (
            <li key={index}>
              {message.uid == client?.uid ? (
                <div className="chat chat-end">
                  <div className="chat-header">
                    {message.username}
                    <time className="test-xs opacity-50">
                      {message.time_sent}
                    </time>
                  </div>
                  <div className="chat-bubble chat-bubble-primary">
                    {message.message}
                  </div>
                </div>
              ) : (
                <div>
                  {message.shouldNotify ? (
                    <span className="text-sm text-blue-300">
                      ---New Message---
                    </span>
                  ) : (
                    <></>
                  )}
                  <div className="chat chat-start">
                    <div className="chat-header">
                      {message.username}
                      <time className="test-xs opacity-50">
                        {message.time_sent}
                      </time>
                    </div>
                    <div className="chat-bubble chat-bubble-secondary">
                      {message.message}
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
          <div ref={messageEndRef}/>
        </ul>
      </div>
      {/* Input */}
      <form
        className="bottom-0 left-0 mt-4 w-full px-3"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-row">
          <input
            type="text"
            onChange={(e) => setMessage(e.target.value)}
            className="block w-full rounded-lg rounded-e-none border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            value={message}
            placeholder="Message"
          />
          <button className="btn-primary btn rounded-s-none" type="submit">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
