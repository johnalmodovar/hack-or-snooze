"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  evt.preventDefault();
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  evt.preventDefault();
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  // $storyForm.hide(); // testing
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** Upon click, will display form to submit new story. */

function navShowSubmitForm(evt) {
  evt.preventDefault();
  hidePageComponents();
  $storyForm.show();
  $allStoriesList.show();
}

$("#nav-submit").on("click", navShowSubmitForm);

/** Shows favorites list when Favorites in nav is clicked. */

function navShowFavorites(evt) {
  evt.preventDefault();
  hidePageComponents();

  //TODO: add global variable for favorite stories to show/hide when button is clicked
  $favoriteStoriesList.show();
}

$("#nav-favorites").on("click", navShowFavorites);