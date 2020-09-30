import DataStore from './DataStore';
import {createContext} from 'react';
import {Models} from './types';

type Graph = Models.Graph;

type AppContextType = {
  rootNode: null|Graph,
  setRootNode: (node: null|Graph) => void,
  hoverNode: null|string,
  setHoverNode: (node: null|string) => void,
  store: DataStore,
};

const AppContext = createContext<AppContextType>({} as AppContextType);

export default AppContext;
