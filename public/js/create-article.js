window.addEventListener("load", function () {
  const imageInput = document.getElementById("imageFile");
  const uploadButton = document.getElementById("submitButton");
  const errorContainer = document.getElementById("errorContainer");
  const deleteButton = document.getElementById("deleteButton");
  const imagePreview = document.getElementById("imagePreview");

  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file.size > 2 * 1024 * 1024) {
      errorContainer.textContent = "Image should be smaller than 2MB";
      uploadButton.disabled = true;
    } else {
      // Show image preview
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          imagePreview.setAttribute("src", e.target.result);
          imagePreview.style.display = "block";
        };
        reader.readAsDataURL(file);
      }
      errorContainer.textContent = "";
      uploadButton.disabled = false;
    }
  });

  tinymce.init({
    selector: "textarea",
    height: 500,
    plugins: [
      "lists",
      "charmap",
      "preview",
      "searchreplace",
      "visualblocks",
      "code",
      "fullscreen",
      "insertdatetime",
      "help",
      "powerpaste",
      "wordcount",
    ],
    toolbar:
      "undo redo | blocks " +
      "bold italic underline backcolor removeformat | alignleft aligncenter " +
      "alignright alignjustify | bullist numlist outdent indent ",
    content_style:
      "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }",
    });

  deleteButton.addEventListener("click", function () {
    articleId = deleteButton.value;
    const modal = document.getElementById("deleteConfirmationModal");
    const confirmDeleteButton = modal.querySelector("#confirmDeleteButton");
    const cancelDeleteButton = modal.querySelector("#cancelDeleteButton");

    confirmDeleteButton.addEventListener("click", function () {
      location.href = `/delete_article?id=${articleId}`;
    });
    cancelDeleteButton.addEventListener("click", function () {
      modal.style.display = "none";
    });

    modal.style.display = "block";
  });
});
