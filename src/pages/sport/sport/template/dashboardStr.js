import fire_static from 'publicDir/imgs/fire_static.jpg'
import heart_staic from 'publicDir/imgs/heart_staic.jpg'
import refresh from 'publicDir/imgs/refresh.jpg'
import running_static from 'publicDir/imgs/running_static.jpg'

function dashboardStr(data) {
    const str = `<li data-node='${data.node}'><h2>${data.name}</h2>
					<p>累计步数 : <span>${data.totalStep}</span></p>
					<div class="yellow">
						<img src=${fire_static} alt="icon">
						<p><span>${data.cal}</span>卡</p>
					</div>
					<div class="red">
						<img src=${heart_staic} alt="icon">
						<p><span>${data.heartRate}</span>/s</p>
					</div>
					<div class="blue">
						<img src=${running_static} alt="icon">
						<a href="javascript:;" data-node='${data.node}'></a>
						<p><span>${data.step}</span>步</p>
					</div></li>`
    return str
}


export {dashboardStr}