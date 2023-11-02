window.addEventListener("load", function () {
  const articleContentElement = document.querySelector(".article-content");
  const commentsSectionElement = document.querySelector(".comments-section");
  const editButton = document.querySelector("#editButton");
  const likeButton = document.querySelector("#likeButton");
  const likesCount = document.querySelector("#likesCount");
  const articleId = document.querySelector("#articleId");
  const userId = document.querySelector("#userId");
  const authorId = document.querySelector("#authorId");
  let likeCountvalue = parseInt(likesCount.innerHTML);

  // comment section elements
  const addNewCommentButton = document.querySelector("#submitComment");
  const newCommentContentElement = document.querySelector("#addedComment");
  const toggleCommentsButton = document.querySelector("#toggleComments");

  // if article content exists
  if (articleContentElement) {
    // load comments data
    const articleIdValue = articleId.value;
    loadComments(articleIdValue);

    // new comment button click event
    addNewCommentButton.addEventListener("click", async function () {
      // check if user is logged in
      if (checkLoginStatus()) {
        addNewCommentButton.disabled = true;
        const articleIdValue = articleId.value;
        const comment = newCommentContentElement.value.trim();
        const userIdValue = userId.value;
        // Remove previous error message
        commentErrorMessage.innerText = "";
        // check comment is not empty
        if (comment === "") {
          // Create and append error message element
          commentErrorMessage.innerText = "Please enter a comment content!";
        } else {
          await addNewComment(articleIdValue, comment, userIdValue);
          // reload comments
          loadComments(articleIdValue);
        }
        newCommentContentElement.value = "";
        addNewCommentButton.disabled = false;
      }
    });

    // reply & delete button click event
    commentsSectionElement.addEventListener("click", function (event) {
      const target = event.target;
      if (target.classList.contains("reply-button")) {
        handleReply(target);
      } else if (target.classList.contains("delete-button")) {
        handleDelete(target);
      }
    });

    // toggle comments button click event to hide/show comments
    toggleCommentsButton.addEventListener("click", function () {
      if (commentsSectionElement.style.display === "none") {
        commentsSectionElement.style.display = "block";
        toggleCommentsButton.textContent = "Hide Comments";
      } else {
        commentsSectionElement.style.display = "none";
        toggleCommentsButton.textContent = "Show Comments";
      }
    });

    // like button click event
    likeButton.addEventListener("click", async function () {
      if (checkLoginStatus()) {
        likeButton.disabled = true;
        const articleIdValue = articleId.value;
        const userIdValue = userId.value;
        if (likeButton.value === "true") {
          // remove like
          await removeLike(articleIdValue, userIdValue);
          likeButton.classList.remove("liked-button");
          likeButton.value = "false";
          likeButton.innerHTML = "Like &#x2764; " + likeCountvalue;
        } else {
          // add new like
          await addLike(articleIdValue, userIdValue);
          likeButton.classList.add("liked-button");
          likeButton.value = "true";
          likeButton.innerHTML = "Liked &#x2764; " + likeCountvalue;
        }
        likesCount.innerHTML = likeCountvalue;
        likeButton.disabled = false;
      }
    });

    // edit article button click event
    if (editButton) {
      editButton.addEventListener("click", function () {
        const articleIdValue = articleId.value;
        window.location.href = `/edit_create_article?id=${articleIdValue}`;
      });
    }
  }

  // request API to add like and update like count
  async function addLike(articleId, userId) {
    let response = await fetch("/article/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        articleId: articleId,
        userId: userId,
      }),
    });
    let data = await response.json();
    likeCountvalue = data.likeCount;
  }
  // request API to remove like and update like count
  async function removeLike(articleId, userId) {
    let response = await fetch("/article/likes", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        articleId: articleId,
        userId: userId,
      }),
    });
    let data = await response.json();
    likeCountvalue = data.likeCount;
  }

  // generate comments html
  function generateCommentsHtml(comments) {
    let html = "";
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      html += '<div class="comment">';
      html += '<div class="comment-header">';
      html += `<a href="/userdetail/${comment.username}"><img class="comment-avatar" src=${comment.avatar} alt="User Avatar"></a>`;
      html += `<a href="/userdetail/${comment.username}"><span class="comment-username">${comment.username}</span></a>`;
      html += '<span class="comment-time">' + comment.create_date + "</span>";
      html += "</div>";
      html += '<div class="comment-content">';
      html += "<p>" + comment.content + "</p>";
      html += "</div>";
      html += '<div class="comment-actions">';
      html +=
        '<button class="reply-button" data-comment-id="' +
        comment.id +
        '">Reply</button>';
      // check if user can delete comment
      if (comment.user_id == userId.value || userId.value == authorId.value) {
        html += `<button class="delete-button" data-comment-id=${comment.id}>Delete</button>`;
      }
      html += "</div>";
      if (comment.children && comment.children.length > 0) {
        html += '<div class="child-comments">';
        html += generateCommentsHtml(comment.children);
        html += "</div>";
      }
      html += "</div>";
    }
    return html;
  }

  // check if user is logged in
  function checkLoginStatus() {
    if (userId.value === "") {
      showModal();
    } else {
      return true;
    }
  }

  // request API to load comments data
  function loadComments(articleIdValue) {
    fetch(`/comments?articleId=${articleIdValue}`)
      .then(function (response) {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("response failed");
        }
      })
      .then(function (data) {
        const commentsHtml = generateCommentsHtml(data);
        // check if comments exist wheather to show toggle comments button
        if (data.length > 0) {
          toggleCommentsButton.style.display = "block";
        } else {
          toggleCommentsButton.style.display = "none";
        }
        commentsSectionElement.innerHTML = commentsHtml;
      })
      .catch(function (error) {
        console.log("request error ", error);
      });
  }

  // request API to add new comment
  async function addNewComment(articleId, comment, userId, parentId = null) {
    let response = await fetch("/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        articleId: articleId,
        userId: userId,
        comment: comment,
        parentId: parentId,
      }),
    });
    let result = await response.json();
  }

  // request API to delete comment
  async function deleteComment(commentId) {
    let response = await fetch("/comments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commentId: commentId,
      }),
    });
    let result = await response.json();
  }

  // reply button click action
  function handleReply(replyButton) {
    if (checkLoginStatus()) {
      const parentId = replyButton.getAttribute("data-comment-id");
      const commentElement = replyButton.closest(".comment");

      // Check if reply form already exists
      const existingReplyForm = commentElement.querySelector(".reply-form");
      if (existingReplyForm) {
        existingReplyForm.remove();
      }
      // create reply form
      const replyForm = document.createElement("div");
      replyForm.className = "reply-form";
      replyForm.innerHTML = `
        <textarea class="reply-textarea" maxlength="500" placeholder="Write a reply and please limit your comment to a maximum of 300 characters."></textarea>
        <div id="commentErrorMessage"></div>
        <button class="reply-submit-button" data-comment-id="${parentId}">Submit</button>
        <button class="reply-cancel-button">Cancel</button>`;
      commentElement.appendChild(replyForm);
      // reply submit button click event
      const submitButton = replyForm.querySelector(".reply-submit-button");
      replyForm.scrollIntoView({ behavior: "smooth", block: "center" });

      submitButton.addEventListener("click", async function () {
        const textarea = replyForm.querySelector(".reply-textarea");
        const replyContent = textarea.value.trim();
        if (replyContent === "") {
          const commentErrorMessage = replyForm.querySelector(
            "#commentErrorMessage"
          );
          commentErrorMessage.innerHTML = "Please enter a reply!";
          return;
        }
        const articleIdValue = articleId.value;
        const userIdValue = userId.value;
        await addNewComment(
          articleIdValue,
          replyContent,
          userIdValue,
          parentId
        );
        loadComments(articleIdValue);
      });

      // reply cancel button click event
      const cancelButton = replyForm.querySelector(".reply-cancel-button");
      cancelButton.addEventListener("click", function () {
        replyForm.remove();
      });
    }
  }

  // delete button click action
  function handleDelete(deleteButton) {
    if (checkLoginStatus()) {
      const commentId = deleteButton.getAttribute("data-comment-id");
      const modal = document.getElementById("deleteConfirmationModal");
      const confirmDeleteButton = modal.querySelector("#confirmDeleteButton");
      const cancelDeleteButton = modal.querySelector("#cancelDeleteButton");
      confirmDeleteButton.addEventListener("click", function () {
        deleteComment(commentId).then(function () {
          const articleIdValue = articleId.value;
          loadComments(articleIdValue);
        });
        modal.style.display = "none";
      });

      cancelDeleteButton.addEventListener("click", function () {
        modal.style.display = "none";
      });
      modal.style.display = "block";
    }
  }

  // ******* prompt box *******
  let modal = document.getElementById("customModal");
  let loginButton = document.getElementById("loginButton");

  function showModal() {
    modal.style.display = "block";
  }

  loginButton.addEventListener("click", function () {
    // jump to login page
    window.location.href = "/login";
  });
});
