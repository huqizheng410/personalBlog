window.addEventListener("load", function () {
    // Get all components from handlebars
    const subscribeBTN = document.querySelector("#subscribe-button");
    const avatarDisplay = document.querySelector("#avatar");
    const username = document.querySelector("#username");
    const firstname = document.querySelector("#firstname");
    const lastname = document.querySelector("#lastname");
    const birthday = document.querySelector("#birthday");
    const description = document.querySelector("#description");
    const saveBTN = document.querySelector("#save");
    const editBTN = document.querySelector("#edit-button");
    const passwordBTN = document.querySelector("#password");
    const deleteBTN = document.querySelector("#delete");
    let currentAvatarSrc = document.querySelector("#currentAvatarSrc");

    // Added function so that if the description exceed the mamimum it will not allow to enter more. 
    window.limitInput = function (element, maxChars) {
        if (element.value.length > maxChars) {
            element.value = element.value.substr(0, maxChars);
        }
    }

    // If edit button is not undefined, meaning the current user are view their own page
    if (editBTN != undefined) {
        const originalName = username.value;
        const inputs = [username, firstname, lastname, birthday, description];
        currentAvatarSrc = currentAvatarSrc.getAttribute("src");

        editBTN.addEventListener('click', async function () {
            document.querySelector('.table-container').innerHTML = '';

            let today = new Date();
            let dd = String(today.getDate()).padStart(2, '0');
            let mm = String(today.getMonth() + 1).padStart(2, '0');
            let yyyy = today.getFullYear();
            today = yyyy + '-' + mm + '-' + dd;
            document.querySelector("#birthday").setAttribute("max", today);

            // Set restriction to those input to make sure the user didn't put above word limit.
            firstname.setAttribute('maxlength', '18');
            firstname.setAttribute('pattern', '[A-Za-z0-9]*');
            lastname.setAttribute('maxlength', '18');
            lastname.setAttribute('pattern', '[A-Za-z0-9]*');
            description.setAttribute('oninput', 'limitInput(this, 100)');

            for (const input of inputs) {
                removeAttribute(input);
            }

            this.style.display = "none";
            passwordBTN.style.display = 'none';
            saveBTN.style.display = 'block';
            deleteBTN.style.display = 'none';

            const response = await fetch(`/getAllAvatars`);
            let avatars = await response.json();

            avatarDisplay.innerHTML = '';

            currentAvatarSrc = currentAvatarSrc.substring(currentAvatarSrc.lastIndexOf("/") + 1);
            avatars = avatars.filter(avatar => avatar !== currentAvatarSrc);

            avatarDisplay.innerHTML += `
            <img src="/uploadedAvatar/thumbnails/${currentAvatarSrc}" width="30">
            <input type="radio" name="avatars" id="/uploadedAvatar/thumbnails/${currentAvatarSrc}" checked>
            `;

            for (const avatar of avatars) {
                avatarDisplay.innerHTML += generateAvatarHTML(avatar);
            }

            if (!username.readOnly) {
                username.addEventListener("input", async function () {
                    const currentUsername = username.value;
                    const isValidUsername = /^[A-Za-z0-9]+$/.test(currentUsername);

                    if (!isValidUsername || currentUsername.length > 12) {
                        usernameCheck.innerHTML = "Invalid characters in username. Please use only letters and numbers, and max number of characters is 12";
                        saveBTN.disabled = true;
                        return;
                    }

                    if (currentUsername === originalName) {
                        usernameCheck.innerHTML = "Your current username is identical to your previous username";
                        saveBTN.disabled = true;
                        return;
                    }

                    const usernameExist = await checkNameExistFromServer(currentUsername);

                    usernameCheck.innerHTML = usernameExist ? "Oh no, it looks like someone has already registered this username!" : "";
                    saveBTN.disabled = usernameExist;
                });
            }

        });

        function generateAvatarHTML(avatar) {
            return `
            <img src="/uploadedAvatar/thumbnails/${avatar}" width="30px">
            <input type="radio" name="avatars" id="/uploadedAvatar/thumbnails/${avatar}">
            `;
        }

        async function checkNameExistFromServer(username) {
            const requestUrl = `/newAccount/username/${username}`;
            let response = await fetch(requestUrl);
            let statusCode = response.status;
            return statusCode == 204 ? false : true;
        }

        function removeAttribute(attribute) {
            attribute.removeAttribute('readonly');
        }

        // If click save button, retrieve all user input and send to server side to modify user information
        saveBTN.addEventListener("click", async function () {
            const checkedRadioButton = document.querySelector('input[name="avatars"]:checked');
            const checkedAvatar = checkedRadioButton.id;
            const updatedUsername = username.value;
            const updatedFirstName = firstname.value;
            const updatedLastName = lastname.value;
            const updatedBirthday = birthday.value;
            const updatedDescription = description.value;
            const updatedAvatar = checkedAvatar;

            const inputs = [username, firstname, lastname];

            const data = {
                originalName: originalName,
                username: updatedUsername,
                firstName: updatedFirstName,
                lastName: updatedLastName,
                birthday: updatedBirthday,
                description: updatedDescription,
                avatar: updatedAvatar
            };

            if (checkFormValidity()) {
                firstname.removeAttribute('maxlength');
                firstname.removeAttribute('pattern');

                lastname.removeAttribute('maxlength');
                lastname.removeAttribute('pattern');

                description.removeAttribute('oninput');

                fetch('/updateUser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                window.location.href = `/userdetail/${updatedUsername}`;
            };


            // Check if all input is validity before enable the submit button. 
            function checkFormValidity() {
                let valid = true;
                for (const input of inputs) {
                    input.addEventListener("input", function () {
                        document.querySelector(`#${input.name}Info`).style.display = 'none';
                    });

                    if (input.value == '') {
                        document.querySelector(`#${input.name}Info`).style.display = 'block';
                        document.querySelector(`.container`).scrollIntoView({ behavior: 'smooth' });
                        valid = false;
                    } else {
                        document.querySelector(`#${input.name}Info`).style.display = 'none';
                    }
                }
                return valid;
            }

        });

        passwordBTN.addEventListener("click", () => window.location.href = "/changePassword");
        deleteBTN.addEventListener("click", () => window.location.href = "/deleteAccount");

    } else {
        // Else meaning the user is viewing another user's details
        subscribeBTN.addEventListener("click", async function () {

            const currentState = this.dataset.state;
            const authorId = this.dataset.authorId;
            const response = await fetch(`/subscribe/${authorId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ state: currentState })
            });

            if (response.ok) {
                if (currentState === 'subscribed') {
                    this.dataset.state = 'not-subscribed';
                    this.textContent = 'Subscribe';
                } else {
                    this.dataset.state = 'subscribed';
                    this.textContent = 'Subscribed';
                }
            } else {
                window.location.href = "/login";
            }
        });
    }
});
