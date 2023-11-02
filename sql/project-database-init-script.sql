/*
 * Group 5 Database
 */
DROP TABLE IF EXISTS notifications;

DROP TABLE IF EXISTS subscriptions_list;

DROP TABLE IF EXISTS users_like;

DROP TABLE IF EXISTS images;

DROP TABLE IF EXISTS admins;

DROP TABLE IF EXISTS comments;

DROP TABLE IF EXISTS articles;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(12) NOT NULL,
    hashed_password VARCHAR NOT NULL,
    birthday DATE NOT NULL,
    first_name VARCHAR(18) NOT NULL,
    last_name VARCHAR(18) NOT NULL,
    description VARCHAR(100) NOT NULL,
    avatar VARCHAR(255) NOT NULL,
    auth_token VARCHAR(255)
);

CREATE TABLE articles (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(50) NOT NULL,
    create_date DATE NOT NULL,
    content VARCHAR NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE comments (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    content VARCHAR NOT NULL,
    create_date DATE NOT NULL,
    parent_comment_id INTEGER,
    visible BOOLEAN DEFAULT true,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

CREATE TABLE admins (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE images (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    url VARCHAR NOT NULL,
    article_id INTEGER NOT NULL,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

CREATE TABLE users_like (
    user_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, article_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

CREATE TABLE subscriptions_list (
    user_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, author_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    content VARCHAR NOT NULL,
    article_id INTEGER,
    read BOOLEAN DEFAULT false,
    created_at DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

INSERT INTO
    users (
        username,
        hashed_password,
        birthday,
        first_name,
        last_name,
        description,
        avatar,
        auth_token
    )
VALUES
    (
        'qizheng',
        '$2a$10$LY0E1qWKB4Hqz/VtrCyxGOukYYqkkR3RxdlIil4dXNlYdXinlmJk2',
        '2000-04-10',
        'Qizheng',
        'Hu',
        'Our Conquest Is The Sea of Stars.',
        '/uploadedAvatar/thumbnails/Dragonite.png',
        'token1'
    ),
    (
        'jiawei',
        '$2a$10$8pIkaXlL5Ou8eGfV5LWaXOL3cG5PL5ZnLodvDjW9mR5VG3N9iJ8W6',
        '2000-10-15',
        'Jiawei',
        'He',
        'Cat lover, Simba''s best friend.',
        '/uploadedAvatar/thumbnails/pikachu.png',
        'token2'
    ),
    (
        'xuan',
        '$2a$10$yiyRMOv.9lxQYNenbfbqN.7XA7XDmPcdyavM4ik.I/riLpJnlCHCS',
        '2001-03-29',
        'Xuan',
        'Luo',
        'Tech geek, coding my way through life.',
        '/uploadedAvatar/thumbnails/charmander.png',
        'token3'
    ),
    (
        'yutian',
        '$2a$10$7b/ibnsv1jCQyhlbi0tAcONnOl7DEnz6aeAWuYGjioTsf2oDENWVq',
        '2002-09-04',
        'Yutian',
        'Sun',
        'Adventure seeker, always exploring.',
        '/uploadedAvatar/thumbnails/eevee.png',
        'token4'
    ),
    (
        'melissa',
        '$2a$10$XkLWICAU7xmrHHXyu/7P/OBZPQiwcGPJpIkGgVASay5NRMUvIRnly',
        '2003-07-07',
        'Melissa',
        'Wang',
        'Coffee enthusiast, coding ninja.',
        '/uploadedAvatar/thumbnails/eevee.png',
        'token5'
    ),
    (
        'tyne',
        '$2a$10$Br.7GJV7MiREeIF0HE.xdudeRc/GhxARPpiEbjEDJArN5j7uqKOIS',
        '2000-01-01',
        'Tyne',
        'Crow',
        'I teach COMPSCI719. I love my dog Nugget.',
        '/uploadedAvatar/thumbnails/mew.png',
        'token6'
    ),
    (
        'vita',
        '$2a$10$qQGYkZCpvWqEg9lF/NgguuYZ6Wo7wmbRKzWlmCtxIQQLRCAfc5JjW',
        '2000-01-02',
        'Vita',
        'Tsai',
        'I teach COMPSCI718. I enjoy cooking and coding.',
        '/uploadedAvatar/thumbnails/mew.png',
        'token7'
    ),
    (
        'tester',
        '$2a$10$c0mKzFRkEn3hAqRngwqki.tI77Lm74Adtzs3YTtQWvSjVOORQGF1q',
        '2000-02-29',
        'Test',
        'Test',
        'I''m a professional tester. Trust me. ',
        '/uploadedAvatar/thumbnails/Dragonite.png',
        'token8'
    );

INSERT INTO
    articles (title, create_date, content, user_id)
VALUES
    (
        'The Intriguing Journey of Flutter Widgets',
        '2023-05-31T21:40:06.768Z',
        'Article 1 Lorem ipsum dolor sit amet,consectetur adipiscing elit. Vivamus non quam nisi. Ut nec sapien posuere, dapibus dui ac, sagittis elit. Integer faucibus, tortor nec efficitur pellentesque, lacus sapien eleifend ex, eu porttitor nulla diam eu tortor. Sed quis eros metus. Ut at lacinia dolor. Mauris lacinia eleifend eros at feugiat. Nullam suscipit enim non erat tincidunt, vel dictum sem scelerisque.Cras eleifend lectus vitae venenatis volutpat. Nulla vitae imperdiet augue. Vestibulum semper dolor id consequat porttitor. Donec arcu velit, pellentesque nec tortor a, pharetra scelerisque nisi. Nunc ac ligula augue. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed volutpat mauris a hendrerit malesuada. In hac habitasse platea dictumst. Vestibulum eget blandit sem. Mauris.',
        1
    ),
    (
        'Unveiling the Secrets of Quantum Algorithms',
        '2023-05-31T21:08:06.768Z',
        'Article 1.12 Lorem ipsum dolor sit amet,consectetur adipiscing elit. Vivamus non quam nisi. Ut nec sapien posuere, dapibus dui ac, sagittis elit. Integer faucibus, tortor nec efficitur pellentesque, lacus sapien eleifend ex, eu porttitor nulla diam eu tortor. Sed quis eros metus. Ut at lacinia dolor. Mauris lacinia eleifend eros at feugiat. Nullam suscipit enim non erat tincidunt, vel dictum sem scelerisque.Cras eleifend lectus vitae venenatis volutpat. Nulla vitae imperdiet augue. Vestibulum semper dolor id consequat porttitor. Donec arcu velit, pellentesque nec tortor a, pharetra scelerisque nisi. Nunc ac ligula augue. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed volutpat mauris a hendrerit malesuada. In hac habitasse platea dictumst. Vestibulum eget blandit sem. Mauris.',
        1
    ),
    (
        'The Art of Crafting Virtual Reality Experiences',
        '2023-05-31T11:10:11.825Z',
        'Article 1.33 Lorem ipsum dolor sit amet,consectetur adipiscing elit. Vivamus non quam nisi. Ut nec sapien posuere, dapibus dui ac, sagittis elit. Integer faucibus, tortor nec efficitur pellentesque, lacus sapien eleifend ex, eu porttitor nulla diam eu tortor. Sed quis eros metus. Ut at lacinia dolor. Mauris lacinia eleifend eros at feugiat. Nullam suscipit enim non erat tincidunt, vel dictum sem scelerisque.Cras eleifend lectus vitae venenatis volutpat. Nulla vitae imperdiet augue. Vestibulum semper dolor id consequat porttitor. Donec arcu velit, pellentesque nec tortor a, pharetra scelerisque nisi. Nunc ac ligula augue. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed volutpat mauris a hendrerit malesuada. In hac habitasse platea dictumst. Vestibulum eget blandit sem. Mauris.',
        1
    ),
    (
        'Exploring the Boundless Possibilities',
        '2023-05-31T11:20:32.825Z',
        'Article 2 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur eu faucibus enim. In metus metus, aliquet sit amet velit quis, sagittis vestibulum erat. In a augue consequat, tincidunt leo ornare, iaculis odio. Sed sollicitudin tristique velit ac pellentesque. Nam malesuada ante nec libero ullamcorper, sed interdum libero luctus. Phasellus cursus feugiat nibh, vitae semper sem bibendum vel. Phasellus ac consequat arcu, quis elementum eros. Maecenas convallis risus quam, vitae placerat lacus pellentesque non. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Curabitur venenatis tortor eget lectus porta egestas. Aliquam placerat at mi eu fringilla. Sed.',
        2
    ),
    (
        'Unraveling the Enigma of Cryptocurrency Mining',
        '2023-05-29T02:36:12.825Z',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In efficitur, metus a malesuada pellentesque, ligula ligula tincidunt est, non semper lectus elit ac elit. Suspendisse rhoncus justo nec massa euismod, eu sollicitudin tellus cursus. Nullam sollicitudin dignissim condimentum. Nunc posuere hendrerit est nec aliquam. Suspendisse tempor vulputate leo, eu gravida dolor. Donec nec leo nec erat condimentum sodales non et felis. Pellentesque egestas risus luctus arcu scelerisque, et commodo nunc laoreet. In tempus, tortor vel pretium consequat, purus ex tristique felis, nec viverra sem leo sit amet nulla. Etiam efficitur feugiat justo, ut rutrum velit posuere vitae. Class aptent taciti.',
        3
    ),
    (
        'Unlocking the Secrets of Neural Networks',
        '2023-05-26T03:30:21.825Z',
        'Article 4 Lorem ipsum dolor sit amet, consectetur adipiscing elit. In efficitur, metus a malesuada pellentesque, ligula ligula tincidunt est, non semper lectus elit ac elit. Suspendisse rhoncus justo nec massa euismod, eu sollicitudin tellus cursus. Nullam sollicitudin dignissim condimentum. Nunc posuere hendrerit est nec aliquam. Suspendisse tempor vulputate leo, eu gravida dolor. Donec nec leo nec erat condimentum sodales non et felis. Pellentesque egestas risus luctus arcu scelerisque, et commodo nunc laoreet. In tempus, tortor vel pretium consequat, purus ex tristique felis, nec viverra sem leo sit amet nulla. Etiam efficitur feugiat justo, ut rutrum velit posuere vitae. Class aptent taciti.',
        4
    ),
    (
        'The Evolution of Big Data Analytics',
        '2023-05-23T01:22:27.825Z',
        'Article 5 Lorem ipsum dolor sit amet, consectetur adipiscing elit. In efficitur, metus a malesuada pellentesque, ligula ligula tincidunt est, non semper lectus elit ac elit. Suspendisse rhoncus justo nec massa euismod, eu sollicitudin tellus cursus. Nullam sollicitudin dignissim condimentum. Nunc posuere hendrerit est nec aliquam. Suspendisse tempor vulputate leo, eu gravida dolor. Donec nec leo nec erat condimentum sodales non et felis. Pellentesque egestas risus luctus arcu scelerisque, et commodo nunc laoreet. In tempus, tortor vel pretium consequat, purus ex tristique felis, nec viverra sem leo sit amet nulla. Etiam efficitur feugiat justo, ut rutrum velit posuere vitae. Class aptent taciti.',
        5
    ),
    (
        'Exploring the Power of Machine Learning',
        '2023-05-26T09:10:31.825Z',
        'Article 5 Lorem ipsum dolor sit amet, consectetur adipiscing elit. In efficitur, metus a malesuada pellentesque, ligula ligula tincidunt est, non semper lectus elit ac elit. Suspendisse rhoncus justo nec massa euismod, eu sollicitudin tellus cursus. Nullam sollicitudin dignissim condimentum. Nunc posuere hendrerit est nec aliquam. Suspendisse tempor vulputate leo, eu gravida dolor. Donec nec leo nec erat condimentum sodales non et felis. Pellentesque egestas risus luctus arcu scelerisque, et commodo nunc laoreet. In tempus, tortor vel pretium consequat, purus ex tristique felis, nec viverra sem leo sit amet nulla. Etiam efficitur feugiat justo, ut rutrum velit posuere vitae. Class aptent taciti.',
        4
    ),
    (
        'Unlocking the Potential of Blockchain Technology',
        '2023-05-30T07:40:21.825Z',
        'Article 5 Lorem ipsum dolor sit amet, consectetur adipiscing elit. In efficitur, metus a malesuada pellentesque, ligula ligula tincidunt est, non semper lectus elit ac elit. Suspendisse rhoncus justo nec massa euismod, eu sollicitudin tellus cursus. Nullam sollicitudin dignissim condimentum. Nunc posuere hendrerit est nec aliquam. Suspendisse tempor vulputate leo, eu gravida dolor. Donec nec leo nec erat condimentum sodales non et felis. Pellentesque egestas risus luctus arcu scelerisque, et commodo nunc laoreet. In tempus, tortor vel pretium consequat, purus ex tristique felis, nec viverra sem leo sit amet nulla. Etiam efficitur feugiat justo, ut rutrum velit posuere vitae. Class aptent taciti.',
        8
    ),
    (
        'The Rise of Artificial Intelligence in Healthcare',
        '2023-05-22T14:50:11.825Z',
        'Article 5 Lorem ipsum dolor sit amet, consectetur adipiscing elit. In efficitur, metus a malesuada pellentesque, ligula ligula tincidunt est, non semper lectus elit ac elit. Suspendisse rhoncus justo nec massa euismod, eu sollicitudin tellus cursus. Nullam sollicitudin dignissim condimentum. Nunc posuere hendrerit est nec aliquam. Suspendisse tempor vulputate leo, eu gravida dolor. Donec nec leo nec erat condimentum sodales non et felis. Pellentesque egestas risus luctus arcu scelerisque, et commodo nunc laoreet. In tempus, tortor vel pretium consequat, purus ex tristique felis, nec viverra sem leo sit amet nulla. Etiam efficitur feugiat justo, ut rutrum velit posuere vitae. Class aptent taciti.',
        6
    ),
    (
        'The Impact of Cloud Computing on Business',
        '2023-05-25T12:15:41.825Z',
        'Article 5 Lorem ipsum dolor sit amet, consectetur adipiscing elit. In efficitur, metus a malesuada pellentesque, ligula ligula tincidunt est, non semper lectus elit ac elit. Suspendisse rhoncus justo nec massa euismod, eu sollicitudin tellus cursus. Nullam sollicitudin dignissim condimentum. Nunc posuere hendrerit est nec aliquam. Suspendisse tempor vulputate leo, eu gravida dolor. Donec nec leo nec erat condimentum sodales non et felis. Pellentesque egestas risus luctus arcu scelerisque, et commodo nunc laoreet. In tempus, tortor vel pretium consequat, purus ex tristique felis, nec viverra sem leo sit amet nulla. Etiam efficitur feugiat justo, ut rutrum velit posuere vitae. Class aptent taciti.',
        7
    ),
    (
        'The Future of Internet of Things',
        '2023-05-27T08:30:12.825Z',
        'Article 5 Lorem ipsum dolor sit amet, consectetur adipiscing elit. In efficitur, metus a malesuada pellentesque, ligula ligula tincidunt est, non semper lectus elit ac elit. Suspendisse rhoncus justo nec massa euismod, eu sollicitudin tellus cursus. Nullam sollicitudin dignissim condimentum. Nunc posuere hendrerit est nec aliquam. Suspendisse tempor vulputate leo, eu gravida dolor. Donec nec leo nec erat condimentum sodales non et felis. Pellentesque egestas risus luctus arcu scelerisque, et commodo nunc laoreet. In tempus, tortor vel pretium consequat, purus ex tristique felis, nec viverra sem leo sit amet nulla. Etiam efficitur feugiat justo, ut rutrum velit posuere vitae. Class aptent taciti.',
        3
    ),
    (
        'Data Privacy and Security in the Digital Age',
        '2023-05-29T16:55:21.825Z',
        'Article 5 Lorem ipsum dolor sit amet, consectetur adipiscing elit. In efficitur, metus a malesuada pellentesque, ligula ligula tincidunt est, non semper lectus elit ac elit. Suspendisse rhoncus justo nec massa euismod, eu sollicitudin tellus cursus. Nullam sollicitudin dignissim condimentum. Nunc posuere hendrerit est nec aliquam. Suspendisse tempor vulputate leo, eu gravida dolor. Donec nec leo nec erat condimentum sodales non et felis. Pellentesque egestas risus luctus arcu scelerisque, et commodo nunc laoreet. In tempus, tortor vel pretium consequat, purus ex tristique felis, nec viverra sem leo sit amet nulla. Etiam efficitur feugiat justo, ut rutrum velit posuere vitae. Class aptent taciti.',
        5
    ),
    (
        'Revolutionizing E-commerce with Chatbots',
        '2023-05-31T10:20:51.825Z',
        'Article 9 Lorem ipsum dolor sit amet, consectetur adipiscing elit. In efficitur, metus a malesuada pellentesque, ligula ligula tincidunt est, non semper lectus elit ac elit. Suspendisse rhoncus justo nec massa euismod, eu sollicitudin tellus cursus. Nullam sollicitudin dignissim condimentum. Nunc posuere hendrerit est nec aliquam. Suspendisse tempor vulputate leo, eu gravida dolor. Donec nec leo nec erat condimentum sodales non et felis. Pellentesque egestas risus luctus arcu scelerisque, et commodo nunc laoreet. In tempus, tortor vel pretium consequat, purus ex tristique felis, nec viverra sem leo sit amet nulla. Etiam efficitur feugiat justo, ut rutrum velit posuere vitae. Class aptent taciti.',
        6
    ),
    (
        'The Future of Robotics and Automation',
        '2023-05-24T06:35:16.825Z',
        'Article 9 Lorem ipsum dolor sit amet, consectetur adipiscing elit. In efficitur, metus a malesuada pellentesque, ligula ligula tincidunt est, non semper lectus elit ac elit. Suspendisse rhoncus justo nec massa euismod, eu sollicitudin tellus cursus. Nullam sollicitudin dignissim condimentum. Nunc posuere hendrerit est nec aliquam. Suspendisse tempor vulputate leo, eu gravida dolor. Donec nec leo nec erat condimentum sodales non et felis. Pellentesque egestas risus luctus arcu scelerisque, et commodo nunc laoreet. In tempus, tortor vel pretium consequat, purus ex tristique felis, nec viverra sem leo sit amet nulla. Etiam efficitur feugiat justo, ut rutrum velit posuere vitae. Class aptent taciti.',
        7
    ),
    (
        'Harnessing the Power of Natural Language Processing',
        '2023-05-28T15:45:32.825Z',
        'Article 10 Lorem ipsum dolor sit amet, consectetur adipiscing elit. In efficitur, metus a malesuada pellentesque, ligula ligula tincidunt est, non semper lectus elit ac elit. Suspendisse rhoncus justo nec massa euismod, eu sollicitudin tellus cursus. Nullam sollicitudin dignissim condimentum. Nunc posuere hendrerit est nec aliquam. Suspendisse tempor vulputate leo, eu gravida dolor. Donec nec leo nec erat condimentum sodales non et felis. Pellentesque egestas risus luctus arcu scelerisque, et commodo nunc laoreet. In tempus, tortor vel pretium consequat, purus ex tristique felis, nec viverra sem leo sit amet nulla. Etiam efficitur feugiat justo, ut rutrum velit posuere vitae. Class aptent taciti.',
        3
    );

INSERT INTO
    comments (
        user_id,
        article_id,
        content,
        create_date,
        parent_comment_id,
        visible
    )
VALUES
    (
        1,
        1,
        'Great article!',
        '2023-05-29T09:17:53.421Z',
        NULL,
        true
    ),
    (
        2,
        1,
        'I couldn''t agree more!',
        '2023-05-29T15:42:10.673Z',
        NULL,
        true
    ),
    (
        3,
        2,
        'Well-written and informative.',
        '2023-05-30T07:55:36.112Z',
        NULL,
        true
    ),
    (
        2,
        1,
        'This really helped me, thanks!',
        '2023-05-30T12:20:41.519Z',
        NULL,
        true
    ),
    (
        3,
        1,
        'I have a different perspective on this.',
        '2023-05-30T14:38:55.927Z',
        NULL,
        true
    ),
    (
        4,
        2,
        'I''m impressed by the depth of the content.',
        '2023-05-30T16:49:02.308Z',
        NULL,
        true
    ),
    (
        2,
        1,
        'Can''t wait to try these tips!',
        '2023-05-30T19:05:17.764Z',
        NULL,
        true
    ),
    (
        3,
        1,
        'I found this to be quite inspiring.',
        '2023-05-30T21:30:59.912Z',
        NULL,
        true
    ),
    (
        4,
        2,
        'Not sure I agree with everything, but interesting read.',
        '2023-05-30T23:48:24.573Z',
        NULL,
        true
    ),
    (
        5,
        1,
        'This article raises important questions.',
        '2023-05-30T01:59:42.701Z',
        NULL,
        true
    ),
    (
        4,
        6,
        'Interesting read.',
        '2023-05-22T14:35:01.123Z',
        NULL,
        true
    ),
    (
        7,
        9,
        'Well written!',
        '2023-05-28T18:41:19.765Z',
        NULL,
        true
    ),
    (
        6,
        4,
        'Great insights.',
        '2023-05-26T07:12:09.234Z',
        NULL,
        true
    ),
    (
        5,
        11,
        'Well done!',
        '2023-05-30T11:58:54.876Z',
        NULL,
        true
    ),
    (
        8,
        14,
        'Impressive article.',
        '2023-05-23T09:20:35.432Z',
        NULL,
        true
    ),
    (
        3,
        3,
        'Great job!',
        '2023-05-24T15:05:47.111Z',
        NULL,
        true
    ),
    (
        4,
        12,
        'Informative content.',
        '2023-05-31T08:37:12.901Z',
        NULL,
        true
    ),
    (
        5,
        7,
        'Enjoyed reading it.',
        '2023-05-27T12:15:29.543Z',
        NULL,
        true
    ),
    (
        6,
        5,
        'Well articulated.',
        '2023-05-25T17:49:38.322Z',
        NULL,
        true
    ),
    (
        7,
        8,
        'Insightful article.',
        '2023-05-29T14:02:05.654Z',
        NULL,
        true
    );

INSERT INTO
    admins (user_id)
VALUES
    (1),
    (2),
    (3),
    (4),
    (5);

INSERT INTO
    images (url, article_id)
VALUES
    ('/article-image/p2.jpeg', 3),
    ('/article-image/p1.png', 5),
    ('/article-image/p11.jpg', 1),
    ('/article-image/p4.jpg', 2),
    ('/article-image/p55.jpg', 4);

INSERT INTO
    users_like (user_id, article_id)
VALUES
    (8, 1),
    (7, 1),
    (6, 1),
    (5, 1),
    (4, 1),
    (3, 1),
    (2, 1),
    (1, 1),
    (5, 2),
    (4, 2),
    (3, 2),
    (1, 2),
    (5, 3),
    (4, 3),
    (2, 3),
    (1, 3),
    (5, 4),
    (3, 4),
    (2, 4),
    (1, 4),
    (4, 5),
    (3, 5),
    (2, 5),
    (1, 5),
    (8, 6),
    (7, 6),
    (6, 6),
    (5, 6),
    (3, 6),
    (2, 6),
    (1, 6),
    (8, 7),
    (7, 7),
    (6, 7),
    (5, 7),
    (4, 7),
    (3, 7),
    (1, 7),
    (8, 8),
    (7, 8),
    (6, 8),
    (5, 8),
    (4, 8),
    (3, 8),
    (2, 8),
    (8, 9),
    (7, 9),
    (6, 9),
    (5, 9),
    (4, 9),
    (2, 9),
    (1, 9),
    (8, 10),
    (7, 10),
    (6, 10),
    (5, 10),
    (4, 10),
    (3, 10),
    (1, 10),
    (8, 11),
    (7, 11),
    (6, 11),
    (4, 11),
    (3, 11),
    (2, 11),
    (1, 11),
    (8, 12),
    (7, 12),
    (6, 12),
    (5, 12),
    (4, 12),
    (3, 12),
    (2, 12),
    (8, 13),
    (7, 13),
    (6, 13),
    (5, 13),
    (4, 13),
    (3, 13),
    (1, 13),
    (8, 14),
    (7, 14),
    (6, 14),
    (5, 14),
    (4, 14),
    (2, 14),
    (1, 14),
    (8, 15),
    (7, 15),
    (6, 15),
    (5, 15),
    (4, 15),
    (3, 15),
    (2, 15),
    (8, 16),
    (7, 16),
    (6, 16),
    (5, 16),
    (4, 16),
    (3, 16),
    (2, 16),
    (1, 16);

INSERT INTO
    subscriptions_list (user_id, author_id)
VALUES
    (1, 3),
    (2, 3),
    (3, 2),
    (4, 2),
    (5, 3),
    (6, 5),
    (7, 4),
    (8, 5),
    (1, 4),
    (2, 4),
    (3, 5),
    (4, 5),
    (5, 2),
    (6, 3),
    (7, 1),
    (8, 3),
    (1, 6),
    (2, 7),
    (3, 7),
    (4, 6),
    (5, 4),
    (6, 1),
    (5, 1),
    (4, 1),
    (3, 1),
    (2, 1),
    (7, 2),
    (8, 4),
    (1, 8),
    (2, 6),
    (3, 8),
    (4, 7),
    (5, 6),
    (6, 2),
    (7, 5),
    (8, 7);