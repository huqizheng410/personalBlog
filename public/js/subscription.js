window.addEventListener("load", async function () {
    let currentPage = 0;
    let totalPages = 0;
    // Controls the number of notifications displayed per page, can be modified, but be aware of the layout structure
    const notificationsPerPage = 7;
    const notificationCountElement = document.querySelector('.notification-count');

    await updateUnreadCount();

    const source = new EventSource('/notifications/sse');

    source.onmessage = function (event) {
        const count = parseInt(event.data);
        updateNotificationCount(count);
        localStorage.setItem('unreadCount', count);
    };

    function updateNotificationCount(count) {
        notificationCountElement.textContent = count;
        notificationCountElement.style.display = count === 0 ? 'none' : 'flex';
    }

    async function updateUnreadCount() {
        const unreadCountResponse = await fetch('/notifications/unreadCount');
        const { unreadCount } = await unreadCountResponse.json();
        updateNotificationCount(unreadCount);
    }


    const logoutButton = document.querySelector("#logout");
    if (logoutButton != null) {
        logoutButton.addEventListener('click', function () {
            localStorage.removeItem('unreadCount');
        });
    }

    const dropdownMenu = document.querySelector('.dropdown-menu');
    if (dropdownMenu != null) {
        let timeoutId = null;
        const bellIcon = document.querySelector('#bell');

        bellIcon.addEventListener('mouseenter', async function (event) {
            await updateUnreadNotifications();
            clearTimeout(timeoutId);

            if (dropdownMenu.children.length > 3) {
                dropdownMenu.style.display = 'block';
            }
        });

        bellIcon.addEventListener('mouseleave', function (event) {
            timeoutId = setTimeout(() => {
                dropdownMenu.style.display = 'none';
            }, 200);
        });

        dropdownMenu.addEventListener('mouseenter', function () {
            dropdownMenu.style.display = 'block';
            clearTimeout(timeoutId);
        });

        dropdownMenu.addEventListener('mouseleave', function (event) {
            timeoutId = setTimeout(() => {
                dropdownMenu.style.display = 'none';
            }, 100);
        });
    }

    async function updateUnreadNotifications(page = 0) {
        const response = await fetch('/notifications/unread');
        const notifications = await response.json();

        notifications.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateB - dateA;
        });

        const start = page * notificationsPerPage;
        const end = start + notificationsPerPage;
        const notificationsForPage = notifications.slice(start, end);
        totalPages = Math.ceil(notifications.length / notificationsPerPage);

        const dropdownMenu = document.querySelector('.dropdown-menu');
        dropdownMenu.innerHTML = '';

        notificationsForPage.forEach(notification => {
            const notificationElement = document.createElement('div');
            notificationElement.classList.add('notification-item');

            const avatarElement = document.createElement('img');
            avatarElement.src = notification.sender_avatar;
            avatarElement.classList.add('notification-avatar');

            const usernameElement = document.createElement('a');
            usernameElement.href = `/userdetail/${notification.sender_username}`;
            usernameElement.textContent = notification.sender_username;
            usernameElement.classList.add('notification-username');
            usernameElement.style.textDecoration = 'none';
            usernameElement.addEventListener('click', async function () {
                markAsRead(notification.id);
            });
            // Shortcut the notification content if the content contains too many characters
            const messageElement = document.createElement('a');
            let shortNotificationContent = notification.content;
            if (shortNotificationContent.length > 102) {
                shortNotificationContent = shortNotificationContent.substring(0, 102) + "...";
            }
            messageElement.textContent = ` ${shortNotificationContent} `;
            messageElement.style.textDecoration = 'none';
            messageElement.classList.add('notification-message');
            messageElement.addEventListener('click', async function () {
                markAsRead(notification.id);
            });

            if (notification.article_id) {
                messageElement.href = `/article/${notification.article_id}`;
            } else {
                messageElement.href = `/userdetail/${notification.sender_username}`;
            }

            const timeElement = document.createElement('span');
            const date = new Date(notification.created_at);
            const options = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            };
            timeElement.textContent = date.toLocaleString('en-GB', options);
            timeElement.classList.add('notification-time');

            const readButton = document.createElement('button');
            readButton.textContent = 'Mark as Read';
            readButton.classList.add('read-notification-button');
            readButton.dataset.notificationId = notification.id;
            readButton.addEventListener('click', async function () {
                markAsRead(notification.id);
                readButton.disabled = true;
                notificationElement.classList.add('read');
            });

            const notificationContent = document.createElement('div');
            notificationContent.classList.add('notification-content');

            const notificationText = document.createElement('div');
            const notificationTime = document.createElement('div');
            const notificationButtons = document.createElement('div');
            const buttonsContainer = document.createElement('div');

            usernameElement.addEventListener('mouseenter', function () {
                usernameElement.style.cursor = 'pointer';
                usernameElement.style.textDecoration = 'underline';
            });

            usernameElement.addEventListener('mouseleave', function () {
                usernameElement.style.textDecoration = 'none';
            });

            messageElement.addEventListener('mouseenter', function () {
                messageElement.style.cursor = 'pointer';
                messageElement.style.textDecoration = 'underline';
            });

            messageElement.addEventListener('mouseleave', function () {
                messageElement.style.textDecoration = 'none';
            });

            notificationText.appendChild(usernameElement);
            notificationText.appendChild(messageElement);

            notificationTime.appendChild(timeElement);

            buttonsContainer.appendChild(readButton);

            notificationButtons.appendChild(buttonsContainer);
            notificationContent.appendChild(notificationText);
            notificationContent.appendChild(notificationTime);
            notificationContent.appendChild(notificationButtons);

            notificationElement.appendChild(avatarElement);
            notificationElement.appendChild(notificationContent);

            dropdownMenu.appendChild(notificationElement);
        });
        dropdownMenu.style.display = notificationsForPage.length === 0 ? 'none' : 'block';

        const nextPageButton = document.createElement('button');
        nextPageButton.textContent = 'Next Page';
        nextPageButton.addEventListener('click', function () {
            currentPage++;
            updateUnreadNotifications(currentPage);
        });

        const prevPageButton = document.createElement('button');
        prevPageButton.textContent = 'Previous Page';
        prevPageButton.addEventListener('click', function () {
            currentPage--;
            updateUnreadNotifications(currentPage);
        });

        const readAllButton = document.createElement('button');
        readAllButton.textContent = 'Delete All';
        readAllButton.addEventListener('click', async function () {
            await fetch('/notifications/readAll', {
                method: 'POST'
            });
            await updateUnreadCount();
            updateUnreadNotifications();
            readAllButton.disabled = true;
        });

        if (currentPage >= totalPages - 1) {
            nextPageButton.disabled = true;
        } else {
            nextPageButton.disabled = false;
        }

        if (currentPage <= 0) {
            prevPageButton.disabled = true;
        } else {
            prevPageButton.disabled = false;
        }
        dropdownMenu.appendChild(prevPageButton);
        dropdownMenu.appendChild(nextPageButton);
        dropdownMenu.appendChild(readAllButton);
    }

    async function markAsRead(notificationId) {
        await fetch('/notifications/read', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ notificationId: notificationId })
        });
        await updateUnreadCount();
    }

});