/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/lines-between-class-members */
// Import the Session type from the library, along with the Node redis package, and `promisify` from Node

export const setRedis = async (client: any, id: string, data: any) => {
  try {
    // Inside our try, we use the `setAsync` method to save our session.
    // This method returns a boolean (true if successful, false if not)
    return await client.set(id, JSON.stringify(data));
  } catch (err: any) {
    // throw errors, and handle them gracefully in your applications
    throw new Error(err as string);
  }
};
export const getRedis = async (client: any, id: string) => {
  try {
    // Inside our try, we use `getAsync` to access the method by id
    // If we receive data back, we parse and return it
    // If not, we return `undefined`
    const reply = await client.get(id);
    if (reply) {
      return JSON.parse(reply);
      // eslint-disable-next-line no-else-return
    } else {
      return undefined;
    }
  } catch (err: any) {
    throw new Error(err as string);
  }
}
export const delRedis = async (client: any, id: string) => {
  try {
    // Inside our try, we use the `delAsync` method to delete our session.
    // This method returns a boolean (true if successful, false if not)
    return await client.del(id);
  } catch (err: any) {
    throw new Error(err as string);
  }
}
