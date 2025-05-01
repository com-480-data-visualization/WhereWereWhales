function drawTemperatureAnomaliesPlot(containerId, csvPath) {
  const margin = { top: 30, right: 30, bottom: 40, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

  d3.select(`#${containerId}`).html("");

  const svg = d3.select(`#${containerId}`)
      .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
      .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

  d3.csv(csvPath, d => ({
      date: d3.timeParse("%Y-%m-%d")(d.date),
      value: +d.value,
      year: d3.timeParse("%Y-%m-%d")(d.date).getFullYear()
  })).then(data => {

      const x = d3.scaleTime()
          .domain(d3.extent(data, d => d.date))
          .range([0, width]);
      svg.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x));

      const y = d3.scaleLinear()
          .domain([ d3.min(data, d => d.value), d3.max(data, d => d.value)])
          .range([height, 0]);
      svg.append("g").call(d3.axisLeft(y));

      // Labels
      svg.append("text")
          .attr("x", width / 2)
          .attr("y", height + 40)
          .style("text-anchor", "middle")
          .text("Date")
          .style("fill", "white");

      svg.append("line")
          .attr("x1", 0)
          .attr("x2", width)
          .attr("y1", y(0))
          .attr("y2", y(0))
          .attr("stroke", "white")
          .attr("stroke-width", 1.5)
          .attr("stroke-dasharray", "4,4"); 

      svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -height / 2)
          .attr("y", -40)
          .style("text-anchor", "middle")
          .text("Temperature Anomaly (°C)")
          .style("fill", "white");

      svg.append("text")
          .attr("x", width / 2)
          .attr("y", -margin.top / 2)
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .style("font-weight", "bold")
          .text("Global Monthly Average Sea Surface Temperature Anomalies")
          .style("fill", "white");

      // Line path
      svg.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", "white")
          .attr("stroke-width", 1.5)
          .attr("d", d3.line()
              .curve(d3.curveBasis)
              .x(d => x(d.date))
              .y(d => y(d.value))
          );

      // Tooltip
      const Tooltip = d3.select(`body`)
          .append("div")
          .style("opacity", 0)
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background-color", "white")
          .style("border", "solid")
          .style("border-width", "2px")
          .style("border-radius", "5px")
          .style("padding", "5px");

      const mouseover = () => Tooltip.style("opacity", 1);
      const mousemove = (event, d) => {
          Tooltip
              .html(`<span style='color:black;'>Exact value: ${d.value}</span>`)
              .style("left", `${event.pageX + 10}px`)
              .style("top", `${event.pageY}px`);
      };
      const mouseleave = () => Tooltip.style("opacity", 0);

      const dataPerYear = Array.from(
        d3.group(data, d => d.date.getFullYear()), // group by year
        ([, values]) => values[0]                  // take the first value in each year
      );

      // Dots
      svg.append("g")
          .selectAll("circle")
          .data(dataPerYear)
          .join("circle")
              .attr("class", "myCircle")
              .attr("cx", d => x(d.date))
              .attr("cy", d => y(d.value))
              .attr("r", 5)
              .attr("stroke", "#69b3a2")
              .attr("stroke-width", 3)
              .attr("fill", "white")
              .on("mouseover", mouseover)
              .on("mousemove", mousemove)
              .on("mouseleave", mouseleave);
  });
}

// Call it when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  drawTemperatureAnomaliesPlot("temperature_anomalies", "data/Copernicus_temperature_plot.csv");
});
