const form = document.querySelector(".test__form");
const inputs = form.querySelectorAll(".test__input[type='text']");

inputs.forEach(function (input) {
  preValidateFIO(input);
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  let err = "";
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].value = inputs[i].value.trim();

    const validate = validateFIO(inputs[i].value);
    if (!validate) {
      err += inputs[i].placeholder + " ";
      continue;
    }
  }

  if (err) {
    alert("Введено неправильно: " + err);
  } else {
    alert("Данные введены правильно!");
  }
});

/**
 * Валидация ФИО на уровне ввода
 * @param {Object} element
 * @returns
 */
function preValidateFIO(element) {
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

/**
 * Проверка ФИО (checkFIOpartNew в java)
 * В соответствии с приказом ФНС:  https://www.consultant.ru/document/cons_doc_LAW_410788/763145d8bce1267a0501117c28ebd122104c1b8e/
 * @param s - строка
 * @return boolean
 */
function validateFIO(s) {
  if (s === null || s.trim() === "") {
    return false;
  }

  // Предварительные проверки
  if (
    s.endsWith(" .") || // заканчивается пробел+точка
    s.endsWith("(") || // заканчивается открывающей скобкой
    s.includes("  ") || // два пробела подряд
    s.includes("--") || // два дефиса подряд
    s.includes("''") || // два апострофа подряд
    s.includes(" .") || // пробел перед точкой
    s.includes("- ") || // пробел после дефиса
    s.includes(" -")
  ) {
    return false;
  }

  // Основная проверка

  const russianLetters = "А-ЯЁа-яё";
  const romanNumerals = "IV";

  const pattern =
    "^[" +
    russianLetters +
    "]+" +
    "(" + // Пробел + НЕ пробел
    "\\s[" +
    russianLetters +
    romanNumerals +
    "\\(\\)\\.]+" +
    "|" +
    // Дефис + НЕ дефис
    "-[" +
    russianLetters +
    romanNumerals +
    "\\(\\)\\s\\.]+" +
    "|" +
    // Апостроф + НЕ апостроф
    "'[" +
    russianLetters +
    romanNumerals +
    "\\(\\)\\s\\.]+" +
    "|" +
    // Запятая + пробел + буквы (запятая всегда с пробелом)
    "\\,\\s[" +
    russianLetters +
    romanNumerals +
    "\\(\\)\\.]+" +
    "|" +
    // Скобки и точки + любые разрешенные символы
    "[\\(\\)\\.][" +
    russianLetters +
    romanNumerals +
    "\\(\\)\\s\\.]+" +
    ")*$";

  const regex = new RegExp(pattern);
  return regex.test(s);
}
