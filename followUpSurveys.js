function sendForm(e){

  // Retreieve values from form/spreadsheet on submission
  var lastName = formatName(e.values[1]);
  var firstName = formatName (e.values[2]);
  var userEmail = e.values[3];
  var reasonForVisit = e.values[5];
  var advisor = e.values[4];
  
  //load pre-saved survey HTML. Get the raw html by sending the form to yourself and viewing source
  var survey = HtmlService.createTemplateFromFile('survey').evaluate().getContent();
  
  //Format email
  var subject = "Office Visit Follow Up";
  if(reasonForVisit == "Academic Advisor Walk-In (Only available during set times)" 
     ||reasonForVisit == "Peer Advising Walk-In (Only available during set times)" 
     ||reasonForVisit == "Advising Appointment (If you are signing in for a schedule appointment)"){
    
    var message = "Hi " + firstName +" "+lastName+ ",\nThank you for coming in today. We are conducting this survey to improve and take note of our service.\nAll responses are sent to Director [REDACTED].\n\nPlease let us know how are we doing by answering the following questions.\nThank You!\n\n\nSome entries have been pre-filled for your convenience";
    survey = prefillSurvey(survey, firstName, lastName, userEmail, advisor,reasonForVisit, message);
    
    var email = {to:userEmail,subject:subject,body:message,htmlBody:survey};
    Logger.log(email);
    MailApp.sendEmail (email);
  }
}

function prefillSurvey(surveyHTML, firstName, lastName, email, advisor, reasonForVisit, message){
  //Form input text entry value IDs (retrieved from follow-up form HTML) corresponding to the entries to be filled
  var firstNameID = "1937989195";
  var lastNameID = "1120993648";
  var emailID = "1799182697";
  var advisorID = "1903118004";
  var reasonID = "377493817";
  
  var originalURL ="https://docs.google.com/forms/d/e/[REDACTED]"
  var baseURL = originalURL.split("?")[0];
  var personalizedLink = '?entry.'+firstNameID+'='+firstName+'&entry.'+lastNameID+'='+lastName+'&entry.'+emailID+'='+email+'&entry.'+advisorID+'='+advisor.split(' ').join('+')+'&entry.'+reasonID+'='+reasonForVisit.split(' ').join('+');
  
  //Go through html line by line, find text entry inputs, replace/fill the values
  var lines = surveyHTML.split('\n');
  for(i=0; i<lines.length; i++){
    line = lines[i];
    if(line.indexOf("input type=")>=0){
      if(line.indexOf("text")>=0){
        var splitPoint = line.indexOf('value="')+ 'value="'.length;
        if (line.indexOf(firstNameID) >= 0){
          lines[i] = line.substring(0,splitPoint) + firstName + line.substring(splitPoint); //string.replace() 
        }
        if (line.indexOf(lastNameID) >= 0){
          lines[i] = line.substring(0,splitPoint) + lastName + line.substring(splitPoint);
        }
        if (line.indexOf(emailID) >= 0){
          lines[i] = line.substring(0,splitPoint) + email + line.substring(splitPoint);
        }
        if (line.indexOf(reasonID) >= 0){
          lines[i] = line.substring(0,splitPoint) + reasonForVisit + line.substring(splitPoint);
        }
      }
      if(line.indexOf("radio")>=0){
        if (line.indexOf(advisor) >= 0){
          lines[i] = lines[i].replace('></span>','checked = "checked"></span>');
        }
      }
    }
    if (line.indexOf("I&#39;ve ") >= 0){
      lines[i] = lines[i].replace('I&#39;ve invited you to fill out a form:',message);
    }
  }
  lines[0] = lines[0].replace(originalURL, baseURL+personalizedLink);
  return lines.join("\n");
    
}
function formatName(s){
  return s[0].toUpperCase() + s.slice(1).toLowerCase();
}
