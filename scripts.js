function createInputFIO(element) {
  // Store original element
  const target = element;

  // What input types are allowed without formatting
  const allowedInputTypes = [
    "deleteContentBackward", // Backspace
    "deleteContentForward", // Delete
    "deleteByCut", // cutting
    "deleteWordBackward", // ctrl + backspace
    "historyUndo", // undo last action (ctrl z)
    "historyRedo", // redo last action (ctrl y)
  ];

  // Format value function
  function formatValue(value) {
    value = value.replace(/[^-\ а-яА-Яё]/g, ""); // remove all symbols except Russian alphabet, dash and space
    value = value.replace(/\s{2,}/g, " "); // remove double spaces
    value = value.replace(/\-{2,}/g, "-"); // remove double dashes
    value = value.trimStart(); // remove space at the beginning
    value = value.replace(/\-\s+/g, "-"); // remove space after dash
    return value;
  }

  // Input handler function
  function handleInput(event) {
    // Check if input type is allowed
    if (allowedInputTypes.includes(event.inputType)) {
      return;
    }

    // Get cursor position and value
    const cursor = target.selectionStart;
    let value = target.value;

    // Parse and format the value
    value = formatValue(value);
    const words = value.split(" "); // split into words by spaces
    let parseResult = "";

    words.forEach(function (word, idx) {
      // Word doesn't start with dash
      if (word[0] === "-") {
        return;
      }

      // If not the first word, add space
      if (idx > 0) {
        parseResult += " " + word.charAt(0).toUpperCase();
      } else {
        parseResult += word.charAt(0).toUpperCase();
      }

      // Add the rest of the word in lowercase
      parseResult += word.slice(1).toLowerCase();
    });

    // Update value and restore cursor position
    target.value = parseResult;
    target.selectionStart = cursor;
    target.selectionEnd = cursor;

    // Prevent default behavior
    event.preventDefault();
    event.stopPropagation();
  }

  // Add event listener
  target.addEventListener("input", handleInput);

  // Return object with destroy method
  return {
    destroy: function () {
      target.removeEventListener("input", handleInput);
    },
  };
}
// Usage example:
// const inputElement = document.getElementById('myInput');
// const inputFIO = createInputFIO(inputElement);
//
// To destroy:
// inputFIO.destroy();

const inputs = document.querySelectorAll(".test__input");

inputs.forEach(function (input) {
  createInputFIO(input);
});
