import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = [
    "avatarPreview",
    "plusIcon",
    "dropzone",
    "userAvatarInput",
    "deleteButton",
    "fileFormatErrorMessage"
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

  isAnImage(file) {
    return file.type.includes('image/');
  }

  handleFileUpload(e) {
    // 'Overload resolution failed' issue fix
    if(this.userAvatarInputTarget.files.length === 0) return;
    const file = this.userAvatarInputTarget.files[0];
    if(!this.isAnImage(file)) {
      this.fileFormatErrorMessageTarget.style.display = 'block';
      this.userAvatarInputTarget.value = ""; // clear input from storing file with wrong type
      return;
    } else {
      this.fileFormatErrorMessageTarget.style.display = 'none';
    }
    this.avatarPreviewTarget.src = URL.createObjectURL(file);
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

  handleFileDrop(e) {
    e.preventDefault();
    const dataTransfer = e.dataTransfer;
    const files = dataTransfer.files;
    const avatar = files[0];
    this.userAvatarInputTarget.files = files;
    const url = URL.createObjectURL(avatar);
    this.avatarPreviewTarget.src = url;
    this.avatarPreviewTarget.style.display = "block";
    this.plusIconTarget.style.display = "none";
    this.deleteButtonTarget.style.display = "block";
  }

  // Required to prevent defaults for drag-drop to work:
  // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations#specifying_drop_targets
  preventDefault(e) {
    e.preventDefault();
  }
}
