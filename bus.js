function setMenuItem(type,code){

	var optionIndex0 = document.form.stations.options.length;

	if (type == 0){
		for ( i=0 ; i <= optionIndex0 ; i++ ){document.form.stations.options[0]=null}
		document.form.stations.options[0] = new Option("----",0);

		if (code == 0){
			nearest(def_lat, def_lon);
		}else{
			document.form.stations.options[0] = new Option("----",0);
			var source = code + ".json";
			$.getJSON(source, function(stations){
			var stations = stations["station"];
			for( i=0; i<stations.length; i++){
			ii = i + 1
			document.form.stations.options[ii] = new Option(stations[i].name,stations[i].stop);
			}
			});
			
		}

	} else if (type == 1){
		if (code == 0){
			nearest(def_lat, def_lon);
		}else{
			var source = stations.value + ".json";
			$.getJSON(source, function(station){
			var station1 = station["station"];
			var route = new Array();
			for( i=0; i<station1.length; i++){
				route[i] = 'http://etav2.kmb.hk/?action=geteta&lang=tc&route=' + station1[i].route + '&bound=' + bound.value + '&stop=' + station1[i].stop + '&stop_seq=' + station1[i].seq ;
			}
			if(!route[2]){ route[2]=""; };
			multipleJSON(station.name,station.bound,station1.length,route[0],route[1],route[2]);
			});
		}
	}
}

function multipleJSON(name,bound,maxcount,r0,r1,r2) {
    var arr = [];
    var calls = [];
    
    for (var i = 0; i < maxcount; i++) {
		var r = eval("r"+i);
		calls.push(
        $.getJSON(r,
            (function(i) {
                return function(d) {
					d.url=eval("r"+i);
								console.log(d.url);
                    arr[i] = d;
				};
            }(i)) 
        )
    );
}
$.when.apply($,calls).then(function() {
    getinfo(name,bound,arr);
});

}

function sortBy(jsonArray, key){
    if(jsonArray){
       var sortedArray = jsonArray.sort(function(left, right) { 
           var a = left[key];
           var b = right[key];
           if (a !== b) {
               if (a > b || a === void 0) return 1;
               if (a < b || b === void 0) return -1;
           }
           return 0;
      });
      return sortedArray;
    }
}

function getDistance(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function error(error) {

    switch(error.code) {
        case error.PERMISSION_DENIED:
            x.innerHTML = "User denied the request for Geolocation. Automatically redirected to default location."
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable. Automatically redirected to default location."
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out. Automatically redirected to default location."
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error occurred. Automatically redirected to default location."
            break;
    }	

			nearest(def_lat, def_lon);

}

/*
function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var day = a.getDate();
  var hour = a.getHours();
  var min = "0" + a.getMinutes();
  var sec = "0" + a.getSeconds();
  var time = day + ' ' + month + ' ' + year + ' ' + hour + ':' + min.substr(-2) + ':' + sec.substr(-2) ;
  return time;
}
*/

function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function UserLocation(position){
        nearest(position.coords.latitude, position.coords.longitude);
    }

function nearest(lat, lon){

    var mindif=99999;
    var closest;

		$.getJSON("1.json", function(data){
		$.getJSON("2.json", function(data2){
		
		var data3 = $.merge( $.merge( [], data.station ), data2.station );
		for (i = 0; i < data3.length; ++i) {
            var dif =  getDistance(lat, lon, data3[i].lat, data3[i].lon);
            if ( dif < mindif ){
                closest=i;
                mindif = dif;
            }
        }

		$.getJSON(data3[closest].stop+".json", function(data4){
			var route = new Array();
			for( i=0; i<data4.station.length; i++){
				route[i] = 'http://etav2.kmb.hk/?action=geteta&lang=tc&route=' + data4.station[i].route + '&bound=' + data4.bound + '&stop=' + data4.station[i].stop + '&stop_seq=' + data4.station[i].seq ;
			}
			if(!route[2]){ route[2]=""; };
			multipleJSON(data4.name,data4.bound,data4.station.length,route[0],route[1],route[2]);
			});
		  });
		});
    }

function addminute(time,min){
	var date1 = new Date ("January 1, 1970 " + time);
	var date1 = new Date (date1.getTime() + min * 60000);
	var hour = "0" + date1.getHours();
	var min = "0" + date1.getMinutes();
	var date2 = hour.substr(-2)+":"+min.substr(-2);
	return date2;
}

function trackbus(route,time,m,seq,bound){
	
	var x = route+bound+".json";
	var track = "";


	   $.getJSON(x, function(data){
		track+="<table><tr><th>巴士站</th><th>預計抵站時間</th><th></th></tr>";
		
		/*
		for (var i=0; i<seq; i++) {
			track+="<td>" + data.station[i].name + "</td><td class=\"centerText\">(已經駛過此站)</td></tr>";
		}
		*/
		seq=parseFloat(seq);
		track+="<td>" + data.station[seq].name + "</td><td class=\"centerText\">"+ m +" (" + time + ")</td></tr>";
		if (m == "到達" || m == "到達/離開"){ m = 0;}
		else{ m = parseFloat(m); }
		if(time=="尾班車已過本站"){  };
		i=seq+1;
		    
			for (var i; i<data.station.length; i++) {
	
			/*var diff = "";
			var regex = new RegExp("^[0-9]{2}:[0-9]{2}$", "i");
			
			if (regex.test(data3[i].t)) {
			var date1 = new Date ("January 1, 1970 " + data3[i].t);
			var diff = Math.floor((date1 - date2) / 1000 / 60);
			
			if (Math.abs(diff) > 100){
			date1 = new Date ("January 2, 1970 " + data3[i].t);
			diff = Math.floor((date1 - date2) / 1000 / 60);
			}
			
			if (diff == "0"){ diff = "到達";}
			else if (diff < 0){	diff = "到達/離開";}
			else{ diff = diff + "分鐘";}
			
			}
			*/
			time = addminute(time,data.station[i].beforemin);
			m = m + data.station[i].beforemin;
			var mm = m+"分鐘";
			
			//var test="http://etav2.kmb.hk/?action=geteta&lang=tc&route="+route+"&bound="+bound+"&stop="+data.station[i].stop+"&stop_seq="+data.station[i].stop_seq;
			//$.getJSON(test, d);
			//function d(data){
			//	mm = data.response[0].t;
			//}
			track+="<td>" + data.station[i].name + "</td><td class=\"centerText\">"+ mm +" (" + time + ")</td></tr>";
			}		
	
	$('#arrival').html(track);
	
	});

}

function closedialog(){
if($(".ui-dialog").is(":visible")){
$("#arrival").dialog("close");
}
}

function getURLParameter(name,url) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url.substr(url.indexOf("?")))||[,""])[1].replace(/\+/g, '%20'))||null
}