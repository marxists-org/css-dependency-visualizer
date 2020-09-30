import AppContext from './AppContext';
import IndexRoute from './IndexRoute';
import React, { useState, useEffect, useContext } from 'react';
import { Switch, Route, } from 'react-router-dom';
import './App.css';

function App() {
  const { setRootNode, store } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);

  // this needs to be useEffect
  useEffect(() => {
    if (!isLoading) return;
    (async () => {
      const graph = await store.get();
      setIsLoading(false);
      setRootNode(graph);
    })();
  });

  return (
    <div className="App">
      <Switch>
        {isLoading ? "loading..." : <Route component={IndexRoute}/>}
      </Switch>
    </div>
  );
}

export default App;
