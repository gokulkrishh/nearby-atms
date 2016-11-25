import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Toast extends Component {
  
  componentDidMount() {
  	this.toastContainer = document.querySelector('.toast__container');

  	document.addEventListener("DOMContentLoaded", () => {
  		if (!navigator.onLine) {
  		  this.showToastMsg('You are Offline');	
  		}
  	})

  	window.addEventListener('offline', () => {
      this.showToastMsg('You are Offline');
  	});

  	window.addEventListener('online', () => {
      if (this.toastMsg) this.toastMsg.remove();
  	});
  }

	showToastMsg(msg) {
		if (this.toastMsg) this.toastMsg.remove();
		this.toastMsg = document.createElement('div');
    this.toastMsg.textContent = msg;
		this.toastMsg.style.opacity = 1;
		this.toastContainer.appendChild(this.toastMsg)
		setTimeout(() => {
      this.toastMsg.remove();
    }, 5000);
	}

	render() {
		return (
			<div class={"toast__container " + style.toast__container}>
			  <div class={style.toast__msg}></div>
			</div>
		);
	}
}
