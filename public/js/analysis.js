window.addEventListener("load", async function () {
    const response = await fetch(`/analysis/data/${userId}`);
    const data = await response.json();

    // Generate an array of last 10 days
    let lastTenDays = Array.from({ length: 10 }, (_, i) => {
        let d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().slice(0, 10);
    }).reverse();

    let commentCountsByDate = {};
    data.dailyCommentCount.forEach(d => {
        commentCountsByDate[d.date] = d.comment_count;
    });

    // Create an array of comment counts for the last 10 days, default is 0.
    let commentCounts = lastTenDays.map(date => commentCountsByDate[date] || 0);

    const xValues = ["Follower Count", "Comment Count", "Like Count"];
    const yValues = [data.followerCount, data.commentCount, data.likeCount];
    const barColors = ["rgb(215, 30, 30)", "rgb(220,100,100)", "rgb(234,170,170)"];

    new Chart("barChart", {
        type: "bar",
        data: {
            labels: xValues,
            datasets: [{
                backgroundColor: barColors,
                data: yValues,
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        stepSize: 1
                    }
                }]
            },
            legend: { display: false },
            title: {
                display: true,
                text: "Your Key Performance Indicate"
            },
            plugins: {
                datalabels: {
                    display: true,
                    color: 'black'
                }
            }
        }
    });

    // Create the line chart for daily comment count
    new Chart("lineChart", {
        type: "line",
        data: {
            labels: lastTenDays,
            datasets: [{
                data: commentCounts,
                borderColor: 'rgb(215, 30, 30)',
            }]
        },
        options: {
            legend: { display: false },
            title: {
                display: true,
                text: "Your Daily Comment Count"
            },
            scales: {
                yAxes: [{
                    ticks: {
                        stepSize: 1
                    }
                }]
            }
        }
    });

    // Get top three articles and display them. (If not default message will display)
    let topThreeArticlesElement = document.getElementById('topThreeArticles');
    if (data.topThreeArticles.length === 0) {
        topThreeArticlesElement.innerHTML += `You have not post any article!`;
    } else {
        data.topThreeArticles.forEach((article, index) => {
            let shortContent = `Rank ${index + 1}: ${article.title}, has ${article.comment_count} comments, with ${article.like_count} likes, Popularity is ${article.popularity}, Created in ${article.create_date}`;
            if (article.thumbnail == null) {
                article.thumbnail = '/dault-image/dault.jpg';
            }

            topThreeArticlesElement.innerHTML += `
        <div class="article-card" onclick="location.href='/article/${article.id}'">
            <div class="article-img">
                <img src="${article.thumbnail}" alt="Article image">
            </div>
            <div class="article-info">
                <div class="article-title">${article.title}</div>    
                <div class="article-header">
                    <span class="article-date">${article.create_date}</span>
                </div>
                <div class="article-content">
                    <span class="article-link">${shortContent}...</span>
                </div>
            </div>
        </div>
    `;
        });
    }
});

