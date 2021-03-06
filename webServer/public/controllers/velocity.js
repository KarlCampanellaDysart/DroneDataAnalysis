/**
@class angular_controller.Velocity
@memberOf angular_controller
@requires angular_factories.Websocket
*/
angular.module('UavOpsInterface')
.controller('VelocityCtrl', function ($scope, Websocket, $interval){
    /**
    @function getSpeed
    @memberOf angular_controller.Speed
    @description The function will attempt to get the most recent speed information
    from the websocket at a regular interval.
    */
	$interval(function (){
  		$scope.velocities = Websocket.getVelocity();
	}, 100);

    /**
    @member VelocityChartOptions
    @memberOf angular_controller.Velocity
    @description This options object governs the appearance of the velocity chart.
    */
  	$scope.options = {
  		chart: {
	        type: 'lineChart',
	        height: 450,
	        margin : {
	            top: 20,
	            right: 20,
	            bottom: 40,
	            left: 55
	        },
	        useInteractiveGuideline: false,
	        x: function(d){ return d.label; },
	        y: function(d){ return d.value*1.943844; },
	        showValues: true,
	        valueFormat: function(d){
	            return d3.format(',.4f')(d);
	        },
	        deepWatchData: true,
	        xAxis: {
	            axisLabel: 'Time elapsed (s)'
	        },
	        yAxis: {
	            axisLabel: 'Directional Speed (knots)',
                tickFormat: function(d){
                    return d3.format('.02f')(d);
                },
	            axisLabelDistance: 30
	        }
    	}, 
    	title: {
            enable: true,
            text: 'Drone\'s Directional Speed Over Time'
        },
        subtitle: {
            enable: true,
            text: 'This displays the drone\'s velocity in meters per second over seconds elapsed',
            css: {
                'text-align': 'center',
                'margin': '10px 13px 0px 7px'
            }
        }
	};
});