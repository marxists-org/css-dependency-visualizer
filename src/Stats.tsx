import AppContext from './AppContext';
import React, {useContext} from 'react';
import {Models} from './types';
import {RouteComponentProps, useLocation} from 'react-router';
import './Stats.css';

type Graph = Models.Graph;

function reduceDirect(count:number, next:Graph):number {
  if (next.type === "ARCHIVE") {
    return count + next.children.filter(node => node.type === "HTML").length;
  }

  if (next.type === "HTML") {
    return count + 1;
  }

  return count;
}

function reduceIndirect(count:number, next: Graph): number {
  if (next.type === "ARCHIVE") {
    return count + next.children.reduce(reduceIndirect, 0);
  }

  if (next.type === "CSS") {
    return next.count + count;
  }

  return count;
}

export function Stats({nodes}: {nodes: Graph[]}) {
  if (nodes.length === 0) return null;
  if (nodes[0].type !== "ROOT") throw new Error("invariant");
  if (nodes.length === 1) {
    return (
      <div className="Stats">
        There are <span className="Stats_primary-metric">{nodes[0].count.toLocaleString()}</span> CSS files across marxists.org.
      </div>
    );
  }
  if (nodes.length < 2) throw new Error('invariant');

  const child = nodes[nodes.length - 1];
  const parent = nodes[nodes.length - 2];

  let i = 1;
  let parentCss = nodes[i];
  while (parentCss.type !== "CSS" && i < nodes.length) {
    parentCss = nodes[nodes.length - i];
    i++;
  }

  const [relationshipDescription, indirectDescription] = (() => {
    switch(parent.type) {
      case "ARCHIVE": return [`of ${parentCss.name}'s dependents within ${parent.name}`];
      case "CSS": return [`of ${parent.name}'s dependents across marxists.org`];
      case "ROOT":
        const direct = child.children.reduce(reduceDirect, 0);
        const indirect = child.children.reduce(reduceIndirect, 0);
        let desc = 'of the css across marxists.org';
        if (indirect > 0) {
          return [desc, `(${direct.toLocaleString()} directly and ${indirect.toLocaleString()} indirectly)`];
        }
        return [desc];
      default: throw new Error('invariant');
    }
  })();

  const percent = (child.percent * 100).toFixed(2);
  const count = child.count.toLocaleString();
  const breadcrumbs = nodes.slice(1).map(({name}) => name).join(" > ");
  const indirect = indirectDescription == null
    ? <>&nbsp;</>
    : indirectDescription;

  return (
    <div className="Stats">
      <div className="Stats_breadcrumbs">{breadcrumbs}</div>
      <div>
        {child.type === 'ARCHIVE' ? 'contains' : 'constitutes'} <span className="Stats_primary-metric">{percent}%</span> {child.type === 'HTML' ? null : `(${count})`} {relationshipDescription}<br/>{indirect}
      </div>
    </div>
  );
}

export default function(props: {className: string}) {
  const {rootNode, hoverNode, store} = useContext(AppContext);
  const location = useLocation();
  if (rootNode == null) return null;

  const pathChunks = (() => {
    let chunks = location.pathname.substr(1).split('/');
    return chunks[0] === "" ? [] : chunks;
  })();

  const pathNodes = pathChunks
    .map(id => store.findById(id))
    .filter(node => node != null) as Graph[];
  const nodes = [rootNode, ...pathNodes];

  const hover = hoverNode === null
    ? null
    : store.findById(hoverNode);
  if (hover != null) nodes.push(hover);

  return (
    <div className={props.className}>
      <Stats nodes={nodes}/>
    </div>
  )
}
