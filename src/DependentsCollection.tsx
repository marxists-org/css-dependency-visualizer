import AppContext from './AppContext';
import React, {useContext} from 'react';
import {AutoSizer, WindowScroller, List} from 'react-virtualized';
import DependentsCollectionListItem, {Props as DependentsCollectionListItemProps} from './DependentsCollectionListItem';
import {Entry} from './types';
import {useLocation, useHistory} from 'react-router-dom';
import {scaleOrdinal, quantize, interpolateSpectral} from "d3";
import {selectCssEntries, selectHtmlEntries} from "./utils";
import 'react-virtualized/styles.css';

function linkItemPropsFromEntry(node: Entry, parentCount: number): DependentsCollectionListItemProps {
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
  const entries = props.node.id === "ALL_CSS"
    ? selectCssEntries(data, props.node.dependents, false)
    : selectHtmlEntries(data, props.node.dependents, true);

  const parentCount = props.node.dependentsCount.direct + props.node.dependentsCount.indirect;
  const pathChunks = location.pathname.substr(1).split('/');
  // FIXME: move to global state
  const getColor = scaleOrdinal()
    .domain(entries.map((d:Entry) => d.name))
    .range(quantize(t => interpolateSpectral(t * 0.8 + 0.1), entries.length).reverse())

  const rowRenderer = (props: {
    key: string,          // Unique key within array of rows
    index: number,        // Index of row within collection
    isScrolling: boolean, // The List is currently being scrolled
    isVisible: boolean,   // This row is visible within the List (eg it is not an overscanned row)
    style: any,           // Style object to be applied to row (to position it)
  }) => {
    const node = entries[props.index];
    const className = node.id === hoverNode
      ? "line-item--hover"
      : undefined;
    const color = getColor(node.name);

    const name = node.path;

    const type = node.type;

    return (
      <DependentsCollectionListItem key={props.key}
                          color={color as string}
                          className={className}
                          style={props.style}
                          {...{...linkItemPropsFromEntry(node, parentCount), name, type}}/>
    );
  };


  return (
    <WindowScroller>
      {({height, scrollTop, isScrolling, onChildScroll}) => (
        <AutoSizer disableHeight>
          {({width}) => (
            <div>
              <List
                autoHeight
                height={height}
                isScrolling={isScrolling}
                scrollTop={scrollTop}
                onScroll={onChildScroll}
                overscanRowCount={2}
                rowCount={entries.length}
                rowHeight={41}
                rowRenderer={rowRenderer}
                width={width} />
            </div>
          )}
        </AutoSizer>
      )}
    </WindowScroller>
  );
}

export default Collection;
