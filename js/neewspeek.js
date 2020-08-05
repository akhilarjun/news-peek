// Setup theme icon data properly
setupThemeIcon();
const ENV = 'DEV';
const categories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
const API_KEY = 'bec0ddf103244fa096a72ce2b2f93945';
const topHeadlinesURL = `https://newsapi.org/v2/top-headlines?country=in&apiKey=${API_KEY}`;
const searchURL = `https://newsapi.org/v2/everything?apiKey=${API_KEY}`;
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if(!localStorage.getItem('installRejected') && !localStorage.getItem('installCompleted')) {
        showInstallPromotion();
    } else {
        showFloatingIcon();
    }
});

addEventListener('load',async () => {
    const permision = await Notification.requestPermission();
    if (permision === 'granted') {
        subscribe();
    }
});

async function subscribe() {
    const rawResp = await fetch('https://cya5q481yc.execute-api.us-east-1.amazonaws.com/pushNotificationEngine');
    rawResp.json().then(async serverKey => {
        let sw = await navigator.serviceWorker.ready;
        let subscription = await sw.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: serverKey
        });
        if (localStorage.getItem('sub_auth') !== subscription.toJSON().keys.auth) {
            fetch('https://cya5q481yc.execute-api.us-east-1.amazonaws.com/pushNotificationEngine', {
                method: 'POST',
                body: JSON.stringify({
                    reqType: 'subscribe',
                    subscription: subscription,
                    subscriptionFor: 'newspeek'
                })
            }).then(
                resp => {
                    if (resp.ok) {
                        localStorage.setItem('sub_auth', subscription.toJSON().keys.auth);
                    }
                }
            );
        }
    });
}

function showFloatingIcon() {
    if (!localStorage.getItem('installCompleted')) {
        const floatingIcon = document.getElementById('floatingIcon');
        floatingIcon.classList.add('show');
    }
}

function showInstallPromotion() {
    const installModal = document.getElementById('installModal');
    installModal.classList.add('show');
}

function hideModal() {
    localStorage.setItem('installRejected', true);
    showFloatingIcon();
    const installModal = document.getElementById('installModal');
    installModal.classList.remove('show');
}

function installNewsPeek() {
    hideModal();
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(choiceResult => {
        if (choiceResult.outcome === 'accepted') {
            localStorage.setItem('installRejected', false);
        } else {
            localStorage.setItem('installRejected', true);
        }
    })
}

window.addEventListener('appinstalled', (evt) => {
    localStorage.setItem('installCompleted', true);
});

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