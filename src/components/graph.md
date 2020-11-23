# Walkthrough D3.js

- ### Init SVG

```html
<svg id="gold-graph-d3-line" width="100%"></svg>
```

- ### Prepare Data

```js
// Preparing Data
let formattedLineData = JSON.parse(JSON.stringify(this.states ? data : data1));

// Pick html tag
let vis = d3.select("#gold-graph-d3-line");

// change format date
for (var indexData = 0; indexData < formattedLineData.length; indexData++) {
  formattedLineData[indexData].d = helpers.parseDate(
    formattedLineData[indexData].d
  );
}
// Prepare range and domain
// Max and min in x bar, y bar
let svgWidth, svgHeight;
let xRange, yRange;
let xAxis, yAxis;
let graphMargin;
let xMin = d3.min(formattedLineData, (d) => d.d);
let xMax = d3.max(formattedLineData, (d) => d.d);
let yMin = d3.min(formattedLineData, (d) => Number(d.v));
let yMax = d3.max(formattedLineData, (d) => Number(d.v));
```

- ### Format for currency

```js
//manage text in ticks
let formatCurrency = (d) => {
  let toNumber = parseFloat(d);
  return (
    toNumber
      .toLocaleString("th", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " ฿"
  );
};
```

- ### Function sizeUpdate()
  - เพื่อกำหนดขอบเขตความสูง และกว้างของตัวกราฟ
- ### Function rangeUpdate()
  - เพื่อกำหนดระยะห่างเริ่มเต้นและสิ้นสุด
- ### Function axisUpdate()

  - เพื่อกำหนดชุดของข้อมูล และความถี่ของการแสดงผลข้อมูล

- ### Generate line data style

```js
// Appending or Changing Element
let lineGen = d3
  .line()
  .curve(d3.curveLinear) // http://bl.ocks.org/d3indepth/b6d4845973089bc1012dec1674d3aff8
  .x((d) => xRange(d.d))
  .y((d) => yRange(d.v));
```

- ### Graph line or Watermark

```js
var make_y_axis = () => {
  return d3.axisRight(yRange).ticks(6);
};
```

- ### Generate Tooltip

```js
var generateTooltip = () => {
  // Tooltip background
  // Tooltip
  let tooltip = vis
    .append("g")
    .attr("class", "focus-tooltip")
    .style("display", "none");

  tooltip
    .append("rect")
    .attr("class", "tooltip-rect")
    .attr("width", constants.tooltipWidth)
    .attr("height", constants.tooltipHeight)
    .attr("rx", 4)
    .attr("ry", 4);

  // Tooltip date
  tooltip
    .append("text")
    .attr("x", 25)
    .attr("y", 20)
    .attr("class", "tooltip-date")
    .attr("text-anchor", "left")
    .attr("fill", constants.grey)
    .text("12/03/07");

  // Tooltip nav data
  tooltip
    .append("text")
    .attr("x", 40)
    .attr("y", 40)
    .attr("class", "tooltip-nav")
    .attr("text-anchor", "left")
    .text("10.2464");
};
```

- ### Draw Graph

  - #### First Draw !!

```js
vis
  .append("svg:g")
  .attr("class", "x axis")
  .call(xAxis);
```

```js
vis
  .append("svg:g")
  .attr("class", "y axis")
  .attr("transform", "translate(-30,-10)")
  .attr("fill", "none")
  .call(yAxis);
```

```js
vis
  .append("g")
  .attr("class", "grid")
  .style("opacity", ".2")
  .attr("transform", "translate(60,0)")
  .attr("stroke-dasharray", "3,3")
  .call(
    make_y_axis()
      .tickSize(0 + svgWidth, 0, 0)
      .tickFormat("")
  );
```

```js
// Data Line
vis
  .append("path")
  .attr("class", "line-data")
  .transition()
  .duration(100)
  .attr("d", lineGen(formattedLineData))
  .attr("stroke", constants.graphColor)
  .attr("stroke-width", constants.lineStroke)
  .attr("fill", "none");
```

```js
// Line on focus
vis
  .append("line")
  .attr("class", "focus-line")
  .attr("y1", constants.margin.top)
  .attr("y2", svgHeight - constants.margin.bottom)
  .attr("stroke-width", constants.focusStroke)
  .attr("stroke", "#999999")
  .style("display", "none");

// Circle
let focusCircle = vis
  .append("g")
  .attr("class", "focus-circle")
  .style("display", "none");

// Circle Background
focusCircle.append("circle").attr("r", constants.circleRadius + 3);

// Circle Inside
focusCircle
  .append("circle")
  .attr("class", "inner-circle")
  .attr("r", constants.circleRadius);

// focus Tooltip
generateTooltip();
```

   - #### After first Draw !!

```js
vis.selectAll(".focus-line").style("display", "none");

vis.selectAll(".focus-circle").style("display", "none");

vis.selectAll(".focus-tooltip-day").style("display", "none");

vis.selectAll(".focus-tooltip").style("display", "none");
```

```js
// X Axis
vis.select(".x").call(xAxis);
```

```js
// y Axis
vis
  .select(".y")
  .attr("fill", "none")
  .call(yAxis);
```

```js
// Grid
vis
  .select(".grid")
  .attr("class", "grid")
  .style("opacity", ".2")
  .attr("transform", "translate(50, 0)")
  .call(
    make_y_axis()
      .tickSize(0 + svgWidth, 0, 0)
      .tickFormat("")
  );
```

```js
// Data Line
vis
  .select(".line-data")
  .transition()
  .duration(100)
  .ease(d3.easeLinear)
  .attr("d", lineGen(formattedLineData))
  .attr("stroke", constants.graphColor)
  .attr("stroke-width", constants.lineStroke)
  .attr("fill", "none");
```

- ### Helpers function

  - bisectDate
  - mouseOver
  - mouseOut
  - mouseMove
  - touchMove
  - handleMove

- ### Overlay focus element

```js
// Overlay Element
vis
  .append("rect")
  .attr("class", "focusing-overlay")
  .attr("fill", "none")
  .attr("pointer-events", "all")
  .attr("y", constants.margin.bgTop)
  .attr("width", svgWidth)
  .attr("height", svgHeight - constants.margin.bottom - constants.margin.bgTop)
  .on("mouseover", mouseEvent.mouseOver)
  .on("mouseout", mouseEvent.mouseOut)
  .on("mousemove", mouseEvent.mouseMove)
  .on("touchmove", mouseEvent.touchMove, true);
```

- ### Function tickUpdate

  - เพื่อคำนวณรายละเอียดของ element ที่เปลี่ยนไปตามขนาดหน้าจอ เช่น ขนาด สี ตำแหน่ง ที่เปลี่ยนไป

- ### Function updateAxisAndGraph
  - เพื่อคำนวณขนาดทั้งหมดของกราฟที่เปลี่ยนไป

* ## Key of Responsive

```js
d3.select(window).on("resize", () => {
  sizeUpdate();
  rangeUpdate();
  axisUpdate();
  updateAxisAndGraph();
  tickUpdate();
});
```
