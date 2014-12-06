
app.controller(
    "IndexCtrl",  
    [ "$scope", "$http", "$location", "$route", "$window", function ($scope, $http, $location, $route, $window ) {
        console.log("Hello From IndexCtrl");
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
                        $(".navigation .logout").show();

                        $scope.loadRecentDesigns();
                    });
                }
                
        });

        $scope.loadRecentDesigns = function() {
            $http.get('/load_recent_designs').
            success(function(response){

                var recentDesigns = response;
                console.log(recentDesigns);

                for(i=0; i< recentDesigns.length; i++){

                    if(i <= 8){
                        console.log(recentDesigns[i]);
                        $http.get('/load_current_design/' + recentDesigns[i]).
                        success(function(response){

                            var strContents = response.img.split(' ');
                        
                            imgSRC = strContents[4].substring(4, strContents[4].length - 1);
                            $(".recent-products").append("<img class='item' id=' "+ response._id +" ' src='" + imgSRC + "'></div>");
                            $(".recent-products .item").click(function(){
                                //alert($(this).attr("id"));
                                var currentPath = document.URL;
                                $window.location.href = "design-detail.html?id=" + $(this).attr("id");;
                            });
                        });
                    }
                    
                }
                              
        });
        }
        

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
            if($scope.userSignup.username.length < 50 && $scope.userSignup.password != $scope.cpassword){
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

        $scope.logout = function() {

            $http.get("/logout")
            .success(function(response){

                var currentPath = document.URL;
                $window.location.href = currentPath;
            });
        };

        $scope.goDisplay = function(){
            var currentPath = document.URL;
            $window.location.href = currentPath + "designs-display.html";
        }







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

    }]);


app.controller(
    "UploadCtrl",  
    [ "$scope", "$http", "$location", "$route", "$window", function ($scope, $http, $location, $route, $window ) {
        console.log("Hello From UploadCtrl");
        //$scope.message = "Hello World From Controller";        


        $scope.upload = function(){
            
            $(function (){
                var isImgChoosen = $('.image-choosen').is(":visible");

                //var nameValue = $('.upload-feature-container input[name="name"]').val();

                $scope.designItem.category = $('.upload-feature-container #dropdownMenu1 span:eq(0)').text();
                $scope.designItem.sex = $('.upload-feature-container #dropdownMenu2 span:eq(0)').text();

                //var minPrice = $('.upload-feature-container input[name="min-price"]').val();

                //var timeLeft = $('.upload-feature-container input[name="time-left"]').val();
                if(isImgChoosen && $scope.designItem.name.length > 0 && $scope.designItem.category != 'Choose One' && $scope.designItem.sex != 'Choose One' && $scope.designItem.min_price.length > 0 && $scope.designItem.time_left.length > 0){


                    $scope.designItem.img = $('.image-choosen .image-choosen-preview').css('background');
                    $scope.designItem.designer = $scope.currentUser._id;

                    var dt = new Date();
                    //var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

                    $scope.designItem.dt = dt;

                    $scope.status = "ON_GOING";

                    //$scope.bidBy = [];

                    console.log($scope.designItem);
                    
                    $http.post("/upload", $scope.designItem)
                        .success(function (response) {
                            console.log(response);
                            var currentPath = document.URL;
                            $window.location.href = currentPath;
                    });

                }
                

            });

           

        }
        

    }]);


app.controller(
    "AccountCtrl",  
    [ "$scope", "$http", "$location", "$route", "$window", function ($scope, $http, $location, $route, $window ) {
        console.log("Hello From AccountCtrl");
        //$scope.message = "Hello World From Controller";        

        //check login status
        $http.get('/get_current_user').
            success(function(response){
                $scope.currentUser = response;
                var currentUsername = $scope.currentUser.username;
                var currentID = $scope.currentUser._id;

                //alert(currentID);
                //if login success, change the look of navigation
                if(!(currentID === undefined)){
                    $(function (){
                        $(".navigation-s .username-label-s").text(currentUsername);
                    });
                }
                
        });

        

        $scope.goDesignerPage = function() {
            var currentPath = document.URL;
            $window.location.href = currentPath.substring(0, currentPath.length - 5) + "-designer.html";
            
            //alert(currentPath);
            //$window.location.href = currentPath + '-designer';
        }

        $scope.goBuyerPage = function() {
            var currentPath = document.URL;
            $window.location.href = currentPath.substring(0, currentPath.length - 5) + "-buyer.html";
        }

        

    }]);

app.controller(
    "Account-DesignerCtrl",  
    [ "$scope", "$http", "$location", "$route", "$window", function ($scope, $http, $location, $route, $window ) {
        console.log("Hello From Account-DesignerCtrl");
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
                        $(".navigation-s .username-label-s").text(currentUsername);

                        $scope.load_selling_designs($scope.currentUser._id);

                    });
                }
                
        });

        //load the designItems that are selling by the designer
        $scope.load_selling_designs = function(id){
            $http.get('/load_selling_designs/' + id).
            success(function(response){
                console.log(response);
                $scope.results = response;
                if( $scope.results.length%5 == 0){
                    lineNumForItemsDisplay = parseInt($scope.results.length/5);
                }else{
                    lineNumForItemsDisplay = parseInt($scope.results.length/5) + 1;
                }
                $scope.itemsHeight = lineNumForItemsDisplay * (257 + 5);



                $(function (){
                        //console.log($scope.results.length);
                        for (i = 0; i < $scope.results.length; i++){

                            var strContents = $scope.results[i].img.split(' ');
                            imgSRC = strContents[4].substring(4, strContents[4].length - 1);

                            $(".ongoing-general .items").append("<img class='item' id=' "+ $scope.results[i]._id +" ' src='" + imgSRC + " '></div>");

                        }

                        $(".ongoing-general .items .item").click(function(){
                            //alert($(this).attr("id"));
                            var currentPath = document.URL;
                            $window.location.href = currentPath.substring(0, currentPath.length - 21) + "design-detail.html?id=" + $(this).attr("id");;
                        });

                    });
            });
        };


        $scope.expandItemsOnGoing = function() {
            $(function() {
                $( ".ongoing-general .items" ).animate({
                          height: $scope.itemsHeight
                        }, 1000, callback);
             
                function callback() {
                  
                    $(".ongoing-general .triangle").hide();
                    $(".ongoing-general .see-more").text("                        ");
                    $(".ongoing-general .triangle-up").show();

                }
            });
        }

        $scope.collapseItemsOnGoing = function() {
            $(function() {
                $( ".ongoing-general .items" ).animate({
                          height: 257
                        }, 1000, callback);
             
                function callback() {
                  
                    $(".ongoing-general .triangle").show();
                    $(".ongoing-general .see-more").text("See More");
                    $(".ongoing-general .triangle-up").hide();

                }
            });
        }

        $scope.Home = function() {
            var currentPath = document.URL;
            $window.location.href = currentPath.substring(0, currentPath.length - 21);
        }

        $scope.goBuyerPage = function() {
            var currentPath = document.URL;
            $window.location.href = currentPath.substring(0, currentPath.length - 14) + "-buyer.html";
        }

        

    }]);

app.controller(
    "Account-BuyerCtrl",  
    [ "$scope", "$http", "$location", "$route", "$window", function ($scope, $http, $location, $route, $window ) {
        console.log("Hello From Account-BuyerCtrl");
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
                        $(".navigation-s .username-label-s").text(currentUsername);
                    });
                }
                
        });

        $scope.goDesignerPage = function() {
            var currentPath = document.URL;
            $window.location.href = currentPath.substring(0, currentPath.length - 11) + "-designer.html";
            
            //alert(currentPath);
            //$window.location.href = currentPath + '-designer';
        }

        

    }]);

app.controller(
    "DesignDetailCtrl",  
    [ "$scope", "$http", "$location", "$route", "$window", function ($scope, $http, $location, $route, $window ) {
        console.log("Hello From DesignDetailCtrl");
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
                        $(".navigation-s .username-label").text(currentUsername);
                        var query = window.location.search;
                        $scope.currentDesignId = query.split('%20')[1];
                        //alert(currentDesignId);
                        $scope.getCurrentDesign($scope.currentDesignId);
                    });
                }
                
        });


        $scope.getCurrentDesign = function(id){


            $http.get('/load_current_design/' + id).
            success(function(response){
                var currentDesign = response;

                if(!(currentDesign._id === undefined)){
                    $(function (){

                        if(currentDesign.designer == $scope.currentUser._id){
                            $('.stuff-to-hide-bidding').hide();
                        }

                        console.log(currentDesign.img);
                        var strContents = currentDesign.img.split(' ');
                        
                        imgSRC = strContents[4].substring(4, strContents[4].length - 1);
                        console.log(imgSRC);
                        $(".detail .preview").attr("src", imgSRC);
                        var dt = new Date(currentDesign.dt);
                        //console.log(dt);
                        dt.setHours(dt.getHours() + parseInt(currentDesign.time_left));
                        //console.log(dt);
                        $(".detail .control .time-left").text(dt);
                        $(".detail .control .minimum").text("$ " + currentDesign.min_price);
                        $scope.getAndSetUsernameById(currentDesign.current_winner);//it will set the current-winner ui, too
                        //console.log($scope.currentWinner);
                        //$(".detail .control .current-winner").text($scope.currentWinner);
                        $(".detail .description p").text(currentDesign.discription);



                    });
                }
                
        });
        }

        $scope.bid = function(){
            $(function (){
                var currentMin = $(".detail .control .minimum").text().substring(2);
                var currentWinner = $(".detail .control .current-winner").text();
                if( currentWinner == $scope.currentUser.username ){
                    $scope.hintForBidding = "You are the curernt Winner!"
                }else if(parseInt($scope.yourBid) > parseInt(currentMin)){
                    //alert("success");

                    $scope.objToSendToBid = {userId:"", yourBid: "", currentMin: ""};
                    $scope.objToSendToBid.userId =  $scope.currentUser._id;
                    $scope.objToSendToBid.yourBid = $scope.yourBid;
                    $scope.objToSendToBid.currentMin = currentMin;

                    console.log($scope.objToSendToBid);

                    $http.put("/bid/" + $scope.currentDesignId, $scope.objToSendToBid)
                    .success(function (response) {
                        //console.log(response);
                        
                        $scope.getCurrentDesign($scope.currentDesignId);

                    });
                }
            });
            
        }

        $scope.getAndSetUsernameById = function(id){
            $http.get('/get_username/' + id).
            success(function(response){
                    $scope.currentWinner = response;
                    $(function (){
                            $(".detail .control .current-winner").text($scope.currentWinner);
                    });
                    //console.log($scope.currentWinner);
            });
        }



        $scope.goAccount = function(){
            var currentPath = document.URL;
            var query = window.location.search;
            $window.location.href = currentPath.substring(0, currentPath.length - 18 - query.length) + "account.html";
        }

        

        

    }]);




app.controller(
    "DesignsDisplayCtrl",  
    [ "$scope", "$http", "$location", "$route", "$window", function ($scope, $http, $location, $route, $window ) {
        console.log("Hello From DesignDetailCtrl");
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
                        $(".navigation-s .username-label").text(currentUsername);
                        $scope.loadDefaultDesigns();
                    });
                }
                
        });


        $scope.loadDefaultDesigns = function(id){


            $http.get('/load_designs_default').
            success(function(response){
                var designsDefault = response;

                console.log(designsDefault);
                for(i=0; i< designsDefault.length; i++){
                        //console.log(designsDefault[i]);
                        //$(".products").append("<div class='item' id=' "+ designsDefault[i]._id +" ' style='background: " + designsDefault[i].img + " ;'></div>");
                        var strContents = designsDefault[i].img.split(' ');
                        
                        imgSRC = strContents[4].substring(4, strContents[4].length - 1);
                        //console.log(imgSRC);
                        $(".products").append("<img class='item' id=' "+ designsDefault[i]._id +" ' src='" + imgSRC + " '>");
                        $(".products .item").click(function(){
                            //alert($(this).attr("id"));
                            var currentPath = document.URL;
                            $window.location.href = "design-detail.html?id=" + $(this).attr("id");;
                        });
                                     
                }
            });
        }

        $scope.bid = function(){
            $(function (){
                var currentMin = $(".detail .control .minimum").text().substring(2);
                var currentWinner = $(".detail .control .current-winner").text();
                if( currentWinner == $scope.currentUser.username ){
                    $scope.hintForBidding = "You are the curernt Winner!"
                }else if(parseInt($scope.yourBid) > parseInt(currentMin)){
                    //alert("success");

                    $scope.objToSendToBid = {userId:"", yourBid: "", currentMin: ""};
                    $scope.objToSendToBid.userId =  $scope.currentUser._id;
                    $scope.objToSendToBid.yourBid = $scope.yourBid;
                    $scope.objToSendToBid.currentMin = currentMin;

                    console.log($scope.objToSendToBid);

                    $http.put("/bid/" + $scope.currentDesignId, $scope.objToSendToBid)
                    .success(function (response) {
                        //console.log(response);
                        
                        $scope.getCurrentDesign($scope.currentDesignId);

                    });
                }
            });
            
        }

        $scope.getAndSetUsernameById = function(id){
            $http.get('/get_username/' + id).
            success(function(response){
                    $scope.currentWinner = response;
                    $(function (){
                            $(".detail .control .current-winner").text($scope.currentWinner);
                    });
                    //console.log($scope.currentWinner);
            });
        }



        $scope.goAccount = function(){
            var currentPath = document.URL;
            $window.location.href = currentPath.substring(0, currentPath.length - 20) + "account.html";
        }

        

        

    }]);

