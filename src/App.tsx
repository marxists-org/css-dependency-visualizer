import './App.css';
import AppContext from './AppContext';
import DependentsRoute from './DependentsRoute';
import IndexRoute from './IndexRoute';
import React, {useContext, useEffect} from 'react';
import {Route, Switch} from 'react-router-dom';
import {fetch} from './DataStore';

function App() {
  const {data, setData} = useContext(AppContext);

  useEffect(() => {
    if (data === null) fetch().then(setData);
  }, [setData, data]);

  return (
    <div className="App">
      <Switch>
        <Route path={["/dependents/:file+", "/dependents"]} component={DependentsRoute}/>
        <Route component={IndexRoute}/>
      </Switch>
    </div>
  );
}

export default App;
