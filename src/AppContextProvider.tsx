import * as React from 'react';
import DataStore from './DataStore';
import AppContext from './AppContext';
import {Models} from './types';

type Graph = Models.Graph;

const {useState} = React;

type AppContextProviderProps = {
  children: React.ReactNode,
};

const store = new DataStore();

function AppContextProvider(props: AppContextProviderProps) {
  const [selectedNode, setSelectedNode] = useState<null|string>(null);
  const [rootNode, setRootNode] = useState<null|Graph>(null);
  const [hoverNode, setHoverNode] = useState<null|string>(null);
  const value = {
    rootNode,
    setRootNode,
    selectedNode,
    setSelectedNode,
    hoverNode,
    setHoverNode,
    store,
  };
  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  )
}

export default AppContextProvider;
