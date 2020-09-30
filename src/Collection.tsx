import AppContext from './AppContext';
import React, {useContext} from 'react';
import {AutoSizer, List, WindowScroller} from 'react-virtualized';
import CollectionListItem, {Props as CollectionListItemProps} from './CollectionListItem';
import {Models} from './types';
import {useLocation, useHistory} from 'react-router-dom';
import {scaleOrdinal, quantize, interpolateSpectral} from "d3";
import 'react-virtualized/styles.css';

type Graph = Models.Graph;

function linkItemPropsFromGraph(node: Graph): CollectionListItemProps {
  const {name, id, percent, count} = node;
  return {name, id, count, percent};
}

function Collection(props: {node: Graph}) {
  const data = props.node.children;
  const nodes =
    data.sort((a: Graph, b: Graph) => b.count - a.count);

  const history = useHistory();
  const location = useLocation();
  const pathChunks = location.pathname.substr(1).split('/');
  const {hoverNode, setHoverNode} = useContext(AppContext);
  const onLineItemMouseEnter = (id: string|null) => {setHoverNode(id)};
  const onLineItemMouseLeave = (id: string|null) => {setHoverNode(null)};

  // FIXME: move to global state
  const getColor = scaleOrdinal()
    .domain(nodes.map(d => d.name))
    .range(quantize(t => interpolateSpectral(t * 0.8 + 0.1), nodes.length).reverse())

  const rowRenderer = (props: {
    key: string,          // Unique key within array of rows
    index: number,        // Index of row within collection
    isScrolling: boolean, // The List is currently being scrolled
    isVisible: boolean,   // This row is visible within the List (eg it is not an overscanned row)
    style: any,           // Style object to be applied to row (to position it)
  }) => {
    const node = nodes[props.index];
    const className = node.id === hoverNode
      ? "line-item--hover"
      : undefined;
    const color = getColor(node.name);
    const onLineItemClick = () => {
      if (node.type === "HTML") return;
      if (pathChunks[0] !== "") {
        console.log(pathChunks);
        history.push(`/${pathChunks.join("/")}/${node.id}`);
      } else {
        history.push(node.id);
      }
    };

    return (
      <CollectionListItem key={props.key}
                          color={color as string}
                          className={className}
                          onClick={onLineItemClick}
                          onMouseEnter={onLineItemMouseEnter}
                          onMouseLeave={onLineItemMouseLeave}
                          style={props.style}
                          {...linkItemPropsFromGraph(node)}/>
    );
  };


  return (
    <AutoSizer>
      {({width, height}) => (
        <div>
          <List
            height={height}
            overscanRowCount={2}
            rowCount={nodes.length}
            rowHeight={41}
            rowRenderer={rowRenderer}
            width={width} />
        </div>
      )}
    </AutoSizer>
  );
}

export default Collection;
