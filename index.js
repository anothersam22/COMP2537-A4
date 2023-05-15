const setup = () => {
  let firstCard = null;
  let secondCard = null;
  let isProcessing = false;

  $(document).on("click", ".card", function () {
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
        $(`#${firstCard.id}`).parent().off("click");
        $(`#${secondCard.id}`).parent().off("click");
        isProcessing = false;
        firstCard = null;
        secondCard = null;
      } else {
        console.log("no match");
        $("#match-message").text("No Match!");
        setTimeout(() => {
          if (firstCard && secondCard) {
            $(`#${firstCard.id}`).parent().toggleClass("flip");
            $(`#${secondCard.id}`).parent().toggleClass("flip");
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
