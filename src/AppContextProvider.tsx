import * as React from 'react';
import AppContext from './AppContext';
import {Entry} from './types';

const {useState} = React;

type AppContextProviderProps = {
  children: React.ReactNode,
};

function AppContextProvider(props: AppContextProviderProps) {
  const [data, setData] = useState<null|Map<string, Entry>>(null);
  const [hoverNode, setHoverNode] = useState<null|string>(null);
  const value = { data, setData, hoverNode, setHoverNode };
  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  )
}

export default AppContextProvider;
