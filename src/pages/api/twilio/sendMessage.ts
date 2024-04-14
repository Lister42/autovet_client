import type { NextApiRequest, NextApiResponse } from "next";
import twilio from "twilio";

export default function sendMessage(req: NextApiRequest, res: NextApiResponse) {
  const accountSid = "AC069b663a06141584651a7370fbcdf33e";
  const token = "52edd074912220e894f7e1c5579ea64c";
  const client = twilio(accountSid, token);

  console.log("Running sendMessage on API");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { phone, message } = req.body;
  // console.log(phone, message);
  client.messages
    .create({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      body: message,
      from: "+15074323547",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      to: phone,
    })
    .then(() =>
      res.json({
        success: true,
      })
    )
    .catch((error) => {
      console.log(error);
      res.json({
        success: false,
      });
    });
}

// async function handlePhoneNumber(phoneNumber: string) {
//     const isVerified = await isCallerIdVerified(phoneNumber);
//     if (!isVerified) {
//         await addCallerId(phoneNumber);
//     } else {
//         console.log("Caller is verified to receive message");
//     }
// }

// async function isCallerIdVerified(phoneNumber: string): Promise<boolean> {
//     const callerIds = await twilioClient.outgoingCallerIds.list();
//     return callerIds.some((callerIds) => callerIds.phoneNumber === phoneNumber);
// }

// async function addCallerId(phoneNumber: string) {
//     try {
//         const curClient = await currentClient;
//         const result = await twilioClient.validationRequests.create({
//             friendlyName: curClient.uid,
//             phoneNumber
//         })
//         console.log("Added caller:", result)
//     } catch (error) {
//         console.error(error);
//     }
// }
