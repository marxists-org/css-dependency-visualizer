import AppContext from './AppContext';
import Collection from './Collection';
import Donut from './Donut';
import React, { useContext} from 'react';
import Stats from './Stats';
import {RouteComponentProps, useLocation} from 'react-router';

type IndexParams = {
  id: string,
  archiveId: string,
};

type Props = RouteComponentProps<IndexParams>;

function IndexRoute(props: Props) {
  const { data } = useContext(AppContext);
  const location = useLocation();
  if (data == null) return null;
  const pathChunks = location.pathname.substr(1).split('/');
  const selectedNode = pathChunks[pathChunks.length - 1];
  const node = data.get(selectedNode === "" ? "ALL_CSS" : selectedNode);

  return node == null
    ? <>loading...</>
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
