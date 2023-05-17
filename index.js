


// time limit function
function startTimer(duration) {
  let timer = duration, minutes, seconds;
  const intervalId = setInterval(function () {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);
    $("#timer").text(minutes + ":" + seconds);

    if (--timer < 0) {
      timer = duration;
      clearInterval(intervalId);
      $("#timer").text("0:00");
      $("#match-message").text("Game Over!");
    }
    
    if (pairsMatched === numberOfPairs) {
      clearInterval(intervalId);
      $("#match-message").text("You Win!");
    }
  }, 1000);

}

// set difficulty level
function setDifficulty(callback) {
  let numberOfPairs = 0;
  let timeLimit = 0;

  $("#level button").click(function () {
    const difficulty = $(this).val();

    if (difficulty === "easy") {
      numberOfPairs = 3;
      timeLimit = 60;
    } else if (difficulty === "medium") {
      numberOfPairs = 6;
      timeLimit = 90;
    } else if (difficulty === "hard") {
      numberOfPairs = 9;
      timeLimit = 120;
    }

    // Log the updated values
    console.log("Number of pairs: ", numberOfPairs);
    console.log("Time limit: ", timeLimit);

    // Call the callback function with the updated values
    callback(numberOfPairs, timeLimit);
  });
}


// Generate cards for grid:
async function generatePokemonCards(numPairs) {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${numPairs}`
  );
  const data = await response.json();
  const pokemonList = data.results;

  const cardContainer = document.getElementById("game_grid");
  cardContainer.innerHTML = "";

  let numRows, numColumns;

  if (numPairs % 4 === 0) {
    numRows = numPairs / 4;
    numColumns = 4;
  } else if (numPairs % 3 === 0) {
    numRows = numPairs / 3;
    numColumns = 3;
  } else {
    numRows = Math.ceil(numPairs / 3);
    numColumns = 3;
  }

  cardContainer.style.gridTemplateColumns = `repeat(${numColumns}, 1fr)`; // Update the grid template columns in CSS

  const uniquePokemons = [];

  for (let i = 0; i < numPairs; i++) {
    const pokemon1 = pokemonList[i];
    const pokemon2 = pokemonList[numPairs - 1 - i];
    uniquePokemons.push(pokemon1, pokemon2);
  }

  shuffleArray(uniquePokemons);

  uniquePokemons.forEach((pokemon, index) => {
    const card = document.createElement("div");
    card.classList.add("card");

    const frontFace = document.createElement("img");
    frontFace.classList.add("front_face");
    frontFace.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
      pokemonList.indexOf(pokemon) + 1
    }.png`;
    frontFace.alt = "";

    const backFace = document.createElement("img");
    backFace.classList.add("back_face");
    backFace.src = "back.webp";
    backFace.alt = "";

    card.appendChild(frontFace);
    card.appendChild(backFace);
    cardContainer.appendChild(card);
  });
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}


// win game function


const setup = () => {
  let firstCard = null;
  let secondCard = null;
  let isProcessing = false;
  let clickCount = 0;
  let numberOfPairs = 3;
  let timeLimit = 0;
  let pairsMatched = 0;
  let score = 0;

// event listener for start button

  // set difficulty level
setDifficulty((updatedNumberOfPairs, updatedTimeLimit) => {
  numberOfPairs = updatedNumberOfPairs;
  timeLimit = updatedTimeLimit;
  console.log("Number of pairs in setup: ", numberOfPairs);
  console.log("Time limit in setup: ", timeLimit);
  generatePokemonCards(numberOfPairs);
  startTimer(timeLimit);
});


  // game play event listener
  $(document).on("click", ".card", function () {
    //add click count
    clickCount++;
    // display click count
    $("#clicks").text(clickCount);

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

      if (firstCard.src === secondCard.src) {
        console.log("match");
        $("#match-message").text("Match!");
        $(this).off("click");
        $(firstCard).parent().off("click");
        score += 10;
        pairsMatched++;
        isProcessing = false;
        firstCard = null;
        secondCard = null;
      } else {
        console.log("no match");
        $("#match-message").text("No Match!");
        setTimeout(() => {
          if (firstCard && secondCard) {
            $(this).toggleClass("flip");
            $(firstCard).parent().toggleClass("flip");
            isProcessing = false;
            firstCard = null;
            secondCard = null;
          }
        }, 1000);
      }
    }
  });
};

$(document).ready(setup);
