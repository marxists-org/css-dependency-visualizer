import AppContext from './AppContext';
import {Entry} from './types';
import React, {useContext} from 'react';
import {useLocation} from 'react-router';
import './Stats.css';

export function Stats({nodes, hoverNode}: {nodes: Entry[], hoverNode: Entry|null}) {
  if (nodes.length === 0) return null;
  if (nodes[0].type !== "ROOT") throw new Error("invariant");
  if (nodes.length === 1 && hoverNode == null) {
    const countString =
      (nodes[0].dependentsCount.direct + nodes[0].dependentsCount.indirect).toLocaleString();
    return (
      <>
      <div className="Breadcrumbs"></div>
      <div className="Stats">
        <div>
          There are <span className="Stats_primary-metric">{countString}</span><br/>files analyzed across marxists.org.
        </div>
      </div>
      </>
    );
  }

  const collection: Array<Entry[]> = [];
  let current: Entry[] = [];
  collection.push(current);
  for (let i = 0; i < nodes.length ; i++) {
    let n = nodes[i];
    current.push(n);
    if ((n.type === "ROOT" || n.type === "CSS") && i < (nodes.length - 1)) {
      current = [];
      collection.push(current);
    }
  }

  let child, parent;
  if (hoverNode == null) {
    const childArr = collection[collection.length - 1];
    child = childArr[childArr.length - 1];
    const parentArr = collection[collection.length - 2];
    parent = parentArr[parentArr.length - 1];
  } else {
    child = hoverNode;
    const parentArr = collection[collection.length - 1];
    parent = parentArr[parentArr.length - 1];
  }

  let parentCss = nodes.find(n => n.type === "CSS");

  const [relationshipDescription, indirectDescription] = (() => {
    const desc = (() => {
      switch(parent.type) {
        case "DIRECTORY": return parentCss === undefined
          ? (
              <>of <span style={{whiteSpace: "nowrap"}}>{parent.path}'s</span> dependents across marxists.org</>
            )
          : (
              <>
                of <span style={{whiteSpace: "nowrap"}}>{parentCss.path}'s</span> dependents within <span style={{whiteSpace: "nowrap"}}>{parent.path}</span>
              </>
            );
        case "CSS": return (<>of <span style={{whiteSpace: "nowrap"}}>{parent.path}'s</span> dependents across marxists.org</>)
        case "ROOT":
          return (<>of the css across marxists.org</>);
        default: throw new Error('invariant');
      }
    })();

    const direct = child.dependentsCount.direct;
    const indirect = child.dependentsCount.indirect;
    if (indirect > 0) {
      return [desc, `(${direct.toLocaleString()} directly and ${indirect.toLocaleString()} indirectly)`];
    }
    return [desc];
  })();

  const percent = (((child.type === "HTML" ? 1 : (child.dependentsCount.direct + child.dependentsCount.indirect))
                  /(parent.dependentsCount.direct + parent.dependentsCount.indirect))
                  * 100).toFixed(2);
  const count = (child.dependentsCount.direct + child.dependentsCount.indirect).toLocaleString();
  const breadcrumbs = collection.slice(1).map((nodes: Entry[], i: number) => {
    if (i === collection.length - 1) {
      const node = nodes[nodes.length - 2];
      return node.path;
    } else {
      const node = nodes[nodes.length - 1];
      return node.type === "ROOT" ? null : node.path;
    }
  }).join(' > ');;
  const indirect = indirectDescription == null
    ? null
    : (<><br/>{indirectDescription}</>);

  const childDescription = child.type === "DIRECTORY"
    ? `The ${child.name} directory`
    : child.name;

  return (
    <>
      <div className="Breadcrumbs">{breadcrumbs}</div>
      <div className="Stats">
        <div>
          <span className="Stats_child-path">{childDescription}</span> {child.type === 'DIRECTORY' ? 'contains' : 'constitutes'} <span className="Stats_primary-metric">{percent}%</span> {child.type === 'HTML' ? null : `(${count})`}<br/>{relationshipDescription}{indirect}
        </div>
      </div>
    </>
  );
}

export default function(props: {className: string}) {
  const {data, hoverNode} = useContext(AppContext);
  const location = useLocation();
  if (data == null) return null;

  const pathChunks = (() => {
    let chunks = location.pathname.substr(1).split('/');
    return chunks[0] === "" ? [] : chunks;
  })();

  const rootNode = data.get("ALL_CSS") as Entry;
  const pathNodes = pathChunks
    .map(id => data.get(id))
    .filter(node => node != null) as Entry[];
  const nodes = [rootNode, ...pathNodes];

  const hoverOrUndefined = hoverNode === null
    ? null
    : data.get(hoverNode);
  const hover = hoverOrUndefined == null ? null : hoverOrUndefined;

  return (
    <div className={props.className}>
      <Stats nodes={nodes} hoverNode={hover}/>
    </div>
  )
}
