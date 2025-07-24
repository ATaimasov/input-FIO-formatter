function createInputFIO(element) {
  // сохраняем элемент в ссылку
  const target = element;

  // что игнорируем
  const allowedInputTypes = [
    "deleteContentBackward", // Backspace
    "deleteContentForward", // Delete
    "deleteByCut", // вырезать
    "deleteWordBackward", // удалить целое слово (ctrl + backspace)
    "historyUndo", // отменить последнее действие (ctrl + z)
    "historyRedo", // повторить последнее действие (ctrl + y)
  ];

  // Что блокируем при вводе
  function formatValue(value) {
    /*
        убираем все кроме:
        а-яА-ЯёЁ  - все русские буквы включая ё
        \-  - дефис (экранированный)
        \s  - пробел
        \.  - точка (экранированная)
        IV  - латинские прописные буквы I и V
        \' - апостроф (экранированный)
        \,  - запятая (экранированная)
        \( и \) - скобки (экранированные)
      */
    value = value.replace(/[^а-яА-ЯёЁ\-\s\.\IV\'\,\(\)]/g, "");
    value = value.replace(/\){2,}/g, ")"); // убираем двойную левую скобку
    value = value.replace(/\({2,}/g, "("); // убираем двойную правую скобку
    value = value.replace(/\'{2,}/g, "'"); // убираем двойной апостро
    value = value.replace(/\.{2,}/g, "."); // убираем двойную точку
    value = value.replace(/\s{2,}/g, " "); // убирает двойной пробел
    value = value.replace(/\-{2,}/g, "-"); // убирает двойной дефис
    value = value.trimStart(); // убирает пробел в самом начале
    value = value.replace(/\-\s+/g, "-"); // убирает пробел после дефиса

    return value;
  }

  function parse(event) {
    const target = event.target;
    const formattedValue = formatValue(target.value);

    var words = formattedValue.split(" "); // каждый раз делим на слова по пробелам
    let parseResult = "";

    words.forEach(function (word, idx) {
      // слово не начинается с тире
      if (word[0] === "-") {
        return;
      }

      // если слово не первое, добавляем пробел
      if (idx > 0) {
        parseResult += " ";
      }

      // первая буква каждого слова в верхнем регистре
      parseResult += word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });

    if (target.value !== parseResult) {
      target.value = parseResult;
    }

    return parseResult;
  }

  function updateCursor(event) {
    const target = event.target;

    // положение курсора всегда будет равно длине ввода(value) инпута
    target.selectionStart = target.value.length;
    target.selectionEnd = target.value.length;
  }

  function handleInput(event) {
    // Проверяем что игнорируем
    if (allowedInputTypes.includes(event.inputType)) {
      updateCursor(event);
      return;
    }

    parse(event);

    event.preventDefault();
    event.stopPropagation();
  }

  target.addEventListener("input", handleInput);

  // Метод для уничтожения обработчика
  return {
    destroy: function () {
      target.removeEventListener("input", handleInput);
    },
  };
}
// Как уничтожить:
// inputFIO.destroy();

const inputs = document.querySelectorAll(".test__input");

inputs.forEach(function (input) {
  createInputFIO(input);
});
