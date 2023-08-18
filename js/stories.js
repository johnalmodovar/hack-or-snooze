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

// TODO: Add star icon for favorites: // bi bi-star-fill
function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}" class="story">
        <span class="star">
          <i class="bi bi-star"></i>
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

async function toggleFavorite() {
  // Ask question about event delegation and how to select parent class
  console.log("TOGGLE");

  //

}

$('.stories-list').on('click', '.star', toggleFavorite);

$("#story-form").on('submit', submitNewStory);