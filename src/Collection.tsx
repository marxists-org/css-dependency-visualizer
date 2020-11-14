import AppContext from './AppContext';
import React, {useContext} from 'react';
import {AutoSizer, List} from 'react-virtualized';
import CollectionListItem, {Props as CollectionListItemProps} from './CollectionListItem';
import {Entry} from './types';
import {useLocation, useHistory} from 'react-router-dom';
import {scaleOrdinal, quantize, interpolateSpectral} from "d3";
import {selectEntries} from "./utils";
import 'react-virtualized/styles.css';

function linkItemPropsFromEntry(node: Entry, parentCount: number): CollectionListItemProps {
  const {name, path, id, dependentsCount, type} = node;
  const count = type === "HTML" ? 1 : dependentsCount.indirect + dependentsCount.direct;
  const percent = count / parentCount;

  return {name: `/${name}` === path ? path : name, id, count, percent, type};
}

function Collection(props: {node: Entry}) {
  const {data, hoverNode, setHoverNode} = useContext(AppContext);
  const history = useHistory();
  const location = useLocation();

  if (data === null) return null;
  const entries = selectEntries(data, props.node.dependents);
  const parentCount = props.node.dependentsCount.direct + props.node.dependentsCount.indirect;

  const pathChunks = location.pathname.substr(1).split('/');
  const onLineItemMouseEnter = (id: string|null) => {setHoverNode(id)};
  const onLineItemMouseLeave = (id: string|null) => {setHoverNode(null)};

  // FIXME: move to global state
  const getColor = scaleOrdinal()
    .domain(entries.map((arr:Array<Entry>) => arr[0] as Entry).map((d:Entry) => d.name))
    .range(quantize(t => interpolateSpectral(t * 0.8 + 0.1), entries.length).reverse())

  const rowRenderer = (props: {
    key: string,          // Unique key within array of rows
    index: number,        // Index of row within collection
    isScrolling: boolean, // The List is currently being scrolled
    isVisible: boolean,   // This row is visible within the List (eg it is not an overscanned row)
    style: any,           // Style object to be applied to row (to position it)
  }) => {
    const combinedNodes = entries[props.index];
    const node = entries[props.index][0];
    const className = node.id === hoverNode
      ? "line-item--hover"
      : undefined;
    const color = getColor(node.name);

    const name = combinedNodes.reduce((prev, next, i) => prev + (i === 0 ? "" : "/") + next.name, '');

    const onLineItemClick = () => {
      const endNode = combinedNodes[combinedNodes.length - 1];
      if (endNode.type === "HTML") return;
      if (endNode.type === "CSS" && endNode.dependents.length === 0) return;
      const parentUri = pathChunks[0] !== "" ? `/${pathChunks.join("/")}` : "";
      const combinedUris = combinedNodes.reduce((prev, next) => prev + `/${next.id}`, '');
      history.push(`${parentUri}${combinedUris}`);
    };

    const type = combinedNodes[combinedNodes.length - 1].type;

    return (
      <CollectionListItem key={props.key}
                          color={color as string}
                          className={className}
                          onClick={onLineItemClick}
                          onMouseEnter={onLineItemMouseEnter}
                          onMouseLeave={onLineItemMouseLeave}
                          style={props.style}
                          {...{...linkItemPropsFromEntry(node, parentCount), name, type}}/>
    );
  };


  return (
    <AutoSizer>
      {({width, height}) => (
        <div>
          <List
            height={height}
            overscanRowCount={2}
            rowCount={entries.length}
            rowHeight={41}
            rowRenderer={rowRenderer}
            width={width} />
        </div>
      )}
    </AutoSizer>
  );
}

export default Collection;
