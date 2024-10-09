import axios from 'axios';
import credential from './managedIdentityConfig';

const triggerPipeline = async () => {
  try {
    const tokenResponse = await credential.getToken("499b84ac-1321-427f-aa17-267ca6975798/.default");
    const accessToken = tokenResponse.token;

    const response = await axios.post(
      'https://dev.azure.com/msazure/One/_apis/build/builds?api-version=6.0',
      {
        definition: { id: 345470 }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Pipeline triggered successfully:', response.data);
  } catch (error) {
    console.error('Error triggering pipeline:', error);
  }
};

export default triggerPipeline;