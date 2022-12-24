const API_KEY = '31531d3c6bdfd09a6d4519950c2b05af';
const city = 'Aizwal';
const unit = 'metric';
const week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const currentWeather = async() =>{
    const currentdata = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${unit}`);
    return currentdata.json();
}

const formatTemp = (temp) => `${temp?.toFixed(1)}°`;

const loadCurrentWeather = ({main: {temp, temp_min, temp_max}, name, weather:[{description, icon}]}) => {
    document.getElementsByClassName("temp")[0].textContent = formatTemp(temp);
    document.getElementsByClassName("city")[0].textContent = name;
    document.getElementsByClassName("img_desc")[0].innerHTML = `<img src="${getURL(icon)}" alt="icon"> <p class="desc">${description}</p>`;
    document.getElementsByClassName("high_low")[0].textContent = `${formatTemp(temp_max)} / ${formatTemp(temp_min)}`;
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
    const container = document.querySelector(".hourly_container");
    let innerHTMLString = "";

    for(let {dt_txt, icon, temp, description} of requiredData){
        innerHTMLString += `
        <article>
            <h4>${formatTime(dt_txt.split(" ")[1])}</h4>
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

const dayWiseForecast = (hourlyForecast) => {
    let dayWiseForecast = new Map();

    for(let forecast of hourlyForecast){
        const date = forecast.dt_txt.split(" ")[0];
        const day = week[new Date(date).getDay()];

        if(dayWiseForecast.has(day)){
            let forecastOfTheDay = dayWiseForecast.get(day);
            forecastOfTheDay.push(forecast);
            dayWiseForecast.set(day, forecastOfTheDay);
        }else{
            dayWiseForecast.set(day, [forecast]);
        }
    }

    for(let [key, value] of dayWiseForecast){
        const temp_min = Math.min(...Array.from(value, val => val.temp_min));
        const temp_max = Math.max(...Array.from(value, val => val.temp_max));
        const icons = Array.from(value, val => val.icon)
        let mostOccuredIcon = new Map();
        
        for(let icon of icons){
            if(mostOccuredIcon.has(icon)){
                let occurance = mostOccuredIcon.get(icon);
                mostOccuredIcon.set(icon, occurance+1);
            }else{
                mostOccuredIcon.set(icon, 1);
            }
        }

        let occurance = 0;
        let icon = "";
        for(let [key, val] of mostOccuredIcon){
            if(occurance < val){
                occurance = val;
                icon = key;
            }
        }

        dayWiseForecast.set(key, {temp_min, temp_max, icon});
    }

    return dayWiseForecast;
}

const loadFiveDayForecase = (dayWiseForecastData) => {
    console.log(dayWiseForecastData);
    const container = document.querySelector(".five-day-forecast-container");
    let innerHTML = ``;

    Array.from(dayWiseForecastData).map(([day, {temp_min, temp_max, icon}], index) => {
        if(index < 5){
            if(index === 0) day = "Today";
            else if(index === 1) day = "Tommorow";
            innerHTML += `
            <article>
                <h4>${day}</h4>
                <img src="${getURL(icon)}" alt="">
                <p class="high_low">${formatTemp(temp_max)} / ${formatTemp(temp_min)}</p>
            </article>
            `
        }
    })

    container.innerHTML = innerHTML;
}

document.addEventListener("DOMContentLoaded", async () => {
    const currWeatherData = await currentWeather();
    loadCurrentWeather(currWeatherData);
    loadWindSpeed(currWeatherData);
    loadHumidity(currWeatherData);

    const hourlyForecast = await weatherForecast();
    loadHourlyForecast(hourlyForecast);

    const dayWiseForecastData = dayWiseForecast(hourlyForecast);
    loadFiveDayForecase(dayWiseForecastData);
    //console.log(hourlyForecast);
})
