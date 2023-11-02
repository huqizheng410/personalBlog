let articles = [];
let currentIndex = 0;
// Control each page will display how many articles
const pageSize = 6;

window.addEventListener("load", async function () {
    const showArticles = document.querySelector("#showArticles");
    articles = await getArticlesDetails();
    renderArticles(showArticles);

    // filter option change event
    const filterOption = document.querySelector("#filterOption");
    filterOption.addEventListener("change", async function () {
      showArticles.innerHTML = "";
      const option = filterOption.value;
      articles = await getArticlesDetails(option);
      currentIndex = 0;
      document.querySelector("#loadMoreButton").innerText = "Load More";
      document.querySelector("#loadMoreButton").disabled = false;
      renderArticles(showArticles);
    });

    document.querySelector("#loadMoreButton").addEventListener("click", function () {
        renderArticles(showArticles);
    });

    async function getArticlesDetails(sortBy = "") {
        let requestUrl = `/articlesDetails`;

        if (sortBy) {
            requestUrl += `?sortBy=${sortBy}`;
        }

        const articlePromise = await fetch(requestUrl);
        const articles = await articlePromise.json();
        return articles;
    }

});

async function renderArticles(showArticles) {

    for (let i = 0; i < pageSize && currentIndex < articles.length; i++, currentIndex++) {
        const article = articles[currentIndex];
        const articlePromise = await fetch(`/homepageUserDetails/${article.user_id}`);
        const articleAuthor = await articlePromise.json();

        const rawContent = article.content.replace(/<[^>]*>?/gm, '');
        const shortContent = rawContent.slice(0, 200);
        if (article.image_url == null) {
            article.image_url = `/dault-image/dault.jpg`;
        };
        showArticles.innerHTML += `
        <div class="article-card" onclick="location.href='/article/${article.id}'">
            <div class="article-img">
                <img src="${article.image_url}" alt="Article image">
            </div>
            <div class="article-info">
                <div class="article-title">${article.title}</div>    
                <div class="article-header">
                    <img class="article-avatar" width="30px" src="${articleAuthor.avatar}">
                    <span class="article-author" onclick="event.stopPropagation(); location.href='/userdetail/${articleAuthor.username}'">${articleAuthor.username}</span>
                    <span class="article-date">${article.create_date}</span>
                </div>
                <div class="article-content">
                    <span class="article-link">${shortContent}...</span>
                </div>
            </div>
        </div>
        `;
    }

    if (currentIndex >= articles.length) {
        document.querySelector("#loadMoreButton").innerText = "No More Articles Available";
        document.querySelector("#loadMoreButton").disabled = true;
    } else {
        document.querySelector("#loadMoreButton").innerText = "Load More";
        document.querySelector("#loadMoreButton").disabled = false;
    }
}
