"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup", story);

  let iconFavoriteClass = "bi bi-star";

  for (const favorite of currentUser.favorites) {

    if (story.storyId === favorite.storyId) {
      iconFavoriteClass = "bi bi-star-fill";
    }
  }

  const hostName = story.getHostName();

  return $(`
      <li id="${story.storyId}" class="story">
        <span class="star">
          <i class="${iconFavoriteClass}"></i>
        </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
  $favoriteStoriesList.hide();
}

/** Gets list of User's favorite stories from server,
 *  generates their HTML, and puts on page. */

function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  $favoriteStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let favorite of currentUser.favorites) {
    const $story = generateStoryMarkup(favorite);
    $favoriteStoriesList.append($story);
  }

  $favoriteStoriesList.show();
}

/** Grabs form input for new story, creates story, and adds to story list. */
async function submitNewStory(evt) {
  evt.preventDefault();
  const author = $("#create-author").val();
  const title = $("#create-title").val();
  const url = $("#create-url").val();
  const user = currentUser;
  const storyData = { author, title, url };

  const story = await storyList.addStory(user, storyData);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);


  $storyForm.get(0).reset();
  // Another method we tried that works - but we're not familiar with trigger()
  // $storyForm.trigger("reset");
  $storyForm.hide();
}

$("#story-form").on('submit', submitNewStory);

/** when clicked on the star icon, it calls on functions to grab API for either
 * deleting or adding favorites, and adding or removing the story from the
 * favorites array.
 */

async function toggleFavorite(evt) {
  const $storyId = $(evt.target).closest(".story").get(0).id;
  const response = await StoryList.getStories($storyId);
  const storyList = await response.stories;
  let curStory = null;

  for (let story of storyList) {
    if (story.storyId === $storyId) {
      curStory = story;
    }
  }

  if ($(evt.target).hasClass("bi-star-fill") ) {
    currentUser.removeFavorite(curStory);

    putFavoritesOnPage();

  } else {
    currentUser.addFavorite(curStory);

    const $storyMarkup = generateStoryMarkup(curStory);
    $favoriteStoriesList.prepend($storyMarkup);  // Adds story to favorites

  }

  $(evt.target).toggleClass("bi-star-fill bi-star");
}

$('.stories-list').on('click', '.star', toggleFavorite);

/** Putting all of the favorites into the DOM */

function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  $favoriteStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let favorite of currentUser.favorites) {
    const $curFavorite = generateStoryMarkup(favorite);
    $favoriteStoriesList.append($curFavorite);
  }
}

/** Adds the favorited story into the favorites section on the DOM */

// function addFavoriteToPage(story) {
//   const $newFavoriteStory = generateStoryMarkup(story).get(0);
// }



// function removeFavoriteFromPage(story) {
//   console.log("REMOVE", $favoriteStoriesList, story);
//   $favoriteStoriesList.get(0).remove(story);
// }