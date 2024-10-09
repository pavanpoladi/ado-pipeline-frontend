export const msalConfig = {
    auth: {
      clientId: '294d3e7a-0872-48ab-a834-35d4d536e149',
      authority: 'https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47',
      redirectUri: 'http://localhost:3000/redirect',
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
      }
  };
  
  export const loginRequest = {
    scopes: ['User.Read'],
  };