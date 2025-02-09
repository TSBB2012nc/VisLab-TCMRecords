export var gDefaultMedMajorClass = [];
export var gExpertMedClass = ['安神类', '活血类', '补脾益气类', '凉血止血类', '泄浊毒类', '祛风止痒类', '补肾类（降蛋白尿）', '清热类（利湿/解毒）'];

export function defaultColoring(d) {
    if (gDefaultMedMajorClass.length > 0) {
      // Default classification by medicine classification
      var medClass = -1;
      for (var ii = 0; ii < gMedProperties.length; ii++) {
        if (d.name == gMedProperties[ii].name) {
          // Search the name of medicine classification in the major classification list
          for (var j = 0; j < gDefaultMedMajorClass.length; j++) {
            if (gMedProperties[ii].class.search(gDefaultMedMajorClass[j]) >= 0) {
              medClass = j;
              break;
            }
          }
        }
  
        if (medClass >= 0)
          break;
      }
      if (medClass < 0)
        return "blue";
      else
        return gDefaultColRange(gDefaultMedMajorClass[medClass]);
    }
    else
      return "blue";
  }
  
export  function expColoring(d) {
    if (gExpertMedClass.length > 0) {
      // Default classification by medicine classification
      var medClass = -1;
      for (var ii = 0; ii < gMedProperties.length; ii++) {
        if (d.name == gMedProperties[ii].name) {
          // Search the name of medicine classification in the major classification list
          for (var j = 0; j < gExpertMedClass.length; j++) {
            if (gMedProperties[ii].classExp.search(gExpertMedClass[j]) >= 0) {
              medClass = j;//gExpertMedClass.length - j -1;
              break;
            }
          }
        }
  
        if (medClass >= 0)
          break;
      }
      if (medClass < 0)
        return "blue";
      else
        return gExpColRange(gExpertMedClass[medClass]);
    }
    else
      return "blue";
  }