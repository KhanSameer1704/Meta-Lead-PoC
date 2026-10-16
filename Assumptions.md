# Assumptions and Limitations

## 1. Project Overview

This proof of concept demonstrates a real-time lead integration workflow using Meta Lead Ads, a Node.js and Express backend, Socket.IO, and a React Native Expo mobile application.

The objective is to receive lead-generation webhook events, retrieve lead details when authorized, and display incoming leads in the mobile application.

## 2. Technology Stack

- **Frontend:** React Native with Expo
- **Backend:** Node.js and Express
- **Real-time communication:** Socket.IO
- **Webhook tunneling:** ngrok
- **Lead source:** Meta Lead Ads
- **Lead retrieval:** Meta Graph API

## 3. Assumptions

1. A Facebook Page and a Meta developer app are available for development and testing.
2. The Facebook Page is subscribed to the `leadgen` webhook field.
3. The backend is publicly accessible through an HTTPS ngrok URL during local testing.
4. A valid Page Access Token with the required permissions is necessary to retrieve actual lead details.
5. The mobile app can connect to the backend and listen for Socket.IO events.
6. Mock lead data can be used to validate the backend-to-mobile communication independently of Meta's live lead delivery.
7. Only lead fields authorized and returned by Meta are processed.

## 4. Implementation Status

- The Express backend starts successfully.
- The health-check endpoint has been tested.
- Meta webhook verification and direct webhook testing have succeeded.
- The Page's `leadgen` subscription has been verified.
- Socket.IO communication between the backend and mobile application has been tested.
- The mock-lead endpoint successfully demonstrates real-time lead display in the mobile app.
- End-to-end delivery and retrieval of an actual Meta test lead remain unverified.

## 5. Known Limitations

1. The Meta Lead Ads Testing Tool continues to show a Pending status for the test lead.
2. Actual lead retrieval has encountered an access-token or permission error that requires further investigation.
3. The mock-lead endpoint demonstrates the real-time application flow but does not prove that actual Meta leads are being processed successfully.
4. This PoC is intended for development and demonstration, not production use.
5. Production deployment would require additional security controls, robust error handling, monitoring, and deployment configuration.

## 6. Security Considerations

- Store access tokens and secrets in environment variables.
- Exclude `.env` files from version control.
- Revoke or regenerate exposed access tokens.
- Restrict access to lead information to authorized users.
- Handle personal information according to applicable privacy requirements.

## 7. Future Improvements

- Resolve Meta lead-delivery and lead-retrieval permissions.
- Validate the complete workflow using an actual Meta lead.
- Add persistent lead storage and duplicate-event handling.
- Improve error handling, logging, and monitoring.
- Add authentication and production-ready deployment configuration.

## 8. Conclusion

The PoC demonstrates a working real-time communication flow between the backend and a React Native mobile application using Socket.IO. Direct Meta webhook connectivity has been tested successfully, while actual Meta lead delivery and retrieval remain pending validation.