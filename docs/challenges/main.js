const csvUrl = "data/direct_catches_plot.csv";
let chart;

// Function to initialize the chart with default values
function initChart() {
    const container = document.getElementById('bar-chart-race-container');

    if (chart) {
    // Remove the old chart
    d3.select(container).select('svg').remove();
    }

    chart = new BarChartRace(container, csvUrl);
    const button = document.getElementById('playPauseButton');
    button.classList.remove('fa-play');
    button.classList.add('fa-pause');
}

// Initialize the chart with default selections on page load
document.addEventListener('DOMContentLoaded', initChart);
document.addEventListener('DOMContentLoaded', togglePlayPause);

function togglePlayPause() {
    const button = document.getElementById('playPauseButton');
    chart.toggle();
    if (chart.isPlaying) {
        button.classList.remove('fa-play');
        button.classList.add('fa-pause');
    } else {
        button.classList.remove('fa-pause');
        button.classList.add('fa-play');
    }
}

// Add event listener to the play/pause button
document.getElementById('playPauseButton').addEventListener('click', togglePlayPause);

// Update the chart when the button is clicked
document.getElementById('runRaceButton').addEventListener('click', initChart);