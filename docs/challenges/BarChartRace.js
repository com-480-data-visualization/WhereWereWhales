class BarChartRace {
    constructor(container, dataUrl) {
        this.container = container;
        this.dataUrl = dataUrl;
        
        this.n = 12;
        this.k = 10;
        this.barSize = 65;
        this.dateFontSize = 100;
        this.margin = { top: 60, right: 80, bottom: 6, left: 223 };
        this.width = 800*2;
        this.height = this.margin.top + this.barSize * this.n + this.margin.bottom;
  
        this.isPlaying = true;
        this.currentKeyframe = 0;
  
        this.whaleTypes = [
          'Fin', 'Sperm', 'Humpback', 'Sei', 
          'Brydes', 'CommonMinke', 'AntarcticMinke', 
          'Gray', 'Bowhead'
        ];
  
        this.initChart();
    }
  
    async initChart() {
        const data = await this.preProcessCsvData(this.dataUrl);
        this.names = new Set(data.map(d => d.name));
        
        // Process data for stacked bars
        this.datevalues = Array.from(d3.rollup(data, 
            ([d]) => {
                const obj = {total: d.value};
                this.whaleTypes.forEach(type => obj[type] = d[type]);
                return obj;
            }, 
            d => +d.date, 
            d => d.name
        ))
        .map(([date, data]) => [new Date(date), data])
        .sort(([a], [b]) => d3.ascending(a, b));
        
        // this.setCategoryValues(data);
  
        this.keyframes = this.getKeyframes();
        this.nameframes = d3.groups(this.keyframes.flatMap(([, data]) => data), d => d.name);
        this.prev = new Map(this.nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])));
        this.next = new Map(this.nameframes.flatMap(([, data]) => d3.pairs(data)));
  
        this.x = d3.scaleLinear([0, 1], [this.margin.left, this.width - this.margin.right]);
        this.y = d3.scaleBand()
            .domain(d3.range(this.n + 1))
            .rangeRound([this.margin.top, this.margin.top + this.barSize * (this.n + 1 + 0.1)])
            .padding(0.1);
  
        // Color scale for whale types
        this.color = d3.scaleOrdinal()
            .domain(this.whaleTypes)
            .range(d3.schemeGnBu[this.whaleTypes.length]);
  
        this.svg = d3.select(this.container).append("svg")
            .attr("viewBox", [0, 0, this.width, this.height])
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("style", "max-width: 100%; height: auto;");
  
        this.updateBars = this.bars(this.svg);
        this.updateAxis = this.axis(this.svg);
        this.updateLabels = this.labels(this.svg);
        this.updateTicker = this.ticker(this.svg);
        
        this.createLegend(this.svg);
  
        this.tooltip = d3.select(this.container).append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("padding", "5px")
            .style("border", "1px solid #ccc")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("opacity", 0);
  
        this.runChart();
    }
  
    async preProcessCsvData(csvUrl) {
      let data = await d3.csv(csvUrl);
  
      let subData = data.map(d => ({
        date: new Date(`${d['Year']}-01-01`),
        value: +d.Total,
        name: d.Nation,
        Fin: +d.Fin,
        Sperm: +d.Sperm,
        Humpback: +d.Humpback,
        Sei: +d.Sei,
        Brydes: +d.Brydes,
        CommonMinke: +d.CommonMinke,
        AntarcticMinke: +d.AntarcticMinke,
        Gray: +d.Gray,
        Bowhead: +d.Bowhead,
        category: d.Nation
      })).filter(d => !isNaN(d.date) && !isNaN(d.value) && d.name && d.category);
    
      return subData;
    }
  
    getKeyframes() {
        const keyframes = [];
        let ka, a, kb, b;
        for ([[ka, a], [kb, b]] of d3.pairs(this.datevalues)) {
            for (let i = 0; i < this.k; ++i) {
                const t = i / this.k;
                keyframes.push([
                    new Date(ka * (1 - t) + kb * t),
                    this.rank(name => {
                        const aVal = a.get(name) || {total: 0};
                        const bVal = b.get(name) || {total: 0};
                        return {
                            total: (aVal.total || 0) * (1 - t) + (bVal.total || 0) * t,
                            // Interpolate each whale type
                            ...Object.fromEntries(this.whaleTypes.map(type => [
                                type, 
                                (aVal[type] || 0) * (1 - t) + (bVal[type] || 0) * t
                            ]))
                        };
                    })
                ]);
            }
        }
        keyframes.push([new Date(kb), this.rank(name => {
            const bVal = b.get(name) || {total: 0};
            return {
                total: bVal.total || 0,
                ...Object.fromEntries(this.whaleTypes.map(type => [
                    type, 
                    bVal[type] || 0
                ]))
            };
        })]);
        return keyframes;
    }

    getTransitionDuration(year) {
        // Adjust the transition duration based on the year
        const yearThreshold = 1988;
        const maxDuration = 500;  // Duration for years before 1990
        const minDuration = 150;   // Duration for years after 1990
    
        if (year < yearThreshold) {
            return maxDuration;  // Longer duration for earlier years
        } else {
            return minDuration;  // Shorter duration for later years
        }
    }
    
  
    rank(value) {
        const data = Array.from(this.names, name => ({ 
            name, 
            ...value(name),
            value: value(name).total // Use total for ranking
        }));
        data.sort((a, b) => d3.descending(a.value, b.value));
        for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(this.n, i);
        return data;
    }
  
    bars(svg) {
        const self = this;
        
        let bar = svg.append("g")
            .attr("fill-opacity", 0.6)
            .selectAll("g");
    
        const stack = d3.stack()
            .keys(this.whaleTypes)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);
    
        return ([date, data], transition) => {
            // Remove all existing bars first
            svg.selectAll("g:not(.legend) > rect").remove();
            
            // Create new bars with current positions
            const bars = bar
                .data(data.slice(0, self.n), d => d.name)
                .join("g")
                .attr("transform", d => `translate(0,${self.y(d.rank)})`);
    
            bars.each(function(d) {
                const barGroup = d3.select(this);
                const stackedData = stack([d]);
                
                barGroup.selectAll("rect")
                    .data(stackedData, d => d.key)
                    .join("rect")
                        .attr("fill", d => self.color(d.key))
                        .attr("height", self.y.bandwidth())
                        .attr("x", d => self.x(d[0][0]))
                        .attr("y", 0) // Position within group
                        .attr("width", d => self.x(d[0][1]) - self.x(d[0][0]))
                        .on("mousemove", (event, d) => self.showTooltip(event, d[0].data, d.key))
                        .on("mouseout", () => self.hideTooltip());
            });
    
            return bars;
        };
    }

    addAnnotation(year) {
        if (year === 1986) {
            this.annotation = this.svg.selectAll(".annotation")
                .data([year])
                .join("text")
                .attr("class", "annotation")
                .attr("text-anchor", "middle")
                .attr("x", this.width / 2)
                .attr("y", this.margin.top + 400)  // adjust as needed
                .text("Global moratorium on commercial whaling takes effect")
                .style("font-size", "30px")
                .style("fill", "white")
                .style("font-weight", "bold");
        } else {
            this.svg.selectAll(".annotation").remove();
        }
    }
    
  
    labels(svg) {
        let label = svg.append("g")
            .style("font", "bold 12px var(--sans-serif)")
            .style("font-variant-numeric", "tabular-nums")
            .attr("text-anchor", "middle")
            .selectAll("text");
    
        // Both nation (on the left) and value (on the right) labels
        let nationLabel = svg.append("g")
            .style("font", "bold 12px var(--sans-serif)")
            .style("font-variant-numeric", "tabular-nums")
            .style("fill", "white")
            .attr("text-anchor", "end")
            .selectAll("text");
    
        // let valueLabel = svg.append("g")
        //     .style("font", "bold 12px var(--sans-serif)")
        //     .style("font-variant-numeric", "tabular-nums")
        //     .attr("text-anchor", "start")
        //     .selectAll("text");
    
        return ([date, data], transition) => {
            // Update nation labels (on the left of the bar)
            nationLabel = nationLabel
                .data(data.slice(0, this.n), d => d.name)
                .join(
                    enter => enter.append("text")
                        .attr("transform", d => `translate(${this.x(0) - 10},${this.y((this.prev.get(d) || d).rank)})`) // Set x = 0, moved left outside the plot
                        .attr("y", this.y.bandwidth() / 2)
                        .attr("x", 0) 
                        .attr("dy", "-0.25em")
                        .text(d => d.name)
                        .on("mouseover", (event, d) => this.showTooltip(event, d))
                        .on("mouseout", () => this.hideTooltip())
                        .call(text => text.append("tspan")
                            .attr("fill-opacity", 0.7)
                            .attr("font-weight", "normal")
                            .attr("x", 0) // Position tspan text
                            .attr("dy", "1.15em")),
                    update => update,
                    exit => exit.transition(transition).remove()
                        .attr("transform", d => `translate(${this.x(0) - 10},${this.y((this.next.get(d) || d).rank)})`)
                        .call(g => g.select("tspan").tween("text", d => this.textTween(d.value, (this.next.get(d) || d).value)))
                );
            // Update value labels (on the right of the bar)
            // valueLabel = valueLabel
            //     .data(data.slice(0, this.n), d => d.name)
            //     .join(
            //         enter => enter.append("text")
            //             .attr("transform", d => `translate(${this.x((this.prev.get(d) || d).value)},${this.y((this.prev.get(d) || d).rank)})`)
            //             .attr("y", this.y.bandwidth() / 2)
            //             .attr("x", 6) // Move the value to the right of the bar
            //             .attr("dy", "-0.25em")
            //             .text(d => d.value) // Display the value
            //             .on("mouseover", (event, d) => this.showTooltip(event, d))
            //             .on("mouseout", () => this.hideTooltip())
            //             .call(text => text.append("tspan")
            //                 .attr("fill-opacity", 0.7)
            //                 .attr("font-weight", "normal")
            //                 .attr("x", 6)
            //                 .attr("dy", "1.15em")),
            //         update => update,
            //         exit => exit.transition(transition).remove()
            //             .attr("transform", d => `translate(${this.x((this.next.get(d) || d).value)},${this.y((this.next.get(d) || d).rank)})`)
            //             .call(g => g.select("tspan").tween("text", d => this.textTween(d.value, (this.next.get(d) || d).value)))
            //     );
    
            // Transition both labels together
            nationLabel.transition(transition)
                .attr("transform", d => `translate(${220},${this.y(d.rank)})`);
    
            // valueLabel.transition(transition)
            //     .attr("transform", d => `translate(${this.x(d.value)},${this.y(d.rank)})`);
    
            return label;
        };
    }
    

    textTween(a, b) {
    const i = d3.interpolateNumber(a, b);
    return function (t) {
        this.textContent = d3.format(",d")(i(t));
    };
    }

    axis(svg) {
    const g = svg.append("g")
        .attr("transform", `translate(0,${this.margin.top})`);

    const axis = d3.axisTop(this.x)
        .ticks(4)
        .tickSizeOuter(0)
        .tickSizeInner(-this.barSize * (this.n + this.y.padding()));

    return (_, transition) => {
        g.transition(transition).call(axis);
        g.select(".tick:first-of-type text").remove();
        g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
        g.select(".domain").remove();

        g.selectAll(".tick text")
            .style("font-size", "20px");  // Change the font size here
    };
    }

    ticker(svg) {
    const now = svg.append("text")
        .style("font", `bold ${this.barSize}px var(--sans-serif)`)
        .style("font-variant-numeric", "tabular-nums")
        .style("font-size", `${this.dateFontSize}`)
        .style("fill", "white")
        .attr("text-anchor", "middle")
        .attr("x", (this.width) /2)
        .attr("y", this.margin.top + this.barSize * (this.n - 0.45))
        .attr("dy", "0.32em")
        .text(d3.utcFormat("%Y")(this.keyframes[0][0]));

    return ([date], transition) => {
        transition.end().then(() => now.text(d3.utcFormat("%Y")(date)));
    };
    }

    async runChart() {
        const firstKeyframe = this.keyframes[0];
        const transition = this.svg.transition()
            .duration(0)  // No transition initially
            .ease(d3.easeLinear);

        this.x.domain([0, firstKeyframe[1][0].value]);

        this.updateAxis(firstKeyframe, transition);
        this.updateBars(firstKeyframe, transition);
        this.updateLabels(firstKeyframe, transition);
        this.updateTicker(firstKeyframe, transition);

    // Begin the animation after displaying the first keyframe
    this.currentKeyframe = 1;
    while (this.isPlaying && this.currentKeyframe < this.keyframes.length) {
        const keyframe = this.keyframes[this.currentKeyframe];
        const transitionDuration = this.getTransitionDuration(keyframe[0].getFullYear()); // Get duration based on the year

        const transition = this.svg.transition()
            .duration(transitionDuration)
            .ease(d3.easeLinear);
        this.x.domain([0, keyframe[1][0].value]);

        this.updateAxis(keyframe, transition);
        this.updateBars(keyframe, transition);
        this.updateLabels(keyframe, transition);
        this.updateTicker(keyframe, transition);

        this.addAnnotation(keyframe[0].getFullYear());

        await transition.end();

        this.currentKeyframe++;
    }
    }
    start() {
    this.isPlaying = true;
    this.runChart();
    }

    stop() {
    this.isPlaying = false;
    }

    toggle() {
    if (this.isPlaying) {
        this.stop();
    } else {
        this.start();
    }
    }
    
    showTooltip(event, d, whaleType = null) {
        let tooltipContent;
        let tooltipColor;
        
        if (whaleType) {
          // Show specific whale type info
          const value = Math.round(d[whaleType]);
          tooltipContent = `${d.name}<br>${whaleType}: ${d3.format(",")(value)}`;
          tooltipColor = this.color(whaleType);
        } else {
            const total = Math.round(d.total);
            tooltipContent = `${d.name}<br>Total: ${d3.format(",")(total)}`;
            tooltipColor = '#ccc';
        }
      
        const rgbColor = d3.color(tooltipColor).rgb();
        const rgbaColor = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.6)`;
    
        this.tooltip
            .style("opacity", 1)
            .html(tooltipContent)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 28}px`)
            .style("background-color", rgbaColor);
    }

    hideTooltip() {
        this.tooltip.style("opacity", 0);
    }
  
    createLegend(svg) {

    svg.append("text")
        .attr("x", this.width / 2)
        .attr("y", this.margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "32px")
        .style("fill", "white")
        .style("font-weight", "bold")
        .text("Top Whaling Countries by Whale Catches Over Time");

      const legendHeight = this.whaleTypes.length * 30;
      const legend = svg.append("g")
          .attr("text-anchor", "end")
          .attr("transform", `translate(${this.width-20},${this.margin.top + this.margin.bottom + this.barSize*this.n - legendHeight})`)
          .attr("class", "legend");
  
      legend.selectAll("rect")
          .data(this.whaleTypes)
          .enter()
          .append("rect")
          .attr("y", (d, i) => i * 30)
          .attr("width", 20)
          .attr("height", 20)
          .style("fill", d => { console.log( this.color(d)); return this.color(d)})
          .attr("fill-opacity", 0.6);
  
      legend.selectAll("text")
          .data(this.whaleTypes)
          .enter()
          .append("text")
          .attr("x", -6)
          .attr("y", (d, i) => i * 30 + 10)
          .text(d => d)
          .style("font-size", "20px")
          .attr("alignment-baseline", "middle")
          .attr("fill", "white");
    }
  }