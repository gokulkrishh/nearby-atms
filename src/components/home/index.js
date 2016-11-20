import { h, Component } from 'preact';
import GoogleMapsLoader from 'google-maps';
import config from '../../config.json';
import style from './style';

export default class Home extends Component {
	componentDidMount(event) {
		GoogleMapsLoader.KEY = config.mapAPIKey;
		const EIFFEL_TOWER_POSITION = {
		  lat: 48.858608,
		  lng: 2.294471
		};

		const options = {
			center: EIFFEL_TOWER_POSITION,
			zoom: 17,
			fullscreenControl: true, 
			zoomControl: false,
			mapTypeControl: false,
			signInControl: true
		};
		

		GoogleMapsLoader.load((google) => {
    	var maps = new google.maps.Map(document.querySelector('#map'), options);
		});

		console.log(GoogleMapsLoader)
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
					Loading map...
				</div>

				<div class={style.actions}>
					<button></button>
					<p>Locate Me</p>
				</div>
			</div>
		);
	}
}
