(function (undefined) {
  var STORAGE_KEY = "open-source-templates/lang";

  var lang = {
    get() {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    },
    set(val) {
      localStorage.setItem(STORAGE_KEY, val);
    },
  };

  var choices = {};

  var content = {};

  var proMode = false;

  var viewCover = function () {
    $("body").scrollTop(0);
    $(".page").hide();
    $(".cover").show();
  };
  var viewPage = function (pageNumber) {
    $("body").scrollTop(0);
    $(".cover").hide();
    $(".page").hide();
    $("#page-" + pageNumber).show();
  };

  var makeChoice = function (pageNumber, choiceKey, choiceValue) {
    if (pageNumber === 1) {
      choices = {};
    }

    choices[choiceKey] = choiceValue;

    fetchContent(choiceKey, choiceValue);

    return viewPage(pageNumber);
  };

  var addToChecklist = function (pageNumber, choiceValue) {
    choices["checklist"] = choices["checklist"] || {};

    choices["checklist"][choiceValue] = choiceValue;

    fetchContent("checklist", choiceValue);

    return viewPage(pageNumber);
  };

  var updateLangs = function () {
    var curLang = lang.get() || "en";
    $("#langSelector")[0].value = curLang;
    $("[data-lang]").hide();
    $("[data-lang=" + curLang + "]").show();
  };

  updateLangs();

  var fetchContent = function (choiceKey, choiceValue, type) {
    type = type || choices["type"];
    if (
      ["description", "environment", "checklist", "change-types"].indexOf(
        choiceKey
      ) !== -1
    ) {
      var contentKey = type + "-" + choiceKey + "-" + choiceValue;
      if (content[contentKey] === undefined) {
        $.get(
          "templates/" + type + "/" + choiceKey + "/" + choiceValue + ".md",
          function (text) {
            content[contentKey] = text;
            updateTextarea();
          }
        );
      } else {
        updateTextarea();
      }
    }
  };

  var updateTextarea = function () {
    var text = "";
    if (choices["type"] === "issues") {
      text =
        content["issues-description-" + choices["description"]] +
        "\n" +
        content["issues-environment-" + choices["environment"]];
    } else if (choices["type"] === "pull-requests") {
      text =
        content["pull-requests-description-" + choices["description"]] +
        "\n" +
        content["pull-requests-change-types-bug-or-feature"] +
        "\n" +
        content["pull-requests-checklist-intro"];
      ["contributing", "tests"].forEach(function (checklistItem) {
        if (choices["checklist"] && choices["checklist"][checklistItem]) {
          text += content["pull-requests-checklist-" + checklistItem];
        }
      });
    }
    $("textarea").val(text);
  };

  var routes = {
    "/": viewCover,
    "/page/:pageNumber": viewPage,
    "/page/:pageNumber/checklist/:choiceValue": addToChecklist,
    "/page/:pageNumber/:choiceKey/:choiceValue": makeChoice,
  };

  var router = Router(routes);
  router.setRoute(location.hash.substring(1));

  router.init();

  fetchContent("change-types", "bug-or-feature", "pull-requests");
  fetchContent("checklist", "intro", "pull-requests");

  $("#langSelector").change(function () {
    lang.set(this.value);
    updateLangs();
  });

  $("a.file-name").click(function () {
    var filename =
      choices["type"] === "issues"
        ? "ISSUE_TEMPLATE.md"
        : "PULL_REQUEST_TEMPLATE.md";
    download($("textarea").val(), filename, "text/plain");
    return false;
  });

  $("#boss-key").click(function () {
    var selector = "p, h1, h2, img, div.author, div.page-number";
    proMode = !proMode;
    if (proMode) {
      $(selector).animate({ opacity: 0.07 });
    } else {
      $(selector).animate({ opacity: 1 });
    }
    return false;
  });
})();
