window.addEventListener("load", function () {
  // Get all components from handlebars
  const usernameInput = document.querySelector("#username");
  const usernameMessage = document.querySelector("#usernameMessage");
  const avatarOptions = document.querySelectorAll('.avatar-option input');
  const avatarMessage = document.querySelector("#avatarMessage");
  const passwordInput = document.querySelector("#password");
  const reenteredPasswordInput = document.querySelector("#reenteredpassword");
  const passwordmatch = document.querySelector("#passwordmatch");
  const firstNameInput = document.querySelector("#firstname");
  const lastNameInput = document.querySelector("#lastname");
  const birthdayInput = document.querySelector("#birthday");
  const descriptionInput = document.querySelector("#description");
  const submitButton = document.querySelector(".signup-btn");

  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0');
  let yyyy = today.getFullYear();
  today = yyyy + '-' + mm + '-' + dd;
  birthdayInput.setAttribute("max", today);

  const inputs = [usernameInput, passwordInput, reenteredPasswordInput, firstNameInput, lastNameInput];

  for (const input of inputs) {
    input.addEventListener("input", function () {
      document.querySelector(`#${input.name}Info`).style.display = 'none';
    });
  };

  // Check if the username exists and provide appropriate error message when it is left blank / exist.
  usernameInput.addEventListener("input", async function () {
    const username = usernameInput.value;
    if (username) {
      const usernameExist = await checkNameExistFromSever(username);
      usernameMessage.innerText = usernameExist ? "Oh no, it looks like someone has already registered this username!" : "";
    };
  });

  // Check the name is exist from database.
  async function checkNameExistFromSever(username) {
    const requestUrl = `/newAccount/username/${username}`;
    let response = await fetch(requestUrl);
    let statusCode = response.status;
    return statusCode == 204 ? false : true;
  }

  // If the user has already filled in the "Re-enter Password" input but modifies the "Password" input, the system should ensure that the button is disabled.
  passwordInput.addEventListener("input", function () {
    checkPasswordValidity();
    if (reenteredPasswordInput.value !== "" && passwordmatch.innerHTML == '') {
      checkPasswordMatch();
    }
  });

  // Check whether two password is matched.
  reenteredPasswordInput.addEventListener("input", function () {
    checkPasswordMatch();
    if (passwordmatch.innerHTML == '') {
      checkPasswordValidity();
    }
  });

  // Check the password should be at least six characters and at least one letter and one number
  function checkPasswordValidity() {
    const passwordValue = passwordInput.value;
    if (passwordValue.length < 6) {
      passwordmatch.innerHTML = "You should enter at least six characters";
    } else if (!(/\d/.test(passwordValue) && /[a-zA-Z]/.test(passwordValue))) {
      passwordmatch.innerHTML = "you need to enter at least one letter and one number";
    } else {
      passwordmatch.innerHTML = "";
    }
  }

  // Check whether the password is matched.
  function checkPasswordMatch() {
    const passwordValue = passwordInput.value;
    const reenteredPasswordValue = reenteredPasswordInput.value;
    if (passwordValue && reenteredPasswordValue) {
      const isPasswordMatch = passwordValue === reenteredPasswordValue;
      passwordmatch.innerHTML = isPasswordMatch ? "" : "passwords do not match!";
    } else {
      passwordmatch.innerHTML = "passwords do not match! Please enter your password";
    }
  }

  // If the user didn't choose any avatar, it will scroll into the top to ask user to choose one. 
  submitButton.addEventListener('click', function (e) {
    if (!checkFormValidity() || !checkFormError()) {
      e.preventDefault();
    }
    
    let isAvatarChosen = Array.from(avatarOptions).some(radio => radio.checked);
    if (!isAvatarChosen) {
      e.preventDefault();
      avatarMessage.style.display = 'block';
      document.querySelector('.username').scrollIntoView({ behavior: 'smooth' });
    } else {
      avatarMessage.style.display = 'none';
    }
  });

  // Check if all input is validity before enable the submit button. 
  function checkFormValidity() {
    let valid = true;
    for (const input of inputs) {
      if(input.value == ''){
        document.querySelector(`#${input.name}Info`).style.display = 'block';
        document.querySelector(`.container`).scrollIntoView({ behavior: 'smooth' });
        valid = false;
      } else {
        document.querySelector(`#${input.name}Info`).style.display = 'none';
      }
    }
    return valid;
  }

  function checkFormError() {
    return !(usernameMessage.innerText != '' || passwordmatch.innerHTML != '');
  }
  
  // To ensure the description is not exceed the limit
  window.limitInput = function (element, maxChars) {
    let excessLimit = document.getElementById("charLimitWarning");
    if (element.value.length > maxChars) {
      element.value = element.value.substr(0, maxChars);
      excessLimit.style.display = "block";
    } else {
      excessLimit.style.display = "none";
    }
  }

  // To avoid paste a large amount of text directly into the text area.
  descriptionInput.addEventListener("paste", function (e) {
    let paste = (e.clipboardData || window.clipboardData).getData('text');
    if (paste.length > maxChars) {
      e.preventDefault();
      alert('The description is too long!');
    }
  });
})