import { google } from "googleapis";

const { GOOGLE_SERVICE_ACCOUNT, NODE_ENV } = process.env;

const serviceAccount = NODE_ENV === "test" ? GOOGLE_SERVICE_ACCOUNT : null;

if (!serviceAccount) {
  throw new Error("GOOGLE_SERVICE_ACCOUNT is required");
}

const credential = JSON.parse(
  Buffer.from(serviceAccount, "base64").toString(),
) as {
  client_email: string;
  private_key: string;
};

const auth = new google.auth.GoogleAuth({
  credentials: credential,
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

google.options({ auth });

export { auth, google };
