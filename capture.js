const { exec } = require("child_process");
var fs = require("fs");
var files = fs.readdirSync("./default_templates/");

// //itr1
// var dir = "./Screenshots";

//itr2
// var files = [
//   "_candidate_accreditation_evaluation_started.json",
//   "_learner_rein_quest_not_started.json",
//   "_learner_series_module_moved.json",
//   "_template_club_email.json",
//   "_um_series_module_invitation.json",
//   "_vos_admin__record_slide_task_multiple_slideshow_multiple_admin_multiple_type_submitted.json",
//   "_vos_admin_record_slide_multiple_slideshow_single_admin_record_only_submitted.json",
//   "_vos_admin_record_slide_single_slide_single_admin_record_only_declined.json",
//   "_vos_admin_record_slide_submitted.json",
//   "_vos_admin_record_slide_task_single_admin_multiple_slideshow_upload_record_submitted.json",
//   "_vos_admin_record_slide_task_single_admin_upload_record_submitted.json",
//   "_vos_new_slide_record_assignment.json",
//   "_vos_slide_learner_upload_record_re_record.json",
//   "_vos_slide_multiple_admin_multiple_slideshow_multiple_type_approved.json",
//   "_vos_slide_record_multiple_admins_multiple_slideshow_multiple_type_submission_pending.json",
//   "_vos_slide_record_only_re_record.json",
//   "_vos_slide_record_single_admin_multiple_slideshow_multiple_type_submission_pending.json",
//   "_vos_slide_record_single_slideshow_submission_pending.json",
//   "_vos_slide_single_admin_multiple_slideshow_multiple_type_approved.json",
//   "_vos_slide_single_slideshow_record_only_approved.json",
//   "_vos_slide_single_slideshow_upload_record_approved.json"
// ];

// var dir = "./ScreenshotsItr2";

//itr3
// var files = [
//   "_learner_series_module_moved.json",
//   "_um_series_module_invitation.json"
// ];
// var dir = "./ScreenshotsItr3";

//final shots
var dir = "./FinalShots";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

console.time("takeShots");
let i = 0;
takeShots = () => {
  if (i == files.length) {
    console.log("job completed! processed number of file: ", i);
    console.timeEnd("takeShots");
    return;
  }
  let onlyName = files[i].split(".")[0];
  let url = `/Users/dileep/.nvm/versions/node/v9.0.0/bin/pageres http://localhost:8000/tiny5.html\?template\=${onlyName} 1280x800 --format=jpg --filename="${dir}/${onlyName}"`;
  console.log("processing file ...", i + 1);
  exec(url, (error, stdout, stderr) => {
    console.log("processed file", i + 1);
    if (!error && !stderr) {
      console.log(`stdout: ${stdout}`);
      i++;
      takeShots();
    } else {
      console.log(`error for file: ${onlyName}`);
    }
  });
};

takeShots();
