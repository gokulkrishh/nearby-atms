import { h, Component } from 'preact';
import GoogleMapsLoader from 'google-maps';
import config from '../../config.json';
import style from './style';

export default class Home extends Component {
	constructor(props) {
		super(props);
		this.getLocation = this.getLocation.bind(this);
	}

	componentDidMount(event) {
		GoogleMapsLoader.KEY = config.mapAPIKey;
		GoogleMapsLoader.LIBRARIES = ['geometry', 'places'];
		GoogleMapsLoader.REGION = 'IN';
		console.log(GoogleMapsLoader)
		this.getLocation();
	}

	getLocation() {
		navigator.geolocation.getCurrentPosition((position) => { 
			const myLatLng = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};

			GoogleMapsLoader.load((google) => {
				const options = {
					center: myLatLng,
					zoom: 17,
					fullscreenControl: true, 
					backgroundColor: '#fafafa',
					zoomControl: false,
					mapTypeControl: false,
					signInControl: true
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

        let request = {
			    location: myLatLng,
			    radius: 250,
			    types: ['atm']
			  };

        var service = new google.maps.places.PlacesService(map);

  			service.nearbySearch(request, (results, status) => {
  				if (status == google.maps.places.PlacesServiceStatus.OK) {
				    for (let i = 0; i < results.length; i++) {
				      createMarker(results[i]);
				    }
				  }
  			});

  			function createMarker(place) {
  				console.log(place);
				  let marker = new google.maps.Marker({
				    map: map,
				    position: place.geometry.location,
				    animation: google.maps.Animation.DROP
				  });

				  let infowindow = new google.maps.InfoWindow({
          	content: place.name
        	});

        	infowindow.open(map, marker);
  			}
			});
		});
	}

	componentWillUnmount() {
		GoogleMapsLoader.release(() => {
			console.log("Google MAPS API is released.");
		});
	}

	render() {
		return (
			<div class={style.home}>
				<div id="map" class={style.map}>
					<p class={style.map.loading}>Loading map...</p>
				</div>

				<div class={style.actions}>
					<button onClick={this.getLocation}>
						<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
					    <path d="M0 0h24v24H0z" fill="none"/>
					    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
						</svg>
					</button>
					<p>Locate ATM Nearby</p>
				</div>
			</div>
		);
	}
}
