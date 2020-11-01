import {Entry} from './types';

export const fetch = async ():Promise<Map<string, Entry>> => {
  try {
    const response = await window.fetch("https://data.css.marxists.dev/data.json", {mode: 'cors'});
    const data = await response.json() as {[key:string]:Entry};
    return new Map(Object.entries(data)) as Map<string, Entry>;
  } catch (e) {
    console.error(e);
    throw e;
  }
}
