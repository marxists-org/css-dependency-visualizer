import {createContext} from 'react';
import {Entry} from './types';

type AppContextType = {
  data: null|Map<string, Entry>,
  setData: (data: Map<string, Entry>) => void,
  hoverNode: null|string,
  setHoverNode: (node: null|string) => void,
};

const AppContext = createContext<AppContextType>({} as AppContextType);

export default AppContext;
