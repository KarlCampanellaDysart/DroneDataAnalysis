/**
@class angular_controller.Altitude
@memberOf angular_controller
@requires angular_factories.Websocket
*/
angular.module('UavOpsInterface')
.controller('AltitudeCtrl', function ($scope, Websocket, $interval){	
	
    /**
    @function getAltitude
    @memberOf angular_controller.Altitude
    @description The function will attempt to get the most recent altitude information
    from the websocket at a regular interval.
    */
	$interval(function (){
  		$scope.altitudes = Websocket.getAltitude();
	}, 1000); 

    /**
    @member AltitudeChartOptions
    @memberOf angular_controller.Altitude
    @description This options object governs the appearance of the altitude chart.
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
            x: function(d){ return d.label; },
            y: function(d){ return d.value*3.280839895; },
            useInteractiveGuideline: true,
            xAxis: {
                axisLabel: 'Time (s)'
            },
            yAxis: {
                axisLabel: 'Altitude (ft)',
                tickFormat: function(d){
                    return d3.format('.02f')(d);
                },
                axisLabelDistance: -10
            }
        },
        title: {
            enable: true,
            text: 'Drone\'s Altitude Over Time'
        }
    };

});