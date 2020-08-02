// Setup theme icon data properly
setupThemeIcon();
const ENV = 'DEV';
const categories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
const API_KEY = 'bec0ddf103244fa096a72ce2b2f93945';
const topHeadlinesURL = `https://newsapi.org/v2/top-headlines?country=in&apiKey=${API_KEY}`;
const searchURL = `https://newsapi.org/v2/everything?apiKey=${API_KEY}`;

/**
 * Utility to format date as
 * Sun Aug 02 2020
 * @param {*} d
 * @returns [day, month, date, year] 
 */
function formatDate(d) {
    const date = new Date(d);
    let [day, month, thedate, year] = date.toDateString().split(' ');
    return `${day}, ${thedate} ${month} ${year}`;
}

function welcomeUser() {
    let formattedDate = formatDate(Date.now());
    document.getElementById('date').innerText = formattedDate;
}

function loadTopCategories() {
    let output = '';
    categories.forEach(category => (
        output += `
            <div class="categoryTile">
                ${category}
            </div>
        `
    ));
    document.getElementById('topcategories').innerHTML = output;
}

function getTitle(title) {
    title = title.split('-');
    title.pop();
    return title.join('-');
}

function loadNews(newsList) {
    let output = '';
    newsList.forEach(news => (
        output += `
            <div class="news--shot">
                <div class="news--img">
                    <img src="${news.urlToImage ? news.urlToImage : './img/logo.png'}" alt="${getTitle(news.title)}">
                </div>
                <div class="news--content">
                    <div class="news--headline"><a target="_blank" rel="noreferrer noopener" href="${news.url}">${getTitle(news.title)}</a></div>
                    <div class="news--meta">
                        <div class="news--date">${formatDate(news.publishedAt)}</div>
                        <div class="news--source">${news.source.name}</div>
                    </div>
                </div>
            </div>
        `
    ));
    document.getElementById('news').innerHTML = output;
}

async function fetchURL(url, params) {
    const req = new URL(url);
    let rawResp;
    
    if (ENV !== 'DEV') {
        params && Object.keys(params).forEach(key => req.searchParams.append(key, params[key]));
        rawResp = await fetch(req);
    } else {
        rawResp = await fetch('./js/newsdump.json');
    }
    return await rawResp.json();
}

async function loadApp() {
    const news = await fetchURL(topHeadlinesURL);
    console.log(news);
    welcomeUser();
    loadTopCategories();
    loadNews(news.articles);
}

document.addEventListener("DOMContentLoaded", loadApp)