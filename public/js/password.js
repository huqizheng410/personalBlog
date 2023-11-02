window.addEventListener("load", function () {
    const changePasswordForm = document.querySelector('.changePassword-form');
    // If changePasswordForm is not null, meaning the user try to change to password
    if (changePasswordForm != null) {
        // Get all components from handlebars and disable the button
        const changePasswordBtn = document.querySelector('.changePassword-btn');
        const oldPassword = document.querySelector('#oldPassword');
        const newPassword = document.querySelector('#newPassword');
        const confirmNewPassword = document.querySelector('#confirmNewPassword');
        const passwordmatch = document.querySelector('#passwordmatch');
        changePasswordBtn.disabled = true;

        newPassword.addEventListener("input", function () {
            const isValidPassword = checkPasswordValidity();
            checkPasswordMatch(isValidPassword);
        });

        confirmNewPassword.addEventListener("blur", function () {
            const isValidPassword = checkPasswordValidity();
            checkPasswordMatch(isValidPassword);
        });

        // Before submit the form, check whether the old password is empty and valid password
        changePasswordBtn.addEventListener("click", function (event) {
            if (oldPassword.value === "") {
                passwordmatch.innerHTML = "You must enter your old password";
                event.preventDefault();
            } else if (!checkPasswordValidity()) {
                event.preventDefault();
            }
        });

        function checkPasswordMatch(isValidPassword) {
            if (newPassword.value !== confirmNewPassword.value) {
                passwordmatch.innerHTML = "Passwords do not match!";
                changePasswordBtn.disabled = true;
            } else if (!isValidPassword) {
                changePasswordBtn.disabled = true;
            } else {
                passwordmatch.innerHTML = "";
                changePasswordBtn.disabled = false;
            }
        }

        function checkPasswordValidity() {
            const passwordValue = newPassword.value;
            if (passwordValue.length < 6) {
                passwordmatch.innerHTML = "You should enter at least six characters for your new password";
                return false;
            } else if (!(/\d/.test(passwordValue) && /[a-zA-Z]/.test(passwordValue))) {
                passwordmatch.innerHTML = "You need to enter at least one letter and one number for your new password";
                return false;
            }
            passwordmatch.innerHTML = "";
            return true;
        }
    }
});

