<template>
	<div id="gold-graph">
		<div class="graph-area">
			<svg id="gold-graph-d3-line" width="100%"></svg>
		</div>
		<button @click="swithData(1)">Data 1</button>
		<button @click="swithData(0)">Data 2</button>
	</div>
</template>

<script>
import * as d3 from 'd3'

// Helper Functions
let helpers = {
	TH: d3.timeFormatDefaultLocale({
		decimal: '.',
		thousands: ',',
		grouping: [3],
		currency: ['$', ''],
		dateTime: '%a %b %e %X %Y',
		date: '%d/%m/%Y',
		time: '%H:%M:%S',
		periods: ['AM', 'PM'],
		days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		shortDays: ['อ', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
		months: [
			'มกราคม',
			'กุมภาพันธ์',
			'มีนาคม',
			'เมษายน',
			'พฤษภาคม',
			'มิถุนายน',
			'กรกฎาคม',
			'สิงหาคม',
			'กันยายน',
			'ตุลาคม',
			'พฤศจิกายน',
			'ธันวาคม'
		],
		shortMonths: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
	}),
	numberFormat: (num) => {
		var parts = num.toString().split('.')
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
		return parts.join('.') + ' ฿'
	},
	changeFormat: (change) => parseFloat(change).toFixed(0),
	parseDate: d3.timeParse('%Y-%m-%dT%H:%M:%SZ'),
	getDate: d3.timeFormat('%d/%m/%y | %H.%M'),
	colorTheme: (pl) => {
		if (pl > 0) return constants.profit
		else if (pl == 0) return constants.stable
		return constants.loss
	},
	iconPriceChange: (pl) => {
		if (pl > 0) return '\uf0d8'
		else if (pl == 0) return '\uf0dc'
		return '\uf0d7'
	}
}

// Constant
let constants = {
	graphMarginPercentage: 0.1,

	// color and styling
	grey: '#B0B0B0',
	profit: '#17c161',
	loss: '#da1616', //da1616
	stable: '#999999',
	graphColor: '#FFD700',

	margin: {
		top: 20,
		left: 0,
		right: 0,
		bottom: 20,
		bgTop: 12
	},

	// Focusing
	focusStroke: 1.5,
	lineStroke: 2,
	axisStroke: 2,
	circleRadius: 4.5,

	// Tooltip
	tooltipDayWidth: 130,
	tooltipDayHeight: 80,
	tooltipWidth: 160,
	tooltipHeight: 50,
	driftRightMargin: 10,
	driftTopMargin: 22.5,

	// Tick Styling
	tickMoveFactor: 34
}

import { data, data1 } from './data.js'
export default {
	data() {
		return {
			firstPaint: true,
			states: true
		}
	},
	computed: {
		checkNavData() {
			return data.length > 0
		},
		yAxisFormatTitle() {
			switch ('1Y') {
				case '1D':
					return helpers.TH.format('%H:%M')
				case '5D':
					return helpers.TH.format('%e %b')
				case '1W':
					return helpers.TH.format('%e %b')
				case '1M':
					return helpers.TH.format('%e %b')
				default:
					return helpers.TH.format('%e %b %y')
			}
		},
		yAxisFormatTick() {
			switch ('1Y') {
				case '5D':
					return 4
				case '1W':
					return 2
				case '6M':
					return 2
				case 'SI':
					return 4
				default:
					return 6
			}
		}
	},
	async mounted() {
		await this.queryData()
	},
	methods: {
		swithData(condition) {
			this.states = condition
			this.queryData()
		},
		async queryData() {
			await this.renderGraph()
		},
		graphHeight() {
			let graphWidth = document.getElementById('gold-graph-d3-line').clientWidth
			let graphRatio = graphWidth > 760 ? 0.5 : 0.6

			return graphWidth * graphRatio
		},
		renderGraph() {
			if (!this.checkNavData) {
				return
			}

			if (this.firstPaint) {
				this.drawGraph({ isFirst: true })
				this.firstPaint = false
			} else {
				this.drawGraph({ isFirst: false })
			}
		},
		drawGraph(options) {
			let isFirst = options.isFirst
			// Preparing Data

			let formattedLineData = JSON.parse(JSON.stringify(this.states ? data : data1))

			let vis = d3.select('#gold-graph-d3-line')
			let spaceNavLineElem = document.getElementById('gold-graph-d3-line')

			// change format date
			for (var indexData = 0; indexData < formattedLineData.length; indexData++) {
				formattedLineData[indexData].d = helpers.parseDate(formattedLineData[indexData].d)
			}

			// Prepare range and domain
			// Max and min in x bar, y bar
			let svgWidth, svgHeight
			let xRange, yRange
			let xAxis, yAxis
			// let graphMargin
			let xMin = d3.min(formattedLineData, (d) => d.d)
			let xMax = d3.max(formattedLineData, (d) => d.d)
			let yMin = d3.min(formattedLineData, (d) => Number(d.v))
			let yMax = d3.max(formattedLineData, (d) => Number(d.v))

			//manage text in ticks
			let formatCurrency = (d) => {
				let toNumber = parseFloat(d)
				return (
					toNumber
						.toLocaleString('th', {
							minimumFractionDigits: 0,
							maximumFractionDigits: 2
						})
						.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ฿'
				)
			}

			let sizeUpdate = () => {
				let clientWidth = document.getElementById('gold-graph-d3-line').clientWidth
				svgWidth = clientWidth ? clientWidth : 0
				svgHeight = this.graphHeight()
				spaceNavLineElem.style.height = svgHeight + 'px'
			}

			let rangeUpdate = () => {
				xRange = d3
					.scaleTime()
					.range([constants.margin.left + 60, svgWidth - constants.margin.right - 10])
					.domain([xMin, xMax])

				yRange = d3
					.scaleLinear()
					.range([constants.margin.bottom, svgHeight - constants.margin.top])
					.domain([yMax, yMin])
			}

			let axisUpdate = () => {
				xAxis = d3
					.axisBottom(xRange)
					.tickFormat(this.yAxisFormatTitle)
					.ticks(this.yAxisFormatTick)
					.tickSize(0)

				yAxis = d3
					.axisRight(yRange)
					.tickFormat(formatCurrency)
					.ticks(6)
			}

			sizeUpdate()
			rangeUpdate()
			axisUpdate()

			// Appending or Changing Element
			let lineGen = d3
				.line()
				.curve(d3.curveLinear) // http://bl.ocks.org/d3indepth/b6d4845973089bc1012dec1674d3aff8
				.x((d) => xRange(d.d))
				.y((d) => yRange(d.v))

			// y Axis
			var make_y_axis = () => {
				return d3.axisRight(yRange).ticks(6)
			}

			var generateTooltip = () => {
				// Tooltip background
				// Tooltip
				let tooltip = vis
					.append('g')
					.attr('class', 'focus-tooltip')
					.style('display', 'none')

				tooltip
					.append('rect')
					.attr('class', 'tooltip-rect')
					.attr('width', constants.tooltipWidth)
					.attr('height', constants.tooltipHeight)
					.attr('rx', 4)
					.attr('ry', 4)

				// Tooltip date
				tooltip
					.append('text')
					.attr('x', 25)
					.attr('y', 20)
					.attr('class', 'tooltip-date')
					.attr('text-anchor', 'left')
					.attr('fill', constants.grey)
					.text('12/03/07')

				// Tooltip nav data
				tooltip
					.append('text')
					.attr('x', 40)
					.attr('y', 40)
					.attr('class', 'tooltip-nav')
					.attr('text-anchor', 'left')
					.text('10.2464')
			}

			if (isFirst) {
				vis.append('svg:g')
					.attr('class', 'x axis')
					.call(xAxis)

				vis.append('svg:g')
					.attr('class', 'y axis')
					.attr('transform', 'translate(-30,-10)')
					.attr('fill', 'none')
					.call(yAxis)

				vis.append('g')
					.attr('class', 'grid')
					.style('opacity', '.2')
					.attr('transform', 'translate(60,0)')
					.attr('stroke-dasharray', '3,3')
					.call(
						make_y_axis()
							.tickSize(0 + svgWidth, 0, 0)
							.tickFormat('')
					)

				// Data Line
				vis.append('path')
					.attr('class', 'line-data')
					.transition()
					.duration(500)
					.attr('d', lineGen(formattedLineData))
					.attr('stroke', constants.graphColor)
					.attr('stroke-width', constants.lineStroke)
					.attr('fill', 'none')

				// Line on focus
				vis.append('line')
					.attr('class', 'focus-line')
					.attr('y1', constants.margin.top)
					.attr('y2', svgHeight - constants.margin.bottom)
					.attr('stroke-width', constants.focusStroke)
					.attr('stroke', '#999999')
					.style('display', 'none')

				// Circle
				let focusCircle = vis
					.append('g')
					.attr('class', 'focus-circle')
					.style('display', 'none')

				// Circle Background
				focusCircle.append('circle').attr('r', constants.circleRadius + 3)

				// Circle Inside
				focusCircle
					.append('circle')
					.attr('class', 'inner-circle')
					.attr('r', constants.circleRadius)

				// focus Tooltip
				generateTooltip()
			} else {
				// X Axis
				vis.select('.x').call(xAxis)

				vis.selectAll('.focus-line').style('display', 'none')

				vis.selectAll('.focus-circle').style('display', 'none')

				vis.selectAll('.focus-tooltip-day').style('display', 'none')

				vis.selectAll('.focus-tooltip').style('display', 'none')

				// y Axis
				vis.select('.y')
					.attr('fill', 'none')
					.call(yAxis)

				// grid
				vis.select('.grid')
					.attr('class', 'grid')
					.style('opacity', '.2')
					.attr('transform', 'translate(50, 0)')
					.call(
						make_y_axis()
							.tickSize(0 + svgWidth, 0, 0)
							.tickFormat('')
					)

				// Data Line
				vis.select('.line-data')
					.transition()
					.duration(500)
					.ease(d3.easeLinear)
					.attr('d', lineGen(formattedLineData))
					.attr('stroke', constants.graphColor)
					.attr('stroke-width', constants.lineStroke)
					.attr('fill', 'none')
			}

			d3.selectAll('.domain').style('display', 'none')

			// Handling mouse event for focus tooltip

			//cache for performance
			let elemFocusLine = vis.select('.focus-line')
			let elemFocusCircle = vis.select('.focus-circle')
			let elemFocusTooltip = vis.select('.focus-tooltip')
			let elemFocusTooltipDate = vis.selectAll('.tooltip-date')
			let elemFocusTooltipNav = vis.selectAll('.tooltip-nav')

			// Helpers function
			let mouseEvent = {
				bisectDate: () =>
					d3.bisector((d) => {
						return d.d
					}).left,
				mouseOver: () => {
					elemFocusLine.style('display', null)
					elemFocusCircle.style('display', null)
					elemFocusTooltip.style('display', null)
				},
				mouseOut: () => {
					elemFocusLine.style('display', 'none')
					elemFocusCircle.style('display', 'none')
					elemFocusTooltip.style('display', 'none')
				},
				mouseMove: (event) => {
					mouseEvent.handleMove(d3.pointer(event)[0], d3.pointer(event)[1])
				},
				touchMove: (event) => {
					mouseEvent.handleMove(d3.pointer(event)[0][0], d3.pointer(event)[0][1])
				},
				// eslint-disable-next-line no-unused-vars
				handleMove: (xPos, yPos) => {
					elemFocusLine.style('display', null)
					elemFocusCircle.style('display', null)
					elemFocusTooltip.style('display', null)

					let x0 = xRange.invert(xPos),
						i = mouseEvent.bisectDate()(formattedLineData, x0, 1),
						d0 = formattedLineData[i - 1],
						d1 = formattedLineData[i]

					if (d0 != null && d1 != null) {
						let d = x0 > d0.d ? d1 : d0
						if (xRange(d0.d) == 0 && xRange(x0) < xRange(d1.d) / 2) {
							d = d0
						}

						elemFocusLine.attr('transform', 'translate(' + xRange(d.d) + ',' + 0 + ')')
						elemFocusCircle
							.attr('transform', 'translate(' + xRange(d.d) + ',' + yRange(d.v) + ')')
							.attr('fill', constants.graphColor)
						// Tooltip move
						// Modify padding for displaying
						let xPad = 0,
							yPad = 0
						if (svgWidth - xRange(d.d) < constants.tooltipWidth) {
							xPad = -constants.tooltipWidth - constants.driftRightMargin * 2
						}

						if (
							svgHeight - constants.margin.bottom - constants.margin.bgTop - yRange(d.v) <
							constants.tooltipHeight
						) {
							yPad = -constants.tooltipHeight / 2
						}

						if (yRange(d.v) < constants.tooltipHeight) {
							yPad = constants.tooltipHeight / 2
						}

						// set tooltip price format
						elemFocusTooltipNav.text(helpers.numberFormat(d.v))
						// set tooltip date format
						elemFocusTooltipDate.text(helpers.getDate(d.d))

						elemFocusTooltip.attr(
							'transform',
							'translate(' +
								(xRange(d.d) + xPad + constants.driftRightMargin) +
								',' +
								(yRange(d.v) + yPad - constants.driftTopMargin) +
								')'
						)
					}
				}
			}

			if (!isFirst) {
				vis.select('.focusing-overlay').remove()
			}

			// Overlay Element
			vis.append('rect')
				.attr('class', 'focusing-overlay')
				.attr('fill', 'none')
				.attr('pointer-events', 'all')
				.attr('y', constants.margin.bgTop)
				.attr('width', svgWidth)
				.attr('height', svgHeight - constants.margin.bottom - constants.margin.bgTop)
				.on('mouseover', mouseEvent.mouseOver)
				.on('mouseout', mouseEvent.mouseOut)
				.on('mousemove', mouseEvent.mouseMove)
				.on('touchmove', mouseEvent.touchMove, true)

			// Styling
			// First and last tick
			let tickUpdate = () => {
				var fontSize
				if (svgWidth < 768) {
					fontSize = '10px'
				} else {
					fontSize = '14px'
				}
				vis.selectAll('.tick text')
					.attr('x', constants.tickMoveFactor)
					.attr('y', 10)
					.attr('font-family', '"DBHeaventRez"')
					.style('font-size', fontSize)
					.attr('fill', constants.grey)

				vis.selectAll('.x .tick text').attr('x', 0)

				vis.selectAll('.x .tick text').attr('y', this.graphHeight())

				vis.selectAll('.y .tick text').style('font-size', fontSize)

				vis.selectAll('.focus-line')
					.attr('y1', constants.margin.top)
					.attr('y2', svgHeight)

				document.getElementById('gold-graph-d3-line').style.height = this.graphHeight() + 20 + 'px'
			}

			tickUpdate()

			// Inner circle focusing
			vis.select('.inner-circle').attr('fill', 'white')

			// Responsive Event for graph and axis
			let updateAxisAndGraph = () => {
				vis.select('.x').call(xAxis)

				vis.select('.y')
					.attr('fill', 'none')
					.attr('transform', 'translate(-30, -10)')
					.call(yAxis)

				// Update Position and Data Line
				vis.select('.line-data').attr('d', lineGen(formattedLineData))

				vis.select('.grid')
					.attr('class', 'grid')
					.style('opacity', '.2')
					.attr('transform', 'translate(50, 0)')
					.call(
						make_y_axis()
							.tickSize(0 + svgWidth, 0, 0)
							.tickFormat('')
					)
			}

			if (!isFirst) {
				d3.select(window).on('resize', null)
			}

			d3.select(window).on('resize', () => {
				sizeUpdate()
				rangeUpdate()
				updateAxisAndGraph()
				axisUpdate()
				tickUpdate()
			})
		}
	}
}
</script>

<style lang="scss">
.tooltip-rect {
	fill: #ffffff;
	fill-opacity: 1;
	stroke: rgba(186, 186, 186, 0.24);
	stroke-width: 1px;
}

.professional-btn-center {
	margin-top: 25px;
	text-align: center;
}

.blink {
	animation: blinker 1s cubic-bezier(0.5, 0, 1, 1) infinite alternate;
}
@keyframes blinker {
	from {
		// opacity: 1;
		stroke-opacity: 0.8;
	}
	to {
		// opacity: 0;
		stroke-opacity: 0;
	}
}
</style>
