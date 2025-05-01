function drawShipStrikesPlot(containerId, csvPath) {
  const margin = { top: 30, right: 30, bottom: 40, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

  // Clear the container in case of re-renders
  d3.select(`#${containerId}`).html("");

  const svg = d3.select(`#${containerId}`)
      .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
      .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

  d3.csv(csvPath, d => ({
      date: d3.timeParse("%Y")(d.Year),
      value: +d.Total
  })).then(data => {
      const x = d3.scaleTime()
          .domain(d3.extent(data, d => d.date))
          .range([0, width]);
      svg.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x));

      const y = d3.scaleLinear()
          .domain([0, d3.max(data, d => d.value)])
          .range([height, 0]);
      svg.append("g").call(d3.axisLeft(y));

      // Axes labels and title
      svg.append("text")
          .attr("x", width / 2)
          .attr("y", height + 40)
          .style("text-anchor", "middle")
          .text("Year")
          .style("fill", "white");

      svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -height / 2)
          .attr("y", -40)
          .style("text-anchor", "middle")
          .text("Total Ship Strikes")
          .style("fill", "white");

      svg.append("text")
          .attr("x", width / 2)
          .attr("y", -margin.top / 2)
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .style("font-weight", "bold")
          .text("Evolution of Ship Strikes with Cetacean Over Time")
          .style("fill", "white");

      // Line path
      svg.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", "white")
          .attr("stroke-width", 1.5)
          .attr("d", d3.line()
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

      // Dots
      svg.append("g")
          .selectAll("circle")
          .data(data)
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

// Call the function when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  drawShipStrikesPlot("traffic_strike_plot", "data/df_traffic_plot.csv");
});
