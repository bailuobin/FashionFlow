$(window).load(function () {
        $(".loader").delay(100).fadeOut("slow");
});
    

$(document).ready(function () {

            $(".navigation .show-user").hide(); $(".navigation .logout").hide();// hide the username and logout label before user login

            var loginDialog, loginForm, signupDialog, signupForm, uploadDialog, uploadForm, 

              // From http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#e-mail-state-%28type=email%29
              emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
              email = $("#email"),
              password = $("#password"),
              allFields = $([]).add(email).add(password),
              tips = $(".validateTips");

            function updateTips(t) {
                tips
                  .text(t)
                  .addClass("ui-state-highlight");
                setTimeout(function () {
                    tips.removeClass("ui-state-highlight", 1500);
                }, 500);
            }

            function checkLength(o, n, min, max) {
                if (o.val().length > max || o.val().length < min) {
                    o.addClass("ui-state-error");
                    updateTips("Length of " + n + " must be between " +
                      min + " and " + max + ".");
                    return false;
                } else {
                    return true;
                }
            }

            function checkRegexp(o, regexp, n) {
                if (!(regexp.test(o.val()))) {
                    o.addClass("ui-state-error");
                    updateTips(n);
                    return false;
                } else {
                    return true;
                }
            }

            /*function addUser() {
                var valid = true;
                allFields.removeClass("ui-state-error");

                valid = valid && checkLength(email, "email", 6, 80);
                valid = valid && checkLength(password, "password", 5, 16);

                valid = valid && checkRegexp(email, /^[a-z]([0-9a-z_\s])+$/i, "Username may consist of a-z, 0-9, underscores, spaces and must begin with a letter.");
                valid = valid && checkRegexp(email, emailRegex, "eg. xxx@xxxxx.com");
                valid = valid && checkRegexp(password, /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9");

                if (valid) {
                    $("#users tbody").append("<tr>" +
                      "<td>" + email.val() + "</td>" +
                      "<td>" + password.val() + "</td>" +
                    "</tr>");
                    dialog.dialog("close");
                }
                return valid;
            }*/

            //building dialog for login
            loginDialog = $("#my-login-dialog-form").dialog({
                autoOpen: false,
                height: 450,
                width: 600,
                modal: true,
                /*buttons: {
                    "Submit": addUser,
                    Cancel: function () {
                        dialog.dialog("close");
                    }
                },*/
                close: function () {
                    loginForm[0].reset();
                    allFields.removeClass("ui-state-error");
                }
            });

            loginForm = loginDialog.find("form").on("submit", function (event) {
                event.preventDefault();
                //addUser();
            });

            $(".navigation .login").click(function () {
                loginDialog.dialog("open");
            }); 

            $(".navigation-s .login").click(function () {
                loginDialog.dialog("open");
            }); 


            //building dialog for sign up
            signupDialog = $("#my-signup-dialog-form").dialog({
                autoOpen: false,
                height: 500,
                width: 600,
                modal: true,
                /*buttons: {
                    "Submit": addUser,
                    Cancel: function () {
                        dialog.dialog("close");
                    }
                },*/
                close: function () {
                    signupForm[0].reset();
                    allFields.removeClass("ui-state-error");
                }
            });

            signupForm = signupDialog.find("form").on("submit", function (event) {
                event.preventDefault();
                //addUser();
            });

            $(".navigation .sign-up").click(function () {
                signupDialog.dialog("open");
            }); 

            $(".navigation-s .sign-up").click(function () {
                signupDialog.dialog("open");
            }); 


            //building dialog for sign up
            uploadDialog = $("#my-upload-dialog-form").dialog({
                autoOpen: false,
                height: 1300,
                width: 900,
                modal: true,
                /*buttons: {
                    "Submit": addUser,
                    Cancel: function () {
                        dialog.dialog("close");
                    }
                },*/
                close: function () {
                    uploadForm[0].reset();
                    allFields.removeClass("ui-state-error");
                }
            });

            uploadForm = uploadDialog.find("form").on("submit", function (event) {
                event.preventDefault();
                //addUser();
            });

            $(".ongoing-general .upload").click(function () {
                uploadDialog.dialog("open");
            }); 

            $(".upload-feature-container .cancel-btn").click(function () {
                uploadDialog.dialog("close");
            }); 


            $(".navigation .show-user").click(function (){

                var currentPath = document.URL;
                window.location.href = currentPath + 'account.html';

            });

            $(".ongoing-general .triangle-up").hide();
            $(".history-general .triangle-up").hide();

            

            



});

//to limit input to only numbers
function numbersonly(myfield, e, dec)
            {
                var key;
                var keychar;

                if (window.event)
                   key = window.event.keyCode;
                else if (e)
                   key = e.which;
                else
                   return true;
                keychar = String.fromCharCode(key);

                // control keys
                if ((key==null) || (key==0) || (key==8) || 
                    (key==9) || (key==13) || (key==27) )
                   return true;

                // numbers
                else if ((("0123456789").indexOf(keychar) > -1))
                   return true;

                // decimal point jump
                else if (dec && (keychar == "."))
                   {
                   myfield.form.elements[dec].focus();
                   return false;
                   }
                else
                   return false;
            }