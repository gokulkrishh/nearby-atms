import { h, Component } from 'preact';
import GoogleMapsLoader from 'google-maps';
import config from '../../config.json';
import style from './style';

export default class Home extends Component {
	constructor(props) {
		super(props);
		this.getLocationAndDistance = this.getLocationAndDistance.bind(this);
		this.geoLocationError = this.geoLocationError.bind(this);
		this.showToastMsg = this.showToastMsg.bind(this);
		this.state = {
			msg: '',
			showToast: false
		};
	}

	hideToastMsg() {
		setTimeout(() => {
			this.setState({
				msg: '',
				showToast: false
			});
		}, 4000);
	}

	showToastMsg(msg) {
		this.setState({
			msg: msg,
			showToast: true
		});

		this.hideToastMsg();
	}

	componentDidMount(event) {
		GoogleMapsLoader.KEY = config.mapAPIKey;
		GoogleMapsLoader.LIBRARIES = ['geometry', 'places'];
		GoogleMapsLoader.REGION = 'IN';
		this.getLocationAndDistance();

		window.addEventListener('offline', () => {
			this.showToastMsg('Offline');
		});

		window.addEventListener('online', () => {
			this.getLocationAndDistance();
			this.showToastMsg('You are Online now');
		})
	}

	getLocationAndDistance() {
		navigator.geolocation.getCurrentPosition(onSuccess, this.geoLocationError);

		function onSuccess(position) { 
			const myLatLng = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};

			GoogleMapsLoader.load((google) => {
				const options = {
					center: myLatLng,
					zoom: 16,
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

      	marker.addListener('click', () => {
    			infowindow.open(map, marker);
			  });

        let request = {
			    location: myLatLng,
			    radius: 250,
			    types: ['atm']
			  };

        var service = new google.maps.places.PlacesService(map);

  			service.nearbySearch(request, (results, status) => {
  				if (status == google.maps.places.PlacesServiceStatus.OK) {
				    for (let i = 0; i < results.length; i++) {
				      createMarker(results[i], i);
				    }
				  }
  			});

  			var infoWindows = [];
  			function createMarker(place, i) {
  				let marker = new google.maps.Marker({
				    map: map,
				    position: place.geometry.location,
				    animation: google.maps.Animation.DROP
				  });

				  var latLngA = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	        var distance = google.maps.geometry.spherical.computeDistanceBetween(latLngA, place.geometry.location);

					let infowindow = new google.maps.InfoWindow({
	          content: `<div><b>Bank:</b> ${place.name} - <b>${parseInt(distance)} M</b></div><div><b>Status:</b> Loading...</div>` + `<div><b>Direction: </b> <a href="https://maps.google.com/?saddr=${latLngA}&daddr=${place.geometry.location}" target="_blank">Go here</a></div>`
	        });

	        infowindow.open(map, marker);
					infoWindows.push(infowindow);

					var url = `https://cash-or-not-proxy-mczimgiusy.now.sh?lat=${place.geometry.location.lat()}&lon=${place.geometry.location.lng()}`;
	      	fetch(url)
	      		.then((response) => { return response.json() })
	      		.then((results) => {
	      			status = results[i].working_status;
	      			var html = `<div><b>Bank:</b> ${place.name} - <b>${parseInt(distance)} M</b></div><div><b>Status:</b> ${status}</div>` + `<div><b>Direction: </b> <a href="https://maps.google.com/?saddr=${latLngA}&daddr=${place.geometry.location}" target="_blank">Go here</a></div>`;
	      			infoWindows[i].setContent(html);
	      		});

      		marker.addListener('click', () => {
      			infowindow.open(map, marker);
				  });
				}
			});
		}
	}

	geoLocationError(error) {
		if (error.code == error.PERMISSION_DENIED) {
			this.showToastMsg(error.message);
    }
	}

	componentWillUnmount() {
		GoogleMapsLoader.release();
	}

	render() {
		const {msg, showToast} = this.state;
		return (
			<div class={style.home}>
				<div id="map" class={style.map}>
					<p class={style.loading}></p>	
				</div>
				<div class={style.snackbar} style={showToast ? {bottom: 0} : ''}>
  				<p>{msg}</p>
				</div>
			</div>
		);
	}
}
