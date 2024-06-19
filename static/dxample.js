
class PovertyRateVis {

    constructor(svg_id) {
        //this.url = "https://ils.unc.edu/~gotz/courses/data/states.csv";
        this.url = "states.csv";
        this.svg_id = svg_id;

        this.loadAndPrepare();
    }

    loadAndPrepare() {
        d3.csv(this.url, d => {
            return {
                state: d.state,
                life_expectancy: +d.life_expectancy,
                poverty_rate: +d.poverty_rate,
                region: d.region
            }
        }).then(
            data => {
                // Group data by state.
                let grouped_state_stats = d3.group(data, d => d.region);

                let avg_state_stats = d3.rollup(data, group => {
                    let le_mean = d3.mean(group, d=> d.life_expectancy);
                    let pr_mean = d3.mean(group, d=> d.poverty_rate);

                    return {
                        avg_le: le_mean,
                        avg_pr: pr_mean
                    }
                }, d => d.region);

                // Calc min and max poverty rates
                let min_pr = d3.min(data, d => d.poverty_rate);
                let max_pr = d3.max(data, d => d.poverty_rate);

                this.render(grouped_state_stats, avg_state_stats, min_pr, max_pr);

            }
        ).catch(error => {
            console.log("Error when loading CSV.")
            console.log(error);
        })

        console.log("Hello!");
    }

    render(region_data, avg_data, min_rate, max_rate) {
        let plot_size = 150;
        let plot_spacing = 30;

        let y = d3.scaleLinear().domain([min_rate, max_rate])
            .range([plot_size, 0]);

        let svg = d3.select("#"+this.svg_id);

        let region_groups = svg.selectAll(".region_g").data(region_data).join("g")
            .attr("class", "region_g")
            .attr("transform", (d,i) => "translate("+(plot_spacing + i*(plot_size+plot_spacing))+","+plot_spacing+")");

        // Draw gray backgrounds.
        region_groups.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", plot_size)
            .attr("width", plot_size)
            .style("fill", "#f4f4f4")
            .on("mousemove", (event, d) => {
                let mouse_coords = d3.pointer(event);
                svg.selectAll(".highlightline")
                    .attr("y1", mouse_coords[1])
                    .attr("y2", mouse_coords[1]);
            })
            .on("mouseout", (event, d) => {
                svg.selectAll(".highlightline")
                    .attr("y1", -100)
                    .attr("y2", -100);
            });

        // Add highlight line
        region_groups.append("line")
            .attr("class", "highlightline")
            .attr("x1", 0)
            .attr("x2", plot_size)
            .attr("y1", -100)
            .attr("y2", -100)
            .style("stroke", "gold")
            .style("stroke-width", 4);

        // Add the max Y axis label
        region_groups.append("text")
            .attr("class", "label")
            .attr("x", -2)
            .attr("y", 0)
            .attr("text-anchor", "end")
            // In class, we used dy:
            // .attr("dy", "0.7em")
            // We could also use dominant-baseline
            .attr("dominant-baseline", "hanging")
            .text(max_rate);

        // THIS IS NEWLY ADDED AFTER CLASS:
        // Add the min Y axis label.
        region_groups.append("text")
            .attr("class", "label")
            .attr("x", -2)
            .attr("y", plot_size)
            .attr("text-anchor", "end")
            .text(min_rate);

        // THIS IS NEWLY ADDED AFTER CLASS:
        // Add the region name label.
        region_groups.append("text")
            .attr("class", "label")
            .attr("x", 0)
            .attr("y", plot_size + 2)
            .attr("dominant-baseline", "hanging")
            .text(d => d[0]);

        // Draw the lines for each state.
        let state_lines = region_groups.selectAll(".stateline").data(d => d[1])
            .join("line")
            .attr("x1",0)
            .attr("x2",plot_size)
            .attr("y1", d => y(d.poverty_rate))
            .attr("y2", d => y(d.poverty_rate))
            .style("stroke", "lightblue");

        // Draw the average line for each state
        region_groups.append("line")
            .attr("x1",0)
            .attr("x2",plot_size)
            .attr("y1", d => y(avg_data.get(d[0]).avg_pr))
            .attr("y2", d => y(avg_data.get(d[0]).avg_pr))
            .style("stroke", "red");

        // THIS IS NEWLY ADDED AFTER CLASS:
        // Add the average poverty rate label.
        region_groups.append("text")
            .attr("class", "avglabel")
            .attr("x", -2)
            // Notice that the y position depends on the region's average poverty rate value.
            // This is the same y position used to draw the average line.
            .attr("y", d => y(avg_data.get(d[0]).avg_pr))
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "central")
            .style("fill", "red")
            // We round the text for the average to show the nearest whole number.
            .text(d => Math.round(avg_data.get(d[0]).avg_pr));
    }
}

$(document).ready(function () {
    let vis = new PovertyRateVis("svg_div");
    vis.loadAndPrepare();
});