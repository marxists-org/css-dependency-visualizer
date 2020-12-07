import AppContext from './AppContext';
import Collection from './DependentsCollection';
import Loading from './Loading';
import React, { useContext} from 'react';
import Stats from './Stats';
import {RouteComponentProps, useParams} from 'react-router';
import {selectHtmlEntries} from "./utils";

type IndexParams = {
  id: string,
  archiveId: string,
};

type Props = RouteComponentProps<IndexParams>;

function LoadingPage(props: {}) {
  return (
    <>
      <div className="Curtain">
        <Loading/>
      </div>
      <div className="AppTopViz">
        <div style={{width: "400px", height: "400px"}}>
        </div>
      </div>
      <div className="AppTopStats">
      </div>
      <div className="Header">
        <div className="Header_name">
          Name
        </div>
      </div>
      <div className="AppList">
      </div>
    </>
  );
}

function DependentsRoute(props: Props) {
  const { data } = useContext(AppContext);
  const {file} = useParams();

  if (data == null) return <LoadingPage />;
  const allCss = data.get("ALL_CSS")!;
  const node = file == null
    ? allCss
    : (() => selectHtmlEntries(data, allCss.dependents, true).find(node => node.path === "/"+file))();
  return node == null
    ? null
    : (<>
        <Stats className="AppTopStats"/>
        <div className="Header">
          <div className="Header_name">
            Name
          </div>
        </div>
        <div className="AppList">
          {node == null ? null : <Collection node={node}/>}
        </div>
      </>);
}

export default DependentsRoute;
