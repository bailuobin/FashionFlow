app.controller(
    "LoginCtrl",  
    [ "$scope", "$http", function ($scope, $http) {
        console.log("Hello From LoginController");
        //$scope.message = "Hello World From Controller";




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

