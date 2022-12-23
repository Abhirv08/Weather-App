const API_KEY = '31531d3c6bdfd09a6d4519950c2b05af';
const city = 'Chandigarh';
const unit = 'metric';

const currentWeather = async() =>{
    const currentdata = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${unit}`);
    return currentdata.json();
}

const formatTemp = (temp) => `${temp?.toFixed(1)}°`;

const loadCurrentWeather = ({main: {temp, temp_min, temp_max}, name, weather:[{description, icon}]}) => {
    document.getElementsByClassName("temp")[0].textContent = formatTemp(temp);
    document.getElementsByClassName("city")[0].textContent = name;
    document.getElementsByClassName("img_desc")[0].innerHTML = `<img src="${getURL(icon)}" alt="icon"> <p class="desc">${description}</p>`;
    document.getElementsByClassName("high")[0].textContent = `H: ${formatTemp(temp_max)}`;
    document.getElementsByClassName("low")[0].textContent = `L: ${formatTemp(temp_min)}`;
}

const loadWindSpeed = ({wind:{speed}}) => {
    document.getElementsByClassName("speed")[0].textContent = `${speed} m/s`;
}

const loadHumidity = ({main:{humidity}}) => {
    document.getElementsByClassName("humidity-data")[0].textContent = `${humidity}%`;
}

const weatherForecast = async() => {
    const forecastData = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${unit}`);
    const data = await forecastData.json();
    return data.list.map((forecast) => {
        const {main:{temp, temp_min, temp_max}, weather:[{description, icon}], dt, dt_txt} = forecast;
        return {temp, temp_min, temp_max, description, icon, dt_txt, dt};
    })
}

const loadHourlyForecast = (hourlyForecast) => {
    let requiredData = hourlyForecast.slice(1, 13);
    console.log(requiredData);
    const container = document.querySelector(".hourly_container");
    let innerHTMLString = "";

    for(let {dt_txt, icon, temp, description} of requiredData){
        innerHTMLString += `
        <article>
            <h2>${formatTime(dt_txt.split(" ")[1])}</h2>
            <img src="${getURL(icon)}" alt="icon" /> 
            <p class="desc">${description}</p>
            <p>${formatTemp(temp)}</p>
        </article>
        `
    }
    container.innerHTML = innerHTMLString;
}

const getURL = (icon) => `http://openweathermap.org/img/wn/${icon}@2x.png`;
const formatTime = (time) => {
    const currTime = Number(time.substring(0,2));
    console.log(typeof(currTime));
    if(currTime === 0){
        return "00:00 AM";
    }else if(currTime === 12){
        return "12:00 PM";
    }else if(currTime < 12){
        return `0${currTime}:00 AM`;
    }else{
        return `0${currTime - 12}:00 PM`;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const currWeatherData = await currentWeather();
    loadCurrentWeather(currWeatherData);
    loadWindSpeed(currWeatherData);
    loadHumidity(currWeatherData);

    const hourlyForecast = await weatherForecast();
    loadHourlyForecast(hourlyForecast);
    // console.log(weatherData);
})
