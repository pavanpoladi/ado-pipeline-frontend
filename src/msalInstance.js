import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./authConfig";

const msalInstance = new PublicClientApplication(msalConfig);

const initializeMsal = async () => {
  await msalInstance.initialize();
};

initializeMsal();

export default msalInstance;