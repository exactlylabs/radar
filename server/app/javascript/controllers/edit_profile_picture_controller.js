import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = [
    "avatarPreview",
    "plusIcon",
    "dropzone",
    "userAvatarInput",
    "deleteButton",
  ];

  connect() {
    this.initialData = {
      originalImageSrc: document.querySelector("#edit-profile-picture-avatar")
        .src,
    };
  }

  handleFileZoneClicked(e) {
    this.userAvatarInputTarget.click();
  }

  handleFileUpload(e) {
    const avatar = this.userAvatarInputTarget.files[0];
    const url = URL.createObjectURL(avatar);
    this.avatarPreviewTarget.src = url;
    this.avatarPreviewTarget.style.display = "block";
    this.plusIconTarget.style.display = "none";
    this.deleteButtonTarget.style.display = "block";
  }

  deleteCurrentPicture() {
    // "Soft" deleting the image, not actually setting the
    // src attribute for the <img> to {null|undefined} as it will result in a
    // GET request to something like /users/{null|undefined} => 404
    // If user decides to save, the logic for removing the avatar
    // will be done correctly though.
    this.avatarPreviewTarget.style.display = "none";
    this.plusIconTarget.style.display = "block";
    this.deleteButtonTarget.style.display = "none";
    // Need to explicitly clear value in order for the input
    // to be triggered if a new image wants to be added after
    // deleting the current one.
    this.userAvatarInputTarget.value = "";
  }

  clearUnsaved() {
    this.avatarPreviewTarget.src = this.initialData.originalImageSrc;
    if (this.initialData.originalImageSrc) {
      this.avatarPreviewTarget.style.display = "block";
      this.plusIconTarget.style.display = "none";
      this.deleteButtonTarget.style.display = "block";
    } else {
      this.avatarPreviewTarget.style.display = "none";
      this.plusIconTarget.style.display = "block";
      this.deleteButtonTarget.style.display = "none";
    }
  }
}
