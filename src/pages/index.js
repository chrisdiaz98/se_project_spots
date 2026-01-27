import "core-js/stable";
import "regenerator-runtime/runtime";

import "./index.css";

import spotsLogoUrl from "../images/spots-logo.svg";
import avatarUrl from "../images/avatar.jpg";
import editIconUrl from "../images/edit-icon.svg";
import plusIconUrl from "../images/plus-icon.svg";
import pencilLightUrl from "../images/pencil-light.svg";

import {
  enableValidation,
  settings,
  hideInputError,
  toggleButtonState,
} from "../scripts/validation.js";

import Api from "../scripts/utils/Api.js";

// ===== API =====
const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "d705a9ec-6c52-4e38-906b-8303e89bb4c8",
    "Content-Type": "application/json",
  },
});

// ===== Modal / Form Utility Functions =====
let handleEscKey;

// loading helper for buttons
function renderLoading(isLoading, button, defaultText, loadingText) {
  if (!button) return;
  if (isLoading) {
    button.textContent = loadingText;
    button.disabled = true;
  } else {
    button.textContent = defaultText;
    button.disabled = false;
  }
}

function resetForm(modal) {
  const formEl = modal.querySelector(".modal__form");
  if (!formEl) return;

  formEl.reset();

  const inputList = Array.from(formEl.querySelectorAll(".modal__input"));
  inputList.forEach((input) => hideInputError(formEl, input, settings));

  const buttonEl = formEl.querySelector(".modal__submit-btn");
  if (buttonEl) toggleButtonState(inputList, buttonEl, settings);
}

function addEscapeListener() {
  handleEscKey = (evt) => {
    if (evt.key === "Escape") {
      document
        .querySelectorAll(".modal_is-opened")
        .forEach((modal) => closeModal(modal));
      removeEscapeListener();
    }
  };
  document.addEventListener("keydown", handleEscKey);
}

function removeEscapeListener() {
  document.removeEventListener("keydown", handleEscKey);
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.add("modal_is-opened");
  addEscapeListener();
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove("modal_is-opened");
  removeEscapeListener();
}

// Overlay click to close modal
document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("mousedown", (evt) => {
    if (evt.target.classList.contains("modal")) closeModal(modal);
  });
});

// ===== Modal Elements =====
const editProfileBtn = document.querySelector(".profile__edit-btn");
const editProfileModal = document.querySelector("#edit-profile-modal");

const newPostBtn = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");

const previewModal = document.querySelector("#preview-modal");

// Delete card modal elements
const deleteCardModal = document.querySelector("#delete-card-modal");
const deleteCardForm = document.querySelector("#delete-card-form");

let deleteCancelBtn;
if (deleteCardModal) {
  deleteCancelBtn = deleteCardModal.querySelector(".modal__cancel-btn");
}

// Track which card we’re about to delete
let selectedCard = null;
let selectedCardId = null;

// Avatar modal elements
const avatarModal = document.querySelector("#avatar-modal");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");

// ===== Profile Display =====
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__avatar");

// ===== Wire static <img> assets (so webpack emits them) =====
const headerLogo = document.querySelector(".header__logo");
if (headerLogo) headerLogo.src = spotsLogoUrl;

if (profileAvatar) profileAvatar.src = avatarUrl;

const pencilIcon = document.querySelector(".profile__pencil-icon");
if (pencilIcon) pencilIcon.src = editIconUrl;

const plusIcon = document.querySelector(".profile__plus-icon");
if (plusIcon) plusIcon.src = plusIconUrl;

const avatarBtnIcon = document.querySelector(".profile__avatar-pencil-icon");
if (avatarBtnIcon) avatarBtnIcon.src = pencilLightUrl;

// ===== Edit Profile Modal wiring =====
let editProfileCloseBtn,
  editProfileForm,
  editProfileNameInput,
  editProfileDescriptionInput;

if (editProfileModal) {
  editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
  editProfileForm = editProfileModal.querySelector(".modal__form");
  editProfileNameInput = editProfileModal.querySelector("#profile-name-input");
  editProfileDescriptionInput = editProfileModal.querySelector(
    "#profile-description-input"
  );
}

if (editProfileBtn && editProfileModal) {
  editProfileBtn.addEventListener("click", () => {
    resetForm(editProfileModal);
    editProfileNameInput.value = profileNameEl.textContent;
    editProfileDescriptionInput.value = profileDescriptionEl.textContent;
    openModal(editProfileModal);
  });
}

if (editProfileCloseBtn && editProfileModal) {
  editProfileCloseBtn.addEventListener("click", () =>
    closeModal(editProfileModal)
  );
}

if (editProfileForm && editProfileModal) {
  const editProfileSubmitBtn =
    editProfileForm.querySelector(".modal__submit-btn");
  const editProfileDefaultText = editProfileSubmitBtn
    ? editProfileSubmitBtn.textContent
    : "Save";

  editProfileForm.addEventListener("submit", (evt) => {
    evt.preventDefault();

    renderLoading(
      true,
      editProfileSubmitBtn,
      editProfileDefaultText,
      "Saving..."
    );

    api
      .editUserInfo({
        name: editProfileNameInput.value,
        about: editProfileDescriptionInput.value,
      })
      .then((data) => {
        profileNameEl.textContent = data.name;
        profileDescriptionEl.textContent = data.about;
        if (profileAvatar) profileAvatar.src = data.avatar;

        closeModal(editProfileModal);
        resetForm(editProfileModal);
      })
      .catch((err) => {
        console.error("Failed to update user info:", err);
      })
      .finally(() => {
        renderLoading(
          false,
          editProfileSubmitBtn,
          editProfileDefaultText,
          "Saving..."
        );
      });
  });
}

// ===== New Post Modal wiring =====
let newPostCloseBtn, addCardFormElement, linkInput, nameInput;

if (newPostModal) {
  newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
  addCardFormElement = newPostModal.querySelector(".modal__form");
  linkInput = newPostModal.querySelector("#card-image-input");
  nameInput = newPostModal.querySelector("#card-caption-input");
}

if (newPostBtn && newPostModal) {
  newPostBtn.addEventListener("click", () => openModal(newPostModal));
}

if (newPostCloseBtn && newPostModal) {
  newPostCloseBtn.addEventListener("click", () => closeModal(newPostModal));
}

// ===== Preview modal wiring =====
let previewImage, previewCaption, previewCloseBtn;

if (previewModal) {
  previewImage = previewModal.querySelector(".modal__image");
  previewCaption = previewModal.querySelector(".modal__caption");
  previewCloseBtn = previewModal.querySelector(".modal__image-close-btn");
}

if (previewCloseBtn && previewModal) {
  previewCloseBtn.addEventListener("click", () => closeModal(previewModal));
}

// ===== Delete modal close / cancel wiring =====
if (deleteCardModal) {
  const deleteCloseBtn = deleteCardModal.querySelector(
    ".modal__image-close-btn"
  );
  if (deleteCloseBtn) {
    deleteCloseBtn.addEventListener("click", () => closeModal(deleteCardModal));
  }
}

if (deleteCancelBtn && deleteCardModal) {
  deleteCancelBtn.addEventListener("click", () => {
    selectedCard = null;
    selectedCardId = null;
    closeModal(deleteCardModal);
  });
}

// ===== Card Template =====
const cardTemplate = document
  .querySelector("#card-template")
  ?.content.querySelector(".card");

const cardsList = document.querySelector(".cards__list");

// ===== Cards =====
function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__description");
  const cardImageEl = cardElement.querySelector(".card__image");

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;

  // ===== Like button with API =====
  const likeBtn = cardElement.querySelector(".card__like-btn");

  if (data.isLiked) {
    likeBtn.classList.add("card__like-btn_active");
  }

  likeBtn.addEventListener("click", () => {
    const isCurrentlyLiked = likeBtn.classList.contains(
      "card__like-btn_active"
    );

    const request = isCurrentlyLiked
      ? api.unlikeCard(data._id)
      : api.likeCard(data._id);

    request
      .then((updatedCard) => {
        if (updatedCard.isLiked) {
          likeBtn.classList.add("card__like-btn_active");
        } else {
          likeBtn.classList.remove("card__like-btn_active");
        }
      })
      .catch((err) => {
        console.error("Failed to toggle like:", err);
      });
  });

  // ===== Delete button opens confirmation modal =====
  const deleteBtn = cardElement.querySelector(".card__delete-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      selectedCard = cardElement;
      selectedCardId = data._id;
      openModal(deleteCardModal);
    });
  }

  // ===== Image preview =====
  cardImageEl.addEventListener("click", () => {
    previewImage.src = data.link;
    previewImage.alt = data.name;
    previewCaption.textContent = data.name;
    openModal(previewModal);
  });

  return cardElement;
}

// ===== Load initial data =====
api
  .getAppInfo()
  .then(([userData, cards]) => {
    profileNameEl.textContent = userData.name;
    profileDescriptionEl.textContent = userData.about;
    if (profileAvatar) profileAvatar.src = userData.avatar;

    cards.forEach((card) => {
      cardsList.append(getCardElement(card));
    });
  })
  .catch(console.error);

// ===== Add card submit (with API) =====
if (addCardFormElement && newPostModal) {
  const newPostSubmitBtn =
    addCardFormElement.querySelector(".modal__submit-btn");
  const newPostDefaultText = newPostSubmitBtn
    ? newPostSubmitBtn.textContent
    : "Save";

  addCardFormElement.addEventListener("submit", (evt) => {
    evt.preventDefault();

    const cardData = {
      name: nameInput.value,
      link: linkInput.value,
    };

    renderLoading(true, newPostSubmitBtn, newPostDefaultText, "Saving...");

    api
      .addCard(cardData)
      .then((createdCard) => {
        const cardElement = getCardElement(createdCard);
        cardsList.prepend(cardElement);

        closeModal(newPostModal);
        resetForm(newPostModal);
      })
      .catch((err) => {
        console.error("Failed to add card:", err);
      })
      .finally(() => {
        renderLoading(false, newPostSubmitBtn, newPostDefaultText, "Saving...");
      });
  });
}

// ===== Delete card submit (with API) =====
if (deleteCardForm && deleteCardModal) {
  const deleteSubmitBtn = deleteCardForm.querySelector(".modal__submit-btn");
  const deleteDefaultText = deleteSubmitBtn
    ? deleteSubmitBtn.textContent
    : "Delete";

  deleteCardForm.addEventListener("submit", (evt) => {
    evt.preventDefault();

    if (!selectedCardId) {
      console.error("No card selected for deletion");
      return;
    }

    renderLoading(true, deleteSubmitBtn, deleteDefaultText, "Deleting...");

    api
      .removeCard(selectedCardId)
      .then(() => {
        if (selectedCard) {
          selectedCard.remove();
        }

        selectedCard = null;
        selectedCardId = null;

        closeModal(deleteCardModal);
      })
      .catch((err) => {
        console.error("Failed to delete card:", err);
      })
      .finally(() => {
        renderLoading(false, deleteSubmitBtn, deleteDefaultText, "Deleting...");
      });
  });
}

// ===== Avatar modal wiring (OPEN + CLOSE) =====
let avatarForm, avatarCloseBtn, avatarSubmitBtn, avatarInput;

if (avatarModal) {
  avatarForm = avatarModal.querySelector(".modal__form");
  avatarCloseBtn = avatarModal.querySelector(".modal__close-btn");
  avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");
  avatarInput = avatarModal.querySelector("#profile-avatar-input");
}

if (avatarModalBtn && avatarModal) {
  avatarModalBtn.addEventListener("click", () => {
    resetForm(avatarModal);
    openModal(avatarModal);
  });
}

if (avatarCloseBtn && avatarModal) {
  avatarCloseBtn.addEventListener("click", () => closeModal(avatarModal));
}

// ===== Avatar submit (with API) =====
if (avatarForm && avatarModal) {
  const avatarDefaultText = avatarSubmitBtn
    ? avatarSubmitBtn.textContent
    : "Save";

  avatarForm.addEventListener("submit", (evt) => {
    evt.preventDefault();

    const newAvatarUrl = avatarInput.value;

    renderLoading(true, avatarSubmitBtn, avatarDefaultText, "Saving...");

    api
      .updateAvatar({ avatar: newAvatarUrl })
      .then((userData) => {
        if (profileAvatar) profileAvatar.src = userData.avatar;

        closeModal(avatarModal);
        resetForm(avatarModal);
      })
      .catch((err) => {
        console.error("Failed to update avatar:", err);
      })
      .finally(() => {
        renderLoading(false, avatarSubmitBtn, avatarDefaultText, "Saving...");
      });
  });
}

// ===== Enable form validation =====
enableValidation(settings);
