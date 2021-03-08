var fs = require("fs");
var files = fs.readdirSync("./default_templates/");
var REGEX = {
  EJS_OP_VAR: "[\\s]*[a-zA-Z.0-9[\\]]*[\\s]*",
  DOLLOR_VAR: "([^$]*)?",
  HASH:"([A-Za-z0-9._]+)",
  EJS_NO_OP_VAR: "[^=]((?!%>).)*"
};

for (let i = 0; i < files.length; i++) {
  fs.readFile(`./default_templates/${files[i]}`, "utf-8", (err, content) => {
    if (err) console.log("error for file :", files[i], "error: ", err);

    var variableMapper = {};
    function addToVariableMap(variable, readable) {
      variableMapper[variable] = readable;
    }

    // var matchesEjsVar = content.match(
    //   new RegExp("<%=" + REGEX.EJS_OP_VAR + "%>", "g")
    // );
    // if (matchesEjsVar) {
    //   matchesEjsVar.forEach(function (match) {
    //     var newVar = match.slice(3, match.length - 2);
    //     addToVariableMap(newVar, newVar);
    //     // console.log("match", match);
    //   });
    // }

    var matchesDollarVars = content.match(
      new RegExp("#" + REGEX.HASH + "#", "g")
    );
    if (matchesDollarVars) {
      matchesDollarVars.forEach(function (match) {
        var newVar = match.slice(1, match.length - 1);
        addToVariableMap(newVar, newVar);
        // console.log("match", match);
      });
    }

    data = Object.keys(variableMapper).toString().replace(/,/g, "\t");

    console.log("writing for : ", files[i]);
    fs.appendFileSync("temp.txt", `${files[i]}\t`);
    fs.appendFileSync("temp.txt", data, (err) => {
      if (err) console.log("error while writing: ", err);
      console.log("Successfully Written to File.");
    });
    fs.appendFileSync("temp.txt", "\n");
  });
}


