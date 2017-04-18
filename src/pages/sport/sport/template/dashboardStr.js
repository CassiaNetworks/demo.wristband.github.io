import fire_static from 'publicDir/imgs/fire_static.jpg'
import heart_staic from 'publicDir/imgs/heart_staic.jpg'
import running_static from 'publicDir/imgs/running_static.jpg'
import './dashboard.css'
function dashboardStr(data) {
    const str = `<li data-node='${data.node}'>
					<h2>${data.userName}</h2>
					${data.loc?'<p class="loc">位置：<span >'+data.loc+'</span></p>':''}
					<p class="totalStep">累计步数 : <span >${data.totalStep}</span></p>
					${data.say?"<input type = 'text' value='hello'><button class='send' data-node='"+data.node+"'>send</button>":''}
					<div class="yellow">
						<img src=${fire_static} alt="icon">
						<p><span>${data.cal}</span>千卡</p>
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