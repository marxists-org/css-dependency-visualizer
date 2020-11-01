import AppContext from './AppContext';
import {useHistory} from 'react-router-dom';
import React, { useEffect, useRef, useContext } from "react";
import * as d3 from "d3";

// FIXME: duped from Collection.tsx
const sortKeys = {
  ROOT: 0,
  DIRECTORY: 1,
  HTML: 2,
  CSS: 3,
};

function sortEntries(a, b) {
  if (a.type === b.type) {
    return (b.dependentsCount.indirect + b.dependentsCount.direct) - (a.dependentsCount.indirect + a.dependentsCount.direct);
  } else {
    return sortKeys[a.type] - sortKeys[b.type];
  }
}

function Donut(props) {
  const svg = useRef(null);
  const {hoverNode, setHoverNode, data} = useContext(AppContext);
  const history = useHistory();

  useEffect(() => {
    const onClick = (id) => history.push(id);
    const dependents = props.node.dependents
      .map(id => data.get(id))
      .filter(node => node != null);
    buildDonut(svg.current, dependents
      .sort(sortEntries)
      .map(({name, dependentsCount, id}) =>
        ({name, id, value: (dependentsCount.direct + dependentsCount.indirect)})), onClick, setHoverNode);
  }, [props.node, setHoverNode, history, data]);

  useEffect(() => {
    mouseover(svg.current, hoverNode);
  }, [hoverNode]);

  return (<svg ref={svg}></svg>);
}

function mouseover(svgElement, id) {
  const paths = d3.select(svgElement)
    .selectAll(".arcs");

  if (id !== null) {
    paths.filter((node, i) => node.data.id === id)
      .transition()
      .duration('50')
      .attr('opacity', '1');
    paths.filter((node, i) => node.data.id !== id)
      .transition()
      .duration('50')
      .attr('opacity', '.65');
  } else {
    paths.transition()
      .duration('50')
      .attr('opacity', '1');
  }
}

function buildDonut(svgElement, data, onClick, setHoverNode) {
  const color = d3.scaleOrdinal()
    .domain(data.map(d => d.name))
    .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse())

  const width = 400;
  const height = 400;
  const radius = Math.min(width, height) / 2;

  const arc = d3.arc()
    .innerRadius(radius * 0.57)
    .outerRadius(radius - 1);

  const svg = d3.select(svgElement)
      .attr("viewBox", [-width / 2, -height / 2, width, height]);

  const pie = d3.pie()
    .padAngle(0.005)
    .sort(null)
    .value(d => d.value);

  const arcs = pie(data);
  const bgArc = pie([{value: 100}]);

  svg.selectAll('path')
    .data(bgArc)
    .join("path")
    .attr("fill", "ghostwhite")
    .attr("stroke", "lightgray")
    .attr("d", arc);

  const paths = svg.selectAll(".arcs")
    .data(arcs)
    .join("path")
    .classed('arcs', true);

  paths
    .attr("fill", d => color(d.data.name))
    .attr("d", arc)
    .on('mouseover', function(event, node) {
      setHoverNode(node.data.id);
    })
    .on('mouseout', function(event, node) {
      setHoverNode(null);
    })
    .on('click', function(event, node) {
      onClick(node.data.id);
    });
}

export default Donut;
