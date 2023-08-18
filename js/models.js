"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    return new URL(this.url).hostname;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await fetch(`${BASE_URL}/stories`, {
      method: "GET",
    });
    const storiesData = await response.json();

    // turn plain old story objects from API into instances of Story class
    const stories = storiesData.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  // Need to pass in story object
  async addStory(user, {title, author, url}) { //user, newStory
    const token = user.loginToken;

    const response = await fetch(
      `${BASE_URL}/stories`, {
        method:"POST",
        body: JSON.stringify( {token, story:{ title, author, url }} ),
        headers: {"Content-Type": "application/json"}
      });

    const responseData = await response.json();

    console.log("RESponse Data", responseData);

    let newStory = new Story(responseData.story); // all from the api call
    console.log("New Story", newStory);
    this.stories.unshift(newStory);

    return newStory;
  }

}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
    username,
    name,
    createdAt,
    favorites = [],
    ownStories = []
  },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      body: JSON.stringify({ user: { username, password, name } }),
      headers: {
        "content-type": "application/json",
      }
    });
    const userData = await response.json();
    const { user } = userData;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      userData.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      body: JSON.stringify({ user: { username, password } }),
      headers: {
        "content-type": "application/json",
      }
    });
    const userData = await response.json();
    const { user } = userData;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      userData.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const tokenParams = new URLSearchParams({ token });

      const response = await fetch(
        `${BASE_URL}/users/${username}?${tokenParams}`,
        {
          method: "GET"
        }
      );
      const userData = await response.json();
      const { user } = userData;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  /** After we get the authorization from the API, push the story being favorited
   * to the favorites array.
   */

  async addFavorite(story) {
    this.favorites.push(story);
    await this.addFavoriteInAPI(currentUser, story.storyId);
  }

  /** After getting authorization from the API, take the story out after being
   * unfavorited.
   */

  async removeFavorite(story) {
    this.favorites = this.favorites.filter( s => s.storyId !== story.storyId );
    await this.removeFavoriteInAPI(currentUser, story.storyId);
  }

  /** Fetches the authorization for favoriting a story. */

  async addFavoriteInAPI(currentUser, storyId) {
    const token = currentUser.loginToken;
    const username = currentUser.username;

    const response = await fetch(
      `${BASE_URL}/users/${username}/favorites/${storyId}`,
      {
        method: "POST",
         body: JSON.stringify({ token }),
         headers: { "Content-Type": "applications/json" }
      }
    );

    const data = await response.json();
    const updatedUser = await data.user;

    return updatedUser;
  }

/** Fetches authorization to unfavorite a story. */

  async removeFavoriteInAPI (currentUser, storyId) {
    const token = currentUser.loginToken;
    const username = currentUser.username;

    const response = await fetch(
      `${BASE_URL}/users/${username}/favorites/${storyId}`,
      {
        method: "DELETE",
         body: JSON.stringify({ token }),
         headers: { "Content-Type": "applications/json" }
      }
    );

    const data = await response.json();
    const updatedUser = await data.user;

    return updatedUser;
  }

}

/*
TODO:
  - fetch data to favorite or unfavorite a story => two separate functions
  - after data has been fetched, either add or remove the story on the favorites array => separate functions
  - if the story has been favorited: FIXME:
    - attach the story to the array list FIXME:
  - if the story has been unfavorited: FIXME:
    - remove story from array list FIXME:

  - for navbar:
    - have a button to show favorites FIXME:
    - only favorited stories will show on this page FIXME:
      => have a container for favorite stories and have it only show FIXME:
        - hide the that shows all stories FIXME:
*/