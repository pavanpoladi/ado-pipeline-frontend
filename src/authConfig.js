const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
  // [::1] is the IPv6 localhost address.
  window.location.hostname === "[::1]" ||
  // 127.0.0.0/8 are considered localhost for IPv4.
  window.location.hostname.match(
    /^127(?:\.[0-9]+){0,2}\.[0-9]+$/
  )
);

const redirectUri = isLocalhost
  ? "http://localhost:3000/redirect"
  : "https://nice-dune-0862be70f.5.azurestaticapps.net/redirect";

export const msalConfig = {
  auth: {
    clientId: '294d3e7a-0872-48ab-a834-35d4d536e149',
    authority: 'https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47',
    redirectUri: redirectUri, // Use dynamic redirectUri
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  }
};

export const loginRequest = {
  scopes: ['User.Read'],
};