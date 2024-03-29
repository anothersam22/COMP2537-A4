/*
Pokemon Memory Game 
Assignment 4
COMP 2537
*/

// time formatter function (location must be string id of html element in quotes)
function displayTimeLimit(timeLimit, location) {
  let minutes = parseInt(timeLimit / 60, 10);
  let seconds = parseInt(timeLimit % 60, 10);

  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  $(location).text(minutes + "min : " + seconds + "sec");
}
// power up function:  if you have clicked 10 times flip all cards for N seconds
function powerUp(clickCount) {
  // Select all cards that are not matched
  const unmatchedCards = $(".card").not(".matched");

  if (clickCount == 10 || clickCount == 30 || clickCount == 60) {
    // Flip all unmatched cards
    unmatchedCards.toggleClass("flip");

    // Set a timeout to flip the cards back
    setTimeout(() => {
      unmatchedCards.toggleClass("flip");
    }, 1000);
    // match message
    $("#match-message").text("Power Up!");
    console.log("Power Up!");
  }
}

// set difficulty level
function setDifficulty(callback) {
  let numberOfPairs = 0;
  let timeLimit = 0;

  $("#level button").click(function () {
    $("#level button").removeClass("active");
    const difficulty = $(this).val();

    if (difficulty === "easy") {
      numberOfPairs = 3;
      timeLimit = 30;
      displayTimeLimit(timeLimit, "#timer");
      $("#levelState").text("Easy");
      $("#pairs-left").text(numberOfPairs);
    } else if (difficulty === "medium") {
      numberOfPairs = 8;
      timeLimit = 60;
      displayTimeLimit(timeLimit, "#timer");
      $("#levelState").text("Medium");
      $("#pairs-left").text(numberOfPairs);
    } else if (difficulty === "hard") {
      numberOfPairs = 12;
      timeLimit = 90;
      displayTimeLimit(timeLimit, "#timer");
      $("#levelState").text("Hard");
      $("#pairs-left").text(numberOfPairs);
    }

    // Log the updated values
    console.log("Number of pairs: ", numberOfPairs);
    console.log("Time limit: ", timeLimit);

    // Add the active class to the clicked button
    $(this).addClass("active");

    // Call the callback function with the updated values
    callback(numberOfPairs, timeLimit);
  });
}

// Generate cards for grid:
async function generatePokemonCards(numPairs) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=810`);
  const data = await response.json();
  const pokemonList = data.results;

  const cardContainer = document.getElementById("game_grid");
  cardContainer.innerHTML = "";

  let numRows, numColumns;

  if (numPairs === 3) {
    numRows = 2;
    numColumns = 3;
  } else if (numPairs === 8) {
    numRows = 4;
    numColumns = 4;
  } else if (numPairs === 12) {
    numRows = 4;
    numColumns = 6;
  } else {
    // Default to a grid with 3 columns and ceil(numPairs/3) rows
    numRows = Math.ceil(numPairs / 3);
    numColumns = 3;
  }
  // make grid according to number of columns
  cardContainer.style.gridTemplateColumns = `repeat(${numColumns}, 1fr)`; // Update the grid template columns in CSS

  // condition to change dimension of game grid depending on numColumns
  const cards = document.querySelectorAll(".card");

  if (numColumns === 3) {
    cardContainer.style.minHeight = "300px";
    cardContainer.style.maxWidth = "400px";
    // change card width to 80%
    cards.forEach((card) => {
      card.style.width = "50%";
    });
  } else if (numColumns === 4) {
    cardContainer.style.minHeight = "700px";
    cardContainer.style.maxWidth = "600px";
    cards.forEach((card) => {
      card.style.width = "50%";
    });
  } else if (numColumns === 6) {
    cardContainer.style.minHeight = "600px";
    cardContainer.style.maxWidth = "800px";
    cards.forEach((card) => {
      card.style.width = "50%";
    });
  }

  // make sure there are no duplicate pokemon pairs
  const uniquePokemons = [];
  const usedIndices = [];

  while (uniquePokemons.length < numPairs * 2) {
    const randomIndex = Math.floor(Math.random() * pokemonList.length);

    if (!usedIndices.includes(randomIndex)) {
      const randomPokemon = pokemonList[randomIndex];
      uniquePokemons.push(randomPokemon, randomPokemon);
      usedIndices.push(randomIndex);
    }
  }

  shuffleArray(uniquePokemons);

  uniquePokemons.forEach((pokemon, index) => {
    const card = document.createElement("div");
    card.classList.add("card");

    const randomIndex = Math.floor(Math.random() * pokemonList.length);
    const randomPokemon = pokemonList[randomIndex];

    const frontFace = document.createElement("img");
    frontFace.classList.add("front_face");
    frontFace.style.background = "white";
    frontFace.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${
      pokemonList.indexOf(pokemon) + 1
    }.png`;
    frontFace.alt = "";

    const backFace = document.createElement("img");
    backFace.classList.add("back_face");
    backFace.src = "back.webp";
    backFace.alt = "";
    backFace.style.background = "white";

    card.appendChild(frontFace);
    card.appendChild(backFace);
    cardContainer.appendChild(card);

    // Detect if dark mode is enabled
    const gameGrid = document.getElementById("game_grid");
    const backgroundColor = getComputedStyle(gameGrid).backgroundColor;
    const isDarkModeEnabled = backgroundColor === "rgb(0, 0, 0)"; // Check if background color is black

    // Check if dark mode is enabled
    if (isDarkModeEnabled) {
      const cards = document.querySelectorAll(".card");
      cards.forEach((card) => {
        card.style.background = "black";
        const images = card.querySelectorAll("img");
        images.forEach((image) => {
          image.style.background = "black";
        });
      });
    }
  });
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const setup = () => {
  let firstCard = null;
  let secondCard = null;
  let isProcessing = false;
  let clickCount = 0;
  let numberOfPairs = 3;
  let pairsMatched = 0;
  let pairsLeft = 0;
  let timeLimit = 30;
  let score = 0;
  let intervalId; // Declare intervalId variable
  // console.log("timeLimit before start game: ", timeLimit);

  // set difficulty level
  setDifficulty((updatedNumberOfPairs, updatedTimeLimit) => {
    numberOfPairs = updatedNumberOfPairs;
    timeLimit = updatedTimeLimit;
    console.log("Number of pairs in setup: ", numberOfPairs);
    console.log("Time limit in setup: ", timeLimit);
    pairsLeft = updatedNumberOfPairs;
  });
  // console.log("timeLimit after setDifficulty: ", timeLimit);

  const startGame = () => {
    // generate cards
    generatePokemonCards(numberOfPairs);
    let timeCounter = timeLimit;
    //console.log("timeCounter at start of game: ", timeCounter);

    // Remove the start button
    $("#start-button").off("click").hide();

    // decrease timeCounter by 1 every second
    intervalId = setInterval(() => {
      timeCounter--;
      // console.log("timeCounter in interval: ", timeCounter);

      // display timeCounter in 0:00 format
      displayTimeLimit(timeCounter, "#timer");

      if (timeCounter === 0) {
        clearInterval(intervalId); // Stop the interval
        // Perform any additional actions when timeCounter reaches 0
        console.log("Game Over! Time is up!");
        $("#match-message").text("Game Over!"); // display lose message
      }
    }, 1000);

    // game play event listener
    $(document).on("click", ".card", function () {
      //add click count
      clickCount++;
      // display click count
      $("#clicks").text(clickCount);

      // power up function
      powerUp(clickCount);

      // timeCounter at each click
      console.log("timeCounter at each click: ", timeCounter);

      // check if card is already flipped or matched
      if (
        $(this).hasClass("flip") ||
        $(this).hasClass("matched") ||
        timeCounter <= 0
      ) {
        return; // Skip further execution
      }

      if (isProcessing) {
        return;
      }

      $(this).toggleClass("flip");

      const currentCard = $(this).find(".front_face")[0];

      if (!firstCard) {
        firstCard = currentCard;
      } else if (firstCard !== currentCard) {
        secondCard = currentCard;
        isProcessing = true;
        // if time runs out, disable flipping cards
        console.log("timeCounter: ", timeCounter);
        if (timeCounter <= 0) {
          console.log("disable cards after time runs out");
          $(this).off("click");
        }

        if (firstCard.src === secondCard.src) {
          console.log("match");
          $("#match-message").text("Match!");
          $(this).off("click");
          $(firstCard).parent().off("click");
          powerUp(clickCount);
          score += 10;
          pairsMatched++;
          pairsLeft = numberOfPairs - pairsMatched;
          console.log("pairsLeft: ", pairsLeft);
          isProcessing = false;
          firstCard = null;
          secondCard = null;
          // Add a "matched" class to the matched cards
          $(this).addClass("matched");
          $(firstCard).parent().addClass("matched");
        } else {
          console.log("no match");
          $("#match-message").text("No Match!");
          setTimeout(() => {
            if (firstCard && secondCard) {
              $(this).toggleClass("flip");
              $(firstCard).parent().toggleClass("flip");
              powerUp(clickCount);
              isProcessing = false;
              firstCard = null;
              secondCard = null;
            }
          }, 1000);
        }
      }

      // update score
      $("#score").text(score);
      // update pairs left
      $("#pairs-left").text(pairsLeft);
      // display pairs matched
      $("#pairs-matched").text(pairsMatched);

      // win condition
      if (pairsMatched === numberOfPairs) {
        console.log("You win!");
        $("#match-message").text("You Win!"); // display win message
        clearInterval(intervalId);

        // display timeCounter in 0:00 format
        displayTimeLimit(timeCounter, "#timer");
      }
    });
  };

  // Event listener for dark button
  $("#darkButton").click(function () {
    $("#game_grid").css("background-color", "black");
    $(".card").css("background-color", "black");
    $(".front_face").css("background-color", "black");
    $(".back_face").css("background-color", "black");
    $(".card").css("background-color", "black");
    $(".img").css("background", "black");
  });

  // Event listener for light button
  $("#lightButton").click(function () {
    $("#game_grid").css("background-color", "white");
    $(".card").css("background-color", "white");
    $(".front_face").css("background-color", "white");
    $(".back_face").css("background-color", "white");
    $(".card").css("background-color", "white");
    $(".img").css("background", "white");
  });

  // reset game
  $("#reset_game").on("click", function () {
    // redirect to home page
    location.reload();
  });

  // Add event listener to the start button
  $("#start-button").on("click", startGame);
};

$(document).ready(setup);
