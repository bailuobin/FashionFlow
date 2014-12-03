
app.controller(
    "LoginCtrl",  
    [ "$scope", "$http", "$location", "$route", "$window", function ($scope, $http, $location, $route, $window ) {
        console.log("Hello From LoginController");
        //$scope.message = "Hello World From Controller";

        $http.get('/get_current_user').
            success(function(response){
                $scope.currentUser = response;
                var currentUsername = $scope.currentUser.username;
                var currentID = $scope.currentUser._id;
                //alert(currentID);
                //if login success, change the look of navigation
                if(!(currentID === undefined)){
                    $(function (){
                        $(".navigation .login").hide();
                        $(".navigation .sign-up").hide();
                        $(".navigation .show-user").show();
                        $(".navigation .show-user").text("Hello, " + currentUsername);
                    });
                }
                
        });



        
        


        

        $scope.login = function () {
            $http.post("/login", $scope.userLogin)
            .success(function (response) {

                //$location.path('/hello');
                //$route.reload();

                if(response == "loginSuccess"){
                    $http.get('/get_current_user').
                    success(function(response){
                        $scope.currentUser = response;
                        //alert($scope.currentUser.username);
                    });

                    var currentPath = document.URL;
                    $window.location.href = currentPath;

                }else{
                    $scope.hintForLogin = "Username or Password not correct.";
                }


            });
        };

        $scope.signup = function () {
            if($scope.userSignup.password != $scope.cpassword){
                $scope.hintForSignup = "The passwords you entered twice are different";
            }else{


                $http.post("/signup", $scope.userSignup)
                .success(function (response) {

                    //if signup success, do a login function
                    $scope.userLogin = response;
                    $scope.login();
                });
            }
        };



        $scope.renderServiceClients = function (response) {
            $scope.serviceClients = response;
        };

        $scope.all = function () {
            //get all
            $http.get("/applications").success($scope.renderServiceClients);
        };

        $scope.create = function () {
            $http.post("/applications", $scope.currentServiceClient)
            .success(function (response) {
                $scope.all();
            });
        };


        $scope.remove = function (id) {
            $http.delete("/applications/" + id)
            .success(function (response) {
                $scope.all();
            });
        };


        $scope.select = function (id) {

            console.log(id);

            $http.get("/applications/" + id)
            .success(function (response) {
                $scope.currentServiceClient = response;
                console.log(response);
            });
        };

        $scope.update = function () {
            $http.put("/applications/" + $scope.currentServiceClient._id, $scope.currentServiceClient)
            .success(function (response) {
                $scope.all();
            });
        };











        //$scope.all();


    }]);

