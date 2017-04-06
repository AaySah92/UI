window.onload = function(){
	var dps = [];
	var app = new Vue({
		el: "#app",
		data: {
			countryList: {},
			country1: {
				name: "",
				trends: {}
			},
			country2: {
				name: "",
				trends: {}
			},
			trends: {},
			totalWeight: 0,
		},
		created: function(){
			var self = this;
			
			$.get("/countries/", function(data){
				self.countryList = Object.assign({}, data.countries);
			});
		},
		methods: {
			updateTrends: function(country){
				if(event.target.value !== "")
				{
					$.get("/countries/" + event.target.value + "/trends/", function(data){
						country.trends = data.trends.map(function(item){
							return item.name;
						});
					}).then(this.filterTrends);
				}
			},
			filterTrends: function(){
				var self = this;
				var commonTrends = {};

				if(self.country1.name === "" || self.country2.name === "")
					commonTrends = Object.assign({}, self.country1.trends, self.country2.trends);
				else
				{
					commonTrends = $.grep(self.country1.trends, function(item){
							return $.inArray(item, self.country2.trends) !== -1;
						});
				}

				self.trends = Object.assign({});
				self.totalWeight = 0;

				for(key in commonTrends){
					trend = commonTrends[key];
					Vue.set(self.trends, trend, trend.length);
					self.totalWeight += trend.length;
				};
				
				self.updateGraph();
			},
			updateGraph: function(){
				var self = this;

				dps.splice(0, dps.length);
				for(key in self.trends){
					var trend = key;
					var weight = self.trends[key];
					var percent = null;
					var input = {};

					percent = weight * 100 / self.totalWeight;
					input = {
						y: percent,
						legendText: trend,
						indexLabel: percent.toFixed(1) + "%"
					};
					dps.push(input);
				}
				chart.render();
			}
		}
	});

	var chart = new CanvasJS.Chart("chartContainer",
    {
		title:{
			text: "Trend weights contribution",
			fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        	fontWeight: "400"
		},
		toolTip:{
			enabled: false
		},
		legend:{
			verticalAlign: "center",
			horizontalAlign: "right",
			fontSize: 18,
			itemWidth: 300
		},
		data: [{
			indexLabelFontSize: 20,
			indexLabelFontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
			indexLabelFontColor: "darkgrey",
			indexLabelLineColor: "darkgrey",
			indexLabelPlacement: "outside",
			type: "doughnut",
			showInLegend: true,
			dataPoints: dps
		}]
	});
};