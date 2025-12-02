import "core-js/stable";
import "regenerator-runtime/runtime";

import "./index.css";

import spotsLogoUrl from "../images/spots-logo.svg";
import avatarUrl from "../images/avatar.jpg";
import editIconUrl from "../images/edit-icon.svg";
import plusIconUrl from "../images/plus-icon.svg";

import {
  enableValidation,
  settings,
  hideInputError,
  toggleButtonState,
} from "../scripts/validation.js";

// ===== Initial Cards Data =====
const initialCards = [
  {
    name: "Golden Gate Bridge",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/7-photo-by-griffin-wooldridge-from-pexels.jpg",
  },
  {
    name: "Val Thorens",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/1-photo-by-moritz-feldmann-from-pexels.jpg",
  },
  {
    name: "Restaurant terrace",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/2-photo-by-ceiline-from-pexels.jpg",
  },
  {
    name: "An outdoor cafe",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/3-photo-by-tubanur-dogan-from-pexels.jpg",
  },
  {
    name: "A very long bridge, over the forest",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/4-photo-by-maurice-laschet-from-pexels.jpg",
  },
  {
    name: "Tunnel with morning light",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/5-photo-by-van-anh-nguyen-from-pexels.jpg",
  },
  {
    name: "Mountain house",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/6-photo-by-moritz-feldmann-from-pexels.jpg",
  },
];

// ===== Modal / Form Utility Functions =====
let handleEscKey;

function resetForm(modal) {
  const formEl = modal.querySelector(".modal__form");
  if (!formEl) return;

  formEl.reset();

  const inputList = Array.from(formEl.querySelectorAll(".modal__input"));
  inputList.forEach((input) => hideInputError(formEl, input, settings));

  const buttonEl = formEl.querySelector(".modal__submit-btn");
  toggleButtonState(inputList, buttonEl, settings);
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
  modal.classList.add("modal_is-opened");
  addEscapeListener();
}

function closeModal(modal) {
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
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const editProfileForm = editProfileModal.querySelector(".modal__form");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);

const newPostBtn = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const addCardFormElement = newPostModal.querySelector(".modal__form");
const linkInput = newPostModal.querySelector("#card-image-input");
const nameInput = newPostModal.querySelector("#card-caption-input");

const previewModal = document.querySelector("#preview-modal");
const previewImage = previewModal.querySelector(".modal__image");
const previewCaption = previewModal.querySelector(".modal__caption");
const previewCloseBtn = previewModal.querySelector(".modal__image-close-btn");

// ===== Profile Display =====
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");

// ===== Wire static <img> assets (so webpack emits them) =====
const headerLogo = document.querySelector(".header__logo");
if (headerLogo) headerLogo.src = spotsLogoUrl;

const profileAvatar = document.querySelector(".profile__avatar");
if (profileAvatar) profileAvatar.src = avatarUrl;

const pencilIcon = document.querySelector(".profile__pencil-icon");
if (pencilIcon) pencilIcon.src = editIconUrl;

const plusIcon = document.querySelector(".profile__plus-icon");
if (plusIcon) plusIcon.src = plusIconUrl;

// ===== Card Template =====
const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardsList = document.querySelector(".cards__list");

// ===== Cards =====
function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__description");
  const cardImageEl = cardElement.querySelector(".card__image");

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;

  cardElement
    .querySelector(".card__like-btn")
    .addEventListener("click", (e) => {
      e.target.classList.toggle("card__like-btn_active");
    });

  cardElement
    .querySelector(".card__delete-btn")
    .addEventListener("click", () => cardElement.remove());

  cardImageEl.addEventListener("click", () => {
    previewImage.src = data.link;
    previewImage.alt = data.name;
    previewCaption.textContent = data.name;
    openModal(previewModal);
  });

  return cardElement;
}

// ===== Event Handlers: Edit Profile =====
editProfileBtn.addEventListener("click", () => {
  resetForm(editProfileModal);
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  openModal(editProfileModal);
});

editProfileCloseBtn.addEventListener("click", () =>
  closeModal(editProfileModal)
);

editProfileForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  profileNameEl.textContent = editProfileNameInput.value;
  profileDescriptionEl.textContent = editProfileDescriptionInput.value;

  closeModal(editProfileModal);
  resetForm(editProfileModal); // Only after successful submit
});

// ===== Event Handlers: New Post =====
newPostBtn.addEventListener("click", () => openModal(newPostModal));
newPostCloseBtn.addEventListener("click", () => closeModal(newPostModal));

addCardFormElement.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const newCard = { name: nameInput.value, link: linkInput.value };
  const cardElement = getCardElement(newCard);
  cardsList.prepend(cardElement);

  closeModal(newPostModal);
  resetForm(newPostModal); // Only after successful submit
});

// ===== Event Handlers: Preview =====
previewCloseBtn.addEventListener("click", () => closeModal(previewModal));

// ===== Initialize Initial Cards =====
initialCards.forEach((card) => {
  cardsList.append(getCardElement(card));
});

// ===== Enable form validation =====
enableValidation(settings);
