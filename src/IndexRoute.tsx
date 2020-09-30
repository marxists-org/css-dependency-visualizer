import AppContext from './AppContext';
import Collection from './Collection';
import Donut from './Donut';
import React, { useContext} from 'react';
import Stats from './Stats';
import {Models} from './types';
import {RouteComponentProps, useLocation} from 'react-router';

type Graph = Models.Graph;

type IndexParams = {
  id: string,
  archiveId: string,
};

type Props = RouteComponentProps<IndexParams>;

function IndexRoute(props: Props) {
  const { rootNode, store } = useContext(AppContext);
  const location = useLocation();
  const pathChunks = location.pathname.substr(1).split('/');
  const selectedNode = pathChunks[pathChunks.length - 1];
  const node = selectedNode === ""
    ? rootNode
    : store.findById(selectedNode);

  return node == null
    ? null
    : (<>
        <div className="AppTopViz">
          <div style={{width: "400px", height: "400px"}}>
            <Donut node={node}/>
          </div>
        </div>
        <Stats className="AppTopStats"/>
        <div className="Header">
          <div className="Header_name">
            Name
          </div>
          <div className="Header_bar"></div>
          <div className="Header_count">
            Count
          </div>
          <div className="Header_percentage">
            Percent
          </div>
        </div>
        <div className="AppList">
          {node == null ? null : <Collection node={node}/>}
        </div>
      </>);
}

export default IndexRoute;
