
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

                        //$scope.loadRecentDesigns();
                    });
                }else{
                    //$scope.loadRecentDesigns();
                }

                
        });



        $scope.loadRecentDesigns = function() {
            $http.get('/load_recent_designs').
            success(function(response){

                var recentDesigns = response;
                //console.log(recentDesigns);
                $scope.recentDesigns = [];

                for(i=0; i< recentDesigns.length; i++){

                    if(i <= 8){
                        //console.log(recentDesigns[i]);
                        $http.get('/load_design_by_id/' + recentDesigns[i]).
                        success(function(response){

                            if(!response.err){
                                var strContents = response.img.split(' ');
                        
                                imgSRC = strContents[4].substring(4, strContents[4].length - 1);

                                $scope.recentDesigns.push({ id: response._id , img: imgSRC , name:response.name});
                            }

                            


                           


                            

                        });
                    }
                    
                }
                              
            });
        }



        $scope.loadRecentDesigns();

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

        $scope.loginWithFacebook = function (){
            $http.get("/auth/facebook")
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
        }

        $scope.signup = function () {

            emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

            if(!$scope.userSignup || !$scope.userSignup.username || !$scope.userSignup.password||  !$scope.cpassword ){
                $scope.hintForSignup = "All fields need to be filled";
            }else if($scope.userSignup.username.length > 50){
                $scope.hintForSignup = "Username should be shorter than 50 characters";
            }else if(!emailRegex.test($scope.userSignup.username)){
                $scope.hintForSignup = "Your username should be an valid email address";
            }else if( $scope.userSignup.password != $scope.cpassword ){
                $scope.hintForSignup = "The passwords you entered twice are different";
            }else{


                $http.post("/signup", $scope.userSignup)
                .success(function (response) {
                    
                    if(response.err){
                        $scope.hintForSignup = "The username already exists. Please choose another one."
                    }else{
                        //console.log(response);
                        $scope.userLogin = response;
                        $scope.login();
                    }
                    //if signup success, do a login function
                    //$scope.userLogin = response;
                    //$scope.login();
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

        $scope.goSearch = function(){
            var currentPath = document.URL;
            $window.location.href = currentPath + "designs-display.html?query=" + $scope.searchQuery;
        }


        $scope.goDisplay = function(){
            var currentPath = document.URL;
            $window.location.href = currentPath + "designs-display.html";
        }

        $scope.goItem = function(id){
            var currentPath = document.URL;
            $window.location.href = "design-detail.html?id=" + id;

        }









        

        // $scope.remove = function (id) {
        //     $http.delete("/applications/" + id)
        //     .success(function (response) {
        //         $scope.all();
        //     });
        // };


        
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
                    $scope.designItem.designer_username = $scope.currentUser.username;
                    

                    var dt = new Date();
                    //var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
                    $scope.designItem.dt = dt ;

                    $scope.designItem.status = "ON_GOING";

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
                        $scope.loadOnGoing();
                        $scope.loadHistory();
                    });
                }
                
        });



        $scope.loadOnGoing = function(){
            $http.get('/load_ongoing/' + $scope.currentUser._id).
            success(function(response){
                //console.log(response);
                var sellingItems = response[0].selling_designs;
                if(sellingItems == undefined){
                    sellingItems = []
                }
                console.log(sellingItems);

                var biddingItems = response[0].bidding_designs;
                if(biddingItems == undefined){
                    biddingItems = []
                }
                console.log(biddingItems);

                var waitForPayItems = response[0].wait_for_pay_designs;
                if(waitForPayItems == undefined){
                    waitForPayItems = []
                }
                console.log(waitForPayItems);

                onGoingItemIDS = sellingItems.concat(biddingItems).concat(waitForPayItems);

                console.log(onGoingItemIDS);

                //calculate line numbers
                if( onGoingItemIDS.length%5 == 0){
                    lineNumForItemsDisplay = parseInt(onGoingItemIDS.length/5);
                }else{
                    lineNumForItemsDisplay = parseInt(onGoingItemIDS.length/5) + 1;
                }

                if(lineNumForItemsDisplay == 1){
                    $( ".ongoing-general .see-more-stuff" ).hide();
                }else{
                    $( ".ongoing-general .see-more-stuff" ).show();
                    $scope.itemsHeight = lineNumForItemsDisplay * (257 + 5);
                }
                

                $scope.onGoingItems = [];
                $(function (){
                        //console.log($scope.results.length);
                        for (i = 0; i < onGoingItemIDS.length; i++){

                            $http.get('/load_design_by_id/' + onGoingItemIDS[i]).
                            success(function(response){
                                var strContents = response.img.split(' ');
                                imgSRC = strContents[4].substring(4, strContents[4].length - 1);

                                $scope.onGoingItems.push({id: response._id, img: imgSRC});

                            });

                            
                        }

                        

                });


            });
        }

        $scope.loadHistory = function(){
            $http.get('/load_ongoing/' + $scope.currentUser._id).
            success(function(response){
                //console.log(response);
                var boughtItems = response[0].bought_designs;
                if(boughtItems == undefined){
                    boughtItems = []
                }
                console.log(boughtItems);

                var soldItems = response[0].sold_designs;
                if(soldItems == undefined){
                    soldItems = []
                }
                console.log(soldItems);

                historyItemIDS = boughtItems.concat(soldItems);

                console.log(historyItemIDS);

                //calculate line numbers
                if( historyItemIDS.length%5 == 0){
                    lineNumForItemsDisplay = parseInt(historyItemIDS.length/5);
                }else{
                    lineNumForItemsDisplay = parseInt(historyItemIDS.length/5) + 1;
                }
                if(lineNumForItemsDisplay == 1){
                    $( ".history-general .see-more-stuff" ).hide();
                }else{
                    $( ".history-general .see-more-stuff" ).show();
                    $scope.itemsHeight = lineNumForItemsDisplay * (257 + 5);
                }
                

                $scope.historyItems = [];
                $(function (){
                        //console.log($scope.results.length);
                        for (i = 0; i < historyItemIDS.length; i++){

                            $http.get('/load_design_by_id/' + historyItemIDS[i]).
                            success(function(response){
                                var strContents = response.img.split(' ');
                                imgSRC = strContents[4].substring(4, strContents[4].length - 1);

                                $scope.historyItems.push({id: response._id, img: imgSRC});

                            });

                            
                        }

                        

                });


            });
        }

        $scope.expandItemsOnGoing = function() {
            $(function() {
                $( ".ongoing-general .items" ).animate({
                          height: $scope.itemsHeight
                        }, 500, callback);
             
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
                        }, 500, callback);
             
                function callback() {
                  
                    $(".ongoing-general .triangle").show();
                    $(".ongoing-general .see-more").text("See More");
                    $(".ongoing-general .triangle-up").hide();

                }
            });
        }

        $scope.expandItemsHistory = function() {
            $(function() {
                $( ".history-general .items" ).animate({
                          height: $scope.itemsHeight
                        }, 500, callback);
             
                function callback() {
                  
                    $(".history-general .triangle").hide();
                    $(".history-general .see-more").text("                        ");
                    $(".history-general .triangle-up").show();

                }
            });
        }

        $scope.collapseItemsHistory = function() {
            $(function() {
                $( ".history-general .items" ).animate({
                          height: 257
                        }, 500, callback);
             
                function callback() {
                  
                    $(".history-general .triangle").show();
                    $(".history-general .see-more").text("See More");
                    $(".history-general .triangle-up").hide();

                }
            });
        }

        $scope.goItem = function(id){
            var currentPath = document.URL;
            $window.location.href = currentPath.substring(0, currentPath.length - 12) + "design-detail.html?id=" + id;

        }


        

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

        $scope.Home = function() {
            var currentPath = document.URL;
            $window.location.href = currentPath.substring(0, currentPath.length - 12);
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

                        $scope.loadSellingDesigns();
                        $scope.loadSoldDesigns();
                    });
                }
                
        });

        $scope.loadSellingDesigns = function(){
            $http.get('/load_ongoing/' + $scope.currentUser._id).
            success(function(response){
                //console.log(response);
                var sellingItems = response[0].selling_designs;
                if(sellingItems == undefined){
                    sellingItems = []
                }
                console.log(sellingItems);

                onGoingItemIDS = sellingItems;

                console.log(onGoingItemIDS);

                //calculate line numbers
                if( onGoingItemIDS.length%5 == 0){
                    lineNumForItemsDisplay = parseInt(onGoingItemIDS.length/5);
                }else{
                    lineNumForItemsDisplay = parseInt(onGoingItemIDS.length/5) + 1;
                }
                if(lineNumForItemsDisplay <= 1){
                    $( ".ongoing-general .see-more-stuff" ).hide();
                }else{
                    $( ".ongoing-general .see-more-stuff" ).show();
                    $scope.itemsHeight = lineNumForItemsDisplay * (257 + 5);
                }

                $scope.onGoingItems = [];
                $(function (){
                        //console.log($scope.results.length);
                        for (i = 0; i < onGoingItemIDS.length; i++){

                            $http.get('/load_design_by_id/' + onGoingItemIDS[i]).
                            success(function(response){
                                var strContents = response.img.split(' ');
                                imgSRC = strContents[4].substring(4, strContents[4].length - 1);

                                $scope.onGoingItems.push({id: response._id, img: imgSRC});

                            });

                            
                        }

                        

                });


            });
        }

        $scope.loadSoldDesigns = function(){
            $http.get('/load_ongoing/' + $scope.currentUser._id).
            success(function(response){
                //console.log(response);

                var soldItems = response[0].sold_designs;
                if(soldItems == undefined){
                    soldItems = []
                }
                console.log(soldItems);

                historyItemIDS = soldItems;

                console.log(historyItemIDS);

                //calculate line numbers
                if( historyItemIDS.length%5 == 0){
                    lineNumForItemsDisplay = parseInt(historyItemIDS.length/5);
                }else{
                    lineNumForItemsDisplay = parseInt(historyItemIDS.length/5) + 1;
                }
                if(lineNumForItemsDisplay <= 1){
                    $( ".history-general .see-more-stuff" ).hide();
                }else{
                    $( ".history-general .see-more-stuff" ).show();
                    $scope.itemsHeight = lineNumForItemsDisplay * (257 + 5);
                }
                

                $scope.historyItems = [];
                $(function (){
                        //console.log($scope.results.length);
                        for (i = 0; i < historyItemIDS.length; i++){

                            $http.get('/load_design_by_id/' + historyItemIDS[i]).
                            success(function(response){
                                var strContents = response.img.split(' ');
                                imgSRC = strContents[4].substring(4, strContents[4].length - 1);

                                $scope.historyItems.push({id: response._id, img: imgSRC});

                            });

                            
                        }

                        

                });


            });
        }




        $scope.expandItemsOnGoing = function() {
            $(function() {
                $( ".ongoing-general .items" ).animate({
                          height: $scope.itemsHeight
                        }, 500, callback);
             
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
                        }, 500, callback);
             
                function callback() {
                  
                    $(".ongoing-general .triangle").show();
                    $(".ongoing-general .see-more").text("See More");
                    $(".ongoing-general .triangle-up").hide();

                }
            });
        }

        $scope.expandItemsHistory = function() {
            $(function() {
                $( ".history-general .items" ).animate({
                          height: $scope.itemsHeight
                        }, 500, callback);
             
                function callback() {
                  
                    $(".history-general .triangle").hide();
                    $(".history-general .see-more").text("                        ");
                    $(".history-general .triangle-up").show();

                }
            });
        }

        $scope.collapseItemsHistory = function() {
            $(function() {
                $( ".history-general .items" ).animate({
                          height: 257
                        }, 500, callback);
             
                function callback() {
                  
                    $(".history-general .triangle").show();
                    $(".history-general .see-more").text("See More");
                    $(".history-general .triangle-up").hide();

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


        $scope.goItem = function(id){
            var currentPath = document.URL;
            $window.location.href = currentPath.substring(0, currentPath.length - 21) + "design-detail.html?id=" + id;

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
                        $scope.loadSumOfShopCart();
                        $scope.loadBiddingDesigns();
                        $scope.loadBoughtDesigns();
                    });
                }
                
        });

        $scope.loadSumOfShopCart = function(){
            $http.get('/load_shopcart_data/' + $scope.currentUser._id).
            success(function(response){
                $(function (){
                    $(".shopping-cart .container .items").text(response.length);                   
                });
            });
        }


        $scope.loadBiddingDesigns = function(){
            $http.get('/load_ongoing/' + $scope.currentUser._id).
            success(function(response){
                //console.log(response);
                var biddingDesigns = response[0].bidding_designs;
                if(biddingDesigns == undefined){
                    biddingDesigns = []
                }
                console.log(biddingDesigns);

                onGoingItemIDS = biddingDesigns;

                console.log(onGoingItemIDS);

                //calculate line numbers
                if( onGoingItemIDS.length%5 == 0){
                    lineNumForItemsDisplay = parseInt(onGoingItemIDS.length/5);
                }else{
                    lineNumForItemsDisplay = parseInt(onGoingItemIDS.length/5) + 1;
                }
                if(lineNumForItemsDisplay <= 1){
                    $( ".ongoing-general .see-more-stuff" ).hide();
                }else{
                    $( ".ongoing-general .see-more-stuff" ).show();
                    $scope.itemsHeight = lineNumForItemsDisplay * (257 + 5);
                }

                $scope.onGoingItems = [];
                $(function (){
                        //console.log($scope.results.length);
                        for (i = 0; i < onGoingItemIDS.length; i++){

                            $http.get('/load_design_by_id/' + onGoingItemIDS[i]).
                            success(function(response){
                                var strContents = response.img.split(' ');
                                imgSRC = strContents[4].substring(4, strContents[4].length - 1);

                                $scope.onGoingItems.push({id: response._id, img: imgSRC});

                            });

                            
                        }

                        

                });


            });
        }

        $scope.loadBoughtDesigns = function(){
            $http.get('/load_ongoing/' + $scope.currentUser._id).
            success(function(response){
                //console.log(response);

                var boughtItems = response[0].bought_designs;
                if(boughtItems == undefined){
                    boughtItems = []
                }
                console.log(boughtItems);

                historyItemIDS = boughtItems;

                console.log(historyItemIDS);

                //calculate line numbers
                if( historyItemIDS.length%5 == 0){
                    lineNumForItemsDisplay = parseInt(historyItemIDS.length/5);
                }else{
                    lineNumForItemsDisplay = parseInt(historyItemIDS.length/5) + 1;
                }
                if(lineNumForItemsDisplay <= 1){
                    $( ".history-general .see-more-stuff" ).hide();
                }else{
                    $( ".history-general .see-more-stuff" ).show();
                    $scope.itemsHeight = lineNumForItemsDisplay * (257 + 5);
                }
                

                $scope.historyItems = [];
                $(function (){
                        //console.log($scope.results.length);
                        for (i = 0; i < historyItemIDS.length; i++){

                            $http.get('/load_design_by_id/' + historyItemIDS[i]).
                            success(function(response){
                                var strContents = response.img.split(' ');
                                imgSRC = strContents[4].substring(4, strContents[4].length - 1);

                                $scope.historyItems.push({id: response._id, img: imgSRC});

                            });

                            
                        }

                        

                });


            });
        }



        $scope.expandItemsOnGoing = function() {
            $(function() {
                $( ".ongoing-general .items" ).animate({
                          height: $scope.itemsHeight
                        }, 500, callback);
             
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
                        }, 500, callback);
             
                function callback() {
                  
                    $(".ongoing-general .triangle").show();
                    $(".ongoing-general .see-more").text("See More");
                    $(".ongoing-general .triangle-up").hide();

                }
            });
        }

        $scope.expandItemsHistory = function() {
            $(function() {
                $( ".history-general .items" ).animate({
                          height: $scope.itemsHeight
                        }, 500, callback);
             
                function callback() {
                  
                    $(".history-general .triangle").hide();
                    $(".history-general .see-more").text("                        ");
                    $(".history-general .triangle-up").show();

                }
            });
        }

        $scope.collapseItemsHistory = function() {
            $(function() {
                $( ".history-general .items" ).animate({
                          height: 257
                        }, 500, callback);
             
                function callback() {
                  
                    $(".history-general .triangle").show();
                    $(".history-general .see-more").text("See More");
                    $(".history-general .triangle-up").hide();

                }
            });
        }

        $scope.goDesignerPage = function() {
            var currentPath = document.URL;
            $window.location.href = currentPath.substring(0, currentPath.length - 11) + "-designer.html";
            
            //alert(currentPath);
            //$window.location.href = currentPath + '-designer';
        }

        $scope.goShoppingCart = function(){
            var currentPath = document.URL;
            var query = window.location.search;
            $window.location.href = currentPath.substring(0, currentPath.length - 18) + "shopping-cart.html";
        }


        $scope.Home = function() {
            var currentPath = document.URL;
            $window.location.href = currentPath.substring(0, currentPath.length - 18);
        }

        $scope.goItem = function(id){
            var currentPath = document.URL;
            $window.location.href = currentPath.substring(0, currentPath.length - 18) + "design-detail.html?id=" + id;

        }

        $scope.logout = function() {

            $http.get("/logout")
            .success(function(response){

                var currentPath = document.URL;
                $window.location.href = currentPath;
            });
        };
        

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
                        $(".navigation-s .shopping-cart").show();
                        $(".navigation-s .sign-up").hide();
                        $(".navigation-s .login").hide();
                        $scope.loadSumOfShopCart();

                    });
                }else{
                    $(".navigation-s .username-label").hide();
                    $(".navigation-s .sign-up").show();
                    $(".navigation-s .login").show();
                    $(".navigation-s .shopping-cart").hide();
                }
                
        });

        $scope.loadSumOfShopCart = function(){
            $http.get('/load_shopcart_data/' + $scope.currentUser._id).
            success(function(response){
                $(function (){
                    $(".shopping-cart .container .items").text(response.length);                   
                });
            });
        }


        $scope.getCurrentDesign = function(id){


            $http.get('/load_design_by_id/' + id).
            success(function(response){
                var currentDesign = response;

                if(!(currentDesign._id === undefined)){
                    $(function (){

                        if(!$scope.currentUser._id){
                            $('.stuff-to-hide-bidding').hide();
                            $scope.hintForBidding = "Login now to get more information!";
                        }

                        if(currentDesign.designer == $scope.currentUser._id){
                            $('.stuff-to-hide-bidding').hide();

                        }


                        
                        //console.log(currentDesign.img);
                        var strContents = currentDesign.img.split(' ');
                        
                        imgSRC = strContents[4].substring(4, strContents[4].length - 1);
                        //console.log(imgSRC);
                        $(".detail .preview").attr("src", imgSRC);
                        var dt = new Date(currentDesign.dt);
                        //console.log(dt);
                        if(currentDesign.time_left == "0"){
                            dt.setMinutes(dt.getMinutes() + 5);
                        }else{
                            dt.setHours(dt.getHours() + parseInt(currentDesign.time_left));
                        }
                        
                        //console.log(dt);
                        $(".detail .control .time-left").text(dt);
                        if(new Date() > new Date(dt)){
                            $('.stuff-to-hide-bidding').hide();
                            if(currentDesign.finally_belong_to == $scope.currentUser._id && $scope.currentUser._id){
                                if(currentDesign.status == "SOLD"){
                                    $scope.hintForBidding = "You bought this Design!";
                                }else{
                                    $scope.hintForBidding = "Waitting For Your Payment";
                                }
                                
                            }else{
                                $scope.hintForBidding = "Bidding Closed";
                            }

                            if(currentDesign.status == "SOLD" && currentDesign.designer == $scope.currentUser._id){
                                    $scope.hintForBidding = "You sold this Design!";
                            }
                        }
                        $(".detail .control .minimum").text("$ " + currentDesign.min_price);
                        $(".detail .control .name").text(currentDesign.name);
                        $scope.getAndSetDesignernameById(currentDesign.designer);
                        if(currentDesign.current_winner){
                            $scope.getAndSetWinnernameById(currentDesign.current_winner);//it will set the current-winner ui, too
                        }
                        
                        //console.log($scope.currentWinner);
                        //$(".detail .control .current-winner").text($scope.currentWinner);
                        $(".detail .description p").text(currentDesign.discription);
                        



                        



                    });
                }
                
            });
        }
        var query = window.location.search;
        if(query.indexOf("%20") > -1){
            $scope.currentDesignId = query.split('%20')[1];
        }else{
            $scope.currentDesignId = query.split('id=')[1];           
        }
        
        //alert(currentDesignId);
        $scope.getCurrentDesign($scope.currentDesignId);

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
                        
                        console.log(response);
                        
                        $scope.getCurrentDesign($scope.currentDesignId);

                        $scope.hintForBidding = "Bid Success!"

                    });
                }
            });
            
        }

        $scope.getAndSetWinnernameById = function(id){
            $http.get('/get_username/' + id).
            success(function(response){
                    $scope.currentWinner = response;
                    $(function (){
                            $(".detail .control .current-winner").text($scope.currentWinner);
                    });
                    //console.log($scope.currentWinner);
            });
        }

        $scope.getAndSetDesignernameById = function(id){
            $http.get('/get_username/' + id).
            success(function(response){
                    $(function (){
                            $(".detail .control .designer").text(response);
                    });
                    //console.log($scope.currentWinner);
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

            emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

            if(!$scope.userSignup || !$scope.userSignup.username || !$scope.userSignup.password||  !$scope.cpassword ){
                $scope.hintForSignup = "All fields need to be filled";
            }else if($scope.userSignup.username.length > 50){
                $scope.hintForSignup = "Username should be shorter than 50 characters";
            }else if(!emailRegex.test($scope.userSignup.username)){
                $scope.hintForSignup = "Your username should be an valid email address";
            }else if( $scope.userSignup.password != $scope.cpassword ){
                $scope.hintForSignup = "The passwords you entered twice are different";
            }else{


                $http.post("/signup", $scope.userSignup)
                .success(function (response) {
                    
                    if(response.err){
                        $scope.hintForSignup = "The username already exists. Please choose another one."
                    }else{
                        //console.log(response);
                        $scope.userLogin = response;
                        $scope.login();
                    }
                    //if signup success, do a login function
                    //$scope.userLogin = response;
                    //$scope.login();
                });
            }
        };



        $scope.goAccount = function(){
            var currentPath = document.URL;
            var query = window.location.search;
            $window.location.href = currentPath.substring(0, currentPath.length - 18 - query.length) + "account.html";
        }

        $scope.Home = function() {
            var currentPath = document.URL;
            var query = window.location.search;
            $window.location.href = currentPath.substring(0, currentPath.length - 18 - query.length);
        }

        $scope.goShoppingCart = function(){
            var currentPath = document.URL;
            var query = window.location.search;
            $window.location.href = currentPath.substring(0, currentPath.length - 18 - query.length) + "shopping-cart.html";
        }

        $scope.searchMen = function(){
            var currentPath = document.URL;
            var query = window.location.search;
            $window.location.href = currentPath.substring(0, currentPath.length - 18 - query.length) + "designs-display.html?query=" + "Men";
            //$window.location.href = currentPath + "designs-display.html?query=" + query;
        }

        $scope.searchWomen = function(){
            var currentPath = document.URL;
            var query = window.location.search;
            $window.location.href = currentPath.substring(0, currentPath.length - 18 - query.length) + "designs-display.html?query=" + "Women";
            //$window.location.href = currentPath + "designs-display.html?query=" + query;
        }

        $scope.searchUni = function(){
            var currentPath = document.URL;
            var query = window.location.search;
            $window.location.href = currentPath.substring(0, currentPath.length -18 - query.length) + "designs-display.html?query=" + "Uni";
            //$window.location.href = currentPath + "designs-display.html?query=" + query;
        }


        

    }]);




app.controller(
    "DesignsDisplayCtrl",  
    [ "$scope", "$http", "$location", "$route", "$window", function ($scope, $http, $location, $route, $window ) {
        console.log("Hello From DesignsDisplayCtrl");
        //$scope.message = "Hello World From Controller";        

        $(function (){
                        $(".left-panel .category-item").click(function(){
                            //alert($(this).attr("id"));
                            var currentPath = document.URL;
                            var query = window.location.search;
                            $window.location.href = currentPath.substring(0, currentPath.length - query.length) + "?query=" + $(this).text();
                        });
                    });

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
                        $(".navigation-s .shopping-cart").show();
                        $(".navigation-s .sign-up").hide();
                        $(".navigation-s .login").hide();
                        $scope.loadSumOfShopCart();
                        
                    });
                }else{
                    $(".navigation-s .username-label").hide();
                    $(".navigation-s .shopping-cart").hide();
                    $(".navigation-s .sign-up").show();
                    $(".navigation-s .login").show();
                }
                
        });

        $scope.loadSumOfShopCart = function(){
            $http.get('/load_shopcart_data/' + $scope.currentUser._id).
            success(function(response){
                $(function (){
                    $(".shopping-cart .container .items").text(response.length);                   
                });
            });
        }

        $scope.loadRecentDesigns = function() {
            $http.get('/load_recent_designs').
            success(function(response){

                if(!response.err){
                    var recentDesigns = response;
                    //console.log(recentDesigns);
                    $scope.recentDesigns = [];

                    for(i=0; i< recentDesigns.length; i++){
                        if(i <= 8){
                            //console.log(recentDesigns[i]);
                            $http.get('/load_design_by_id/' + recentDesigns[i]).
                            success(function(response){

                                var strContents = response.img.split(' ');
                            
                                imgSRC = strContents[4].substring(4, strContents[4].length - 1);

                                $scope.recentDesigns.push({ id: response._id , img: imgSRC , name : response.name});
                            });
                        }                   
                    }
                }                              
            });
        }


        $scope.loadDefaultDesigns = function(){


            $http.get('/load_designs_default').
            success(function(response){
                var designsDefault = response;

                $scope.resultsDesigns = [];

                              
                for(i=0; i< designsDefault.length; i++){
                        
                        var strContents = designsDefault[i].img.split(' ');
                        
                        imgSRC = strContents[4].substring(4, strContents[4].length - 1);
                        //console.log(imgSRC);

                        $scope.resultsDesigns.push({ id: designsDefault[i]._id , img: imgSRC , name:designsDefault[i].name});
                        
                                     
                }
            });
        }

        $scope.loadSearchResults = function(query){

            $http.get('/load_search_results/' + query)
            .success(function(response){
                results = response;
                if(query){
                    var q = query.replace("%20"," ");
                    $(".upper-part .results-of").text("\"" + q + "\"");
                }else{
                    $(".upper-part .results-of").text("all");
                }
                
                $scope.resultsDesigns = [];

                for(i=0; i< results.length; i++){
                        //console.log(results[i].name);
                //         //console.log(designsDefault[i]);
                //         //$(".products").append("<div class='item' id=' "+ designsDefault[i]._id +" ' style='background: " + designsDefault[i].img + " ;'></div>");
                         var strContents = results[i].img.split(' ');
                        
                         imgSRC = strContents[4].substring(4, strContents[4].length - 1);

                         $scope.resultsDesigns.push({ id: results[i]._id , img: imgSRC , name : results[i].name});

                                     
                 }
            });
        }


        $scope.loadDesignsBySex = function(query){

            $http.get('/load_results_by_sex/' + query)
            .success(function(response){
                results = response;
                //var q = query.replace("%20"," ");
                $(".upper-part .results-of").text("\"" + query + "\"");
                
                $scope.resultsDesigns = [];
                for(i=0; i< results.length; i++){
                        //console.log(results[i].name);
                //         //console.log(designsDefault[i]);
                //         //$(".products").append("<div class='item' id=' "+ designsDefault[i]._id +" ' style='background: " + designsDefault[i].img + " ;'></div>");
                         var strContents = results[i].img.split(' ');
                        
                         imgSRC = strContents[4].substring(4, strContents[4].length - 1);

                         $scope.resultsDesigns.push({ id: results[i]._id , img: imgSRC , name : results[i].name});
                //         //console.log(imgSRC);
                                     
                 }
            });
        }

        $scope.loadDesignsByCategory = function(query){

            $http.get('/load_results_by_category/' + query)
            .success(function(response){
                results = response;
                //var q = query.replace("%20"," ");
                $(".upper-part .results-of").text("\"" + query + "\"");
                
                $scope.resultsDesigns = [];
                for(i=0; i< results.length; i++){
                //       console.log(results[i].name);
                //         //console.log(designsDefault[i]);
                //         //$(".products").append("<div class='item' id=' "+ designsDefault[i]._id +" ' style='background: " + designsDefault[i].img + " ;'></div>");
                         var strContents = results[i].img.split(' ');
                        
                         imgSRC = strContents[4].substring(4, strContents[4].length - 1);

                         $scope.resultsDesigns.push({ id: results[i]._id , img: imgSRC , name : results[i].name});
                                     
                 }
            });
        }


        var categories = ["Category", "Beachwear", "Coats", "Dresses", "Denim","Jackets", "Knitwear", "Lingerie", "Polo shirts", "Shirts", "Shorts", 
        "Suits", "Sweaters and knitwear", "Trousers", "T-Shirts and vests", "Underwear and socks"];
        

        var search = window.location.search;

        query = search.split('query=')[1];  

        //var words = query.split('%20');   

        if(!query){
            $scope.loadDefaultDesigns();
        }else if(query == "Men" || query == "Women" || query == "Uni"){

            $scope.loadDesignsBySex(query);

        }else if(categories.indexOf(query) > -1){
            $scope.loadDesignsByCategory(query);
        }else{

            $scope.loadSearchResults(query);
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

            emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

            if(!$scope.userSignup || !$scope.userSignup.username || !$scope.userSignup.password||  !$scope.cpassword ){
                $scope.hintForSignup = "All fields need to be filled";
            }else if($scope.userSignup.username.length > 50){
                $scope.hintForSignup = "Username should be shorter than 50 characters";
            }else if(!emailRegex.test($scope.userSignup.username)){
                $scope.hintForSignup = "Your username should be an valid email address";
            }else if( $scope.userSignup.password != $scope.cpassword ){
                $scope.hintForSignup = "The passwords you entered twice are different";
            }else{


                $http.post("/signup", $scope.userSignup)
                .success(function (response) {
                    
                    if(response.err){
                        $scope.hintForSignup = "The username already exists. Please choose another one."
                    }else{
                        //console.log(response);
                        $scope.userLogin = response;
                        $scope.login();
                    }
                    //if signup success, do a login function
                    //$scope.userLogin = response;
                    //$scope.login();
                });
            }
        };


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

        $scope.Home = function() {
            var currentPath = document.URL;
            var query = window.location.search;
            $window.location.href = currentPath.substring(0, currentPath.length - 20 - query.length);
        }

        $scope.goAccount = function(){
            var currentPath = document.URL;
            var query = window.location.search;
            $window.location.href = currentPath.substring(0, currentPath.length - 20 - query.length) + "account.html";
        }

        $scope.goShoppingCart = function(){
            var currentPath = document.URL;
            var query = window.location.search;
            $window.location.href = currentPath.substring(0, currentPath.length - 20 - query.length) + "shopping-cart.html";
        }

        $scope.goItem = function(id){
            
            var currentPath = document.URL;
            $window.location.href = "design-detail.html?id=" + id;

        }

        $scope.searchMen = function(){
            var currentPath = document.URL;
            var query = window.location.search;
            $window.location.href = currentPath.substring(0, currentPath.length - query.length) + "?query=" + "Men";
            //$window.location.href = currentPath + "designs-display.html?query=" + query;
        }

        $scope.searchWomen = function(){
            var currentPath = document.URL;
            var query = window.location.search;
            $window.location.href = currentPath.substring(0, currentPath.length - query.length) + "?query=" + "Women";
            //$window.location.href = currentPath + "designs-display.html?query=" + query;
        }

        $scope.searchUni = function(){
            var currentPath = document.URL;
            var query = window.location.search;
            $window.location.href = currentPath.substring(0, currentPath.length - query.length) + "?query=" + "Uni";
            //$window.location.href = currentPath + "designs-display.html?query=" + query;
        }

        

    }]);






app.controller(
    "ShoppingCartCtrl",  
    [ "$scope", "$http", "$location", "$route", "$window", function ($scope, $http, $location, $route, $window ) {
        console.log("Hello From ShoppingCartCtrl");
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
                        $(".navigation-s .sign-up").hide();
                        $(".navigation-s .login").hide();
                        $scope.loadShopCartData();
                        
                    });
                }else{
                    $(".navigation-s .username-label").hide();
                    $(".navigation-s .sign-up").show();
                    $(".navigation-s .login").show();
                }
                
        });


        //console.log($scope.test);



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

        $scope.loadShopCartData = function(){
            //alert($scope.currentUser._id);
            $http.get('/load_shopcart_data/' + $scope.currentUser._id).
            success(function(response){ 
                var itemsInShopCart = response;
                $scope.shoppingCartItems = [];
                if(itemsInShopCart.length > 0){

                    for(i = 0; i < itemsInShopCart.length; i++){
                        $http.get('/load_design_by_id/' + itemsInShopCart[i]).
                        success(function(response){
                            
                            var design = response;
                            if(!(design._id === undefined)){

                                var strContents = design.img.split(' ');
                        
                                imgSRC = strContents[4].substring(4, strContents[4].length - 1);

                                //$(".item img").attr("src", imgSRC);


                                $http.get('/get_username/' + design.designer).
                                success(function(response){
                                        
                                    $scope.shoppingCartItems.push(
                                    {
                                        name: design.name,                                    
                                        designerID: design.designer,
                                        designerName: response,
                                        price: design.min_price,
                                        itemID: design._id,
                                        img: imgSRC
                                    });

                                });
                                

                            }
                        
                        });
                    }

                    //console.log(itemsInShopCart);
                    //console.log(itemsInShopCart.length);
                }             
                
            });           
            
        }

        $scope.pay = function(item){

            //console.log($scope.currentUser._id);


            $http.put("/pay/" + item.itemID, { action:"confirm", buyerID: $scope.currentUser._id,  designerID: item.designerID } )
            .success(function (response) {
                //console.log(response);
                if(response == "pay success"){
                    //console.log("success");
                    //var currentPath = document.URL;
                    //$window.location.href = currentPath;
                    $scope.shoppingCartItems.splice($scope.shoppingCartItems.indexOf(item), 1);

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

        $scope.Home = function() {
            var currentPath = document.URL;
            $window.location.href = currentPath.substring(0, currentPath.length - 18);
        }

        $scope.goAccount = function(){
            var currentPath = document.URL;
            $window.location.href = currentPath.substring(0, currentPath.length - 18) + "account.html";
        }

        

    }]);

