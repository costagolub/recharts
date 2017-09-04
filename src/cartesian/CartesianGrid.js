/**
 * @fileOverview Cartesian Grid
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import pureRender from '../util/PureRender';
import { PRESENTATION_ATTRIBUTES, getPresentationAttributes } from '../util/ReactUtils';

@pureRender
class CartesianGrid extends Component {

  static displayName = 'CartesianGrid';

  static propTypes = {
    ...PRESENTATION_ATTRIBUTES,
    x: PropTypes.number,
    y: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    horizontal: PropTypes.oneOfType([
      PropTypes.object, PropTypes.element, PropTypes.func, PropTypes.bool,
    ]),
    vertical: PropTypes.oneOfType([
      PropTypes.object, PropTypes.element, PropTypes.func, PropTypes.bool,
    ]),
    horizontalPoints: PropTypes.arrayOf(PropTypes.number),
    verticalPoints: PropTypes.arrayOf(PropTypes.number),
    horizontalCoordinatesGenerator: PropTypes.func,
    verticalCoordinatesGenerator: PropTypes.func,
    xAxis: PropTypes.object,
    yAxis: PropTypes.object,
    offset: PropTypes.object,
    chartWidth: PropTypes.number,
    chartHeight: PropTypes.number,
    verticalFill: PropTypes.arrayOf(PropTypes.string),
    horizontalFill: PropTypes.arrayOf(PropTypes.string)
  };

  static defaultProps = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    horizontal: true,
    vertical: true,
    // The ordinates of horizontal grid lines
    horizontalPoints: [],
    // The abscissas of vertical grid lines
    verticalPoints: [],

    stroke: '#ccc',
    fill: 'red',
    // The fill of colors of grid lines
    verticalFill: [],
    horizontalFill: []
  };

  renderLineItem(option, props) {
    let lineItem;

    if (React.isValidElement(option)) {
      lineItem = React.cloneElement(option, props);
    } else if (_.isFunction(option)) {
      lineItem = option(props);
    } else {
      const { x1, y1, x2, y2, key, ...others } = props;

      lineItem = (
        <line
          {...getPresentationAttributes(others)}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          fill="none"
          key={key}
        />
      );
    }

    return lineItem;
  }

  /**
   * Draw the horizontal grid lines
   * @param {Array} horizontalPoints either passed in as props or generated from function
   * @return {Group} Horizontal lines
   */
  renderHorizontal(horizontalPoints) {
    const { x, width, horizontal } = this.props;

    if (!horizontalPoints || !horizontalPoints.length) { return null; }

    const items = horizontalPoints.map((entry, i) => {
      const props = {
        ...this.props,
        x1: x,
        y1: entry,
        x2: x + width,
        y2: entry,
        key: `line-${i}`,
        index: i,
      };

      return this.renderLineItem(horizontal, props);
    });

    return <g className="recharts-cartesian-grid-horizontal">{items}</g>;
  }

  /**
   * Draw vertical grid lines
   * @param {Array} verticalPoints either passed in as props or generated from function
   * @return {Group} Vertical lines
   */
  renderVertical(verticalPoints) {
    const { y, height, vertical } = this.props;

    if (!verticalPoints || !verticalPoints.length) { return null; }

    const items = verticalPoints.map((entry, i) => {
      const props = {
        ...this.props,
        x1: entry,
        y1: y,
        x2: entry,
        y2: y + height,
        key: `line-${i}`,
        index: i,
      };

      return this.renderLineItem(vertical, props);
    });

    return <g className="recharts-cartesian-grid-vertical">{items}</g>;
  }

  /**
   * Draw vertical grid stripes filled by colors
   * @param {Array} verticalPoints either passed in as props or generated from function
   * @return {Group} Vertical stripes
   */
  renderVerticalStripes(verticalPoints) {
    const { verticalFill } = this.props;
    if (!verticalFill || !verticalFill.length) { return null; }

    const { fillOpacityVertical, x, y, width, height } = this.props;
    let verticalPointsUpdated = verticalPoints;
    if (x === 0) {
      verticalPointsUpdated.unshift(0);
    }

    const items = verticalPointsUpdated.map((entry, i) => {
      let lineWidth = Math.max(0, (i === 0) ? verticalPointsUpdated[i+1]-x : verticalPointsUpdated[i+1] !== undefined ? verticalPointsUpdated[i+1] - entry : width - entry);      

      let colorIndex = i % verticalFill.length;
      return (
        <rect
          key={i}
          x={Math.round(entry+x-x)}
          y={y}
          width={Math.round(lineWidth)}
          height={height}
          stroke="none"
          fill={verticalFill[colorIndex]}
          fillOpacity={fillOpacityVertical}
          className="recharts-cartesian-grid-bg"
        />
      )
    });

    return <g className="recharts-cartesian-gridstripes-vertical">{items}</g>;
  }
  

  /**
   * Draw horizontal grid stripes filled by colors
   * @param {Array} horizontalPoints either passed in as props or generated from function
   * @return {Group} Horizontal stripes
   */
  renderHorizontalStripes(horizontalPoints) {
    const { horizontalFill } = this.props;
    if (!horizontalFill || !horizontalFill.length) { return null; }

    const { fillOpacityHorizontal, x, y, width, height } = this.props;
    let horizontalPointsUpdated = horizontalPoints;
    if (y === 0) {
      horizontalPointsUpdated.unshift(0);
    }

    const items = horizontalPointsUpdated.map((entry, i) => {
      let lineHeight = Math.max(0, (i === 0) ? horizontalPointsUpdated[i+1]-y : horizontalPointsUpdated[i+1] !== undefined ? horizontalPointsUpdated[i+1] - entry : height - entry);

      let colorIndex = i % horizontalFill.length;
      return (
        <rect
          key={i}
          y={Math.round(entry+y-y)}
          x={x}
          height={lineHeight}
          width={width}
          stroke="none"
          fill={horizontalFill[colorIndex]}
          fillOpacity={fillOpacityHorizontal}
          className="recharts-cartesian-grid-bg"
        />
      )
    });

    return <g className="recharts-cartesian-gridstripes-horizontal">{items}</g>;
  }

  renderBackground() {
    const { fill } = this.props;

    if (!fill || fill === 'none') { return null; }

    const { fillOpacity, x, y, width, height } = this.props;

    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        stroke="none"
        fill={fill}
        fillOpacity={fillOpacity}
        className="recharts-cartesian-grid-bg"
      />
    );
  }

  render() {
    const { x, y, width, height, horizontal, vertical, horizontalCoordinatesGenerator,
      verticalCoordinatesGenerator, xAxis, yAxis, offset, chartWidth, chartHeight } = this.props;

    if (width <= 0 || height <= 0 || x !== +x || y !== +y) {
      return null;
    }

    let { horizontalPoints, verticalPoints } = this.props;

    if (_.isFunction(horizontalCoordinatesGenerator)) {
      horizontalPoints = horizontalCoordinatesGenerator({ yAxis, width: chartWidth,
        height: chartHeight, offset });
    }

    if (_.isFunction(verticalCoordinatesGenerator)) {
      verticalPoints = verticalCoordinatesGenerator({ xAxis, width: chartWidth,
        height: chartHeight, offset });
    }

    return (
      <g className="recharts-cartesian-grid">
        {vertical && this.renderVerticalStripes(verticalPoints)}
        {horizontal && this.renderHorizontalStripes(horizontalPoints)}

        {horizontal && this.renderHorizontal(horizontalPoints)}
        {vertical && this.renderVertical(verticalPoints)}
      </g>
    );
  }
}

export default CartesianGrid;
