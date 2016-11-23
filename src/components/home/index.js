import { h, Component } from 'preact';
import GoogleMapsLoader from 'google-maps';
import config from '../../config.json';
import style from './style';

export default class Home extends Component {
	constructor(props) {
		super(props);
		this.getNearbyAtms = ::this.getNearbyAtms;
	}

	componentDidMount() {
		GoogleMapsLoader.KEY = config.mapAPIKey;
		GoogleMapsLoader.LIBRARIES = ['geometry', 'places'];

    navigator.geolocation.getCurrentPosition((event) => {
			let location = {
				lat: event.coords.latitude,
				lng: event.coords.longitude
			};
			this.getNearbyAtms(location);
		}, (error) => {
			if (error.code == error.PERMISSION_DENIED) {
				alert(error.message);
    	}
		});
	}

	getNearbyAtms(myLatLng) {
		GoogleMapsLoader.load((google) => {
			const options = {
				center: myLatLng,
				fullscreenControl: true, 
				backgroundColor: '#fafafa',
				zoomControl: true,
				signInControl: true,
				disableDefaultUI: true
			};
  		
  		var map = new google.maps.Map(document.getElementById('map'), options);

  		var marker = new google.maps.Marker({
        position: myLatLng,
        animation: google.maps.Animation.DROP,
        map: map
      });

      var infowindow = new google.maps.InfoWindow({
      	content: 'You'
    	});

    	infowindow.open(map, marker);

    	marker.addListener('click', () => {
  			infowindow.open(map, marker);
  			map.setZoom(19);
	      map.panTo(marker.getPosition());
		  });

		  map.setZoom(17);
    	map.setCenter(myLatLng);
    	
      let request = {
		    location: myLatLng,
		    radius: 250,
		    types: ['atm']
		  };

      var service = new google.maps.places.PlacesService(map);

			service.nearbySearch(request, (results, status) => {
				if (status == google.maps.places.PlacesServiceStatus.OK) {
			    for (let result of results) {
			      createMarker(result);
			    }
			  }
			});

			function createMarker(place) {
				let marker = new google.maps.Marker({
			    map: map,
			    position: place.geometry.location,
			    animation: google.maps.Animation.DROP
			  });

			  var latLngA = new google.maps.LatLng(myLatLng.lat, myLatLng.lng);
        var distance = google.maps.geometry.spherical.computeDistanceBetween(latLngA, place.geometry.location);

        function hasCash(event) {
					console.log(event)
				}

				let infowindow = new google.maps.InfoWindow({
          content: `<div><b>Bank:</b> ${place.name} - <b>${parseInt(distance)} M</b></div><div id="${place.id}"><b>Cash:</b> <span>Yes</span> or <span>No</span></div>` + `<div><b>Direction: </b> <a href="https://maps.google.com/?saddr=${latLngA}&daddr=${place.geometry.location}" target="_blank">Go here</a></div>`
        });

        infowindow.open(map, marker);

    		marker.addListener('click', () => {
    			console.log("came")
    			infowindow.open(map, marker);
    			map.setZoom(19);
		      map.panTo(marker.getPosition());
			  });

			  document.getElementById(place.id).addEventListener('click', (event) => {
			  	if (event.target.textContent === 'Yes' || event.target.textContent === 'No') {
			  		var userAns = event.target.textContent;
			  		console.log(userAns)
			  	}
			  })
			}
		});
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
