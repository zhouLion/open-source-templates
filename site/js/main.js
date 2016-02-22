(function(undefined) {
  var choices = {};

  var content = {};

  var viewPage = function(pageNumber) {
    $('body').scrollTop(0);
    $('.cover').hide();
    $('.page').hide();
    $('#page-'+pageNumber).show();
  };

  var makeChoice = function(pageNumber, choiceKey, choiceValue) {
    if (pageNumber === 1) {
      choices = {};
    }

    choices[choiceKey] = choiceValue;

    fetchContent(choiceKey, choiceValue);

    return viewPage(pageNumber);
  };

  var addToChecklist = function(pageNumber, choiceValue) {
    choices['checklist'] = choices['checklist'] || {};

    choices['checklist'][choiceValue] = choiceValue;

    fetchContent('checklist', choiceValue);

    return viewPage(pageNumber);
  };

  var fetchContent = function(choiceKey, choiceValue, type) {
    type = type || choices['type'];
    if (['description', 'environment', 'checklist', 'change-types'].indexOf(choiceKey) !== -1) {
      var contentKey = type+'-'+choiceKey+'-'+choiceValue;
      if (content[contentKey] === undefined) {
        $.get( "templates/"+type+"/"+choiceKey+"/"+choiceValue+".md", function(text) {
          content[contentKey] = text;
          updateTextarea();
        });
      } else {
        updateTextarea();
      }
    }
  };

  var updateTextarea = function() {
    var text = '';
    if (choices['type'] === 'issues') {
      text =  content['issues-description-'+choices['description']]+"\n"+
              content['issues-environment-'+choices['environment']];
    } else if (choices['type'] === 'pull-requests') {
      text  = content['pull-requests-description-'+choices['description']]+"\n"+
              content['pull-requests-change-types-bug-or-feature']+"\n"+
              content['pull-requests-checklist-intro'];
      ['contributing', 'tests'].forEach(function(checklistItem) {
        if (choices['checklist'] && choices['checklist'][checklistItem]) {
          text += content['pull-requests-checklist-'+checklistItem];
        }
      });
    }
    $('textarea').val(text);
  };

  $('.page').hide();

  var routes = {
    '/page/:pageNumber': viewPage,
    '/page/:pageNumber/checklist/:choiceValue': addToChecklist,
    '/page/:pageNumber/:choiceKey/:choiceValue': makeChoice
  };

  var router = Router(routes);

  router.setRoute('/')

  router.init();

  fetchContent('change-types', 'bug-or-feature', 'pull-requests');
  fetchContent('checklist', 'intro', 'pull-requests');

})()
