import { h, Component } from 'preact';
import GoogleMapsLoader from 'google-maps';
import config from '../../config.json';
import style from './style';
import moment from 'moment';
require('../../lib/fetch-polyfill.js');

export default class Home extends Component {
	constructor(props) {
		super(props);
		this.getNearbyAtms = ::this.getNearbyAtms;
	}

	location

	componentDidMount() {
		GoogleMapsLoader.KEY = config.mapAPIKey;
		GoogleMapsLoader.LIBRARIES = ['geometry', 'places'];

    navigator.geolocation.getCurrentPosition((event) => {
			this.location = {
				lat: event.coords.latitude,
				lng: event.coords.longitude
			};

			this.getNearbyAtms(this.location);
		}, (error) => {
			if (error.code == error.PERMISSION_DENIED) {
				alert(error.message);
    	}
		});
	}

	getNearbyAtms(myLatLng) {
		var promise = new Promise((resolve, reject) => {
			GoogleMapsLoader.load((google) => {
				const options = {
					center: myLatLng,
					fullscreenControl: true, 
					backgroundColor: '#fafafa',
					zoomControl: true,
					signInControl: true,
					disableDefaultUI: true,
					styles: [{"featureType": "administrative.locality", "stylers": [{"weight": 8 } ] }, {"featureType": "landscape", "stylers": [{"visibility": "on"}, {"weight": 8 } ] }, {"featureType": "poi", "stylers": [{"visibility": "simplified"}, {"weight": 8 }]}]
				};
				
				var map = new google.maps.Map(document.getElementById('map'), options);

		    var marker = new google.maps.Marker({
		      position: myLatLng,
		      animation: google.maps.Animation.DROP,
		      map: map,
		      icon: './assets/icons/current-location.png'
		    });

		    var infowindow = new google.maps.InfoWindow({
		    	content: 'You'
		  	});

		  	marker.addListener('click', () => {
					infowindow.open(map, marker);
		      map.panTo(marker.getPosition());
			  });

			  map.setZoom(17);
		  	map.setCenter(myLatLng);
		  	
		    let request = {
			    location: myLatLng,
			    radius: 500,
			    types: ['atm']
			  };

		    var service = new google.maps.places.PlacesService(map);

				service.nearbySearch(request, (results, status) => {
					if (status == google.maps.places.PlacesServiceStatus.OK) {
				    results.map((result, i) => {
		          createMarker(result, i);
				    });
				  }
				});
		    
		    var infoWindows = []; 
				function createMarker(place, i) {
					let marker = new google.maps.Marker({
				    map: map,
				    position: place.geometry.location,
				    animation: google.maps.Animation.DROP
				  });

				  var latLngA = new google.maps.LatLng(myLatLng.lat, myLatLng.lng);
		      var distance = google.maps.geometry.spherical.computeDistanceBetween(latLngA, place.geometry.location);
		      
					let infowindow = new google.maps.InfoWindow({
		        content: `<div><b>Bank:</b> ${place.name}</div><div><b>Active Status:</b> Loading..</div>` + `<div><b>Direction: </b> <a href="https://maps.google.com/?saddr=${latLngA}&daddr=${place.geometry.location}" target="_blank">Go here</a></div>`
		      });

		      infowindow.placeId = place.place_id;
		      infowindow.place = place.geometry.location;
		      infowindow.open(map, marker);
		      infoWindows.push({
		      	infowindow,
		      	latLng: latLngA
		      });

		      marker.addListener('click', () => {
		  			infowindow.open(map, marker);
			      map.panTo(marker.getPosition());
				  });
				}
				resolve({
					infoWindows, 
					location: this.location
				});
			});
		});

		promise.then((data) => {
			var url = `https://cash-status-lfontbrpvv.now.sh?lat=${data.location.lat}&lng=${data.location.lng}`;
			fetch(url, {method: 'GET', headers: {'Content-type': 'application/json'}})
			.then(response => { return response.json()})
			.then((results) => {
				data.infoWindows.forEach((infoWindow) => {
					results.forEach((result) => { 
						if (infoWindow.infowindow.placeId === result.placeId) {
							var distance = google.maps.geometry.spherical.computeDistanceBetween(infoWindow.latLng, infoWindow.infowindow.place);
							var currentTime = moment(result.txnDate).fromNow();
							var html = `<div><b>Bank:</b> ${result.name} - <b> ${parseInt(distance)} M </b></div><div><b>Active Status:</b> ${currentTime}</div>` + `<div><b>Direction: </b> <a href="https://maps.google.com/?saddr=${infoWindow.latLng}&daddr=${infoWindow.infowindow.place}" target="_blank">Go here</a></div>`;
							infoWindow.infowindow.setContent(html);
						}
					});
				});
			});
		})
	}

	componentWillUnmount() {
		GoogleMapsLoader.release();
	}

	render() {
		const {msg} = this.state;
		return (
			<div class={style.home}>
				<div id="map" class={style.map}>
					<p class={style.loading}></p>	
				</div>
			</div>
		);
	}
}
